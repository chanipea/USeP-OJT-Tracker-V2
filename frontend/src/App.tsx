// =========================================================
// App.tsx
// The main app component. Holds shared state in memory,
// handles the login/signup flow, fetches data from the PHP
// backend once authenticated, and renders whichever tab is
// active. Each tab/screen's markup lives in its own
// component file under components/.
// =========================================================

import { useState, useEffect, useCallback } from 'react';
import type { TabId, LogEntry, LogFormData, Profile, NotificationState, User, AuthResponse } from './types';
import { defaultLogData } from './utils';
import { fetchLogs, fetchProfile, fetchMe, getToken, clearToken, logoutAccount, setUnauthorizedHandler } from './api';

import TopNav from './components/TopNav';
import NotificationToast from './components/Notification';
import Dashboard from './components/Dashboard';
import AddLogForm from './components/AddLogForm';
import History from './components/History';
import ProfileSettings from './components/ProfileSettings';
import Login from './components/Login';
import SignUp from './components/SignUp';

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

type AuthScreen = 'login' | 'signup';

export default function App() {
  // ----- Auth state -----
  const [user, setUser] = useState<User | null>(null);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [checkingSession, setCheckingSession] = useState(true);

  // ----- App state (only meaningful once logged in) -----
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

  const resetToLoggedOutState = useCallback(() => {
    setUser(null);
    setLogs([]);
    setProfile(EMPTY_PROFILE);
    setActiveTab('dashboard');
    setEditingLogId(null);
    setLogFormData(defaultLogData());
  }, []);

  // If any API call ever comes back 401 (expired/invalid token),
  // drop the user back to the login screen automatically.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      resetToLoggedOutState();
      setAuthScreen('login');
    });
  }, [resetToLoggedOutState]);

  // On first load, if a token was saved from a previous visit,
  // try to use it to restore the session automatically.
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        setCheckingSession(false);
        return;
      }
      try {
        const [me, logsData, profileData] = await Promise.all([fetchMe(), fetchLogs(), fetchProfile()]);
        setUser(me);
        setLogs(logsData);
        setProfile(profileData);
      } catch {
        clearToken();
      } finally {
        setCheckingSession(false);
        setLoadingData(false);
      }
    })();
  }, []);

  const reloadLogs = useCallback(async () => {
    const data = await fetchLogs();
    setLogs(data);
  }, []);

  const handleAuthSuccess = (auth: AuthResponse) => {
    setUser(auth.user);
    setProfile(auth.profile);
    setLoadingData(true);
    reloadLogs().finally(() => setLoadingData(false));
  };

  const handleLogout = async () => {
    try {
      await logoutAccount();
    } catch {
      // even if the network call fails, still log out locally
    }
    resetToLoggedOutState();
    setAuthScreen('login');
    notify('You have been logged out.');
  };

  const goToAddLog = (logToEdit: LogEntry | null = null) => {
    setLogFormData(logToEdit ? { ...logToEdit } : defaultLogData());
    setEditingLogId(logToEdit ? logToEdit.id : null);
    setActiveTab('add');
  };

  const totalHoursCompleted = logs.reduce((total, log) => total + Number(log.hours || 0), 0);

  // ----- Still checking for a saved session on first load -----
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f8] text-gray-400">
        Loading&hellip;
      </div>
    );
  }

  // ----- Not logged in: show Login or Sign Up -----
  if (!user) {
    return (
      <>
        <NotificationToast notification={notification} />
        {authScreen === 'login' ? (
          <Login
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={() => setAuthScreen('signup')}
            notify={notify}
          />
        ) : (
          <SignUp
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthScreen('login')}
            notify={notify}
          />
        )}
      </>
    );
  }

  // ----- Logged in: show the tracker -----
  return (
    <div className="min-h-screen bg-[#faf9f8] font-sans selection:bg-[#fdb813] selection:text-[#1a0107]">
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogHoursClick={() => goToAddLog(null)}
        user={user}
        onLogout={handleLogout}
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
