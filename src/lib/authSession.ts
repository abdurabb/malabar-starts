const TOKEN_KEY = "malabar.token";
const PENDING_EMAIL_KEY = "malabar.pendingEmail";

const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.localStorage.removeItem("malabar.users");
  window.localStorage.removeItem("malabar.session");
  window.sessionStorage.removeItem("malabar.pendingSignup");
}

export function readToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function writeToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  const hadToken = window.localStorage.getItem(TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
  if (hadToken) listeners.forEach((listener) => listener());
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
