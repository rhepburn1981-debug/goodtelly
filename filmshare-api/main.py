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
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "709452989437-vooq081nkmhb03n12h8p0tee0e327ui1.apps.googleusercontent.com")

DB_PATH = os.environ.get("DB_PATH", "/data/filmshare.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


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
                created_at TEXT DEFAULT (datetime('now')),
                last_login_at TEXT
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
                note TEXT,
                rating REAL,
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

# Migrations: add columns that may not exist in older DBs
def _migrate():
    with get_db() as conn:
        for sql in [
            "ALTER TABLE user_recommendations ADD COLUMN note TEXT",
            "ALTER TABLE user_recommendations ADD COLUMN rating REAL",
            "ALTER TABLE films ADD COLUMN slug TEXT",
            "ALTER TABLE films ADD COLUMN tmdb_id INTEGER",
            "ALTER TABLE films ADD COLUMN tvmaze_id INTEGER",
            "ALTER TABLE users ADD COLUMN display_name TEXT",
            "ALTER TABLE users ADD COLUMN avatar TEXT",
            "ALTER TABLE users ADD COLUMN color TEXT",
            "ALTER TABLE users ADD COLUMN last_login_at TEXT",
            """CREATE TABLE IF NOT EXISTS search_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                query TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            )""",
            """CREATE TABLE IF NOT EXISTS tab_views (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                tab_name TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            )""",
        ]:
            try:
                conn.execute(sql)
            except Exception:
                pass  # column/table already exists

_migrate()


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
    # Replace OG tags — handle both old spaced and new compact formats
    for _t in [
        '<meta property="og:title"       content="Your friend recommended a film on reel."/>',
        '<meta property="og:title" content="Your friend recommended a film on reel."/>',
        '<meta property="og:title" content="Your friend recommended a film on REEL."/>',
    ]:
        if _t in html:
            html = html.replace(_t, f'<meta property="og:title" content="{og_title}"/>', 1); break
    for _d in [
        '<meta property="og:description" content="Watch the trailer and see what your friends are watching."/>',
    ]:
        if _d in html:
            html = html.replace(_d, f'<meta property="og:description" content="{og_desc}"/>', 1); break
    if poster:
        for _i in [
            '<meta property="og:image"       content="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80"/>',
            '<meta property="og:image" content="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80"/>',
        ]:
            if _i in html:
                html = html.replace(_i, f'<meta property="og:image" content="{poster}"/>', 1); break
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
    avatar: Optional[str] = None


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
            "INSERT INTO users (username, email, password_hash, display_name, color, avatar) VALUES (?,?,?,?,?,?)",
            (username, req.email, hashed, display, req.color, req.avatar)
        )
        user_id = cur.lastrowid
        user = {"id": user_id, "username": username, "email": req.email,
                "display_name": display, "color": req.color, "avatar": req.avatar}
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
        conn.execute("UPDATE users SET last_login_at=datetime('now') WHERE id=?", (user["id"],))
        user_dict = {k: user[k] for k in user.keys() if k != "password_hash"}
    token = create_access_token({"sub": str(user["id"])})
    return {"access_token": token, "token_type": "bearer", "user": user_dict}


@app.post("/api/auth/google")
def google_auth(body: dict):
    import urllib.request, json as _json
    credential = body.get("credential", "")
    if not credential:
        raise HTTPException(status_code=400, detail="Missing credential")
    # Verify token with Google
    try:
        url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential
        with urllib.request.urlopen(url, timeout=10) as resp:
            info = _json.loads(resp.read())
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    # Validate audience if client ID is configured
    if GOOGLE_CLIENT_ID and info.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Token audience mismatch")
    email = info.get("email", "")
    given_name = info.get("given_name") or info.get("name") or ""
    if not email:
        raise HTTPException(status_code=400, detail="No email from Google")
    with get_db() as conn:
        user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        if not user:
            # Create new account from Google profile
            import random as _random
            base = (given_name or email.split("@")[0]).lower()
            base = _re.sub(r'[^a-z0-9]', '', base)[:12] or "user"
            username = base + str(_random.randint(1000, 9999))
            # Ensure unique username
            while conn.execute("SELECT id FROM users WHERE username=?", (username,)).fetchone():
                username = base + str(_random.randint(1000, 9999))
            display_name = given_name or base.capitalize()
            conn.execute(
                "INSERT INTO users (username, email, password_hash, display_name) VALUES (?,?,?,?)",
                (username, email, "", display_name)
            )
            user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        else:
            conn.execute("UPDATE users SET last_login_at=datetime('now') WHERE id=?", (user["id"],))
        token = jwt.encode(
            {"sub": str(user["id"]), "exp": datetime.utcnow() + timedelta(days=7)},
            SECRET_KEY, algorithm=ALGORITHM
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "display_name": user["display_name"],
                "avatar": user["avatar"],
                "color": user["color"],
            }
        }


@app.get("/api/config")
def get_config():
    return {"google_client_id": GOOGLE_CLIENT_ID}


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


@app.post("/api/friends/{username}/connect")
def auto_connect_friend(username: str, current_user=Depends(require_user)):
    """Immediately create an accepted friendship (used after share-link sign-up)."""
    with get_db() as conn:
        target = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
        if not target or target["id"] == current_user["id"]:
            return {"ok": True}
        existing = conn.execute(
            "SELECT id, status FROM user_friends "
            "WHERE (requester_id=? AND addressee_id=?) OR (requester_id=? AND addressee_id=?)",
            (current_user["id"], target["id"], target["id"], current_user["id"])
        ).fetchone()
        if existing:
            if existing["status"] != "accepted":
                conn.execute("UPDATE user_friends SET status='accepted' WHERE id=?", (existing["id"],))
        else:
            conn.execute(
                "INSERT INTO user_friends (requester_id, addressee_id, status) VALUES (?,?,'accepted')",
                (current_user["id"], target["id"])
            )
        return {"ok": True, "status": "accepted"}


@app.post("/api/admin/connect-friends")
def admin_connect_friends(body: dict, token: str = ""):
    """Admin: force an accepted friendship between two users by username."""
    _check_admin(token)
    u1 = body.get("username1", "")
    u2 = body.get("username2", "")
    with get_db() as conn:
        r1 = conn.execute("SELECT id FROM users WHERE username=?", (u1,)).fetchone()
        r2 = conn.execute("SELECT id FROM users WHERE username=?", (u2,)).fetchone()
        if not r1 or not r2:
            raise HTTPException(status_code=404, detail="User not found")
        existing = conn.execute(
            "SELECT id, status FROM user_friends WHERE (requester_id=? AND addressee_id=?) OR (requester_id=? AND addressee_id=?)",
            (r1["id"], r2["id"], r2["id"], r1["id"])
        ).fetchone()
        if existing:
            conn.execute("UPDATE user_friends SET status='accepted' WHERE id=?", (existing["id"],))
        else:
            conn.execute("INSERT INTO user_friends (requester_id, addressee_id, status) VALUES (?,?,'accepted')", (r1["id"], r2["id"]))
    return {"ok": True, "connected": [u1, u2]}


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


@app.get("/api/users/find")
def find_user(q: str, current_user=Depends(get_current_user)):
    """Find a user by email address, username, or display name (case-insensitive)."""
    with get_db() as conn:
        user = conn.execute(
            "SELECT id, username, display_name, avatar, color FROM users WHERE LOWER(email)=LOWER(?) OR LOWER(username)=LOWER(?) OR LOWER(display_name)=LOWER(?)",
            (q, q, q)
        ).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="No user found")
        return dict(user)


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


