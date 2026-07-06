// =========================================================
// utils.ts
// Pure helper functions shared across the app - calculations
// and formatting only, no React/DOM code lives here.
// =========================================================

import type { LogEntry, LogFormData, MoodStats, CategoryStats, CategoryId } from './types';

export const CATEGORY_OPTIONS: CategoryId[] = [
  'Technical/Core',
  'Administrative',
  'Meetings/Comm',
  'Research',
  'Observation',
];

export function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let startInMinutes = startHour * 60 + startMin;
  let endInMinutes = endHour * 60 + endMin;

  if (endInMinutes < startInMinutes) {
    endInMinutes += 24 * 60;
  }

  return (endInMinutes - startInMinutes) / 60;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export function formatTime(timeString: string): string {
  if (!timeString) return '';
  const [hour, min] = timeString.split(':').map(Number);
  const d = new Date();
  d.setHours(hour, min);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function getCurrentWeekDays(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(new Date().setDate(diff));

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    week.push(nextDay);
  }
  return week;
}

export function defaultLogData(): LogFormData {
  return {
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '17:00',
    tasks: '',
    diary: '',
    moods: [],
    categories: [],
  };
}

export function computeMoodStats(logs: LogEntry[], targetHours: number): MoodStats {
  const capacity = targetHours || 1;
  const accrued: MoodStats = { Productive: 0, Learning: 0, Challenging: 0, Routine: 0 };

  logs.forEach((log) => {
    const shiftYield = log.hours || 0;
    (log.moods || []).forEach((m) => {
      if (accrued[m] !== undefined) accrued[m] += shiftYield;
    });
  });

  return {
    Productive: Math.min(100, Math.round((accrued.Productive / capacity) * 100)),
    Learning: Math.min(100, Math.round((accrued.Learning / capacity) * 100)),
    Challenging: Math.min(100, Math.round((accrued.Challenging / capacity) * 100)),
    Routine: Math.min(100, Math.round((accrued.Routine / capacity) * 100)),
  };
}

export function computeCategoryStats(logs: LogEntry[], targetHours: number): CategoryStats {
  const capacity = targetHours || 1;
  const accrued = {} as Record<CategoryId, number>;
  CATEGORY_OPTIONS.forEach((c) => (accrued[c] = 0));

  logs.forEach((log) => {
    const shiftYield = log.hours || 0;
    const cats = log.categories || [];
    if (cats.length > 0) {
      const yieldPerCat = shiftYield / cats.length;
      cats.forEach((c) => {
        if (accrued[c] !== undefined) accrued[c] += yieldPerCat;
      });
    }
  });

  const result = {} as CategoryStats;
  CATEGORY_OPTIONS.forEach((c) => {
    result[c] = Math.min(100, Math.round((accrued[c] / capacity) * 100));
  });
  return result;
}
