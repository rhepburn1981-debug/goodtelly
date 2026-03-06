"""TVmaze API helper -- free, no key required."""

import urllib.request
import urllib.parse
import json
import re
import os

TVMAZE_BASE = "https://api.tvmaze.com"
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p"


def _get(path, params=None):
    url = f"{TVMAZE_BASE}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            return json.loads(resp.read())
    except Exception:
        return None


def _tmdb_get(path, params=None):
    key = os.environ.get("TMDB_API_KEY", "")
    if not key:
        return None
    p = dict(params or {})
    p["api_key"] = key
    url = f"{TMDB_BASE}{path}?{urllib.parse.urlencode(p)}"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            return json.loads(resp.read())
    except Exception:
        return None


def _strip_html(text):
    return re.sub(r"<[^>]+>", "", text or "").strip()


def _tmdb_tv_trailer_and_stills(title, year=None):
    """Look up a TV show on TMDB to get trailer URL and backdrop stills."""
    params = {"query": title, "language": "en-US"}
    if year:
        params["first_air_date_year"] = year
    data = _tmdb_get("/search/tv", params)
    if not data:
        return None, []
    results = data.get("results", [])
    if not results:
        return None, []

    # Pick best match: exact title, prefer matching year
    match = None
    title_lower = title.lower()
    for r in results[:5]:
        if (r.get("name") or "").lower() == title_lower:
            if year and str(year) in (r.get("first_air_date") or ""):
                match = r
                break
            if not match:
                match = r
    if not match:
        match = results[0]

    tmdb_id = match["id"]

    # Fetch videos + images
    details = _tmdb_get(f"/tv/{tmdb_id}", {"language": "en-US", "append_to_response": "videos,images"})
    if not details:
        return None, []

    # Trailer
    trailer_url = None
    for v in (details.get("videos") or {}).get("results", []):
        if v.get("site") == "YouTube" and v.get("type") == "Trailer":
            trailer_url = f"https://www.youtube.com/embed/{v['key']}"
            break

    # Stills from backdrops
    backdrops = (details.get("images") or {}).get("backdrops", [])
    stills = [f"{TMDB_IMAGE_BASE}/w780{b['file_path']}" for b in backdrops[:6] if b.get("file_path")]

    # Better backdrop if available
    backdrop_path = details.get("backdrop_path")
    backdrop = f"{TMDB_IMAGE_BASE}/w1280{backdrop_path}" if backdrop_path else None

    return trailer_url, stills, backdrop


def search_shows(query):
    data = _get("/search/shows", {"q": query})
    if not data:
        return []
    results = []
    for item in data[:10]:
        show = item.get("show", {})
        net = show.get("network") or show.get("webChannel") or {}
        country = (net.get("country") or {}).get("name", "")
        image = show.get("image") or {}
        premiered = show.get("premiered") or ""
        results.append({
            "tvmaze_id": show["id"],
            "title": show.get("name"),
            "year": premiered[:4] or None,
            "description": _strip_html(show.get("summary")),
            "poster": image.get("original") or image.get("medium"),
            "backdrop": image.get("original"),
            "rating": (show.get("rating") or {}).get("average"),
            "network": net.get("name"),
            "country": country,
            "type": show.get("type"),
            "genres": show.get("genres", []),
        })
    return results


def enrich_show(tvmaze_id):
    """Fetch full show details and return enriched fields for the films table."""
    data = _get(f"/shows/{tvmaze_id}", {"embed[]": "cast"})
    if not data:
        return {}

    image = data.get("image") or {}
    poster = image.get("original") or image.get("medium")
    backdrop = image.get("original")

    runtime_mins = data.get("runtime") or data.get("averageRuntime")
    runtime = f"{runtime_mins}m" if runtime_mins else None

    genres = data.get("genres", [])
    genre = ", ".join(genres) if genres else None

    cast_list = (data.get("_embedded") or {}).get("cast", [])
    cast = ", ".join(p["person"]["name"] for p in cast_list[:8]) if cast_list else None

    net = data.get("network") or data.get("webChannel") or {}
    network = net.get("name")
    country = (net.get("country") or {}).get("name", "")

    premiered = data.get("premiered") or ""
    year_str = premiered[:4]
    year = int(year_str) if year_str.isdigit() else None

    # Fetch trailer + stills from TMDB TV (TVmaze has no trailer data)
    trailer_url, stills, tmdb_backdrop = None, [], None
    try:
        result = _tmdb_tv_trailer_and_stills(data.get("name", ""), year)
        if result and len(result) == 3:
            trailer_url, stills, tmdb_backdrop = result
    except Exception:
        pass

    return {
        "tvmaze_id": tvmaze_id,
        "description": _strip_html(data.get("summary")),
        "poster": poster,
        "backdrop": tmdb_backdrop or backdrop,
        "runtime": runtime,
        "genre": genre,
        "director": None,
        "cast": cast,
        "trailer_url": trailer_url,
        "rating": (data.get("rating") or {}).get("average"),
        "stills": stills,
        "network": network,
        "country": country,
        "year": year,
    }
