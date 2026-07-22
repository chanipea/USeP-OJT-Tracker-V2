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
    <nav className="fixed top-0 left-0 w-full bg-[#fdfaf5] dark:bg-zinc-950 flex items-center justify-between px-4 md:px-8 xl:px-12 py-4 z-50 border-b-2 border-[#1a0107] dark:border-zinc-800 transition-colors shadow-retro-sm dark:shadow-none">
      <div
        className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 cursor-pointer group shrink-0"
        onClick={() => onTabChange('dashboard')}
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2a020b] border-2 border-[#1a0107] flex items-center justify-center group-hover:bg-[#7a0016] transition-colors shrink-0 shadow-[2px_2px_0px_#1a0107]">
          <Sparkles size={15} className="text-[#fdb813]" />
        </div>
        <span className="font-serif-fraunces font-bold text-xl tracking-tight hidden md:block whitespace-nowrap">
          <span className="text-[#7a0016] dark:text-[#fca5a5]">USeP</span>
          <span className="text-[#1a0107] dark:text-zinc-300 ml-1">Internship</span>
        </span>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
            className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-sm text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap border-2
              ${
                activeTab === tab.id
                  ? 'border-[#1a0107] dark:border-white text-[#1a0107] dark:text-white bg-[#ffc1cc] dark:bg-zinc-800 shadow-[2px_2px_0px_#1a0107] dark:shadow-none translate-y-[-2px]'
                  : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-[#1a0107] dark:hover:text-white hover:border-[#1a0107] hover:bg-white dark:hover:bg-zinc-900'
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
          className="bg-[#ffb6c1] dark:bg-white text-[#1a0107] dark:text-black border-2 border-[#1a0107] px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-bold hover:bg-[#ffc1cc] transition-colors flex items-center gap-2 whitespace-nowrap rounded-sm shadow-[4px_4px_0px_#1a0107] active:shadow-[0px_0px_0px_#1a0107] active:translate-x-[4px] active:translate-y-[4px]"
        >
          <Plus size={16} className="shrink-0" /> <span className="hidden md:inline font-serif-fraunces">Log Hours</span>
        </button>
      </div>
    </nav>
  );
}
