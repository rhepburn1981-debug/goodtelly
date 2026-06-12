"""
Seed script — parses filmshare-app.html and populates filmshare.db.
Run once: python seed.py
"""
import re
import sqlite3
import os
import sys

HTML_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "filmshare-app.html")
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "filmshare.db")



def parse_field(block, field):
    for line in block.split(chr(10)):
        s = line.strip()
        if not s.startswith(field + chr(58)): continue
        val = s[len(field)+1:].strip().rstrip(chr(44))
        if val.startswith(chr(34)):
            return val[1:val.rfind(chr(34))]
        elif val.startswith(chr(39)):
            return val[1:val.rfind(chr(39))]
        else:
            try: return val.split()[0].rstrip(chr(44))
            except: return None
    return None
def parse_streamers(block):
    m = re.search(r'streamers:\s*\[(.*?)\]', block, re.DOTALL)
    if not m:
        return []
    content = m.group(1)
    return [s for pair in re.findall(r'"([^"]+)"|\'([^\']+)\'', content) for s in pair if s]


def parse_stills(block):
    m = re.search(r'stills:\s*\[(.*?)\],', block, re.DOTALL)
    if not m:
        return []
    return re.findall(r'"(data:[^"]+)"', m.group(1))


def parse_base64_field(block, field):
    for pattern in [
        rf'{field}:\s*\n\s*"(data:[^"]+)"',
        rf'{field}:\s*"(data:[^"]+)"',
    ]:
        m = re.search(pattern, block, re.DOTALL)
        if m:
            return m.group(1)
    return None


def split_objects(array_text):
    objects = []
    depth = 0
    current = []
    in_object = False

    for char in array_text:
        if char == '{':
            depth += 1
            if depth == 1:
                in_object = True
                current = [char]
            else:
                current.append(char)
        elif char == '}':
            depth -= 1
            if depth == 0 and in_object:
                current.append(char)
                objects.append("".join(current))
                current = []
                in_object = False
            else:
                current.append(char)
        else:
            if in_object:
                current.append(char)

    return objects


def extract_array(html, const_name):
    marker = f"const {const_name} = "
    start = html.find(marker)
    if start == -1:
        return None
    i = start + len(marker)
    depth = 0
    in_array = False
    for j in range(i, len(html)):
        c = html[j]
        if c == '[':
            depth += 1
            in_array = True
        elif c == ']':
            depth -= 1
            if depth == 0 and in_array:
                return html[i:j + 1]
    return None


