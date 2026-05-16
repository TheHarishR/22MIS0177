"""
Logging Middleware — Affordmed Campus Hiring Evaluation
=======================================================
Usage:
    from logger import Log

    Log("backend", "info",  "route",   "GET /notifications received")
    Log("backend", "error", "handler", "received string, expected bool")
    Log("backend", "fatal", "db",      "Critical database connection failure.")
"""

import requests
from config import (
    AUTH_ENDPOINT, LOG_ENDPOINT,
    CLIENT_ID, CLIENT_SECRET, EMAIL, NAME, ROLL_NO, ACCESS_CODE,
    VALID_STACKS, VALID_LEVELS, BACKEND_PACKAGES, FRONTEND_PACKAGES,
)

# Token cached in memory for the session
_token_cache: dict = {}


def _get_token() -> str:
    """Authenticate once and cache the Bearer token."""
    if _token_cache.get("access_token"):
        return _token_cache["access_token"]

    payload = {
        "email":        EMAIL,
        "name":         NAME,
        "rollNo":       ROLL_NO,
        "accessCode":   ACCESS_CODE,
        "clientID":     CLIENT_ID,
        "clientSecret": CLIENT_SECRET,
    }

    try:
        res = requests.post(AUTH_ENDPOINT, json=payload, timeout=10)
        res.raise_for_status()
        data = res.json()
        token = data.get("access_token") or data.get("token", "")
        if not token:
            raise RuntimeError(f"Auth response missing token. Got: {data}")
        _token_cache["access_token"] = token
        print("[logger] ✓ Auth token obtained.")
        return token
    except requests.RequestException as exc:
        raise RuntimeError(f"[logger] Auth failed: {exc}") from exc


def _validate(stack: str, level: str, package: str) -> None:
    """Raise ValueError if any field is invalid."""
    if stack not in VALID_STACKS:
        raise ValueError(f"[logger] Invalid stack '{stack}'. Allowed: {VALID_STACKS}")
    if level not in VALID_LEVELS:
        raise ValueError(f"[logger] Invalid level '{level}'. Allowed: {VALID_LEVELS}")

    allowed = BACKEND_PACKAGES if stack == "backend" else FRONTEND_PACKAGES
    if package not in allowed:
        raise ValueError(
            f"[logger] Invalid package '{package}' for stack '{stack}'. Allowed: {allowed}"
        )


def Log(stack: str, level: str, package: str, message: str) -> dict:
    """
    Send a log entry to the Affordmed evaluation server.

    Parameters
    ----------
    stack   : "backend" | "frontend"
    level   : "debug" | "info" | "warn" | "error" | "fatal"
    package : valid package name (lowercase)
    message : descriptive message about the event

    Returns
    -------
    dict — server response with logID
    """
    _validate(stack, level, package)
    token = _get_token()

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type":  "application/json",
    }
    payload = {
        "stack":   stack,
        "level":   level,
        "package": package,
        "message": message,
    }

    try:
        res = requests.post(LOG_ENDPOINT, json=payload, headers=headers, timeout=10)
        res.raise_for_status()
        result = res.json()
        print(
            f"[logger] [{stack.upper()}][{level.upper()}][{package}] "
            f"{message}  → logID={result.get('logID', 'N/A')}"
        )
        return result
    except requests.HTTPError as exc:
        print(f"[logger] HTTP error: {exc.response.status_code} {exc.response.text}")
        raise
    except requests.RequestException as exc:
        print(f"[logger] Network error: {exc}")
        raise
