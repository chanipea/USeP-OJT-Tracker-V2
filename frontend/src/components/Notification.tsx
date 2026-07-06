// =========================================================
// components/Notification.tsx
// A temporary toast shown at the top of the screen.
// =========================================================

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { NotificationState } from '../types';

interface Props {
  notification: NotificationState | null;
}

export default function Notification({ notification }: Props) {
  if (!notification) return null;

  return (
    <div
      className={`fixed top-28 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 text-white text-sm font-bold tracking-wide animate-in slide-in-from-top-4
        ${notification.type === 'error' ? 'bg-[#2a020b]' : 'bg-[#7a0016]'}`}
    >
      {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
      <span>{notification.message}</span>
    </div>
  );
}