def seed_films(conn, html):
    array_text = extract_array(html, "ALL_FILMS")
    if not array_text:
        print("ERROR: Could not find ALL_FILMS")
        sys.exit(1)

    objects = split_objects(array_text)
    print(f"Found {len(objects)} film objects")

    for obj in objects:
        film_id   = parse_field(obj, "id")
        title     = parse_field(obj, "title")
        year      = parse_field(obj, "year")
        genre     = parse_field(obj, "genre")
        runtime   = parse_field(obj, "runtime")
        director  = parse_field(obj, "director")
        cast_     = parse_field(obj, "cast")
        rating    = parse_field(obj, "rating")
        shared_by = parse_field(obj, "sharedBy")
        note      = parse_field(obj, "note")
        trailer   = parse_field(obj, "trailerUrl")
        color     = parse_field(obj, "color")
        desc      = parse_field(obj, "description")
        views     = parse_field(obj, "trendingViews")
        poster    = parse_base64_field(obj, "poster")
        backdrop  = parse_base64_field(obj, "backdrop")
        stills    = parse_stills(obj)
        streamers = parse_streamers(obj)

        if not film_id or not title:
            print("  Skipping malformed object")
            continue

        fid = int(film_id)
        if conn.execute("SELECT id FROM films WHERE id = ?", (fid,)).fetchone():
            print(f"  Film {fid} already exists, skipping")
            continue

        conn.execute(
            """INSERT INTO films
               (id, title, year, genre, runtime, director, cast, rating, shared_by, note,
                poster, backdrop, trailer_url, color, description, trending_views)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (fid, title, int(year) if year else None, genre, runtime, director,
             cast_, float(rating) if rating else None, shared_by, note,
             poster, backdrop, trailer, color, desc, int(views) if views else 0)
        )

        for s in streamers:
            conn.execute("INSERT INTO film_streamers (film_id, streamer) VALUES (?,?)", (fid, s))
        for still in stills:
            conn.execute("INSERT INTO film_stills (film_id, still_url) VALUES (?,?)", (fid, still))

        print(f"  Inserted film {fid}: {title} ({streamers})")

    conn.commit()


def seed_friends(conn, html):
    array_text = extract_array(html, "FRIENDS_DATA")
    if not array_text:
        print("ERROR: Could not find FRIENDS_DATA")
        return

    objects = split_objects(array_text)
    print(f"\nFound {len(objects)} friend objects")

    for obj in objects:
        name   = parse_field(obj, "name")
        avatar = parse_field(obj, "avatar")
        color  = parse_field(obj, "color")
        count  = parse_field(obj, "count")

        if not name:
            continue

        m = re.search(r'watched:\s*\[(.*?)\]', obj, re.DOTALL)
        watched_ids = []
        if m:
            watched_ids = [int(x.strip()) for x in m.group(1).split(",") if x.strip().isdigit()]

        if conn.execute("SELECT id FROM friends WHERE name = ?", (name,)).fetchone():
            print(f"  Friend '{name}' already exists, skipping")
            continue

        cur = conn.execute(
            "INSERT INTO friends (name, avatar, color, film_count) VALUES (?,?,?,?)",
            (name, avatar, color, int(count) if count else 0)
        )
        friend_id = cur.lastrowid

        for wid in watched_ids:
            conn.execute("INSERT INTO friend_watched (friend_id, film_id) VALUES (?,?)", (friend_id, wid))

        print(f"  Inserted friend: {name} (watched: {watched_ids})")

    conn.commit()


def seed_watchlist(conn, html):
    m = re.search(r'const INITIAL_WATCHLIST_IDS = \[([\d,\s]+)\]', html)
    if not m:
        return
    ids = [int(x.strip()) for x in m.group(1).split(",") if x.strip().isdigit()]
    print(f"\nSeeding initial watchlist IDs: {ids}")
    for fid in ids:
        conn.execute("INSERT OR IGNORE INTO watchlist (film_id) VALUES (?)", (fid,))
    conn.commit()


def main():
    if not os.path.exists(HTML_PATH):
        print(f"ERROR: Cannot find HTML at {HTML_PATH}")
        sys.exit(1)

    print(f"Reading {HTML_PATH}...")
    with open(HTML_PATH, "r", encoding="utf-8") as f:
        html = f.read()

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS films (
            id INTEGER PRIMARY KEY, title TEXT NOT NULL, year INTEGER, genre TEXT,
            runtime TEXT, director TEXT, cast TEXT, rating REAL, shared_by TEXT,
            note TEXT, poster TEXT, backdrop TEXT, trailer_url TEXT, color TEXT,
            description TEXT, trending_views INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS film_streamers (film_id INTEGER, streamer TEXT);
        CREATE TABLE IF NOT EXISTS film_stills (film_id INTEGER, still_url TEXT);
        CREATE TABLE IF NOT EXISTS friends (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
            avatar TEXT, color TEXT, film_count INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS friend_watched (friend_id INTEGER, film_id INTEGER);
        CREATE TABLE IF NOT EXISTS watchlist (film_id INTEGER PRIMARY KEY);
        CREATE TABLE IF NOT EXISTS watched (film_id INTEGER PRIMARY KEY);
    """)
    conn.commit()

    print("\n=== Seeding Films ===")
    seed_films(conn, html)

    print("\n=== Seeding Friends ===")
    seed_friends(conn, html)

    print("\n=== Seeding Watchlist ===")
    seed_watchlist(conn, html)

    conn.close()
    print("\nDone!")


if __name__ == "__main__":
    main()
