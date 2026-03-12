const TOKEN_KEY = 'theo-panel-token';
const EMAIL_KEY = 'theo-panel-email';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}

// Keep getUsername as alias for backwards compat
export function getUsername(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}

export function saveSession(token: string, email: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
