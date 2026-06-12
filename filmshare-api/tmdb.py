"""TMDB API helper -- wraps The Movie Database API v3."""

import os
import urllib.request
import urllib.parse
import json
from typing import Optional

TMDB_API_KEY = os.environ.get("TMDB_API_KEY", "")
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p"


def _get(path: str, params: dict) -> dict:
    token = os.environ.get("TMDB_READ_TOKEN", "")
    key = os.environ.get("TMDB_API_KEY", "")
    if not token and not key:
        return {}
    url = f"{TMDB_BASE}{path}?{urllib.parse.urlencode(params)}"
    if not token:
        url += f"&api_key={key}"
    try:
        req = urllib.request.Request(url)
        if token:
            req.add_header("Authorization", f"Bearer {token}")
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"TMDB _get error for {path}: {e}", flush=True)
        return {}


def poster_url(path: Optional[str], size: str = "w500") -> Optional[str]:
    if not path:
        return None
    return f"{TMDB_IMAGE_BASE}/{size}{path}"


def backdrop_url(path: Optional[str], size: str = "w1280") -> Optional[str]:
    if not path:
        return None
    return f"{TMDB_IMAGE_BASE}/{size}{path}"


def search_film(title: str, year: Optional[int] = None) -> Optional[dict]:
    params = {"query": title, "language": "en-US", "page": 1}
    if year:
        params["year"] = year
    data = _get("/search/movie", params)
    results = data.get("results", [])
    if not results:
        return None
    if year:
        for r in results:
            rd = r.get("release_date", "")
            if rd and rd[:4] == str(year):
                return r
    return results[0]


def get_film_details(tmdb_id: int) -> dict:
    data = _get(f"/movie/{tmdb_id}", {
        "language": "en-US",
        "append_to_response": "credits,images"
    })
    # Fetch videos without language filter — non-English films only have native-language trailers
    data["videos"] = _get(f"/movie/{tmdb_id}/videos", {})
    return data


def enrich_film_by_id(tmdb_id: int) -> dict:
    """Enrich movie or TV show details using TMDB ID directly."""
    if not os.environ.get("TMDB_API_KEY", "") and not os.environ.get("TMDB_READ_TOKEN", ""):
        return {}

    details = get_film_details(tmdb_id)
    is_tv = False
    # If movie lookup returned no title, try as TV show
    if not details.get("title") and not details.get("overview"):
        details = _get(f"/tv/{tmdb_id}", {
            "language": "en-US",
            "append_to_response": "credits,images"
        })
        details["videos"] = _get(f"/tv/{tmdb_id}/videos", {})
        is_tv = bool(details.get("name"))

    if not details:
        return {}

    poster = poster_url(details.get("poster_path"))
    backdrop = backdrop_url(details.get("backdrop_path"))

    if is_tv:
        ep_runtimes = details.get("episode_run_time") or []
        runtime_mins = ep_runtimes[0] if ep_runtimes else None
    else:
        runtime_mins = details.get("runtime")
    runtime = f"{runtime_mins}m" if runtime_mins else None

    genres = [g["name"] for g in details.get("genres", [])]
    genre = ", ".join(genres) if genres else None

    credits = details.get("credits", {})
    crew = credits.get("crew", [])
    cast_list = credits.get("cast", [])
    if is_tv:
        creators = details.get("created_by") or []
        director = ", ".join(c["name"] for c in creators) if creators else None
    else:
        directors = [p["name"] for p in crew if p.get("job") == "Director"]
        director = ", ".join(directors) if directors else None
    cast = ", ".join(p["name"] for p in cast_list[:8]) if cast_list else None

    videos = details.get("videos", {}).get("results", [])
    trailer_key = None
    for v in videos:
        if v.get("site") == "YouTube" and v.get("type") == "Trailer":
            trailer_key = v["key"]
            break
    trailer_url = f"https://www.youtube.com/embed/{trailer_key}" if trailer_key else None

    images = details.get("images", {})
    backdrops = images.get("backdrops", [])
    stills = [backdrop_url(b["file_path"], "w780") for b in backdrops[:6]]

    return {
        "tmdb_id": tmdb_id,
        "description": details.get("overview"),
        "poster": poster,
        "backdrop": backdrop,
        "runtime": runtime,
        "genre": genre,
        "director": director,
        "cast": cast,
        "trailer_url": trailer_url,
        "rating": round(details.get("vote_average", 0) / 2.0, 2) if details.get("vote_average") else None,
        "stills": stills,
    }


_PROVIDER_MAP = {
    "netflix": "Netflix",
    "amazon prime video": "Prime Video",
    "prime video": "Prime Video",
    "disney plus": "Disney+",
    "disney+": "Disney+",
    "apple tv+": "Apple TV+",
    "apple tv plus": "Apple TV+",
    "hbo max": "Max",
    "max": "Max",
    "paramount plus": "Paramount+",
    "paramount+": "Paramount+",
    "now tv": "NOW TV",
    "now tv cinema": "NOW TV",
    "sky go": "NOW TV",
    "bbc iplayer": "BBC iPlayer",
    "bbc": "BBC iPlayer",
    "channel 4": "Channel 4",
    "channel 4 plus": "Channel 4",
    "itvx": "ITVX",
    "itv": "ITVX",
    "itvx premium": "ITVX",
    "britbox": "BritBox",
    "mubi": "MUBI",
    "shudder": "Shudder",
    "peacock": "Peacock",
    "hulu": "Hulu",
}

_SKIP_KEYWORDS = ("amazon channel", "apple tv channel", "store", "rent", "buy",
                  "with ads", "basic", "plus basic", "rakuten",
                  "google play", "youtube", "studiocanal", "mgm", "vudu",
                  "amazon video")


def _normalise_provider(name: str) -> str | None:
    lower = name.lower()
    for skip in _SKIP_KEYWORDS:
        if skip in lower:
            return None
    for key, label in _PROVIDER_MAP.items():
        if key in lower:
            return label
    return None


def get_watch_providers(tmdb_id: int, region: str = "GB", media_type: str = "movie") -> list:
    """Return normalised list of streaming service names for a film/show in the given region."""
    data = _get(f"/{media_type}/{tmdb_id}/watch/providers", {})
    results = data.get("results", {}).get(region, {})
    seen = []
    for key in ("flatrate", "free"):
        for p in results.get(key, []):
            label = _normalise_provider(p["provider_name"])
            if label and label not in seen:
                seen.append(label)
    return seen


def enrich_film(title: str, year: Optional[int] = None) -> dict:
    """Search TMDB for title and return enriched fields for the films table.
    Returns empty dict if TMDB is unavailable or no match found."""
    if not os.environ.get("TMDB_API_KEY", "") and not os.environ.get("TMDB_READ_TOKEN", ""):
        return {}

    match = search_film(title, year)
    if not match:
        return {}

    return enrich_film_by_id(match["id"])
