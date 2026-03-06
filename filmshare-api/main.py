import sqlite3
import os
import json

# Load .env if present
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(_env_path):
    for _line in open(_env_path):
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _v = _line.split("=", 1)
            os.environ.setdefault(_k.strip(), _v.strip())

from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
import bcrypt as _bcrypt
import tmdb as _tmdb
import tvmaze as _tvmaze

app = FastAPI(title="Filmshare API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

TMDB_API_KEY = os.environ.get("TMDB_API_KEY", "")

DB_PATH = os.environ.get("DB_PATH", "/data/filmshare.db")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()



import re as _re

def _slugify(title: str) -> str:
    s = title.lower()
    s = _re.sub(r'[^\w\s-]', '', s)
    s = _re.sub(r'[\s_]+', '-', s)
    s = _re.sub(r'-+', '-', s).strip('-')
    return s

def _unique_slug(conn, title: str, exclude_id: int = None) -> str:
    base = _slugify(title)
    slug = base
    i = 2
    while True:
        row = conn.execute(
            "SELECT id FROM films WHERE slug=?" + (" AND id!=?" if exclude_id else ""),
            (slug, exclude_id) if exclude_id else (slug,)
        ).fetchone()
        if not row:
            break
        slug = base + "-" + str(i)
        i += 1
    return slug

def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS films (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                year INTEGER,
                genre TEXT,
                runtime TEXT,
                director TEXT,
                cast TEXT,
                rating REAL,
                shared_by TEXT,
                note TEXT,
                poster TEXT,
                backdrop TEXT,
                trailer_url TEXT,
                color TEXT,
                description TEXT,
                trending_views INTEGER DEFAULT 0,
                tmdb_id INTEGER,
                slug TEXT
            );

            CREATE TABLE IF NOT EXISTS film_streamers (
                film_id INTEGER,
                streamer TEXT,
                FOREIGN KEY (film_id) REFERENCES films(id)
            );

            CREATE TABLE IF NOT EXISTS film_stills (
                film_id INTEGER,
                still_url TEXT,
                FOREIGN KEY (film_id) REFERENCES films(id)
            );

            CREATE TABLE IF NOT EXISTS friends (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                avatar TEXT,
                color TEXT,
                film_count INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS friend_watched (
                friend_id INTEGER,
                film_id INTEGER,
                FOREIGN KEY (friend_id) REFERENCES friends(id)
            );

            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                display_name TEXT,
                avatar TEXT,
                color TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS user_friends (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                requester_id INTEGER NOT NULL,
                addressee_id INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT DEFAULT (datetime('now')),
                UNIQUE(requester_id, addressee_id),
                FOREIGN KEY (requester_id) REFERENCES users(id),
                FOREIGN KEY (addressee_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS user_recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                film_id INTEGER NOT NULL,
                from_user_id INTEGER,
                to_user_id INTEGER NOT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                UNIQUE(film_id, from_user_id, to_user_id),
                FOREIGN KEY (film_id) REFERENCES films(id),
                FOREIGN KEY (to_user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS user_watchlist (
                user_id INTEGER NOT NULL,
                film_id INTEGER NOT NULL,
                added_at TEXT DEFAULT (datetime('now')),
                PRIMARY KEY (user_id, film_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (film_id) REFERENCES films(id)
            );

            CREATE TABLE IF NOT EXISTS user_watched (
                user_id INTEGER NOT NULL,
                film_id INTEGER NOT NULL,
                watched_at TEXT DEFAULT (datetime('now')),
                PRIMARY KEY (user_id, film_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (film_id) REFERENCES films(id)
            );

            CREATE TABLE IF NOT EXISTS user_ratings (
                user_id INTEGER NOT NULL,
                film_id INTEGER NOT NULL,
                rating REAL,
                review TEXT,
                rated_at TEXT DEFAULT (datetime('now')),
                PRIMARY KEY (user_id, film_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (film_id) REFERENCES films(id)
            );

            CREATE TABLE IF NOT EXISTS watchlist (
                film_id INTEGER PRIMARY KEY
            );

            CREATE TABLE IF NOT EXISTS watched (
                film_id INTEGER PRIMARY KEY
            );
        """)


init_db()

HTML_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "filmshare-app.html")
SHARE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "reel-share-landing.html")


@app.get("/", include_in_schema=False)
def serve_app():
    return FileResponse(HTML_FILE)


def _render_share_page(title="", year="", rating="", genre="", sender="A friend",
                         note="", poster="", trailer="", runtime="", color="", from_user="", slug=""):
    from fastapi.responses import HTMLResponse
    with open(SHARE_FILE, encoding="utf-8") as fh:
        html = fh.read()
    og_title = f"{sender} recommends {title}" if title else "Someone shared a pick on Reel."
    og_desc = note or (", ".join(filter(None, [genre, str(year) if year else "", f"★ {rating}" if rating else ""])) or "Watch the trailer and see what your friends are watching.")
    html = html.replace(
        '<meta property="og:title"       content="Your friend recommended a film on reel."/>',
        f'<meta property="og:title"       content="{og_title}"/>',
    )
    html = html.replace(
        '<meta property="og:description" content="Watch the trailer and see what your friends are watching."/>',
        f'<meta property="og:description" content="{og_desc}"/>',
    )
    if poster:
        html = html.replace(
            '<meta property="og:image"       content="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80"/>',
            f'<meta property="og:image"       content="{poster}"/>',
        )
    # Inject film data so the page JS can hydrate without URL params
    film_data = {
        "title": title, "year": year, "rating": rating, "genre": genre,
        "from": sender, "from_user": from_user, "note": note, "poster": poster,
        "trailer": trailer, "runtime": runtime, "color": color, "slug": slug,
    }
    film_json = json.dumps(film_data, ensure_ascii=False)
    inject = "<script>window.__FILM__ = " + film_json + ";"
    html = html.replace("<script>", inject, 1)
    return HTMLResponse(html)


@app.get("/share/{slug}", include_in_schema=False)
def serve_share_slug(slug: str, from_: str = Query(default="A friend", alias="from"), from_user: str = "", note: str = ""):
    """Clean slug URL — looks up film in DB and renders landing page with full OG tags."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM films WHERE slug=?", (slug,)
        ).fetchone()
    if not row:
        from fastapi.responses import HTMLResponse
        return HTMLResponse("<h1>Not found</h1>", status_code=404)
    return _render_share_page(
        title=row["title"] or "",
        year=str(row["year"]) if row["year"] else "",
        rating=str(round(row["rating"], 1)) if row["rating"] else "",
        genre=row["genre"] or "",
        sender=from_,
        note=note or row["note"] or "",
        poster=row["backdrop"] or row["poster"] or "",
        trailer=row["trailer_url"] or "",
        runtime=row["runtime"] or "",
        color=row["color"] or "",
        from_user=from_user,
        slug=slug,
    )


@app.get("/share", include_in_schema=False)
def serve_share(
    title: str = "",
    year: str = "",
    rating: str = "",
    genre: str = "",
    from_: str = Query(default="A friend", alias="from"),
    from_user: str = "",
    note: str = "",
    poster: str = "",
    trailer: str = "",
    runtime: str = "",
    color: str = "",
):
    """Fallback: query-param share URL (for unsaved TMDB results)."""
    return _render_share_page(title, year, rating, genre, from_, note, poster, trailer, runtime, color, from_user)


# ─── Auth helpers ──────────────────────────────────────────────────────────────

def verify_password(plain, hashed):
    return _bcrypt.checkpw(plain.encode(), hashed.encode())


def hash_password(plain):
    return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt()).decode()


def create_access_token(data, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            return None
        user_id = int(sub)
    except JWTError:
        return None
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None


def require_user(current_user=Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user


# ─── Helpers ───────────────────────────────────────────────────────────────────

def row_to_film(row, streamers, stills):
    d = dict(row)
    d["streamers"] = streamers
    d["stills"] = stills
    d["sharedBy"] = d.pop("shared_by")
    d["trailerUrl"] = d.pop("trailer_url")
    d["trendingViews"] = d.pop("trending_views")
    return d


def get_film_by_id(conn, film_id):
    row = conn.execute("SELECT * FROM films WHERE id = ?", (film_id,)).fetchone()
    if not row:
        return None
    streamers = [r["streamer"] for r in conn.execute(
        "SELECT streamer FROM film_streamers WHERE film_id = ?", (film_id,)
    ).fetchall()]
    stills = [r["still_url"] for r in conn.execute(
        "SELECT still_url FROM film_stills WHERE film_id = ? ORDER BY rowid", (film_id,)
    ).fetchall()]
    return row_to_film(row, streamers, stills)


# Auth

class RegisterRequest(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = None
    username: Optional[str] = None
    color: Optional[str] = None


def _generate_username(display_name: str, conn) -> str:
    import re, random, string
    base = re.sub(r"[^a-z0-9]", "", display_name.lower().replace(" ", ""))[:16] or "user"
    for _ in range(20):
        suffix = "".join(random.choices(string.digits, k=4))
        candidate = f"{base}{suffix}"
        if not conn.execute("SELECT id FROM users WHERE username = ?", (candidate,)).fetchone():
            return candidate
    return base + "".join(random.choices(string.digits, k=6))


@app.post("/api/auth/register", status_code=201)
def register(req: RegisterRequest):
    with get_db() as conn:
        if conn.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone():
            raise HTTPException(status_code=409, detail="Email already registered")
        display = req.display_name or req.email.split("@")[0]
        username = req.username or _generate_username(display, conn)
        if req.username and conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone():
            raise HTTPException(status_code=409, detail="Username already taken")
        hashed = hash_password(req.password)
        cur = conn.execute(
            "INSERT INTO users (username, email, password_hash, display_name, color) VALUES (?,?,?,?,?)",
            (username, req.email, hashed, display, req.color)
        )
        user_id = cur.lastrowid
        user = {"id": user_id, "username": username, "email": req.email,
                "display_name": display, "color": req.color, "avatar": None}
    token = create_access_token({"sub": str(user_id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/api/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            (form.username, form.username)
        ).fetchone()
        if not user or not verify_password(form.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        user_dict = {k: user[k] for k in user.keys() if k != "password_hash"}
    token = create_access_token({"sub": str(user["id"])})
    return {"access_token": token, "token_type": "bearer", "user": user_dict}


@app.get("/api/auth/me")
def get_me(current_user=Depends(require_user)):
    return {k: v for k, v in current_user.items() if k != "password_hash"}


@app.put("/api/auth/me")
def update_me(body: dict, current_user=Depends(require_user)):
    allowed = {"display_name", "avatar", "color"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=400, detail="Nothing to update")
    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values()) + [current_user["id"]]
    with get_db() as conn:
        conn.execute(f"UPDATE users SET {set_clause} WHERE id = ?", values)
        row = conn.execute("SELECT * FROM users WHERE id = ?", (current_user["id"],)).fetchone()
        return {k: row[k] for k in row.keys() if k != "password_hash"}


# Friend relationships


@app.get("/api/friends/requests")
def list_friend_requests(current_user=Depends(require_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT uf.id, uf.created_at, u.id as user_id, u.username, u.display_name, u.avatar, u.color "
            "FROM user_friends uf JOIN users u ON u.id = uf.requester_id "
            "WHERE uf.addressee_id = ? AND uf.status = 'pending'",
            (current_user["id"],)
        ).fetchall()
        return [dict(r) for r in rows]


@app.get("/api/friends")
def list_friends(current_user=Depends(require_user)):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT u.id, u.username, u.display_name, u.avatar, u.color, uf.created_at as friends_since "
            "FROM user_friends uf "
            "JOIN users u ON (CASE WHEN uf.requester_id = ? THEN u.id = uf.addressee_id ELSE u.id = uf.requester_id END) "
            "WHERE (uf.requester_id = ? OR uf.addressee_id = ?) AND uf.status = 'accepted'",
            (current_user["id"], current_user["id"], current_user["id"])
        ).fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["count"] = conn.execute(
                "SELECT COUNT(*) as c FROM user_watchlist WHERE user_id=?", (d["id"],)
            ).fetchone()["c"]
            result.append(d)
        return result


@app.post("/api/friends/{username}", status_code=201)
def send_friend_request(username: str, current_user=Depends(require_user)):
    with get_db() as conn:
        target = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        if target["id"] == current_user["id"]:
            raise HTTPException(status_code=400, detail="Cannot friend yourself")
        existing = conn.execute(
            "SELECT id, status FROM user_friends "
            "WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)",
            (current_user["id"], target["id"], target["id"], current_user["id"])
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Request already exists")
        conn.execute(
            "INSERT INTO user_friends (requester_id, addressee_id, status) VALUES (?,?,'pending')",
            (current_user["id"], target["id"])
        )
        return {"ok": True, "status": "pending"}


@app.put("/api/friends/{username}/accept")
def accept_friend_request(username: str, current_user=Depends(require_user)):
    with get_db() as conn:
        requester = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
        if not requester:
            raise HTTPException(status_code=404, detail="User not found")
        result = conn.execute(
            "UPDATE user_friends SET status = 'accepted' "
            "WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'",
            (requester["id"], current_user["id"])
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="No pending request")
        return {"ok": True}


@app.delete("/api/friends/{username}")
def remove_friend(username: str, current_user=Depends(require_user)):
    with get_db() as conn:
        target = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        conn.execute(
            "DELETE FROM user_friends "
            "WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)",
            (current_user["id"], target["id"], target["id"], current_user["id"])
        )
        return {"ok": True}


# User profiles


@app.get("/api/users/{username}")
def get_user_profile(username: str, current_user=Depends(get_current_user)):
    with get_db() as conn:
        user = conn.execute(
            "SELECT id, username, display_name, avatar, color, created_at FROM users WHERE username = ?",
            (username,)
        ).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_dict = dict(user)
        uid = user_dict["id"]
        user_dict["friend_count"] = conn.execute(
            "SELECT COUNT(*) as c FROM user_friends WHERE (requester_id=? OR addressee_id=?) AND status='accepted'",
            (uid, uid)
        ).fetchone()["c"]
        user_dict["watchlist_count"] = conn.execute(
            "SELECT COUNT(*) as c FROM user_watchlist WHERE user_id=?", (uid,)
        ).fetchone()["c"]
        user_dict["watched_count"] = conn.execute(
            "SELECT COUNT(*) as c FROM user_watched WHERE user_id=?", (uid,)
        ).fetchone()["c"]
        if current_user and current_user["id"] != uid:
            rel = conn.execute(
                "SELECT status, requester_id FROM user_friends "
                "WHERE (requester_id=? AND addressee_id=?) OR (requester_id=? AND addressee_id=?)",
                (current_user["id"], uid, uid, current_user["id"])
            ).fetchone()
            user_dict["friendship_status"] = rel["status"] if rel else None
            if rel:
                user_dict["friendship_direction"] = (
                    "outgoing" if rel["requester_id"] == current_user["id"] else "incoming"
                )
        return user_dict


@app.get("/api/users/{username}/watchlist")
def get_user_watchlist_endpoint(username: str, current_user=Depends(get_current_user)):
    with get_db() as conn:
        user = conn.execute("SELECT id FROM users WHERE username=?", (username,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        ids = [r["film_id"] for r in conn.execute(
            "SELECT film_id FROM user_watchlist WHERE user_id=? ORDER BY added_at DESC", (user["id"],)
        ).fetchall()]
        watched_ids = set()
        if current_user and current_user["id"] == user["id"]:
            watched_ids = {r["film_id"] for r in conn.execute(
                "SELECT film_id FROM user_watched WHERE user_id=?", (user["id"],)
            ).fetchall()}
        films = []
        for fid in ids:
            film = get_film_by_id(conn, fid)
            if film:
                film["isWatched"] = fid in watched_ids
                films.append(film)
        return films


# Per-user watchlist/watched


@app.get("/api/me/watchlist")
def get_my_watchlist(current_user=Depends(require_user)):
    with get_db() as conn:
        ids = [r["film_id"] for r in conn.execute(
            "SELECT film_id FROM user_watchlist WHERE user_id=? ORDER BY added_at DESC",
            (current_user["id"],)
        ).fetchall()]
        watched_ids = {r["film_id"] for r in conn.execute(
            "SELECT film_id FROM user_watched WHERE user_id=?", (current_user["id"],)
        ).fetchall()}
        films = []
        for fid in ids:
            film = get_film_by_id(conn, fid)
            if film:
                film["isWatched"] = fid in watched_ids
                films.append(film)
        return films


@app.post("/api/me/watchlist/{film_id}", status_code=201)
def add_to_my_watchlist(film_id: int, current_user=Depends(require_user)):
    with get_db() as conn:
        if not get_film_by_id(conn, film_id):
            raise HTTPException(status_code=404, detail="Film not found")
        conn.execute(
            "INSERT OR IGNORE INTO user_watchlist (user_id, film_id) VALUES (?,?)",
            (current_user["id"], film_id)
        )
        return {"ok": True}


@app.delete("/api/me/watchlist/{film_id}")
def remove_from_my_watchlist(film_id: int, current_user=Depends(require_user)):
    with get_db() as conn:
        conn.execute("DELETE FROM user_watchlist WHERE user_id=? AND film_id=?", (current_user["id"], film_id))
        conn.execute("DELETE FROM user_watched WHERE user_id=? AND film_id=?", (current_user["id"], film_id))
        return {"ok": True}


@app.post("/api/me/watched/{film_id}", status_code=201)
def mark_my_watched(film_id: int, current_user=Depends(require_user)):
    with get_db() as conn:
        conn.execute("INSERT OR IGNORE INTO user_watchlist (user_id, film_id) VALUES (?,?)", (current_user["id"], film_id))
        conn.execute("INSERT OR IGNORE INTO user_watched (user_id, film_id) VALUES (?,?)", (current_user["id"], film_id))
        return {"ok": True}


@app.delete("/api/me/watched/{film_id}")
def unmark_my_watched(film_id: int, current_user=Depends(require_user)):
    with get_db() as conn:
        conn.execute("DELETE FROM user_watched WHERE user_id=? AND film_id=?", (current_user["id"], film_id))
        return {"ok": True}


@app.post("/api/me/ratings/{film_id}", status_code=201)
def rate_film(film_id: int, body: dict, current_user=Depends(require_user)):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO user_ratings (user_id, film_id, rating, review) VALUES (?,?,?,?) "
            "ON CONFLICT(user_id, film_id) DO UPDATE SET rating=excluded.rating, review=excluded.review, rated_at=datetime('now')",
            (current_user["id"], film_id, body.get("rating"), body.get("review"))
        )
        return {"ok": True}


# ─── Films ─────────────────────────────────────────────────────────────────────

@app.get("/api/films")
def list_films(genre: Optional[str] = None, streamer: Optional[str] = None, q: Optional[str] = None):
    with get_db() as conn:
        query = "SELECT DISTINCT f.* FROM films f"
        params = []
        joins = []
        wheres = []

        if streamer:
            joins.append("JOIN film_streamers fs ON f.id = fs.film_id")
            wheres.append("fs.streamer = ?")
            params.append(streamer)

        if genre and genre.lower() != "all":
            wheres.append("f.genre = ?")
            params.append(genre)

        if q:
            wheres.append("(f.title LIKE ? OR f.director LIKE ? OR f.cast LIKE ?)")
            like = f"%{q}%"
            params.extend([like, like, like])

        if joins:
            query += " " + " ".join(joins)
        if wheres:
            query += " WHERE " + " AND ".join(wheres)

        rows = conn.execute(query, params).fetchall()
        films = []
        for row in rows:
            fid = row["id"]
            streamers = [r["streamer"] for r in conn.execute(
                "SELECT streamer FROM film_streamers WHERE film_id = ?", (fid,)
            ).fetchall()]
            stills = [r["still_url"] for r in conn.execute(
                "SELECT still_url FROM film_stills WHERE film_id = ? ORDER BY rowid", (fid,)
            ).fetchall()]
            films.append(row_to_film(row, streamers, stills))
        return films


@app.get("/api/films/{film_id}")
def get_film(film_id: int):
    with get_db() as conn:
        film = get_film_by_id(conn, film_id)
        if not film:
            raise HTTPException(status_code=404, detail="Film not found")
        return film



@app.get("/api/films/slug/{slug}")
def get_film_by_slug(slug: str):
    with get_db() as conn:
        film = conn.execute("SELECT * FROM films WHERE slug=?", (slug,)).fetchone()
        if not film:
            raise HTTPException(status_code=404, detail="Film not found")
        return get_film_by_id(conn, film["id"])

@app.post("/api/films/{film_id}/refresh")
def refresh_film(film_id: int):
    """Re-enrich a film from TMDB/TVmaze to fill missing trailer, cast, stills etc."""
    import tmdb as _tmdb
    from tvmaze import _tmdb_tv_trailer_and_stills
    with get_db() as conn:
        row = conn.execute("SELECT * FROM films WHERE id = ?", (film_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Film not found")
        d = dict(row)
        tmdb_id = d.get("tmdb_id")
        title = d.get("title", "")
        year = d.get("year")
        enriched = {}

        if tmdb_id:
            details = _tmdb.get_film_details(tmdb_id)
            if details:
                videos = details.get("videos", {}).get("results", [])
                for v in videos:
                    if v.get("site") == "YouTube" and v.get("type") == "Trailer":
                        enriched["trailer_url"] = f"https://www.youtube.com/embed/{v['key']}"
                        break
                if not d.get("cast"):
                    cast_list = (details.get("credits") or {}).get("cast", [])
                    if cast_list:
                        enriched["cast"] = ", ".join(p["name"] for p in cast_list[:8])
                if not d.get("description"):
                    enriched["description"] = details.get("overview")
        else:
            result = _tmdb_tv_trailer_and_stills(title, year)
            if result and len(result) == 3:
                trailer_url, stills, backdrop = result
                if trailer_url:
                    enriched["trailer_url"] = trailer_url
                has_stills = conn.execute("SELECT 1 FROM film_stills WHERE film_id=?", (film_id,)).fetchone()
                if stills and not has_stills:
                    for s in stills:
                        conn.execute("INSERT OR IGNORE INTO film_stills (film_id, still_url) VALUES (?,?)", (film_id, s))
                if backdrop and not d.get("backdrop"):
                    enriched["backdrop"] = backdrop

        if enriched:
            sets = ", ".join(f"{k} = ?" for k in enriched)
            conn.execute(f"UPDATE films SET {sets} WHERE id = ?", (*enriched.values(), film_id))
        conn.commit()
        return get_film_by_id(conn, film_id)


class FilmCreate(BaseModel):
    title: str
    year: Optional[int] = None
    genre: Optional[str] = None
    runtime: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[str] = None
    rating: Optional[float] = None
    sharedBy: Optional[str] = None
    note: Optional[str] = None
    poster: Optional[str] = None
    backdrop: Optional[str] = None
    trailerUrl: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None
    trendingViews: Optional[int] = 0
    streamers: list[str] = []
    stills: list[str] = []
    tmdbId: Optional[int] = None
    tvmazeId: Optional[int] = None
    autoEnrich: bool = True


@app.post("/api/films", status_code=201)
def create_film(film: FilmCreate, current_user=Depends(get_current_user)):
    # Auto-enrich from TMDB or TVmaze
    enriched = {}
    if film.tvmazeId:
        enriched = _tvmaze.enrich_show(film.tvmazeId)
    elif film.autoEnrich:
        enriched = _tmdb.enrich_film(film.title, film.year)

    def pick(manual, key):
        """Use manual value if provided, else fall back to TMDB enrichment."""
        return manual if manual is not None else enriched.get(key)

    title = film.title
    year = film.year
    genre = pick(film.genre, "genre")
    runtime = pick(film.runtime, "runtime")
    director = pick(film.director, "director")
    cast = pick(film.cast, "cast")
    rating = pick(film.rating, "rating")
    shared_by = film.sharedBy or (current_user["username"] if current_user else None)
    note = film.note
    poster = pick(film.poster, "poster")
    backdrop = pick(film.backdrop, "backdrop")
    trailer_url = pick(film.trailerUrl, "trailer_url")
    color = film.color
    description = pick(film.description, "description")
    trending_views = film.trendingViews or 0
    tmdb_id = film.tmdbId or enriched.get("tmdb_id")
    tvmaze_id = film.tvmazeId or enriched.get("tvmaze_id")

    stills = film.stills or enriched.get("stills", [])

    with get_db() as conn:
        slug = _unique_slug(conn, title)
        cur = conn.execute(
            """INSERT INTO films
               (title, year, genre, runtime, director, cast, rating, shared_by, note,
                poster, backdrop, trailer_url, color, description, trending_views, tmdb_id, slug)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (title, year, genre, runtime, director, cast, rating, shared_by, note,
             poster, backdrop, trailer_url, color, description, trending_views, tmdb_id, slug)
        )
        fid = cur.lastrowid
        for s in film.streamers:
            conn.execute("INSERT INTO film_streamers (film_id, streamer) VALUES (?,?)", (fid, s))
        for still in stills:
            conn.execute("INSERT INTO film_stills (film_id, still_url) VALUES (?,?)", (fid, still))
        return get_film_by_id(conn, fid)


@app.get("/api/tmdb/search")
def tmdb_search(q: str, year: Optional[int] = None):
    """Search TMDB (movies) and TVmaze (TV shows) in parallel."""
    from concurrent.futures import ThreadPoolExecutor

    def search_tmdb():
        if not os.environ.get("TMDB_API_KEY", ""):
            return []
        params = {"query": q, "language": "en-US", "page": 1}
        if year:
            params["year"] = year
        data = _tmdb._get("/search/movie", params)
        return [
            {
                "tmdb_id": r["id"],
                "title": r.get("title"),
                "year": (r.get("release_date") or "")[:4] or None,
                "description": r.get("overview"),
                "poster": _tmdb.poster_url(r.get("poster_path")),
                "backdrop": _tmdb.backdrop_url(r.get("backdrop_path")),
                "rating": r.get("vote_average"),
                "source": "tmdb",
            }
            for r in (data.get("results", [])[:8])
        ]

    def search_tvmaze():
        shows = _tvmaze.search_shows(q)
        return [
            {
                "tvmaze_id": s["tvmaze_id"],
                "title": s["title"],
                "year": s["year"],
                "description": s["description"],
                "poster": s["poster"],
                "backdrop": s["backdrop"],
                "rating": s["rating"],
                "network": s.get("network"),
                "country": s.get("country"),
                "genres": s.get("genres", []),
                "source": "tvmaze",
            }
            for s in shows[:8]
        ]

    with ThreadPoolExecutor(max_workers=2) as ex:
        f_tmdb = ex.submit(search_tmdb)
        f_tvmaze = ex.submit(search_tvmaze)
        tmdb_results = f_tmdb.result()
        tvmaze_results = f_tvmaze.result()

    # TMDB = movies, TVmaze = TV shows: never the same content, no deduplication needed
    return tmdb_results + tvmaze_results


@app.get("/api/tmdb/enrich")
def tmdb_enrich(title: str, year: Optional[int] = None):
    """Return full TMDB enrichment data for a title (for preview before saving)."""
    if not os.environ.get("TMDB_API_KEY", ""):
        raise HTTPException(status_code=503, detail="TMDB_API_KEY not configured")
    data = _tmdb.enrich_film(title, year)
    if not data:
        raise HTTPException(status_code=404, detail="No TMDB match found")
    return data


@app.get("/api/tvmaze/enrich")
def tvmaze_enrich(id: int):
    """Return full TVmaze enrichment data for a show (for preview before saving)."""
    data = _tvmaze.enrich_show(id)
    if not data:
        raise HTTPException(status_code=404, detail="No TVmaze match found")
    return data



@app.post("/api/me/recommendations", status_code=201)
def record_recommendation(body: dict, current_user=Depends(require_user)):
    """Record that a film was recommended to the current user via a share link."""
    film_slug = body.get("film_slug", "")
    from_username = body.get("from_username", "")
    with get_db() as conn:
        film = conn.execute("SELECT id FROM films WHERE slug=?", (film_slug,)).fetchone()
        if not film:
            raise HTTPException(status_code=404, detail="Film not found")
        from_user_id = None
        if from_username:
            fu = conn.execute("SELECT id FROM users WHERE username=?", (from_username,)).fetchone()
            if fu:
                from_user_id = fu["id"]
        try:
            conn.execute(
                "INSERT OR IGNORE INTO user_recommendations (film_id, from_user_id, to_user_id) VALUES (?,?,?)",
                (film["id"], from_user_id, current_user["id"])
            )
        except Exception:
            pass
    return {"ok": True}


@app.get("/api/me/recommendations")
def get_recommendations(current_user=Depends(require_user)):
    """Films explicitly recommended to the current user via share links."""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT f.*, u.username as rec_from_username, u.display_name as rec_from_name
               FROM user_recommendations ur
               JOIN films f ON f.id = ur.film_id
               LEFT JOIN users u ON u.id = ur.from_user_id
               WHERE ur.to_user_id=?
               ORDER BY ur.created_at DESC""",
            (current_user["id"],)
        ).fetchall()
        result = []
        for row in rows:
            fid = row["id"]
            streamers = [r["streamer"] for r in conn.execute(
                "SELECT streamer FROM film_streamers WHERE film_id=?", (fid,)
            ).fetchall()]
            stills = [r["still_url"] for r in conn.execute(
                "SELECT still_url FROM film_stills WHERE film_id=? ORDER BY rowid", (fid,)
            ).fetchall()]
            d = row_to_film(row, streamers, stills)
            d["_fromFriend"] = row["rec_from_username"] or row["rec_from_name"]
            result.append(d)
        return result


@app.get("/api/users/find")
def find_user(q: str, current_user=Depends(require_user)):
    """Find a user by email address or username."""
    with get_db() as conn:
        user = conn.execute(
            "SELECT id, username, display_name, avatar, color FROM users WHERE email=? OR username=?",
            (q, q)
        ).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="No user found")
        return dict(user)


# ─── Friends ────────────────────────────────────────────────────────

@app.get("/api/legacy/friends")
def list_legacy_friends():
    """Legacy: seed-data friends from the friends table."""
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM friends").fetchall()
        friends = []
        for row in rows:
            d = dict(row)
            d["count"] = d.pop("film_count")
            d["watched"] = [r["film_id"] for r in conn.execute(
                "SELECT film_id FROM friend_watched WHERE friend_id=?", (d["id"],)
            ).fetchall()]
            friends.append(d)
        return friends


@app.get("/api/friends/{username}/films")
def get_friend_films(username: str):
    """Watchlist films for a real user, or legacy shared films for seed friends."""
    with get_db() as conn:
        user = conn.execute("SELECT id FROM users WHERE username=?", (username,)).fetchone()
        if user:
            rows = conn.execute(
                """SELECT f.* FROM films f
                   JOIN user_watchlist uw ON uw.film_id = f.id
                   WHERE uw.user_id=? ORDER BY uw.added_at DESC""",
                (user["id"],)
            ).fetchall()
        else:
            if not conn.execute("SELECT id FROM friends WHERE name=?", (username,)).fetchone():
                raise HTTPException(status_code=404, detail="User not found")
            rows = conn.execute("SELECT f.* FROM films f WHERE f.shared_by=?", (username,)).fetchall()
        result = []
        for row in rows:
            fid = row["id"]
            streamers = [r["streamer"] for r in conn.execute(
                "SELECT streamer FROM film_streamers WHERE film_id=?", (fid,)
            ).fetchall()]
            stills = [r["still_url"] for r in conn.execute(
                "SELECT still_url FROM film_stills WHERE film_id=? ORDER BY rowid", (fid,)
            ).fetchall()]
            result.append(row_to_film(row, streamers, stills))
        return result


# ─── Watchlist ─────────────────────────────────────────────────────────────────

@app.get("/api/watchlist")
def get_watchlist():
    with get_db() as conn:
        ids = [r["film_id"] for r in conn.execute("SELECT film_id FROM watchlist").fetchall()]
        watched_ids = [r["film_id"] for r in conn.execute("SELECT film_id FROM watched").fetchall()]
        films = []
        for fid in ids:
            film = get_film_by_id(conn, fid)
            if film:
                film["isWatched"] = fid in watched_ids
                films.append(film)
        return films


@app.post("/api/watchlist/{film_id}", status_code=201)
def add_to_watchlist(film_id: int):
    with get_db() as conn:
        film = get_film_by_id(conn, film_id)
        if not film:
            raise HTTPException(status_code=404, detail="Film not found")
        conn.execute("INSERT OR IGNORE INTO watchlist (film_id) VALUES (?)", (film_id,))
        return {"ok": True}


@app.delete("/api/watchlist/{film_id}")
def remove_from_watchlist(film_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM watchlist WHERE film_id = ?", (film_id,))
        conn.execute("DELETE FROM watched WHERE film_id = ?", (film_id,))
        return {"ok": True}


@app.post("/api/watched/{film_id}", status_code=201)
def mark_watched(film_id: int):
    with get_db() as conn:
        conn.execute("INSERT OR IGNORE INTO watchlist (film_id) VALUES (?)", (film_id,))
        conn.execute("INSERT OR IGNORE INTO watched (film_id) VALUES (?)", (film_id,))
        return {"ok": True}


@app.delete("/api/watched/{film_id}")
def unmark_watched(film_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM watched WHERE film_id = ?", (film_id,))
        return {"ok": True}


# ─── Streamers config ──────────────────────────────────────────────────────────

STREAMERS = {
    "netflix":   {"label": "Netflix",     "bg": "#E50914", "text": "#fff", "short": "N"},
    "prime":     {"label": "Prime",       "bg": "#00A8E1", "text": "#fff", "short": "P"},
    "disney":    {"label": "Disney+",     "bg": "#113CCF", "text": "#fff", "short": "D+"},
    "apple":     {"label": "Apple TV+",   "bg": "#1C1C1E", "text": "#fff", "short": "🍎"},
    "hbo":       {"label": "Max",         "bg": "#6B00E3", "text": "#fff", "short": "M"},
    "paramount": {"label": "Paramount+",  "bg": "#0064FF", "text": "#fff", "short": "P+"},
    "bbc":       {"label": "BBC iPlayer", "bg": "#FF4040", "text": "#fff", "short": "BBC"},
    "cinema":    {"label": "In Cinemas",  "bg": "#E8C96A", "text": "#1a1a1a", "short": "🎟"},
}

@app.get("/api/streamers")
def get_streamers():
    return STREAMERS
