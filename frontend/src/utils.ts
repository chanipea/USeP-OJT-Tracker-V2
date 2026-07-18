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
    const shiftYield = Number(log.hours) || 0;
    const moods = log.moods || [];
    if (moods.length > 0) {
      moods.forEach((m) => {
        if (accrued[m] !== undefined) {
          accrued[m] += shiftYield;
        }
      });
    }
  });

  return {
    Productive: Math.min(100, Number(((accrued.Productive / capacity) * 100).toFixed(1))),
    Learning: Math.min(100, Number(((accrued.Learning / capacity) * 100).toFixed(1))),
    Challenging: Math.min(100, Number(((accrued.Challenging / capacity) * 100).toFixed(1))),
    Routine: Math.min(100, Number(((accrued.Routine / capacity) * 100).toFixed(1))),
  };
}

export function computeCategoryStats(logs: LogEntry[], targetHours: number): CategoryStats {
  const capacity = targetHours || 1;
  const accrued = {} as Record<CategoryId, number>;
  CATEGORY_OPTIONS.forEach((c) => (accrued[c] = 0));

  logs.forEach((log) => {
    const shiftYield = Number(log.hours) || 0;
    const cats = log.categories || [];
    if (cats.length > 0) {
      cats.forEach((c) => {
        if (accrued[c] !== undefined) {
          accrued[c] += shiftYield;
        }
      });
    }
  });

  const result = {} as CategoryStats;
  CATEGORY_OPTIONS.forEach((c) => {
    result[c] = Math.min(100, Number(((accrued[c] / capacity) * 100).toFixed(1)));
  });
  return result;
}

export function filterLogsByTime(logs: LogEntry[], filter: 'all' | 'week' | 'month'): LogEntry[] {
  if (filter === 'all') return logs;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return logs.filter(log => {
    const logDate = new Date(log.date);
    const diffTime = Math.abs(today.getTime() - logDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (filter === 'week') return diffDays <= 7;
    if (filter === 'month') return diffDays <= 30;
    return true;
  });
}

export function calculateStreak(logs: LogEntry[]): number {
  if (!logs || logs.length === 0) return 0;
  
  // Sort logs by date descending
  const sortedDates = [...new Set(logs.map(log => log.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (sortedDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDateToCheck = new Date(today);

  // If the first log is neither today nor yesterday, streak is 0
  const mostRecentLogDate = new Date(sortedDates[0]);
  mostRecentLogDate.setHours(0, 0, 0, 0);
  const diffFromToday = Math.floor((today.getTime() - mostRecentLogDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffFromToday > 1) {
    return 0; // Streak broken
  }
  
  // Start checking backwards from the most recent log
  currentDateToCheck = mostRecentLogDate;

  for (let i = 0; i < sortedDates.length; i++) {
    const logDate = new Date(sortedDates[i]);
    logDate.setHours(0, 0, 0, 0);
    
    if (logDate.getTime() === currentDateToCheck.getTime()) {
      streak++;
      currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getUnlockedBadges(logs: LogEntry[], targetHours: number): string[] {
  const unlocked: string[] = [];
  const totalHours = logs.reduce((sum, log) => sum + Number(log.hours || 0), 0);
  const streak = calculateStreak(logs);
  
  if (logs.length > 0) unlocked.push("First Step");
  if (targetHours > 0) {
    if (totalHours >= targetHours * 0.25) unlocked.push("Quarter Way");
    if (totalHours >= targetHours * 0.50) unlocked.push("Halfway There");
    if (totalHours >= targetHours * 0.75) unlocked.push("The Final Stretch");
    if (totalHours >= targetHours) unlocked.push("Mission Complete");
  }
  if (streak >= 3) unlocked.push("Hot Streak");
  
  return unlocked;
}
