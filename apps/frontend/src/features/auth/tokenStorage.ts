const KEY = "auth_token";

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}

export function subscribeToken(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToken(): string | null {
  return localStorage.getItem(KEY);
}

export function setToken(token: string) {
  localStorage.setItem(KEY, token);
  emit();
}

export function clearToken() {
  localStorage.removeItem(KEY);
  emit();
}
