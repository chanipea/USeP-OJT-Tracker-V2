// =========================================================
// components/Dashboard.tsx
// The main dashboard tab: weekly strip, progress, stats.
// =========================================================

import { useState, useMemo } from 'react';
import { Briefcase, Clock, Activity, CalendarDays } from 'lucide-react';
import type { LogEntry, Profile } from '../types';
import { getCurrentWeekDays, computeMoodStats, computeCategoryStats } from '../utils';
import Calendar from './Calendar';


interface Props {
  profile: Profile;
  logs: LogEntry[];
}

const CATEGORY_BARS = [
  { label: 'Technical/Core', color: 'bg-[#7a0016]' },
  { label: 'Meetings/Comm', color: 'bg-[#fdb813]' },
  { label: 'Research', color: 'bg-[#2a020b]' },
  { label: 'Administrative', color: 'bg-[#a8a29e]' },
  { label: 'Observation', color: 'bg-[#d97706]' },
] as const;

export default function Dashboard({ profile, logs }: Props) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const weekDays = useMemo(() => getCurrentWeekDays(), []);
  const todayStr = new Date().toISOString().split('T')[0];
  const loggedDates = logs.map((l) => l.date);

  const totalHoursCompleted = useMemo(
    () => logs.reduce((total, log) => total + Number(log.hours || 0), 0),
    [logs]
  );

  const remainingHours = useMemo(() => {
    const remaining = (profile.targetHours || 0) - totalHoursCompleted;
    return remaining > 0 ? remaining : 0;
  }, [totalHoursCompleted, profile.targetHours]);

  const progressPercentage = useMemo(() => {
    if (!profile.targetHours) return 0;
    const percent = (totalHoursCompleted / profile.targetHours) * 100;
    return percent > 100 ? 100 : percent;
  }, [totalHoursCompleted, profile.targetHours]);

  const moodStats = useMemo(
    () => computeMoodStats(logs, profile.targetHours || 1),
    [logs, profile.targetHours]
  );

  const categoryStats = useMemo(
    () => computeCategoryStats(logs, profile.targetHours || 1),
    [logs, profile.targetHours]
  );

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-12">
      {/* Weekly Strip */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold tracking-tighter text-[#1a0107]">Your Week</h3>
          <span className="text-sm font-medium text-gray-400">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2 overflow-x-auto pb-4 hide-scrollbar">
          {weekDays.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const hasLog = loggedDates.includes(dateStr);

            return (
              <div key={i} className="flex flex-col items-center gap-3 min-w-[3.5rem]">
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-[#1a0107]' : 'text-gray-400'
                    }`}
                >
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300
                  ${hasLog
                      ? 'bg-[#fdb813] text-[#2a020b] shadow-md border-2 border-white'
                      : isToday
                        ? 'bg-[#2a020b] text-white'
                        : 'bg-white border border-gray-200 text-gray-500'
                    }`}
                >
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Calendar (opens as a modal) */}
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="w-full flex items-center justify-between bg-white rounded-[2rem] p-6 md:p-8 border border-[#f0ebe1] shadow-sm hover:shadow-md hover:border-[#fdb813]/50 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f8f6f5] group-hover:bg-[#fdb813]/20 flex items-center justify-center transition-colors">
              <CalendarDays size={20} className="text-[#7a0016]" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[#1a0107]">View Full Calendar</h3>
              <p className="text-sm text-gray-500">See every day's duty status at a glance</p>
            </div>
          </div>
        </button>
      </div>

      {isCalendarOpen && <Calendar logs={logs} onClose={() => setIsCalendarOpen(false)} />}
      
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-[#fffdfb] px-6 py-20 text-center border border-[#f0ebe1] shadow-sm max-w-6xl mx-auto">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-gradient-to-b from-[#fdb813]/15 via-[#7a0016]/5 to-transparent blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-[#1a0107] mb-6 leading-[1.1]">
            Where Your <br className="hidden md:block" /> Progress Grows
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl font-light leading-relaxed">
            A programmable, utility-driven tracker designed for native value accrual and seamless
            integration into your OJT.
          </p>
        </div>
      </div>

      {/* Progress Stats Section */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Large Card */}
          <div className="lg:col-span-2 bg-[#f8f6f5] rounded-[2rem] md:rounded-[3rem] p-10 md:p-14 relative overflow-hidden group border border-[#f0ebe1] flex flex-col justify-between min-h-[380px]">
            <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-gradient-to-tl from-[#7a0016]/10 to-transparent rounded-full blur-3xl group-hover:from-[#7a0016]/20 transition-all duration-700"></div>

            <div className="relative z-10 mb-8">
              <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#1a0107]">
                So Far, So Good !<span className="ml-2">ദ്ദി( • ᴗ &lt; )</span>
              </h3>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl md:text-8xl font-semibold tracking-tighter text-[#7a0016]">
                    {totalHoursCompleted.toFixed(1)}
                  </span>
                  <span className="text-2xl text-gray-400 font-medium tracking-tight">hrs</span>
                </div>
              </div>

              <div className="w-full md:w-5/12 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white">
                <div className="flex justify-between items-center text-sm font-bold text-[#1a0107] uppercase tracking-widest mb-4">
                  <span>Progress</span>
                  <span className="text-[#7a0016]">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner overflow-hidden">
                  <div
                    className="bg-[#7a0016] h-full rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Cards */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#1a0107] text-white rounded-[2rem] md:rounded-[3rem] p-10 flex-1 flex flex-col justify-between relative overflow-hidden group hover:bg-[#2a020b] transition-colors border border-[#2a020b]">
              <div className="absolute top-8 right-8 text-[#fdb813]/20 group-hover:text-[#fdb813]/40 transition-colors">
                <Briefcase size={64} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold tracking-tight mb-2">Target required</h3>
                <span className="text-5xl font-semibold tracking-tighter text-[#fdb813] mt-4 block">
                  {profile.targetHours}
                </span>
              </div>
            </div>

            <div className="bg-[#2a020b] text-white rounded-[2rem] md:rounded-[3rem] p-10 flex-1 flex flex-col justify-between relative overflow-hidden group hover:bg-[#3a0310] transition-colors border border-[#3a0310]">
              <div className="absolute top-8 right-8 text-white/10 group-hover:text-white/20 transition-colors">
                <Clock size={64} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold tracking-tight mb-2">Remaining</h3>
                <span className="text-5xl font-semibold tracking-tighter text-white mt-4 block">
                  {remainingHours.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-[#f0ebe1] shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f6f5] border border-[#f0ebe1] mb-6">
                <Activity size={14} className="text-[#7a0016]" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
                  Skill Allocation
                </span>
              </div>
              <h3 className="text-3xl font-semibold tracking-tighter text-[#1a0107] mb-4">
                Category Breakdown
              </h3>
              <p className="text-gray-500 font-light mb-8">
                % of Target Yield Capacity across task types.
              </p>
            </div>

            <div className="space-y-6">
              {CATEGORY_BARS.map((cat) => (
                <div key={cat.label}>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-[#1a0107]">{cat.label}</span>
                    <span className="text-gray-500">{categoryStats[cat.label] || 0}%</span>
                  </div>
                  <div className="w-full bg-[#f8f6f5] rounded-full h-3 shadow-inner overflow-hidden">
                    <div
                      className={`${cat.color} h-full rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${categoryStats[cat.label] || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="bg-[#faf9f8] rounded-[2.5rem] p-10 border border-[#f0ebe1] shadow-sm relative overflow-hidden">
            <h3 className="text-2xl font-semibold tracking-tighter text-[#1a0107] mb-2 text-center">
              Mood Distribution
            </h3>
            <p className="text-sm text-gray-500 text-center mb-8">% of Target Yield by Reflection</p>

            <div className="flex justify-center items-center h-56 gap-2 sm:gap-6">
              {[
                { key: 'Productive' as const, color: 'bg-[#fdb813]' },
                { key: 'Learning' as const, color: 'bg-[#7a0016]' },
                { key: 'Challenging' as const, color: 'bg-[#2a020b]' },
                { key: 'Routine' as const, color: 'bg-[#a8a29e]' },
              ].map((bar) => (
                <div key={bar.key} className="flex flex-col items-center gap-3 w-16 sm:w-20 h-full">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {moodStats[bar.key]}%
                  </span>
                  <div className="w-full bg-white rounded-full flex-1 flex items-end px-1.5 pt-1.5 shadow-inner overflow-hidden">
                    <div
                      className={`w-full ${bar.color} rounded-full transition-all duration-1000 ease-out shadow-[0_-6px_10px_-2px_rgba(0,0,0,0.35)]`} style={{ height: `${moodStats[bar.key]}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#1a0107]">{bar.key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
