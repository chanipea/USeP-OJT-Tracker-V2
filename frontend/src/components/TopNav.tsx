// =========================================================
// components/TopNav.tsx
// The pill-shaped top navigation bar.
// Shows icon-only tabs on narrow screens, icon+label from
// the sm breakpoint up, so it never overflows/overlaps on
// mobile widths.
// =========================================================

import { Sparkles, Plus, LayoutDashboard, List, User as UserIcon, LogOut } from 'lucide-react';
import type { TabId, User } from '../types';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogHoursClick: () => void;
  user: User;
  onLogout: () => void;
}

const TABS: { id: TabId; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'history', label: 'History', Icon: List },
  { id: 'profile', label: 'Profile', Icon: UserIcon },
];

export default function TopNav({ activeTab, onTabChange, onLogHoursClick, user, onLogout }: Props) {
  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-4xl bg-white/70 backdrop-blur-2xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between p-1.5 sm:p-2 z-50 border border-white/80">
      <div
        className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 cursor-pointer group shrink-0"
        onClick={() => onTabChange('dashboard')}
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2a020b] flex items-center justify-center group-hover:bg-[#7a0016] transition-colors shrink-0">
          <Sparkles size={15} className="text-[#fdb813]" />
        </div>
        <span className="font-semibold text-lg tracking-tight text-[#1a0107] hidden md:block whitespace-nowrap">
          USeP<span className="text-gray-400 font-normal">Internship</span>
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
                  ? 'bg-[#1a0107] text-white shadow-md'
                  : 'text-gray-500 hover:text-[#1a0107] hover:bg-gray-100/80'
              }`}
          >
            <tab.Icon size={16} className="shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="pl-1 sm:px-2 flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={onLogHoursClick}
          className="bg-[#fdb813] text-[#2a020b] px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-[#e5a610] transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={16} className="shrink-0" /> <span className="hidden md:inline">Log Hours</span>
        </button>
        <button
          onClick={onLogout}
          title={`Log out (${user.email})`}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-[#1a0107] flex items-center justify-center transition-colors shrink-0"
        >
          <LogOut size={15} />
        </button>
      </div>
    </nav>
  );
}
