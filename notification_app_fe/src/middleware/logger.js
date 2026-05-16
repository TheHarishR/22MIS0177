/**
 * Logging Middleware — Frontend (JavaScript)
 * Mirrors the Python logging_middleware package.
 *
 * Usage:
 *   import { Log } from './middleware/logger';
 *   await Log("frontend", "info", "component", "PriorityInbox mounted");
 */

const LOG_ENDPOINT  = "/api/logs";
const AUTH_ENDPOINT = "/api/auth";

// Credentials — pulled from .env (Vite exposes VITE_* vars)
const CREDS = {
  email:        import.meta.env.VITE_EMAIL        || "",
  name:         import.meta.env.VITE_NAME         || "",
  rollNo:       import.meta.env.VITE_ROLL_NO      || "",
  accessCode:   import.meta.env.VITE_ACCESS_CODE  || "",
  clientID:     import.meta.env.VITE_CLIENT_ID    || "",
  clientSecret: import.meta.env.VITE_CLIENT_SECRET || "",
};

const VALID_STACKS   = new Set(["backend", "frontend"]);
const VALID_LEVELS   = new Set(["debug", "info", "warn", "error", "fatal"]);
const FRONTEND_PKGS  = new Set([
  "api", "component", "hook", "page", "state", "style",
  "auth", "config", "middleware", "utils",
]);

let _token = null;

async function _getToken() {
  if (_token) return _token;

  const res = await fetch(AUTH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(CREDS),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`[logger] Auth failed ${res.status}: ${txt}`);
  }

  const data  = await res.json();
  const token = data.access_token || data.token;
  if (!token) throw new Error("[logger] Auth response missing access_token");

  _token = token;
  console.info("[logger] ✓ Auth token obtained.");
  return _token;
}

// Exported so hooks/api can reuse the same token
export async function getAuthToken() {
  return _getToken();
}

function _validate(stack, level, pkg) {
  if (!VALID_STACKS.has(stack))
    throw new Error(`[logger] Invalid stack '${stack}'`);
  if (!VALID_LEVELS.has(level))
    throw new Error(`[logger] Invalid level '${level}'`);
  if (!FRONTEND_PKGS.has(pkg))
    throw new Error(`[logger] Invalid package '${pkg}' for frontend`);
}

/**
 * Log(stack, level, pkg, message)
 * @returns {Promise<{logID: string}>}
 */
export async function Log(stack, level, pkg, message) {
  try {
    _validate(stack, level, pkg);
    const token = await _getToken();

    const res = await fetch(LOG_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });

    if (!res.ok) {
      console.error(`[logger] Log POST failed ${res.status}`);
      return null;
    }

    const result = await res.json();
    console.log(
      `[logger] [${stack.toUpperCase()}][${level.toUpperCase()}][${pkg}] ${message}`,
      `→ logID=${result.logID}`
    );
    return result;
  } catch (err) {
    // Never crash the app over a failed log
    console.warn("[logger] Suppressed log error:", err.message);
    return null;
  }
}