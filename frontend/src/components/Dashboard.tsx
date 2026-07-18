// =========================================================
// components/Dashboard.tsx
// The main dashboard tab: weekly strip, progress, stats.
// =========================================================

import { useState, useMemo } from 'react';
import { Briefcase, Clock, Activity, CalendarDays, TrendingUp, Filter, Award, Target, Flame, Star, Zap, CheckCircle2 } from 'lucide-react';
import type { LogEntry, Profile } from '../types';
import { getCurrentWeekDays, computeMoodStats, computeCategoryStats, filterLogsByTime, getUnlockedBadges, calculateStreak } from '../utils';
import Calendar from './Calendar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';


interface Props {
  profile: Profile;
  logs: LogEntry[];
}

const CATEGORY_BARS = [
  { label: 'Technical/Core', color: 'bg-[#7a0016] dark:bg-[#b31b34]' },
  { label: 'Meetings/Comm', color: 'bg-[#fdb813] dark:bg-amber-400' },
  { label: 'Research', color: 'bg-[#4a0414] dark:bg-[#721c24]' },
  { label: 'Administrative', color: 'bg-zinc-400 dark:bg-zinc-500' },
  { label: 'Observation', color: 'bg-amber-600 dark:bg-amber-500' },
] as const;

export default function Dashboard({ profile, logs }: Props) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  
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

  const filteredLogs = useMemo(() => filterLogsByTime(logs, timeFilter), [logs, timeFilter]);

  const moodStats = useMemo(
    () => computeMoodStats(filteredLogs, profile.targetHours || 1),
    [filteredLogs, profile.targetHours]
  );

  const categoryStats = useMemo(
    () => computeCategoryStats(filteredLogs, profile.targetHours || 1),
    [filteredLogs, profile.targetHours]
  );

  const unlockedBadges = useMemo(() => getUnlockedBadges(logs, profile.targetHours || 0), [logs, profile.targetHours]);
  const currentStreak = useMemo(() => calculateStreak(logs), [logs]);

  const BADGES = [
    { id: 'First Step', icon: Star, description: 'Logged your first shift', color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
    { id: 'Quarter Way', icon: Target, description: '25% Target Hours', color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' },
    { id: 'Halfway There', icon: Zap, description: '50% Target Hours', color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' },
    { id: 'The Final Stretch', icon: Flame, description: '75% Target Hours', color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' },
    { id: 'Mission Complete', icon: CheckCircle2, description: '100% Target Hours', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
    { id: 'Hot Streak', icon: Award, description: '3-Day Streak', color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' },
  ];

  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = logs.filter(l => l.date === dateStr);
      const hours = dayLogs.reduce((acc, curr) => acc + Number(curr.hours), 0);
      data.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        hours,
      });
    }
    return data;
  }, [logs]);

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-12">
      {/* Weekly Strip */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold tracking-tighter text-[#1a0107] dark:text-white">Your Week</h3>
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
                  className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-[#1a0107] dark:text-white' : 'text-gray-400'
                    }`}
                >
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300
                  ${hasLog
                      ? 'bg-[#fdb813] text-[#2a020b] dark:text-white shadow-md border-2 border-white'
                      : isToday
                        ? 'bg-[#2a020b] text-white dark:bg-zinc-800'
                        : 'bg-white dark:bg-zinc-900 border border-gray-200 text-gray-500 dark:text-gray-400'
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
          className="w-full flex items-center justify-between bg-white dark:bg-zinc-900 rounded-[2rem] p-6 md:p-8 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-[#fdb813]/50 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f8f6f5] dark:bg-zinc-800 group-hover:bg-[#fdb813]/20 flex items-center justify-center transition-colors">
              <CalendarDays size={20} className="text-[#7a0016] dark:text-[#fca5a5]" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[#1a0107] dark:text-white">View Full Calendar</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">See every day's duty status at a glance</p>
            </div>
          </div>
        </button>
      </div>

      {isCalendarOpen && <Calendar logs={logs} onClose={() => setIsCalendarOpen(false)} />}
      
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-[#fffdfb] dark:bg-zinc-900 px-6 py-20 text-center border border-[#f0ebe1] dark:border-zinc-800 shadow-sm max-w-6xl mx-auto">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-gradient-to-b from-[#fdb813]/15 via-[#7a0016]/5 to-transparent blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-[#1a0107] dark:text-white mb-6 leading-[1.1]">
            Where Your <br className="hidden md:block" /> Progress Grows
          </h1>
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl font-light leading-relaxed">
            A programmable, utility-driven tracker designed for native value accrual and seamless
            integration into your OJT.
          </p>
        </div>
      </div>

      {/* Progress Stats Section */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Large Card */}
          <div className="lg:col-span-2 bg-[#f8f6f5] dark:bg-zinc-800 rounded-[2rem] md:rounded-[3rem] p-10 md:p-14 relative overflow-hidden group border border-[#f0ebe1] dark:border-zinc-800 flex flex-col justify-between min-h-[380px]">
            <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-gradient-to-tl from-[#7a0016]/10 to-transparent rounded-full blur-3xl group-hover:from-[#7a0016]/20 transition-all duration-700"></div>

            <div className="relative z-10 mb-8">
              <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#1a0107] dark:text-white">
                So Far, So Good !<span className="ml-2">ദ്ദി( • ᴗ &lt; )</span>
              </h3>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl md:text-8xl font-semibold tracking-tighter text-[#7a0016] dark:text-white">
                    {totalHoursCompleted.toFixed(1)}
                  </span>
                  <span className="text-2xl text-gray-400 font-medium tracking-tight">hrs</span>
                </div>
              </div>

              <div className="w-full md:w-5/12 bg-white/60 dark:bg-zinc-800/80 backdrop-blur-md p-6 rounded-3xl border border-white dark:border-zinc-700/50">
                <div className="flex justify-between items-center text-sm font-bold text-[#1a0107] dark:text-white uppercase tracking-widest mb-4">
                  <span>Progress</span>
                  <span className="text-[#7a0016] dark:text-white">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner overflow-hidden">
                  <div
                    className="bg-[#7a0016] dark:bg-zinc-400 h-full rounded-full transition-all duration-1000 ease-out relative"
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
            <div className="bg-[#1a0107] text-white dark:bg-zinc-800 rounded-[2rem] md:rounded-[3rem] p-10 flex-1 flex flex-col justify-between relative overflow-hidden group hover:bg-[#2a020b] transition-colors border border-[#2a020b] dark:border-zinc-700">
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

            <div className="bg-[#2a020b] text-white dark:bg-zinc-800 rounded-[2rem] md:rounded-[3rem] p-10 flex-1 flex flex-col justify-between relative overflow-hidden group hover:bg-[#4a0414] transition-colors border border-[#4a0414] dark:border-zinc-700">
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
        
        {/* Weekly Activity Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f6f5] dark:bg-zinc-800 border border-[#f0ebe1] dark:border-zinc-800 mb-4">
                <TrendingUp size={14} className="text-[#7a0016] dark:text-[#fca5a5]" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">Velocity</span>
              </div>
              <h3 className="text-3xl font-semibold tracking-tighter text-[#1a0107] dark:text-white">Last 7 Days Activity</h3>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#3f3f46" strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey="name" axisLine={{ stroke: '#3f3f46' }} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12 }} dy={10} />
                <YAxis axisLine={{ stroke: '#3f3f46' }} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="hours" fill="#7a0016" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Breakdown */}
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f6f5] dark:bg-zinc-800 border border-[#f0ebe1] dark:border-zinc-800">
                  <Activity size={14} className="text-[#7a0016] dark:text-[#fca5a5]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                    Skill Allocation
                  </span>
                </div>
                
                <div className="flex bg-[#f8f6f5] dark:bg-zinc-800 p-1 rounded-full border border-[#f0ebe1] dark:border-zinc-800">
                  <button onClick={() => setTimeFilter('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${timeFilter === 'all' ? 'bg-white dark:bg-zinc-700 text-[#1a0107] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-[#1a0107] dark:hover:text-white'}`}>All</button>
                  <button onClick={() => setTimeFilter('month')} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${timeFilter === 'month' ? 'bg-white dark:bg-zinc-700 text-[#1a0107] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-[#1a0107] dark:hover:text-white'}`}>Month</button>
                  <button onClick={() => setTimeFilter('week')} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${timeFilter === 'week' ? 'bg-white dark:bg-zinc-700 text-[#1a0107] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-[#1a0107] dark:hover:text-white'}`}>Week</button>
                </div>
              </div>
              <h3 className="text-3xl font-semibold tracking-tighter text-[#1a0107] dark:text-white mb-4">
                Category Breakdown
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-light mb-8">
                % of Target Yield Capacity across task types.
              </p>
            </div>

            <div className="space-y-6">
              {CATEGORY_BARS.map((cat) => (
                <div key={cat.label}>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-[#1a0107] dark:text-white">{cat.label}</span>
                    <span className="text-gray-500 dark:text-gray-400">{categoryStats[cat.label] || 0}%</span>
                  </div>
                  <div className="w-full bg-[#f8f6f5] dark:bg-zinc-800 rounded-full h-3 shadow-inner overflow-hidden">
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
          <div className="bg-[#faf9f8] dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm relative overflow-hidden">
            <h3 className="text-2xl font-semibold tracking-tighter text-[#1a0107] dark:text-white mb-2 text-center">
              Mood Distribution
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">% of Target Yield by Reflection</p>

            <div className="flex justify-center items-center h-56 gap-2 sm:gap-6">
              {[
                { key: 'Productive' as const, color: 'bg-[#fdb813] dark:bg-amber-400' },
                { key: 'Learning' as const, color: 'bg-[#7a0016] dark:bg-[#b31b34]' },
                { key: 'Challenging' as const, color: 'bg-[#4a0414] dark:bg-[#721c24]' },
                { key: 'Routine' as const, color: 'bg-zinc-400 dark:bg-zinc-500' },
              ].map((bar) => (
                <div key={bar.key} className="flex flex-col items-center gap-3 w-16 sm:w-20 h-full">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {moodStats[bar.key]}%
                  </span>
                  <div className="w-full bg-[#f8f6f5] dark:bg-zinc-800 rounded-full flex-1 flex items-end shadow-inner overflow-hidden border border-gray-100 dark:border-zinc-700">
                    <div
                      className={`w-full ${bar.color} transition-all duration-1000 ease-out`} style={{ height: `${moodStats[bar.key]}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#1a0107] dark:text-white">{bar.key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Milestones & Gamification */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f6f5] dark:bg-zinc-800 border border-[#f0ebe1] dark:border-zinc-800 mb-4">
                <Award size={14} className="text-[#fdb813]" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">Milestones</span>
              </div>
              <h3 className="text-3xl font-semibold tracking-tighter text-[#1a0107] dark:text-white">Achievements</h3>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-semibold tracking-tighter text-[#fdb813]">{currentStreak}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Day Streak</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {BADGES.map((badge) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              const Icon = badge.icon;
              return (
                <div key={badge.id} className={`p-6 rounded-[2rem] border transition-all ${isUnlocked ? 'bg-white dark:bg-zinc-800 border-[#f0ebe1] dark:border-zinc-700 shadow-md hover:scale-105' : 'bg-gray-50 dark:bg-zinc-900/50 border-gray-100 dark:border-zinc-800 opacity-60 grayscale'}`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 border ${isUnlocked ? badge.color : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 border-gray-200 dark:border-zinc-700'}`}>
                    <Icon size={24} />
                  </div>
                  <h4 className={`text-lg font-semibold tracking-tight mb-1 ${isUnlocked ? 'text-[#1a0107] dark:text-white' : 'text-gray-500'}`}>{badge.id}</h4>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
