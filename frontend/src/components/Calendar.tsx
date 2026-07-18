// =========================================================
// components/Calendar.tsx
// A full month calendar for the Dashboard. Each day is
// color-coded based on your logs:
//   - Today                -> dark outline
//   - Duty logged that day -> gold fill
//   - Past day, no log     -> light gray fill ("no duty")
//   - Future day            -> plain white
// Hovering a day (or tapping it on mobile) shows its details
// in a small tooltip.
// =========================================================

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import type { LogEntry } from '../types';
import { formatTime } from '../utils';

interface Props {
  logs: LogEntry[];
  onClose: () => void;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstOfMonth = new Date(year, month, 1);
  // getDay(): Sun=0..Sat=6. We want Mon=0..Sun=6 to match the rest of the app.
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function Calendar({ logs, onClose }: Props) {
  const today = new Date();
  const todayStr = toDateStr(today);
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const logsByDate = useMemo(() => {
    const map: Record<string, LogEntry[]> = {};
    logs.forEach((log) => {
      if (!map[log.date]) map[log.date] = [];
      map[log.date].push(log);
    });
    return map;
  }, [logs]);

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-[#1a0107]/40 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 md:p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#f8f6f5] dark:bg-zinc-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors z-10"
          aria-label="Close calendar"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4 pr-14">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f6f5] dark:bg-zinc-800 border border-[#f0ebe1] dark:border-zinc-800">
              <CalendarDays size={14} className="text-[#7a0016] dark:text-[#fca5a5]" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">Monthly Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevMonth}
              className="w-9 h-9 rounded-full bg-[#f8f6f5] dark:bg-zinc-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-full bg-[#f8f6f5] dark:bg-zinc-800 hover:bg-gray-200 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="w-9 h-9 rounded-full bg-[#f8f6f5] dark:bg-zinc-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <h3 className="text-2xl font-semibold tracking-tighter text-[#1a0107] dark:text-white mb-6">
          {new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 py-2">
              {label}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {grid.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="aspect-square" />;

            const dateStr = toDateStr(date);
            const dayLogs = logsByDate[dateStr] || [];
            const hasLog = dayLogs.length > 0;
            const isToday = dateStr === todayStr;
            const isPast = date < todayAtMidnight;
            const totalHours = dayLogs.reduce((t, l) => t + Number(l.hours || 0), 0);

            let cellClass =
              'relative group aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center text-xs sm:text-sm font-semibold transition-all cursor-default ';

            if (hasLog) {
              cellClass += 'bg-[#fdb813] text-[#2a020b] dark:text-white shadow-sm ';
            } else if (isPast) {
              cellClass += 'bg-[#f8f6f5] dark:bg-zinc-800 text-gray-400 ';
            } else {
              cellClass += 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-400 ';
            }

            if (isToday) {
              cellClass += 'ring-2 ring-[#1a0107] dark:ring-white ring-offset-1 dark:ring-offset-zinc-900 ';
            }

            const column = i % 7;
            let tooltipPosClass = 'left-1/2 -translate-x-1/2'; // centered (default)
            let arrowPosClass = 'left-1/2 -translate-x-1/2';
            if (column <= 1) {
              // near the left edge - align tooltip's left side with the cell instead of centering
              tooltipPosClass = 'left-0';
              arrowPosClass = 'left-4';
            } else if (column >= 5) {
              // near the right edge - align tooltip's right side with the cell instead of centering
              tooltipPosClass = 'right-0';
              arrowPosClass = 'right-4';
            }

            return (
              <div key={dateStr} className={cellClass}>
                {date.getDate()}

                {/* Tooltip */}
                <div className={`pointer-events-none absolute bottom-full ${tooltipPosClass} mb-2 w-max max-w-[13rem] opacity-0 group-hover:opacity-100 transition-opacity z-30`}>
                  <div className="bg-[#1a0107] text-white dark:bg-zinc-800 text-xs rounded-2xl px-4 py-3 shadow-xl">
                    <p className="font-bold mb-1">
                      {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                      {isToday && <span className="text-[#fdb813]"> &middot; Today</span>}
                    </p>
                    {hasLog ? (
                      <>
                        <p className="text-[#fdb813] font-semibold">{totalHours.toFixed(1)} hrs logged</p>
                        <p className="text-white/70 mt-1 line-clamp-2">
                          {dayLogs.map((l) => l.tasks).join(' • ')}
                        </p>
                        <p className="text-white/50 mt-1">
                          {formatTime(dayLogs[0].startTime)} &ndash; {formatTime(dayLogs[0].endTime)}
                        </p>
                      </>
                    ) : isPast ? (
                      <p className="text-white/60">No duty logged</p>
                    ) : (
                      <p className="text-white/60">Upcoming</p>
                    )}
                  </div>
                  <div className={`w-3 h-3 bg-[#1a0107] rotate-45 absolute ${arrowPosClass} -bottom-1.5`}></div>                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#fdb813] shrink-0"></span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Duty logged</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#f8f6f5] dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 shrink-0"></span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">No duty</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 shrink-0"></span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-white dark:bg-zinc-900 ring-2 ring-[#1a0107] dark:ring-white shrink-0"></span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Today</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}