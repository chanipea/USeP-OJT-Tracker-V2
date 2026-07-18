// =========================================================
// App.tsx
// The main app component. Holds shared state in memory,
// fetches data from the backend, and renders whichever tab is
// active.
// =========================================================

import { useState, useEffect, useCallback } from 'react';
import type { TabId, LogEntry, LogFormData, Profile, NotificationState } from './types';
import { defaultLogData } from './utils';
import { fetchLogs, fetchProfile } from './api';

import TopNav from './components/TopNav';
import NotificationToast from './components/Notification';
import Dashboard from './components/Dashboard';
import AddLogForm from './components/AddLogForm';
import History from './components/History';
import ProfileSettings from './components/ProfileSettings';

const EMPTY_PROFILE: Profile = {
  name: '',
  studentId: '',
  program: '',
  company: '',
  supervisor: '',
  targetHours: 0,
  bio: '',
  email: '',
  phone: '',
  profilePicture: '',
  coverPhoto: '',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [loadingData, setLoadingData] = useState(true);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const [logFormData, setLogFormData] = useState<LogFormData>(defaultLogData());
  const [editingLogId, setEditingLogId] = useState<number | null>(null);

  const notify = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Setup dark mode class
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Smart Reminders logic
  useEffect(() => {
    if (!profile?.remindersEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();

      if (day >= 1 && day <= 5 && hour >= 17 && hour <= 20) {
        const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
        const hasLoggedToday = logs.some((l) => l.date === todayStr);

        if (!hasLoggedToday) {
          const lastReminder = localStorage.getItem('last_reminder_date');
          if (lastReminder !== todayStr) {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification("OJT Tracker Reminder", {
                body: "It's past 5 PM! Don't forget to log your OJT hours for today.",
              });
              localStorage.setItem('last_reminder_date', todayStr);
            }
          }
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [profile?.remindersEnabled, logs]);

  useEffect(() => {
    (async () => {
      try {
        const [logsData, profileData] = await Promise.all([fetchLogs(), fetchProfile()]);
        setLogs(logsData);
        setProfile(profileData);
      } catch (err) {
        console.error('Failed to load data:', err);
        notify('Failed to connect to the backend.', 'error');
      } finally {
        setLoadingData(false);
      }
    })();
  }, [notify]);

  const reloadLogs = useCallback(async () => {
    const data = await fetchLogs();
    setLogs(data);
  }, []);

  const goToAddLog = (logToEdit: LogEntry | null = null) => {
    setLogFormData(logToEdit ? { ...logToEdit } : defaultLogData());
    setEditingLogId(logToEdit ? logToEdit.id : null);
    setActiveTab('add');
  };

  const totalHoursCompleted = logs.reduce((total, log) => total + Number(log.hours || 0), 0);

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-zinc-950 transition-colors duration-300 font-sans selection:bg-[#fdb813] selection:text-[#1a0107] dark:text-white">
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogHoursClick={() => goToAddLog(null)}
      />

      <main className="w-full px-4 pt-32 pb-24 relative overflow-hidden">
        <NotificationToast notification={notification} />

        {loadingData && (
          <div className="max-w-xl mx-auto text-center py-32 text-gray-400">Loading your data&hellip;</div>
        )}

        {!loadingData && activeTab === 'dashboard' && <Dashboard profile={profile} logs={logs} />}

        {!loadingData && activeTab === 'add' && (
          <AddLogForm
            logFormData={logFormData}
            setLogFormData={setLogFormData}
            editingLogId={editingLogId}
            notify={notify}
            onCancel={() => {
              setEditingLogId(null);
              setLogFormData(defaultLogData());
              setActiveTab('history');
            }}
            onSaved={async () => {
              await reloadLogs();
              setLogFormData(defaultLogData());
              setEditingLogId(null);
              setActiveTab('history');
            }}
          />
        )}

        {!loadingData && activeTab === 'history' && (
          <History
            logs={logs}
            profile={profile}
            totalHoursCompleted={totalHoursCompleted}
            notify={notify}
            onEdit={(log) => goToAddLog(log)}
            onDeleted={reloadLogs}
            onAddClick={() => goToAddLog(null)}
          />
        )}

        {!loadingData && activeTab === 'profile' && (
          <ProfileSettings profile={profile} notify={notify} onSaved={setProfile} />
        )}
      </main>
    </div>
  );
}
