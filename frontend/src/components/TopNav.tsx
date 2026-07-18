// =========================================================
// components/TopNav.tsx
// The pill-shaped top navigation bar.
// Shows icon-only tabs on narrow screens, icon+label from
// the sm breakpoint up, so it never overflows/overlaps on
// mobile widths.
// =========================================================

import { useState, useEffect } from 'react';
import { Sparkles, Plus, LayoutDashboard, List, User as UserIcon, Moon, Sun } from 'lucide-react';
import type { TabId } from '../types';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogHoursClick: () => void;
}

const TABS: { id: TabId; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'history', label: 'History', Icon: List },
  { id: 'profile', label: 'Profile', Icon: UserIcon },
];

export default function TopNav({ activeTab, onTabChange, onLogHoursClick }: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDark = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setIsDark(nextDark);
  };

  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-4xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between p-1.5 sm:p-2 z-50 border border-white/80 dark:border-zinc-800">
      <div
        className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 cursor-pointer group shrink-0"
        onClick={() => onTabChange('dashboard')}
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2a020b] flex items-center justify-center group-hover:bg-[#7a0016] transition-colors shrink-0">
          <Sparkles size={15} className="text-[#fdb813]" />
        </div>
        <span className="font-semibold text-lg tracking-tight hidden md:block whitespace-nowrap">
          <span className="text-[#7a0016] dark:text-[#fca5a5]">USeP</span>
          <span className="text-[#1a0107] dark:text-zinc-300">Internship</span>
        </span>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
            className={`flex items-center gap-2 px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap
              ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-zinc-800 text-[#1a0107] dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-[#1a0107] dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50'
              }`}
          >
            <tab.Icon size={16} className="shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="pl-1 sm:px-2 flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={toggleDark}
          className="p-2 sm:p-2.5 rounded-full text-gray-500 dark:text-zinc-400 hover:text-[#1a0107] dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-zinc-800/50 transition-all"
          title="Toggle Dark Mode"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={onLogHoursClick}
          className="bg-[#fdb813] text-[#2a020b] px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-[#e5a610] transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={16} className="shrink-0" /> <span className="hidden md:inline">Log Hours</span>
        </button>
      </div>
    </nav>
  );
}
