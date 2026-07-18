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
    <div className="max-w-7xl mx-auto px-4 animate-in fade-in duration-700 pb-12 pt-6">
      {isCalendarOpen && <Calendar logs={logs} onClose={() => setIsCalendarOpen(false)} />}
      
      {/* Bento Master Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 auto-rows-min">
        
        {/* 1. Hero & Calendar Button (Col Span 4, Row Span 2) */}
        <div className="md:col-span-4 xl:col-span-4 row-span-2 relative overflow-hidden rounded-[2.5rem] bg-[#fffdfb] dark:bg-zinc-900 border border-[#f0ebe1] dark:border-zinc-800 shadow-xl group hover:shadow-2xl transition-all p-8 md:p-12 flex flex-col justify-between min-h-[340px]">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#fdb813]/20 via-[#7a0016]/10 to-transparent blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col items-start h-full">
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter text-[#1a0107] dark:text-white mb-4 leading-tight">
              Where Your <br /> Progress Grows.
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-light max-w-lg mb-8 leading-relaxed">
              A programmable, utility-driven tracker designed for native value accrual and seamless OJT management.
            </p>
            <div className="mt-auto w-full flex justify-end">
               <button
                 onClick={() => setIsCalendarOpen(true)}
                 className="flex items-center gap-3 bg-white/60 dark:bg-zinc-800/80 backdrop-blur-md rounded-full px-6 py-3 border border-gray-200 dark:border-zinc-700 shadow-sm hover:scale-105 transition-all group-hover:border-[#fdb813]/50"
               >
                 <CalendarDays size={20} className="text-[#7a0016] dark:text-[#fca5a5]" />
                 <span className="font-semibold text-sm">Full Calendar View</span>
               </button>
            </div>
          </div>
        </div>

        {/* 2. Core Metric Progress (Col Span 2, Row Span 2) */}
        <div className="md:col-span-2 xl:col-span-2 row-span-2 bg-[#f8f6f5] dark:bg-zinc-800 rounded-[2.5rem] border border-[#f0ebe1] dark:border-zinc-800 shadow-lg p-8 flex flex-col justify-center items-center relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-gradient-to-tl from-[#7a0016]/20 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          <div className="text-center relative z-10 mb-6">
             <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Total Yield Acquired</span>
             <div className="flex items-baseline justify-center gap-1">
               <span className="text-7xl font-semibold tracking-tighter text-[#7a0016] dark:text-white">
                 {totalHoursCompleted.toFixed(1)}
               </span>
               <span className="text-xl text-gray-400 font-medium tracking-tight">hrs</span>
             </div>
          </div>
          
          <div className="w-full relative z-10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-3xl p-6 border border-white/40 dark:border-zinc-700/50 shadow-sm">
             <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest mb-3">
               <span className="text-gray-500">Progress</span>
               <span className="text-[#7a0016] dark:text-white">{progressPercentage.toFixed(1)}%</span>
             </div>
             <div className="w-full bg-gray-200/80 dark:bg-zinc-800 rounded-full h-3 shadow-inner overflow-hidden">
               <div
                 className="bg-[#7a0016] h-full rounded-full transition-all duration-1000 ease-out relative"
                 style={{ width: `${progressPercentage}%` }}
               >
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
               </div>
             </div>
          </div>
        </div>

        {/* 3. Micro Cards (Target & Remaining) */}
        <div className="md:col-span-2 xl:col-span-1 row-span-1 bg-[#1a0107] text-white dark:bg-zinc-800 rounded-[2.5rem] p-8 border border-[#2a020b] dark:border-zinc-700 flex flex-col justify-between group hover:bg-[#2a020b] transition-colors shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Target Config</span>
            <Target size={20} className="text-[#fdb813]/60 group-hover:text-[#fdb813] transition-colors" />
          </div>
          <span className="text-5xl font-semibold tracking-tighter text-[#fdb813]">{profile.targetHours}</span>
        </div>

        <div className="md:col-span-2 xl:col-span-1 row-span-1 bg-[#2a020b] text-white dark:bg-zinc-800/80 rounded-[2.5rem] p-8 border border-[#4a0414] dark:border-zinc-700 flex flex-col justify-between group hover:bg-[#4a0414] transition-colors shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Time Remaining</span>
            <Clock size={20} className="text-white/60 group-hover:text-white transition-colors" />
          </div>
          <span className="text-5xl font-semibold tracking-tighter">{remainingHours.toFixed(1)}</span>
        </div>

        {/* 4. Weekly Strip (Col Span 4) */}
        <div className="md:col-span-4 xl:col-span-4 row-span-1 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] border border-[#f0ebe1] dark:border-zinc-800 shadow-sm p-6 flex flex-col justify-center overflow-hidden">
          <div className="flex justify-between items-center gap-4 overflow-x-auto hide-scrollbar px-2">
            {weekDays.map((date, i) => {
              const dateStr = date.toISOString().split('T')[0];
              const isToday = dateStr === todayStr;
              const hasLog = loggedDates.includes(dateStr);
              return (
                <div key={i} className="flex flex-col items-center gap-3 min-w-[3.5rem]">
                  <span className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-[#1a0107] dark:text-white' : 'text-gray-400'}`}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                    ${hasLog ? 'bg-[#fdb813] text-[#2a020b] dark:text-[#2a020b] shadow-md border-2 border-white dark:border-zinc-700' : isToday ? 'bg-[#2a020b] text-white dark:bg-zinc-800' : 'bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-500'}
                    `}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Chart & Analytics */}
        <div className="md:col-span-4 xl:col-span-3 row-span-2 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-[#f0ebe1] dark:border-zinc-800 shadow-sm p-8 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp size={14} className="text-[#7a0016] dark:text-[#fca5a5]" /> Velocity Over Time
            </span>
            <span className="text-xs font-medium bg-[#f8f6f5] dark:bg-zinc-800 px-4 py-1.5 rounded-full text-gray-600 dark:text-gray-300">Last 7 Days</span>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#3f3f46" strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey="name" axisLine={{ stroke: '#3f3f46' }} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12 }} dy={10} />
                <YAxis axisLine={{ stroke: '#3f3f46' }} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="hours" fill="#7a0016" radius={[6, 6, 6, 6]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-4 xl:col-span-3 row-span-2 bg-[#f8f6f5] dark:bg-zinc-800/50 rounded-[2.5rem] border border-[#f0ebe1] dark:border-zinc-800 shadow-sm p-8 flex flex-col justify-between min-h-[350px]">
           <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Activity size={14} className="text-[#fdb813]" /> Skill Allocation
            </span>
            <div className="flex bg-white dark:bg-zinc-800 p-1 rounded-full border border-gray-200 dark:border-zinc-700 shadow-sm">
               {['all', 'month', 'week'].map((t) => (
                 <button key={t} onClick={() => setTimeFilter(t as any)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${timeFilter === t ? 'bg-[#1a0107] dark:bg-zinc-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-[#1a0107] dark:hover:text-white'}`}>
                   {t}
                 </button>
               ))}
            </div>
          </div>
          <div className="space-y-6 flex-1 mt-2">
             {CATEGORY_BARS.map((cat) => (
               <div key={cat.label} className="group">
                 <div className="flex justify-between text-sm font-semibold mb-2">
                   <span className="text-[#1a0107] dark:text-white">{cat.label}</span>
                   <span className="text-gray-500 dark:text-gray-400">{categoryStats[cat.label] || 0}%</span>
                 </div>
                 <div className="w-full bg-gray-200/60 dark:bg-zinc-700/50 rounded-full h-3 shadow-inner overflow-hidden">
                   <div className={`${cat.color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${categoryStats[cat.label] || 0}%` }} />
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* 6. Milestones Gallery (Col Span 6) */}
        <div className="md:col-span-4 xl:col-span-6 bg-gradient-to-br from-white to-[#faf9f8] dark:from-zinc-900 dark:to-zinc-900/90 rounded-[2.5rem] border border-[#f0ebe1] dark:border-zinc-800 shadow-sm p-8 mt-2 lg:mb-0 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#fdb813]/20 flex items-center justify-center">
                <Award size={24} className="text-[#fdb813]" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tighter text-[#1a0107] dark:text-white">Milestones & Achievements</h3>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-5 py-2.5 rounded-full border border-gray-100 dark:border-zinc-700 shadow-sm">
               <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Current Day Streak</span>
               <div className="flex items-center gap-1.5 text-[#fdb813]">
                 <Flame size={16} className="fill-current" />
                 <span className="font-bold text-lg">{currentStreak}</span>
               </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {BADGES.map((badge) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              const Icon = badge.icon;
              return (
                <div key={badge.id} className="relative group">
                  <div className={`flex items-center gap-4 py-3 px-6 rounded-full border transition-all ${isUnlocked ? 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 shadow-sm hover:scale-105 hover:shadow-md cursor-help' : 'bg-transparent border-dashed border-gray-200 dark:border-zinc-800 opacity-50 grayscale cursor-not-allowed'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isUnlocked ? badge.color : 'border-gray-300 dark:border-zinc-700 text-gray-400'}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold tracking-tight ${isUnlocked ? 'text-[#1a0107] dark:text-white' : 'text-gray-500'}`}>{badge.id}</h4>
                    </div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                    <div className="bg-[#1a0107] dark:bg-zinc-800 text-white dark:text-gray-200 text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-xl shadow-xl border border-[#2a020b] dark:border-zinc-700">
                      {badge.description}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a0107] dark:bg-zinc-800 rotate-45 border-b border-r border-[#2a020b] dark:border-zinc-700"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