@app.get("/api/me/friends-ratings")
def friends_ratings(current_user=Depends(require_user)):
    """Return friends' ratings for all films, keyed by film_id."""
    uid = current_user["id"]
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT ur.film_id, ur.rating, u.username, u.display_name
            FROM user_ratings ur
            JOIN users u ON u.id = ur.user_id
            WHERE ur.user_id IN (
                SELECT CASE WHEN requester_id = ? THEN addressee_id ELSE requester_id END
                FROM user_friends
                WHERE (requester_id = ? OR addressee_id = ?) AND status = 'accepted'
            ) AND ur.rating IS NOT NULL
            """,
            (uid, uid, uid)
        ).fetchall()
    result = {}
    for r in rows:
        fid = r["film_id"]
        rating = r["rating"]
        # Normalize ratings stored on 10-scale to 5-scale
        if rating and rating > 5:
            rating = round(rating / 2, 2)
        if fid not in result:
            result[fid] = {"sum": 0, "count": 0, "users": []}
        result[fid]["sum"] += rating
        result[fid]["count"] += 1
        result[fid]["users"].append({
            "username": r["username"],
            "display_name": r["display_name"],
            "rating": rating,
        })
    # Build final output
    return {
        fid: {
            "avg": round(d["sum"] / d["count"], 2),
            "count": d["count"],
            "users": d["users"],
        }
        for fid, d in result.items()
    }


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
        # Compute activity scores per film for different time windows
        def build_scores(days=None):
            wl_clause  = f"WHERE added_at >= datetime('now', '-{days} days')"   if days else ""
            wd_clause  = f"WHERE watched_at >= datetime('now', '-{days} days')"  if days else ""
            rec_clause = f"WHERE created_at >= datetime('now', '-{days} days')"  if days else ""
            out = {}
            for r in conn.execute(f"""
                SELECT film_id, COUNT(*) as c FROM (
                    SELECT film_id FROM user_watchlist {wl_clause}
                    UNION ALL SELECT film_id FROM user_watched {wd_clause}
                    UNION ALL SELECT film_id FROM user_recommendations {rec_clause}
                ) GROUP BY film_id
            """).fetchall():
                out[r["film_id"]] = r["c"]
            return out
        scores_all = build_scores()
        scores_7d  = build_scores(7)
        scores_30d = build_scores(30)
        scores_365d = build_scores(365)
        films = []
        for row in rows:
            fid = row["id"]
            streamers = [r["streamer"] for r in conn.execute(
                "SELECT streamer FROM film_streamers WHERE film_id = ?", (fid,)
            ).fetchall()]
            stills = [r["still_url"] for r in conn.execute(
                "SELECT still_url FROM film_stills WHERE film_id = ? ORDER BY rowid", (fid,)
            ).fetchall()]
            f = row_to_film(row, streamers, stills)
            f["activityScore"]    = scores_all.get(fid, 0)
            f["activityScore7d"]  = scores_7d.get(fid, 0)
            f["activityScore30d"] = scores_30d.get(fid, 0)
            f["activityScore365d"] = scores_365d.get(fid, 0)
            films.append(f)
        films.sort(key=lambda f: f["activityScore"], reverse=True)
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

@app.put("/api/films/{film_id}/streamers")
def set_film_streamers(film_id: int, body: dict, current_user=Depends(require_user)):
    """Manually set streaming services for a film."""
    streamers = body.get("streamers", [])
    with get_db() as conn:
        if not conn.execute("SELECT id FROM films WHERE id=?", (film_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Film not found")
        conn.execute("DELETE FROM film_streamers WHERE film_id=?", (film_id,))
        for s in streamers:
            conn.execute("INSERT OR IGNORE INTO film_streamers (film_id, streamer) VALUES (?,?)", (film_id, s))
    return {"ok": True, "streamers": streamers}


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
    tmdbTvId: Optional[int] = None
    tvmazeId: Optional[int] = None
    autoEnrich: bool = True


@app.post("/api/films", status_code=201)
def create_film(film: FilmCreate, current_user=Depends(get_current_user)):
    # Auto-enrich from TMDB or TVmaze
    enriched = {}
    if film.tvmazeId:
        enriched = _tvmaze.enrich_show(film.tvmazeId)
    elif film.tmdbTvId:
        tv_data = _tvmaze._tmdb_get(f"/tv/{film.tmdbTvId}",
            {"language": "en-US", "append_to_response": "videos,images,credits"})
        if tv_data:
            poster = tv_data.get("poster_path")
            backdrop = tv_data.get("backdrop_path")
            trailer_url = None
            for v in (tv_data.get("videos") or {}).get("results", []):
                if v.get("site") == "YouTube" and v.get("type") == "Trailer":
                    trailer_url = "https://www.youtube.com/embed/" + v["key"]
                    break
            backdrops = (tv_data.get("images") or {}).get("backdrops", [])
            cast_list = (tv_data.get("credits") or {}).get("cast", [])
            genres = [g.get("name") for g in tv_data.get("genres", []) if g.get("name")]
            enriched = {
                "poster": ("https://image.tmdb.org/t/p/w342" + poster) if poster else None,
                "backdrop": ("https://image.tmdb.org/t/p/w1280" + backdrop) if backdrop else None,
                "trailer_url": trailer_url,
                "description": tv_data.get("overview"),
                "genre": ", ".join(genres[:2]) if genres else None,
                "cast": ", ".join(c.get("name", "") for c in cast_list[:8]) if cast_list else None,
                "rating": round(tv_data.get("vote_average", 0) / 2, 2) if tv_data.get("vote_average") else None,
                "stills": ["https://image.tmdb.org/t/p/w780" + b["file_path"] for b in backdrops[:6] if b.get("file_path")],
                "tmdb_id": film.tmdbTvId,
            }
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
    final_streamers = film.streamers or enriched.get("streamers", [])

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
        for s in final_streamers:
            conn.execute("INSERT INTO film_streamers (film_id, streamer) VALUES (?,?)", (fid, s))
        for still in stills:
            conn.execute("INSERT INTO film_stills (film_id, still_url) VALUES (?,?)", (fid, still))
        return get_film_by_id(conn, fid)


@app.get("/api/tmdb/search")
def tmdb_search(q: str, year: Optional[int] = None):
    """Search TMDB (movies) and TVmaze (TV shows) in parallel."""
    from concurrent.futures import ThreadPoolExecutor

    def search_tmdb():
        if not os.environ.get("TMDB_API_KEY", "") and not os.environ.get("TMDB_READ_TOKEN", ""):
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


@app.post("/api/admin/bulk-reenrich")
def bulk_reenrich():
    """Re-enrich all films missing a poster by searching TMDB movie + TV."""
    with get_db() as conn:
        rows = [dict(r) for r in conn.execute(
            "SELECT id, title, year, tmdb_id, tvmaze_id FROM films WHERE poster IS NULL OR poster = ''"
        ).fetchall()]

    results = []
    for row in rows:
        fid, title, year = row["id"], row["title"], row["year"]
        enriched = None

        # Try TMDB movie search first
        enriched = _tmdb.enrich_film(title, year)

        # If no result, try TMDB TV search
        if not enriched:
            sr = _tvmaze._tmdb_get("/search/tv", {"query": title, "language": "en-US"})
            tv_results = (sr or {}).get("results", [])
            if tv_results:
                tmdb_tv_id = tv_results[0]["id"]
                tv_data = _tvmaze._tmdb_get(f"/tv/{tmdb_tv_id}",
                    {"language": "en-US", "append_to_response": "videos,images,credits"})
                if tv_data:
                    poster = tv_data.get("poster_path")
                    backdrop = tv_data.get("backdrop_path")
                    trailer_url = None
                    for v in (tv_data.get("videos") or {}).get("results", []):
                        if v.get("site") == "YouTube" and v.get("type") == "Trailer":
                            trailer_url = "https://www.youtube.com/embed/" + v["key"]
                            break
                    backdrops = (tv_data.get("images") or {}).get("backdrops", [])
                    cast_list = (tv_data.get("credits") or {}).get("cast", [])
                    genres = [g.get("name") for g in tv_data.get("genres", []) if g.get("name")]
                    enriched = {
                        "poster": ("https://image.tmdb.org/t/p/w342" + poster) if poster else None,
                        "backdrop": ("https://image.tmdb.org/t/p/w1280" + backdrop) if backdrop else None,
                        "trailer_url": trailer_url,
                        "description": tv_data.get("overview"),
                        "genre": ", ".join(genres[:2]) if genres else None,
                        "cast": ", ".join(c.get("name", "") for c in cast_list[:8]) if cast_list else None,
                        "rating": round(tv_data.get("vote_average", 0) / 2, 2) if tv_data.get("vote_average") else None,
                        "stills": ["https://image.tmdb.org/t/p/w780" + b["file_path"] for b in backdrops[:6] if b.get("file_path")],
                        "tmdb_id": tmdb_tv_id,
                    }

        if not enriched:
            results.append({"id": fid, "title": title, "status": "not_found"})
            continue

        stills = enriched.pop("stills", [])
        with get_db() as conn:
            conn.execute("""UPDATE films SET description=COALESCE(?,description), poster=COALESCE(?,poster),
                backdrop=COALESCE(?,backdrop), runtime=COALESCE(?,runtime), genre=COALESCE(?,genre),
                director=COALESCE(?,director), cast=COALESCE(?,cast), trailer_url=COALESCE(?,trailer_url),
                rating=COALESCE(?,rating), tmdb_id=COALESCE(?,tmdb_id) WHERE id=?""",
                (enriched.get("description"), enriched.get("poster"), enriched.get("backdrop"),
                 enriched.get("runtime"), enriched.get("genre"), enriched.get("director"),
                 enriched.get("cast"), enriched.get("trailer_url"), enriched.get("rating"),
                 enriched.get("tmdb_id"), fid))
            if stills:
                conn.execute("DELETE FROM film_stills WHERE film_id=?", (fid,))
                for url in stills:
                    conn.execute("INSERT INTO film_stills (film_id, still_url) VALUES (?,?)", (fid, url))
        results.append({"id": fid, "title": title, "status": "ok"})

    return {"enriched": len([r for r in results if r["status"] == "ok"]), "results": results}


@app.get("/api/tmdb/enrich")
def tmdb_enrich(title: str, year: Optional[int] = None):
    """Return full TMDB enrichment data for a title (for preview before saving)."""
    if not os.environ.get("TMDB_API_KEY", "") and not os.environ.get("TMDB_READ_TOKEN", ""):
        raise HTTPException(status_code=503, detail="TMDB_API_KEY not configured")
    data = _tmdb.enrich_film(title, year)
    if not data:
        raise HTTPException(status_code=404, detail="No TMDB match found")
    return data


@app.post("/api/films/{film_id}/reenrich")
def reenrich_film(film_id: int, current_user=Depends(get_current_user)):
    """Re-enrich a film from TMDB and update the DB entry."""
    with get_db() as db:
        row = db.execute("SELECT title, year FROM films WHERE id = ?", (film_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Film not found")
        title, year = row["title"], row["year"]
    enriched = _tmdb.enrich_film(title, year)
    if not enriched:
        # Fallback: try TMDB TV search
        sr = _tvmaze._tmdb_get("/search/tv", {"query": title, "language": "en-US"})
        tv_results = (sr or {}).get("results", [])
        if tv_results:
            tmdb_tv_id = tv_results[0]["id"]
            tv_data = _tvmaze._tmdb_get(f"/tv/{tmdb_tv_id}",
                {"language": "en-US", "append_to_response": "videos,images,credits"})
            if tv_data:
                poster = tv_data.get("poster_path")
                backdrop = tv_data.get("backdrop_path")
                trailer_url = None
                for v in (tv_data.get("videos") or {}).get("results", []):
                    if v.get("site") == "YouTube" and v.get("type") == "Trailer":
                        trailer_url = "https://www.youtube.com/embed/" + v["key"]
                        break
                backdrops = (tv_data.get("images") or {}).get("backdrops", [])
                cast_list = (tv_data.get("credits") or {}).get("cast", [])
                genres = [g.get("name") for g in tv_data.get("genres", []) if g.get("name")]
                enriched = {
                    "poster": ("https://image.tmdb.org/t/p/w342" + poster) if poster else None,
                    "backdrop": ("https://image.tmdb.org/t/p/w1280" + backdrop) if backdrop else None,
                    "trailer_url": trailer_url,
                    "description": tv_data.get("overview"),
                    "genre": ", ".join(genres[:2]) if genres else None,
                    "cast": ", ".join(c.get("name", "") for c in cast_list[:8]) if cast_list else None,
                    "rating": round(tv_data.get("vote_average", 0) / 2, 2) if tv_data.get("vote_average") else None,
                    "stills": ["https://image.tmdb.org/t/p/w780" + b["file_path"] for b in backdrops[:6] if b.get("file_path")],
                    "tmdb_id": tmdb_tv_id,
                }
    if not enriched:
        raise HTTPException(status_code=404, detail="No TMDB match found")
    with get_db() as db:
        stills = enriched.pop("stills", [])
        db.execute("""UPDATE films SET description=?, poster=?, backdrop=?, runtime=?, genre=?,
            director=?, cast=?, trailer_url=?, rating=?, tmdb_id=? WHERE id=?""",
            (enriched.get("description"), enriched.get("poster"), enriched.get("backdrop"),
             enriched.get("runtime"), enriched.get("genre"), enriched.get("director"),
             enriched.get("cast"), enriched.get("trailer_url"), enriched.get("rating"),
             enriched.get("tmdb_id"), film_id))
        db.execute("DELETE FROM film_stills WHERE film_id = ?", (film_id,))
        for url in stills:
            db.execute("INSERT INTO film_stills (film_id, still_url) VALUES (?, ?)", (film_id, url))
    return {"ok": True, "film_id": film_id, "title": title}


@app.get("/api/tvmaze/enrich")
def tvmaze_enrich(id: int):
    """Return full TVmaze enrichment data for a show (for preview before saving)."""
    data = _tvmaze.enrich_show(id)
    if not data:
        raise HTTPException(status_code=404, detail="No TVmaze match found")
    # Try to add UK streaming providers via TMDB TV search
    if not data.get("streamers"):
        try:
            PROVIDER_MAP = {8: "netflix", 9: "prime", 337: "disney", 350: "apple",
                            1899: "hbo", 384: "hbo", 531: "paramount", 38: "bbc"}
            title = data.get("description", "") and _tvmaze._get(f"/shows/{id}").get("name", "") if False else ""
            # Find TMDB TV ID by title
            show_resp = _tvmaze._get(f"/shows/{id}")
            name = (show_resp or {}).get("name", "") if show_resp else ""
            year = data.get("year")
            if name:
                sr = _tvmaze._tmdb_get("/search/tv", {"query": name, "language": "en-US"})
                tmdb_tv = ((sr or {}).get("results") or [None])[0]
                if tmdb_tv:
                    tid = tmdb_tv["id"]
                    prov = _tvmaze._tmdb_get(f"/tv/{tid}/watch/providers")
                    gb = ((prov or {}).get("results") or {}).get("GB", {})
                    flatrate = gb.get("flatrate") or []
                    data["streamers"] = list(dict.fromkeys(
                        PROVIDER_MAP[p["provider_id"]] for p in flatrate if p.get("provider_id") in PROVIDER_MAP
                    ))
        except Exception:
            pass
    return data



@app.get("/api/trending/tv-schedule")
def tv_schedule():
    """Proxy UK TV schedule from TVmaze, deduplicated by show."""
    import urllib.request, json as _json, datetime
    today = datetime.date.today().isoformat()
    url = f"https://api.tvmaze.com/schedule?country=GB&date={today}"
    try:
        with urllib.request.urlopen(url, timeout=8) as resp:
            data = _json.loads(resp.read())
    except Exception:
        return []
    SOAPS = {"EastEnders","Emmerdale","Hollyoaks","Coronation Street","Doctors",
             "Home and Away","Neighbours","Fair City","Casualty","Waterloo Road"}
    seen = set()
    results = []
    for ep in data:
        show = ep.get("show", {})
        sid = show.get("id")
        if not sid or sid in seen:
            continue
        show_type = show.get("type", "")
        runtime = show.get("runtime") or show.get("averageRuntime") or 0
        if show_type == "Sports":
            pass
        elif show_type == "Scripted" and runtime >= 45:
            pass
        else:
            continue
        if show.get("name", "") in SOAPS:
            continue
        seen.add(sid)
        img = show.get("image") or {}
        results.append({
            "id": sid,
            "name": show.get("name", ""),
            "image": img.get("medium") or img.get("original"),
            "channel": (show.get("network") or show.get("webChannel") or {}).get("name", ""),
            "genres": show.get("genres", []),
            "airtime": ep.get("airtime", ""),
            "summary": (show.get("summary") or "").replace("<p>", "").replace("</p>", "").replace("<b>", "").replace("</b>", ""),
            "rating": show.get("rating", {}).get("average"),
        })
    return results[:20]


@app.get("/api/trending/upcoming-tv")
def upcoming_tv():
    """UK TV shows airing in the next 7 days from TVmaze, deduplicated by show."""
    import urllib.request, json as _json, datetime
    SOAPS = {"EastEnders","Emmerdale","Hollyoaks","Coronation Street","Doctors",
             "Home and Away","Neighbours","Fair City","Casualty","Waterloo Road"}
    seen = set()
    results = []
    today = datetime.date.today()
    for offset in range(1, 8):
        day = (today + datetime.timedelta(days=offset)).isoformat()
        url = f"https://api.tvmaze.com/schedule?country=GB&date={day}"
        try:
            with urllib.request.urlopen(url, timeout=8) as resp:
                data = _json.loads(resp.read())
        except Exception:
            continue
        for ep in data:
            show = ep.get("show", {})
            sid = show.get("id")
            if not sid or sid in seen:
                continue
            show_type = show.get("type", "")
            runtime = show.get("runtime") or show.get("averageRuntime") or 0
            if show_type == "Sports":
                pass
            elif show_type == "Scripted" and runtime >= 45:
                pass
            else:
                continue
            if show.get("name", "") in SOAPS:
                continue
            seen.add(sid)
            img = show.get("image") or {}
            results.append({
                "id": sid,
                "name": show.get("name", ""),
                "image": img.get("medium") or img.get("original"),
                "channel": (show.get("network") or show.get("webChannel") or {}).get("name", ""),
                "genres": show.get("genres", []),
                "airdate": day,
                "airtime": ep.get("airtime", ""),
                "summary": (show.get("summary") or "").replace("<p>","").replace("</p>","").replace("<b>","").replace("</b>",""),
                "rating": show.get("rating", {}).get("average"),
            })
            if len(results) >= 30:
                break
        if len(results) >= 30:
            break
        if len(results) >= 20:
            break
    return results


@app.get("/api/trending/discover-tv")
def discover_tv():
    """Popular TV shows from TMDB."""
    data = _tvmaze._tmdb_get("/tv/popular", {"language": "en-US", "page": 1})
    if not data:
        return []
    results = []
    for s in (data.get("results") or [])[:20]:
        poster = s.get("poster_path")
        results.append({
            "id": s.get("id"),
            "name": s.get("name", ""),
            "image": f"https://image.tmdb.org/t/p/w185{poster}" if poster else None,
            "poster_large": f"https://image.tmdb.org/t/p/w342{poster}" if poster else None,
            "overview": (s.get("overview") or "")[:200],
            "rating": s.get("vote_average"),
            "first_air_date": s.get("first_air_date", ""),
            "genres": s.get("genre_ids", []),
        })
    return results


@app.get("/api/tmdb/tv/{tmdb_id}")
def tmdb_tv_detail(tmdb_id: int):
    """Fetch TMDB TV show details for the film detail page."""
    data = _tvmaze._tmdb_get(f"/tv/{tmdb_id}",
                              {"language": "en-US", "append_to_response": "videos,images,credits"})
    if not data:
        raise HTTPException(status_code=404, detail="Show not found")
    poster = data.get("poster_path")
    backdrop = data.get("backdrop_path")
    trailer_url = None
    for v in (data.get("videos") or {}).get("results", []):
        if v.get("site") == "YouTube" and v.get("type") == "Trailer":
            trailer_url = "https://www.youtube.com/embed/" + v["key"]
            break
    backdrops = (data.get("images") or {}).get("backdrops", [])
    stills = ["https://image.tmdb.org/t/p/w780" + b["file_path"]
              for b in backdrops[:6] if b.get("file_path")]
    cast_list = (data.get("credits") or {}).get("cast", [])
    cast = ", ".join(c.get("name", "") for c in cast_list[:8]) if cast_list else None
    genres = [g.get("name") for g in data.get("genres", []) if g.get("name")]
    rt = data.get("episode_run_time", [])
    vote = data.get("vote_average", 0)
    year_str = (data.get("first_air_date") or "")[:4]
    # UK streaming providers
    PROVIDER_MAP = {8: "netflix", 9: "prime", 337: "disney", 350: "apple",
                    1899: "hbo", 384: "hbo", 531: "paramount", 38: "bbc"}
    prov_data = _tvmaze._tmdb_get(f"/tv/{tmdb_id}/watch/providers")
    gb_prov = ((prov_data or {}).get("results") or {}).get("GB", {})
    flatrate = gb_prov.get("flatrate") or []
    streamers = list(dict.fromkeys(
        PROVIDER_MAP[p["provider_id"]] for p in flatrate if p.get("provider_id") in PROVIDER_MAP
    ))
    return {
        "title": data.get("name", ""),
        "description": data.get("overview", ""),
        "poster": ("https://image.tmdb.org/t/p/w342" + poster) if poster else None,
        "backdrop": ("https://image.tmdb.org/t/p/w1280" + backdrop) if backdrop else None,
        "genre": ", ".join(genres[:2]) if genres else None,
        "rating": round(vote / 2, 2) if vote else None,
        "year": int(year_str) if year_str.isdigit() else None,
        "runtime": (str(rt[0]) + "m") if rt else None,
        "cast": cast,
        "trailer_url": trailer_url,
        "stills": stills,
        "streamers": streamers,
    }


@app.get("/api/providers")
def get_providers():
    """Return TMDB logo URLs for our supported streaming providers (UK)."""
    PROVIDER_MAP = {8: "netflix", 9: "prime", 337: "disney", 350: "apple",
                    1899: "hbo", 384: "hbo", 531: "paramount", 38: "bbc"}
    data = _tvmaze._tmdb_get("/watch/providers/movie", {"watch_region": "GB"})
    result = {}
    for p in (data or {}).get("results", []):
        pid = p.get("provider_id")
        if pid in PROVIDER_MAP:
            key = PROVIDER_MAP[pid]
            path = p.get("logo_path", "")
            if path and key not in result:
                result[key] = f"https://image.tmdb.org/t/p/w45{path}"
    return result


@app.get("/api/trending/watchlist-recent")
def trending_watchlist_recent():
    """Films ordered by most watches + recommendations in the last 7 days."""
    with get_db() as conn:
        rows = conn.execute("""
            SELECT f.*,
                COUNT(DISTINCT uw.id) as watchlist_count,
                (
                    SELECT COUNT(*) FROM user_watched uwat WHERE uwat.film_id = f.id
                    AND uwat.created_at >= datetime('now', '-7 days')
                ) +
                (
                    SELECT COUNT(*) FROM user_watchlist uwl WHERE uwl.film_id = f.id
                    AND uwl.created_at >= datetime('now', '-7 days')
                ) +
                (
                    SELECT COUNT(*) FROM user_recommendations ur WHERE ur.film_id = f.id
                    AND ur.created_at >= datetime('now', '-7 days')
                ) as recent_score
            FROM films f
            LEFT JOIN user_watchlist uw ON uw.film_id = f.id
            WHERE f.poster IS NOT NULL AND f.poster != ''
            GROUP BY f.id
            ORDER BY recent_score DESC, COUNT(DISTINCT uw.id) DESC
            LIMIT 15
        """).fetchall()
        result = []
        for row in rows:
            streamers = [r["streamer"] for r in conn.execute(
                "SELECT streamer FROM film_streamers WHERE film_id=?", (row["id"],)
            ).fetchall()]
            stills = [r["still_url"] for r in conn.execute(
                "SELECT still_url FROM film_stills WHERE film_id=? ORDER BY rowid", (row["id"],)
            ).fetchall()]
            d = row_to_film(row, streamers, stills)
            d["watchlistCount"] = row["watchlist_count"]
            result.append(d)
    return result


@app.get("/api/trending/all")
def trending_all():
    """TMDB trending movies and TV shows this week."""
    data = _tvmaze._tmdb_get("/trending/all/week", {"language": "en-US"})
    if not data:
        return []
    results = []
    for s in (data.get("results") or [])[:20]:
        poster = s.get("poster_path")
        is_tv = s.get("media_type") == "tv"
        results.append({
            "id": s.get("id"),
            "title": s.get("name") if is_tv else s.get("title"),
            "poster": f"https://image.tmdb.org/t/p/w185{poster}" if poster else None,
            "poster_large": f"https://image.tmdb.org/t/p/w342{poster}" if poster else None,
            "overview": (s.get("overview") or "")[:200],
            "rating": round(s.get("vote_average", 0) / 2, 2) if s.get("vote_average") else None,
            "popularity": round(s.get("popularity", 0), 1) if s.get("popularity") else None,
            "year": (s.get("release_date") or s.get("first_air_date") or "")[:4],
            "media_type": s.get("media_type", "movie"),
        })
    return results


@app.get("/api/admin/check-providers")
def check_providers(title: str):
    """Debug: show all UK streaming providers TMDB returns for a title."""
    results = {}
    for media in ("movie", "tv"):
        sr = _tvmaze._tmdb_get(f"/search/{media}", {"query": title, "language": "en-US"})
        hit = ((sr or {}).get("results") or [None])[0]
        if hit:
            tid = hit["id"]
            prov = _tvmaze._tmdb_get(f"/{media}/{tid}/watch/providers")
            gb = ((prov or {}).get("results") or {}).get("GB", {})
            results[media] = {
                "tmdb_id": tid,
                "tmdb_title": hit.get("title") or hit.get("name"),
                "flatrate": [{"id": p["provider_id"], "name": p["provider_name"]} for p in (gb.get("flatrate") or [])],
                "rent": [{"id": p["provider_id"], "name": p["provider_name"]} for p in (gb.get("rent") or [])],
            }
    return results



@app.get("/api/admin/backfill-streamers")
@app.post("/api/admin/backfill-streamers")
def backfill_streamers():
    """Backfill film_streamers from TMDB watch/providers for all films with a tmdb_id."""
    PROVIDER_MAP = {8: "netflix", 9: "prime", 337: "disney", 350: "apple",
                    1899: "hbo", 384: "hbo", 531: "paramount", 38: "bbc"}
    updated = []
    skipped = []
    with get_db() as conn:
        films = conn.execute("SELECT id, title, tmdb_id, tvmaze_id FROM films").fetchall()
        for film in films:
            fid = film["id"]
            tmdb_id = film["tmdb_id"]
            tvmaze_id = film["tvmaze_id"]
            try:
                streamers = []
                if tmdb_id:
                    # Try as movie first
                    prov_data = _tvmaze._tmdb_get(f"/movie/{tmdb_id}/watch/providers")
                    gb_prov = ((prov_data or {}).get("results") or {}).get("GB", {})
                    flatrate = gb_prov.get("flatrate") or []
                    streamers = list(dict.fromkeys(
                        PROVIDER_MAP[p["provider_id"]] for p in flatrate if p.get("provider_id") in PROVIDER_MAP
                    ))
                    if not streamers:
                        # Try as TV show using same tmdb_id
                        prov_data = _tvmaze._tmdb_get(f"/tv/{tmdb_id}/watch/providers")
                        gb_prov = ((prov_data or {}).get("results") or {}).get("GB", {})
                        flatrate = gb_prov.get("flatrate") or []
                        streamers = list(dict.fromkeys(
                            PROVIDER_MAP[p["provider_id"]] for p in flatrate if p.get("provider_id") in PROVIDER_MAP
                        ))
                else:
                    # No tmdb_id at all: search TMDB by title (try movie then TV)
                    title = film["title"]
                    for media in ("movie", "tv"):
                        sr = _tvmaze._tmdb_get(f"/search/{media}", {"query": title, "language": "en-US"})
                        result = ((sr or {}).get("results") or [None])[0]
                        if result:
                            tid = result["id"]
                            prov = _tvmaze._tmdb_get(f"/{media}/{tid}/watch/providers")
                            gb = ((prov or {}).get("results") or {}).get("GB", {})
                            flatrate = gb.get("flatrate") or []
                            streamers = list(dict.fromkeys(
                                PROVIDER_MAP[p["provider_id"]] for p in flatrate if p.get("provider_id") in PROVIDER_MAP
                            ))
                            if streamers:
                                break
                if streamers:
                    conn.execute("DELETE FROM film_streamers WHERE film_id = ?", (fid,))
                    for s in streamers:
                        conn.execute("INSERT OR IGNORE INTO film_streamers (film_id, streamer) VALUES (?, ?)", (fid, s))
                    updated.append({"id": fid, "title": film["title"], "streamers": streamers})
                else:
                    skipped.append({"id": fid, "title": film["title"]})
            except Exception as e:
                skipped.append({"id": fid, "title": film["title"], "error": str(e)})
    return {"updated": updated, "skipped": skipped}


@app.post("/api/me/recommendations", status_code=201)
def record_recommendation(body: dict, current_user=Depends(require_user)):
    """Record that a film was recommended to the current user via a share link."""
    film_slug = body.get("film_slug", "")
    film_id = body.get("film_id")
    from_username = body.get("from_username", "")
    note = body.get("note", "")
    rating = body.get("rating")
    with get_db() as conn:
        if film_id:
            film = conn.execute("SELECT id FROM films WHERE id=?", (film_id,)).fetchone()
        else:
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
                "INSERT OR IGNORE INTO user_recommendations (film_id, from_user_id, to_user_id, note, rating) VALUES (?,?,?,?,?)",
                (film["id"], from_user_id, current_user["id"], note or None, rating or None)
            )
        except Exception:
            pass
    return {"ok": True}


@app.get("/api/me/recommendations")
def get_recommendations(current_user=Depends(require_user)):
    """Films explicitly recommended to the current user via share links."""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT f.*, u.username as rec_from_username, u.display_name as rec_from_name, ur.note as rec_note, ur.rating as rec_rating
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
            d["_fromFriend"] = row["rec_from_name"] or row["rec_from_username"]
            d["_recNote"] = row["rec_note"]
            d["_recRating"] = row["rec_rating"]
            result.append(d)
        return result


@app.post("/api/me/send-recommendation")
def send_recommendation(body: dict, current_user=Depends(require_user)):
    """Push an in-app recommendation to a friend directly."""
    film_id = body.get("film_id")
    to_username = body.get("to_username", "")
    note = body.get("note", "")
    with get_db() as conn:
        to_user = conn.execute("SELECT id FROM users WHERE username=?", (to_username,)).fetchone()
        if not to_user:
            raise HTTPException(status_code=404, detail="User not found")
        film = conn.execute("SELECT id FROM films WHERE id=?", (film_id,)).fetchone()
        if not film:
            raise HTTPException(status_code=404, detail="Film not found")
        try:
            conn.execute(
                "INSERT OR REPLACE INTO user_recommendations (film_id, from_user_id, to_user_id, note) VALUES (?,?,?,?)",
                (film_id, current_user["id"], to_user["id"], note or None)
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True}





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


# ─── Admin ────────────────────────────────────────────────────────────────────

ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "reel-admin-2024")
ADMIN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "admin.html")


def _check_admin(token: str = ""):
    if not token or token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/admin", include_in_schema=False)
def serve_admin():
    return FileResponse(ADMIN_FILE)


@app.get("/api/admin/users")
def admin_users_list(token: str = ""):
    _check_admin(token)
    with get_db() as conn:
        rows = conn.execute("""
            SELECT u.id, u.username, COALESCE(u.display_name, u.username) as display_name,
                   u.avatar, u.color, u.created_at,
                   (SELECT MAX(ts) FROM (
                       SELECT u2.last_login_at as ts FROM users u2 WHERE u2.id=u.id
                       UNION ALL SELECT MAX(wl.added_at) FROM user_watchlist wl WHERE wl.user_id=u.id
                       UNION ALL SELECT MAX(wd.watched_at) FROM user_watched wd WHERE wd.user_id=u.id
                       UNION ALL SELECT MAX(rc.created_at) FROM user_recommendations rc WHERE rc.from_user_id=u.id
                       UNION ALL SELECT MAX(sl.created_at) FROM search_logs sl WHERE sl.user_id=u.id
                   ) WHERE ts IS NOT NULL) as last_login_at,
                   COUNT(DISTINCT uf.id) as friend_count,
                   COUNT(DISTINCT uw.film_id) as watchlist_count
            FROM users u
            LEFT JOIN user_friends uf ON (uf.requester_id=u.id OR uf.addressee_id=u.id) AND uf.status='accepted'
            LEFT JOIN user_watchlist uw ON uw.user_id=u.id
            GROUP BY u.id ORDER BY u.created_at DESC
        """).fetchall()
        return [dict(r) for r in rows]


@app.get("/api/admin/watchlist")
def admin_watchlist(token: str = "", user_id: Optional[int] = None):
    _check_admin(token)
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    with get_db() as conn:
        rows = conn.execute("""
            SELECT f.title, uw.added_at,
                   CASE WHEN wd.film_id IS NOT NULL THEN 1 ELSE 0 END as watched
            FROM user_watchlist uw
            JOIN films f ON f.id = uw.film_id
            LEFT JOIN user_watched wd ON wd.film_id = uw.film_id AND wd.user_id = uw.user_id
            WHERE uw.user_id = ?
            ORDER BY uw.added_at DESC
        """, (user_id,)).fetchall()
        return [dict(r) for r in rows]


@app.get("/api/admin/debug")
def admin_debug(token: str = ""):
    _check_admin(token)
    with get_db() as conn:
        tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()]
        user_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        cols = [r[1] for r in conn.execute("PRAGMA table_info(users)").fetchall()]
        return {"tables": tables, "user_count": user_count, "user_columns": cols}


@app.get("/api/admin/stats")
def admin_stats(token: str = "", user_id: Optional[int] = None):
    _check_admin(token)
    with get_db() as conn:
        if user_id:
            fc = conn.execute("SELECT COUNT(*) as c FROM user_friends WHERE (requester_id=? OR addressee_id=?) AND status='accepted'", (user_id, user_id)).fetchone()["c"]
            wc = conn.execute("SELECT COUNT(*) as c FROM user_watchlist WHERE user_id=?", (user_id,)).fetchone()["c"]
            dc = conn.execute("SELECT COUNT(*) as c FROM user_watched WHERE user_id=?", (user_id,)).fetchone()["c"]
            rc = conn.execute("SELECT COUNT(*) as c FROM user_recommendations WHERE from_user_id=? OR to_user_id=?", (user_id, user_id)).fetchone()["c"]
            return [
                {"label": "Friends", "value": fc},
                {"label": "Watchlisted", "value": wc},
                {"label": "Watched", "value": dc},
                {"label": "Recommendations", "value": rc},
            ]
        else:
            total = conn.execute("SELECT COUNT(*) as c FROM users").fetchone()["c"]
            new7 = conn.execute("SELECT COUNT(*) as c FROM users WHERE created_at >= datetime('now','-7 days')").fetchone()["c"]
            new14 = conn.execute("SELECT COUNT(*) as c FROM users WHERE created_at >= datetime('now','-14 days') AND created_at < datetime('now','-7 days')").fetchone()["c"]
            try:
                active_today = conn.execute("""SELECT COUNT(DISTINCT user_id) as c FROM (
                    SELECT user_id FROM user_watchlist WHERE date(added_at)=date('now')
                    UNION SELECT user_id FROM user_watched WHERE date(watched_at)=date('now')
                    UNION SELECT from_user_id as user_id FROM user_recommendations WHERE date(created_at)=date('now') AND from_user_id IS NOT NULL
                )""").fetchone()["c"]
                active_yesterday = conn.execute("""SELECT COUNT(DISTINCT user_id) as c FROM (
                    SELECT user_id FROM user_watchlist WHERE date(added_at)=date('now','-1 day')
                    UNION SELECT user_id FROM user_watched WHERE date(watched_at)=date('now','-1 day')
                    UNION SELECT from_user_id as user_id FROM user_recommendations WHERE date(created_at)=date('now','-1 day') AND from_user_id IS NOT NULL
                )""").fetchone()["c"]
            except:
                active_today = 0
                active_yesterday = 0
            recs_total = conn.execute("SELECT COUNT(*) as c FROM user_recommendations").fetchone()["c"]
            recs_rated = conn.execute("SELECT COUNT(*) as c FROM user_recommendations WHERE rating IS NOT NULL").fetchone()["c"]
            new_from_invites = conn.execute("SELECT COUNT(*) as c FROM users WHERE created_at >= datetime('now','-30 days')").fetchone()["c"]
            active_pct = round((active_today / max(active_yesterday,1) - 1) * 100) if active_yesterday else 0
            new_pct = round((new7 / max(new14,1) - 1) * 100) if new14 else 0
            conv_pct = round(recs_rated / max(recs_total,1) * 100)
            return {
                "total_users": total,
                "new_this_week": new7,
                "new_pct_change": new_pct,
                "active_today": active_today,
                "active_pct_change": active_pct,
                "recs_sent": recs_total,
                "recs_rated": recs_rated,
                "rec_conversion_pct": conv_pct,
                "new_last_30d": new_from_invites,
            }


@app.get("/api/admin/chart")
def admin_chart(token: str = "", user_id: Optional[int] = None, period: str = "day"):
    _check_admin(token)
    with get_db() as conn:
        now = datetime.now()

        if period == "week":
            n = 12
            window_days = n * 7
            grp = lambda col: f"strftime('%Y-%W', {col})"
            buckets = [(now - timedelta(weeks=i)).strftime("%Y-%W") for i in range(n-1, -1, -1)]
            labels = ["W" + b.split("-")[1].lstrip("0") or "0" for b in buckets]
            win = f"datetime('now', '-{window_days} days')"
        elif period == "month":
            n = 12
            grp = lambda col: f"strftime('%Y-%m', {col})"
            buckets = []
            for i in range(n-1, -1, -1):
                m = now.month - i
                y = now.year
                while m <= 0:
                    m += 12
                    y -= 1
                buckets.append(f"{y:04d}-{m:02d}")
            month_names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
            labels = [month_names[int(b[5:])-1] for b in buckets]
            win = f"'{buckets[0]}-01'"
        else:  # day
            n = 14
            grp = lambda col: f"date({col})"
            buckets = [(now - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(n-1, -1, -1)]
            labels = [d[5:] for d in buckets]
            win = f"datetime('now', '-{n} days')"

        def win_clause(col):
            if period == "month":
                return f"strftime('%Y-%m', {col}) >= '{buckets[0]}'"
            return f"{col} >= {win}"

        # DAU/WAU/MAU
        if user_id:
            dau_rows = conn.execute(f"""
                SELECT {grp('day')} as bucket, COUNT(DISTINCT user_id) as c FROM (
                    SELECT added_at as day, user_id FROM user_watchlist WHERE user_id=? AND {win_clause('added_at')}
                    UNION ALL SELECT watched_at, user_id FROM user_watched WHERE user_id=? AND {win_clause('watched_at')}
                    UNION ALL SELECT created_at, from_user_id FROM user_recommendations WHERE from_user_id=? AND {win_clause('created_at')}
                ) GROUP BY bucket
            """, (user_id, user_id, user_id)).fetchall()
        else:
            dau_rows = conn.execute(f"""
                SELECT {grp('day')} as bucket, COUNT(DISTINCT user_id) as c FROM (
                    SELECT added_at as day, user_id FROM user_watchlist WHERE {win_clause('added_at')}
                    UNION ALL SELECT watched_at, user_id FROM user_watched WHERE {win_clause('watched_at')}
                    UNION ALL SELECT created_at, from_user_id FROM user_recommendations WHERE from_user_id IS NOT NULL AND {win_clause('created_at')}
                ) GROUP BY bucket
            """).fetchall()
        dau_data = {r["bucket"]: r["c"] for r in dau_rows}

        # Searches
        if user_id:
            srch_rows = conn.execute(f"SELECT {grp('created_at')} as bucket, COUNT(*) as c FROM search_logs WHERE user_id=? AND {win_clause('created_at')} GROUP BY bucket", (user_id,)).fetchall()
        else:
            try:
                srch_rows = conn.execute(f"SELECT {grp('created_at')} as bucket, COUNT(*) as c FROM search_logs WHERE {win_clause('created_at')} GROUP BY bucket").fetchall()
            except:
                srch_rows = []
        srch_data = {r["bucket"]: r["c"] for r in srch_rows}

        # New accounts
        if user_id:
            acct_rows = conn.execute(f"SELECT {grp('created_at')} as bucket, 1 as c FROM users WHERE id=? AND {win_clause('created_at')}", (user_id,)).fetchall()
        else:
            acct_rows = conn.execute(f"SELECT {grp('created_at')} as bucket, COUNT(*) as c FROM users WHERE {win_clause('created_at')} GROUP BY bucket").fetchall()
        acct_data = {r["bucket"]: r["c"] for r in acct_rows}

        # Tab views
        if user_id:
            try:
                tab_rows = conn.execute(f"SELECT {grp('created_at')} as bucket, COUNT(*) as c FROM tab_views WHERE user_id=? AND {win_clause('created_at')} GROUP BY bucket", (user_id,)).fetchall()
            except:
                tab_rows = []
        else:
            try:
                tab_rows = conn.execute(f"SELECT {grp('created_at')} as bucket, COUNT(*) as c FROM tab_views WHERE {win_clause('created_at')} GROUP BY bucket").fetchall()
            except:
                tab_rows = []
        tab_data = {r["bucket"]: r["c"] for r in tab_rows}

        # Cumulative users — total on DB as of each period bucket (respects period filter)
        cum_rows = conn.execute(
            f"SELECT {grp('created_at')} as bucket, COUNT(*) as c FROM users WHERE created_at IS NOT NULL GROUP BY bucket ORDER BY bucket"
        ).fetchall()
        cum_counts = [(r["bucket"], r["c"]) for r in cum_rows if r["bucket"]]
        cumulative_labels = []
        cumulative_totals = []
        for i, b in enumerate(buckets):
            total = sum(c for bk, c in cum_counts if bk <= b)
            cumulative_labels.append(labels[i])
            cumulative_totals.append(total)

        return {
            "labels": labels,
            "dau": [dau_data.get(b, 0) for b in buckets],
            "searches": [srch_data.get(b, 0) for b in buckets],
            "new_accounts": [acct_data.get(b, 0) for b in buckets],
            "tab_views": [tab_data.get(b, 0) for b in buckets],
            "cumulative_labels": cumulative_labels,
            "cumulative_totals": cumulative_totals,
        }


@app.get("/api/admin/recommendations")
def admin_recs(token: str = "", user_id: Optional[int] = None):
    _check_admin(token)
    with get_db() as conn:
        if user_id:
            rows = conn.execute("""
                SELECT ur.created_at, f.title as film_title,
                       COALESCE(uf.display_name, uf.username) as from_name,
                       COALESCE(ut.display_name, ut.username) as to_name,
                       ur.note, ur.rating
                FROM user_recommendations ur
                JOIN films f ON f.id=ur.film_id
                LEFT JOIN users uf ON uf.id=ur.from_user_id
                JOIN users ut ON ut.id=ur.to_user_id
                WHERE ur.from_user_id=? OR ur.to_user_id=?
                ORDER BY ur.created_at DESC LIMIT 30
            """, (user_id, user_id)).fetchall()
        else:
            rows = conn.execute("""
                SELECT ur.created_at, f.title as film_title,
                       COALESCE(uf.display_name, uf.username) as from_name,
                       COALESCE(ut.display_name, ut.username) as to_name,
                       ur.note, ur.rating
                FROM user_recommendations ur
                JOIN films f ON f.id=ur.film_id
                LEFT JOIN users uf ON uf.id=ur.from_user_id
                JOIN users ut ON ut.id=ur.to_user_id
                ORDER BY ur.created_at DESC LIMIT 30
            """).fetchall()
        return [dict(r) for r in rows]


@app.get("/api/admin/activity")
def admin_activity(token: str = "", user_id: Optional[int] = None):
    _check_admin(token)
    with get_db() as conn:
        events = []
        uid_filter = (user_id,) if user_id else ()
        where_user_wl = "WHERE uw.user_id=?" if user_id else ""
        where_user_wd = "WHERE uw.user_id=?" if user_id else ""
        where_user_rc = "WHERE (ur.from_user_id=? OR ur.to_user_id=?)" if user_id else ""

        wl = conn.execute(f"""
            SELECT uw.added_at as ts, COALESCE(u.display_name,u.username) as user_name,
                   u.id as user_id, f.title as film, 'Added to Watchlist' as action, NULL as to_user, 'In-App' as channel
            FROM user_watchlist uw JOIN users u ON u.id=uw.user_id JOIN films f ON f.id=uw.film_id
            {where_user_wl} ORDER BY uw.added_at DESC LIMIT 30
        """, uid_filter).fetchall()
        events.extend([dict(r) for r in wl])

        wd = conn.execute(f"""
            SELECT uw.watched_at as ts, COALESCE(u.display_name,u.username) as user_name,
                   u.id as user_id, f.title as film, 'Marked Watched' as action, NULL as to_user, 'In-App' as channel
            FROM user_watched uw JOIN users u ON u.id=uw.user_id JOIN films f ON f.id=uw.film_id
            {where_user_wd} ORDER BY uw.watched_at DESC LIMIT 30
        """, uid_filter).fetchall()
        events.extend([dict(r) for r in wd])

        rc_filter = (user_id, user_id) if user_id else ()
        rc = conn.execute(f"""
            SELECT ur.created_at as ts, COALESCE(uf.display_name,uf.username) as user_name,
                   uf.id as user_id, f.title as film, 'Recommended' as action,
                   COALESCE(ut.display_name,ut.username) as to_user, 'In-App' as channel
            FROM user_recommendations ur
            JOIN films f ON f.id=ur.film_id
            LEFT JOIN users uf ON uf.id=ur.from_user_id
            JOIN users ut ON ut.id=ur.to_user_id
            {where_user_rc} ORDER BY ur.created_at DESC LIMIT 30
        """, rc_filter).fetchall()
        events.extend([dict(r) for r in rc])

        # Search events
        sl_filter = (user_id,) if user_id else ()
        where_sl = "WHERE sl.user_id=?" if user_id else ""
        sl = conn.execute(f"""
            SELECT sl.created_at as ts, COALESCE(u.display_name,u.username,'Unknown') as user_name,
                   sl.user_id as user_id, sl.query as film, 'Searched' as action, NULL as to_user, 'In-App' as channel
            FROM search_logs sl LEFT JOIN users u ON u.id=sl.user_id
            {where_sl} ORDER BY sl.created_at DESC LIMIT 50
        """, sl_filter).fetchall()
        events.extend([dict(r) for r in sl])

        # Tab view events
        tv_filter = (user_id,) if user_id else ()
        where_tv = "WHERE tv.user_id=?" if user_id else ""
        tv = conn.execute(f"""
            SELECT tv.created_at as ts, COALESCE(u.display_name,u.username,'Unknown') as user_name,
                   tv.user_id as user_id, NULL as film, 'Opened ' || tv.tab_name || ' tab' as action, NULL as to_user, 'In-App' as channel
            FROM tab_views tv LEFT JOIN users u ON u.id=tv.user_id
            {where_tv} ORDER BY tv.created_at DESC LIMIT 50
        """, tv_filter).fetchall()
        events.extend([dict(r) for r in tv])

        # Generic event logs (trailer views, friend list views)
        try:
            el_filter = (user_id,) if user_id else ()
            where_el = "WHERE el.user_id=?" if user_id else ""
            el = conn.execute(f"""
                SELECT el.created_at as ts, COALESCE(u.display_name,u.username,'Unknown') as user_name,
                       el.user_id as user_id, el.detail as film,
                       CASE el.event_type
                           WHEN 'trailer_view' THEN 'Watched Trailer'
                           WHEN 'friend_view' THEN 'Viewed Friend List'
                           ELSE el.event_type
                       END as action,
                       NULL as to_user, 'In-App' as channel
                FROM event_logs el LEFT JOIN users u ON u.id=el.user_id
                {where_el} ORDER BY el.created_at DESC LIMIT 50
            """, el_filter).fetchall()
            events.extend([dict(r) for r in el])
        except Exception:
            pass

        events.sort(key=lambda x: x.get("ts") or "", reverse=True)
        return events[:100]


@app.get("/api/admin/friends")
def admin_friends_list(token: str = "", user_id: Optional[int] = None):
    _check_admin(token)
    with get_db() as conn:
        if user_id:
            rows = conn.execute("""
                SELECT u.id, COALESCE(u.display_name,u.username) as name, u.avatar, u.color, uf.created_at as since
                FROM user_friends uf
                JOIN users u ON (CASE WHEN uf.requester_id=? THEN u.id=uf.addressee_id ELSE u.id=uf.requester_id END)
                WHERE (uf.requester_id=? OR uf.addressee_id=?) AND uf.status='accepted'
            """, (user_id, user_id, user_id)).fetchall()
        else:
            rows = conn.execute("""
                SELECT u.id, COALESCE(u.display_name,u.username) as name, u.avatar, u.color,
                       COUNT(DISTINCT uf.id) as friend_count
                FROM users u
                LEFT JOIN user_friends uf ON (uf.requester_id=u.id OR uf.addressee_id=u.id) AND uf.status='accepted'
                GROUP BY u.id ORDER BY friend_count DESC LIMIT 15
            """).fetchall()
        return [dict(r) for r in rows]


# ─── Event logging (search + tab) ─────────────────────────────────────────────

@app.post("/api/log/search", status_code=201)
def log_search(body: dict, token: str = Depends(oauth2_scheme)):
    query = (body.get("query") or "").strip()
    if not query:
        return {"ok": True}
    user_id = None
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub", 0)) or None
        except Exception:
            pass
    with get_db() as conn:
        conn.execute("INSERT INTO search_logs (user_id, query) VALUES (?,?)", (user_id, query))
    return {"ok": True}


@app.post("/api/log/tab", status_code=201)
def log_tab(body: dict, token: str = Depends(oauth2_scheme)):
    tab = (body.get("tab") or "").strip()
    if not tab:
        return {"ok": True}
    user_id = None
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub", 0)) or None
        except Exception:
            pass
    with get_db() as conn:
        conn.execute("INSERT INTO tab_views (user_id, tab_name) VALUES (?,?)", (user_id, tab))
    return {"ok": True}


@app.post("/api/log/trailer", status_code=201)
def log_trailer(body: dict, token: str = Depends(oauth2_scheme)):
    film_title = (body.get("title") or "").strip()
    if not film_title:
        return {"ok": True}
    user_id = None
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub", 0)) or None
        except Exception:
            pass
    with get_db() as conn:
        try:
            conn.execute("CREATE TABLE IF NOT EXISTS event_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, event_type TEXT NOT NULL, detail TEXT, created_at TEXT DEFAULT (datetime('now')))")
        except Exception:
            pass
        conn.execute("INSERT INTO event_logs (user_id, event_type, detail) VALUES (?,?,?)", (user_id, "trailer_view", film_title))
    return {"ok": True}


@app.post("/api/log/friend_view", status_code=201)
def log_friend_view(body: dict, token: str = Depends(oauth2_scheme)):
    friend_name = (body.get("friend") or "").strip()
    user_id = None
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub", 0)) or None
        except Exception:
            pass
    with get_db() as conn:
        try:
            conn.execute("CREATE TABLE IF NOT EXISTS event_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, event_type TEXT NOT NULL, detail TEXT, created_at TEXT DEFAULT (datetime('now')))")
        except Exception:
            pass
        conn.execute("INSERT INTO event_logs (user_id, event_type, detail) VALUES (?,?,?)", (user_id, "friend_view", friend_name))
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

@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: int, token: str = ""):
    _check_admin(token)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        user = conn.execute("SELECT username FROM users WHERE id=?", (user_id,)).fetchone()
        if not user:
            conn.close()
            raise HTTPException(status_code=404, detail="User not found")
        # Disable FK enforcement so we can delete in any order
        conn.execute("PRAGMA foreign_keys = OFF")
        tables = [
            ("DELETE FROM user_watchlist WHERE user_id=?", (user_id,)),
            ("DELETE FROM user_watched WHERE user_id=?", (user_id,)),
            ("DELETE FROM user_ratings WHERE user_id=?", (user_id,)),
            ("DELETE FROM user_friends WHERE requester_id=? OR addressee_id=?", (user_id, user_id)),
            ("DELETE FROM user_recommendations WHERE from_user_id=? OR to_user_id=?", (user_id, user_id)),
            ("DELETE FROM search_logs WHERE user_id=?", (user_id,)),
            ("DELETE FROM tab_views WHERE user_id=?", (user_id,)),
            ("DELETE FROM users WHERE id=?", (user_id,)),
        ]
        for sql, params in tables:
            try:
                conn.execute(sql, params)
            except Exception:
                pass
        conn.commit()
    finally:
        conn.close()
    return {"deleted": user_id}

@app.post("/api/admin/assign-avatars")
def assign_avatars(token: str = ""):
    _check_admin(token)
    import random
    avatars = ["🌑","⚡","🔥","🌊","💀","💎","🌿","🎭","🎸","👑","☁️","🌙"]
    with get_db() as conn:
        rows = conn.execute('SELECT id, username FROM users WHERE avatar IS NULL OR avatar = ""').fetchall()
        for row in rows:
            conn.execute("UPDATE users SET avatar=? WHERE id=?", (random.choice(avatars), row["id"]))
    return {"updated": len(rows), "users": [r["username"] for r in rows]}
