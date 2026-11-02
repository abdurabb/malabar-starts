export const TOKEN_KEY = "malabar.token";
const PENDING_EMAIL_KEY = "malabar.pendingEmail";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.localStorage.removeItem("malabar.users");
  window.localStorage.removeItem("malabar.session");
  window.sessionStorage.removeItem("malabar.pendingSignup");
}

function writeTokenCookie(value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_KEY}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function readToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function writeToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  writeTokenCookie(encodeURIComponent(token), TOKEN_MAX_AGE);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  const hadToken = window.localStorage.getItem(TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
  writeTokenCookie("", 0);
  if (hadToken) listeners.forEach((listener) => listener());
}

export function syncTokenCookie() {
  if (typeof window === "undefined") return false;
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  const encoded = encodeURIComponent(token);
  const current = document.cookie.split("; ").find((part) => part.startsWith(`${TOKEN_KEY}=`));
  if (current === `${TOKEN_KEY}=${encoded}`) return false;
  writeTokenCookie(encoded, TOKEN_MAX_AGE);
  return true;
}

export function onSessionCleared(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readPendingEmail() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(PENDING_EMAIL_KEY);
}

export function writePendingEmail(email: string) {
  window.sessionStorage.setItem(PENDING_EMAIL_KEY, email);
}

export function clearPendingEmail() {
  window.sessionStorage.removeItem(PENDING_EMAIL_KEY);
}
