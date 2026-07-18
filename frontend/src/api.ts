// =========================================================
// api.ts
// The ONLY file that talks to the backend. Every
// component calls these functions instead of using fetch()
// directly, so the HTTP details stay in one place.
//
// The base URL comes from VITE_API_BASE_URL (see .env).
// =========================================================

import type { LogEntry, LogFormData, Profile } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (data && data.error) || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

// ----- Logs -------------------------------------------------

export function fetchLogs(): Promise<LogEntry[]> {
  return request<LogEntry[]>(`${BASE_URL}/logs`);
}

export function createLog(logData: LogFormData): Promise<LogEntry> {
  return request<LogEntry>(`${BASE_URL}/logs`, {
    method: 'POST',
    body: JSON.stringify(logData),
  });
}

export function updateLog(id: number, logData: LogFormData): Promise<LogEntry> {
  return request<LogEntry>(`${BASE_URL}/logs?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(logData),
  });
}

export function deleteLog(id: number): Promise<{ success: boolean }> {
  return request(`${BASE_URL}/logs?id=${id}`, { method: 'DELETE' });
}

// ----- Profile -----------------------------------------------

export function fetchProfile(): Promise<Profile> {
  return request<Profile>(`${BASE_URL}/profile`);
}

export function saveProfile(profileData: Profile): Promise<Profile> {
  return request<Profile>(`${BASE_URL}/profile`, {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
}
