BASE_URL = "http://4.224.186.213/evaluation-service"
LOG_ENDPOINT = f"{BASE_URL}/logs"
AUTH_ENDPOINT = f"{BASE_URL}/auth"

# ── Fill these with your registration credentials ──────────────────────────
CLIENT_ID     = "e836ae94-b2e2-42d8-b81b-9383951c5c5e"
CLIENT_SECRET = "BwdWgEHEegtbqFsz"
EMAIL         = "harish2005ramesh@gmail.com"
NAME          = "harish r"
ROLL_NO       = "22mis0177"
ACCESS_CODE   = "SfFuWg"

# ── Allowed field values (do not change) ───────────────────────────────────
VALID_STACKS   = {"backend", "frontend"}
VALID_LEVELS   = {"debug", "info", "warn", "error", "fatal"}

BACKEND_PACKAGES = {
    "cache", "controller", "cron_job", "db", "domain",
    "handler", "repository", "route", "service",
    "auth", "config", "middleware", "utils",
}

FRONTEND_PACKAGES = {
    "api", "component", "hook", "page", "state", "style",
    "auth", "config", "middleware", "utils",
}
