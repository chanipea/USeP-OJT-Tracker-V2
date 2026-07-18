// =========================================================
// types.ts
// Shared TypeScript types used across every component.
// =========================================================

export type MoodId = 'Productive' | 'Learning' | 'Challenging' | 'Routine';

export type CategoryId =
  | 'Technical/Core'
  | 'Administrative'
  | 'Meetings/Comm'
  | 'Research'
  | 'Observation';

export type TabId = 'dashboard' | 'history' | 'profile';

export interface LogEntry {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  tasks: string;
  diary: string;
  moods: MoodId[];
  categories: CategoryId[];
  attachments?: string[];
  createdAt?: string;
}

export type LogFormData = Omit<LogEntry, 'id' | 'hours' | 'createdAt'>;

export interface Profile {
  name: string;
  studentId: string;
  program: string;
  company: string;
  supervisor: string;
  targetHours: number;
  bio: string;
  email: string;
  phone: string;
  profilePicture: string;
  coverPhoto: string;
  theme?: string;
  remindersEnabled?: boolean;
}

export interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  profile: Profile;
}

export interface MoodStats {
  Productive: number;
  Learning: number;
  Challenging: number;
  Routine: number;
}

export type CategoryStats = Record<CategoryId, number>;
