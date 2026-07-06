// =========================================================
// api.ts
// The ONLY file that talks to the PHP backend. Every
// component calls these functions instead of using fetch()
// directly, so the HTTP details stay in one place.
//
// The base URL comes from VITE_API_BASE_URL (see .env).
//
// Auth: after login/register, the backend returns a token.
// We store it in localStorage and attach it as
// "Authorization: Bearer <token>" on every request from then
// on, so the backend knows which account is asking.
// =========================================================

import type { LogEntry, LogFormData, Profile, AuthResponse, User } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/backend/api';
const TOKEN_STORAGE_KEY = 'ojt_auth_token';

// ----- Token storage ----------------------------------------

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// Called by App.tsx once, so this file can tell the app to log
// the user out automatically whenever a request comes back 401
// (e.g. the token expired or was revoked).
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    clearToken();
    if (unauthorizedHandler) unauthorizedHandler();
  }

  if (!response.ok) {
    const message = (data && data.error) || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

// ----- Auth ---------------------------------------------------

export async function registerAccount(username: string, email: string, password: string): Promise<AuthResponse> {
  const result = await request<AuthResponse>(`${BASE_URL}/register.php`, {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
  setToken(result.token);
  return result;
}

export async function loginAccount(email: string, password: string): Promise<AuthResponse> {
  const result = await request<AuthResponse>(`${BASE_URL}/login.php`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(result.token);
  return result;
}

export async function logoutAccount(): Promise<void> {
  try {
    await request(`${BASE_URL}/logout.php`, { method: 'POST' });
  } finally {
    clearToken();
  }
}

export function fetchMe(): Promise<User> {
  return request<User>(`${BASE_URL}/me.php`);
}

// ----- Logs -------------------------------------------------

export function fetchLogs(): Promise<LogEntry[]> {
  return request<LogEntry[]>(`${BASE_URL}/logs.php`);
}

export function createLog(logData: LogFormData): Promise<LogEntry> {
  return request<LogEntry>(`${BASE_URL}/logs.php`, {
    method: 'POST',
    body: JSON.stringify(logData),
  });
}

export function updateLog(id: number, logData: LogFormData): Promise<LogEntry> {
  return request<LogEntry>(`${BASE_URL}/logs.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(logData),
  });
}

export function deleteLog(id: number): Promise<{ success: boolean }> {
  return request(`${BASE_URL}/logs.php?id=${id}`, { method: 'DELETE' });
}

// ----- Profile -----------------------------------------------

export function fetchProfile(): Promise<Profile> {
  return request<Profile>(`${BASE_URL}/profile.php`);
}

export function saveProfile(profileData: Profile): Promise<Profile> {
  return request<Profile>(`${BASE_URL}/profile.php`, {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
}
