// =========================================================
// components/ProfileSettings.tsx
// View + edit mode for the student's profile & OJT settings.
// =========================================================

import { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { User, Mail, Phone, Edit2, X, Camera, Briefcase, Save, Download, Upload, Palette, Bell } from 'lucide-react';
import type { Profile } from '../types';
import { saveProfile, downloadBackup, restoreBackup } from '../api';
import ImageCropperModal from './ImageCropperModal';

interface Props {
  profile: Profile;
  notify: (message: string, type?: 'success' | 'error') => void;
  onSaved: (profile: Profile) => void;
}

interface CropState {
  open: boolean;
  src: string;
  field: 'profilePicture' | 'coverPhoto' | '';
  aspect: number;
}

export default function ProfileSettings({ profile, notify, onSaved }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Profile>(profile);
  const [cropState, setCropState] = useState<CropState>({ open: false, src: '', field: '', aspect: 1 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      if (!backupData.profile || !backupData.logs) throw new Error('Invalid backup file.');

      await restoreBackup(backupData);
      notify('Backup restored successfully! Refreshing data...', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      notify('Failed to restore backup: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    }
    e.target.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const saved = await saveProfile(formData);
      onSaved(saved);
      setIsEditing(false);
      notify('Profile parameters updated!');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not save profile.', 'error');
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>, field: 'profilePicture' | 'coverPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify('Image must be under 5MB', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropState({
          open: true,
          src: reader.result as string,
          field,
          aspect: field === 'profilePicture' ? 1 : 3,
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    if (cropState.field) {
      setFormData((prev) => ({ ...prev, [cropState.field as 'profilePicture' | 'coverPhoto']: croppedDataUrl }));
    }
    setCropState({ open: false, src: '', field: '', aspect: 1 });
  };

  if (!isEditing) {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in duration-700 pb-12 mt-8">
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] md:rounded-[4rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#f0ebe1] dark:border-zinc-800 overflow-hidden">
          <div className="h-48 md:h-64 w-full relative bg-[#f8f6f5] dark:bg-zinc-800">
            {profile.coverPhoto ? (
              <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdb813]/20 via-[#7a0016]/10 to-transparent"></div>
            )}
            <button
              onClick={() => {
                setFormData(profile);
                setIsEditing(true);
              }}
              className="absolute top-8 right-8 bg-white/90 backdrop-blur-md hover:bg-white dark:bg-zinc-900 text-[#1a0107] dark:text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Edit2 size={16} /> Edit Details
            </button>
          </div>

          <div className="px-8 sm:px-16 pb-16 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-10 -mt-16 sm:-mt-20 mb-10 relative z-10">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[6px] border-white bg-[#2a020b] flex items-center justify-center shadow-xl overflow-hidden shrink-0 mx-auto sm:mx-0">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl text-[#fdb813] font-serif italic">
                    {profile.name ? profile.name.charAt(0) : 'U'}
                  </span>
                )}
              </div>
              <div className="text-center sm:text-left flex-1 sm:mb-6 mt-4 sm:mt-0">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-[#1a0107] dark:text-white mb-2">
                  {profile.name || 'Anonymous User'}
                </h1>
                <p className="text-lg md:text-xl text-[#7a0016] dark:text-[#fca5a5] font-medium tracking-tight">
                  {profile.program || 'Degree Program Pending'}
                </p>
              </div>
            </div>

            {profile.bio && (
              <div className="mb-12 pb-10 border-b border-gray-100 dark:border-zinc-800">
                <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto sm:mx-0 font-light">
                  {profile.bio}
                </p>
              </div>
            )}

            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2 bg-[#f8f6f5] dark:bg-zinc-800/50 p-6 rounded-3xl border border-[#f0ebe1] dark:border-zinc-800">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} className="text-[#7a0016] dark:text-[#fca5a5]" /> Student ID
                  </span>
                  <div className="text-xl font-medium text-[#1a0107] dark:text-white">{profile.studentId || '—'}</div>
                </div>

                <div className="space-y-2 bg-[#f8f6f5] dark:bg-zinc-800/50 p-6 rounded-3xl border border-[#f0ebe1] dark:border-zinc-800">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={14} className="text-[#7a0016] dark:text-[#fca5a5]" /> Host Organization
                  </span>
                  <div className="text-xl font-medium text-[#1a0107] dark:text-white">{profile.company || '—'}</div>
                </div>

                <div className="space-y-2 bg-[#f8f6f5] dark:bg-zinc-800/50 p-6 rounded-3xl border border-[#f0ebe1] dark:border-zinc-800">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} className="text-[#7a0016] dark:text-[#fca5a5]" /> Supervisor
                  </span>
                  <div className="text-xl font-medium text-[#1a0107] dark:text-white">{profile.supervisor || '—'}</div>
                </div>
              </div>

              <div className="bg-[#fffdf8] dark:bg-zinc-900 p-6 md:p-8 rounded-[2.5rem] border border-[#fde59b]/50 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs text-[#8a6d3b] dark:text-white uppercase font-bold tracking-widest block mb-2">
                    Target Yield Capacity
                  </span>
                  <p className="text-[#8a6d3b]/80 dark:text-gray-400 text-sm max-w-sm">
                    Total capital (hours) required to complete your program requirements.
                  </p>
                </div>
                <div className="text-5xl font-semibold tracking-tighter text-[#7a0016] dark:text-white">
                  {profile.targetHours} <span className="text-2xl text-gray-400 font-medium tracking-normal">hrs</span>
                </div>
              </div>
            </div>

            <div className="mb-12 bg-[#f8f6f5] dark:bg-zinc-800/50 p-6 md:p-8 rounded-[2.5rem] border border-[#f0ebe1] dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Bell size={14} className="text-[#7a0016]" /> Shift Reminders
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified at 5:00 PM if you haven't logged your hours.</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const newVal = !profile.remindersEnabled;
                  if (newVal && 'Notification' in window && Notification.permission !== 'granted') {
                    const perm = await Notification.requestPermission();
                    if (perm !== 'granted') {
                      notify('You must allow notifications to enable reminders.', 'error');
                      return;
                    }
                  }
                  try {
                    const saved = await saveProfile({ ...profile, remindersEnabled: newVal });
                    onSaved(saved);
                    notify(newVal ? 'Reminders enabled!' : 'Reminders disabled!');
                  } catch (e) {
                    notify('Could not save reminder settings.', 'error');
                  }
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${profile.remindersEnabled ? 'bg-[#7a0016]' : 'bg-gray-300 dark:bg-zinc-600'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${profile.remindersEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="pt-12 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-4 justify-center">
              <button
                onClick={downloadBackup}
                className="bg-white dark:bg-zinc-900 hover:bg-gray-50 text-[#1a0107] dark:text-white border border-gray-200 px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
              >
                <Download size={18} className="text-gray-400" /> Download Backup
              </button>
              <button
                onClick={() => restoreInputRef.current?.click()}
                className="bg-white dark:bg-zinc-900 hover:bg-gray-50 text-[#1a0107] dark:text-white border border-gray-200 px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
              >
                <Upload size={18} className="text-gray-400" /> Restore Backup
              </button>
              <input
                type="file"
                ref={restoreInputRef}
                className="hidden"
                accept=".json,application/json"
                onChange={handleRestoreSelect}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-700 pb-12 mt-8">
      {cropState.open && (
        <ImageCropperModal
          src={cropState.src}
          aspect={cropState.aspect}
          onComplete={handleCropComplete}
          onCancel={() => setCropState({ open: false, src: '', field: '', aspect: 1 })}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 rounded-[3rem] md:rounded-[4rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#f0ebe1] dark:border-zinc-800 overflow-hidden"
      >
        <div className="flex justify-between items-center p-8 md:px-12 border-b border-gray-100 dark:border-zinc-800 bg-[#faf9f8] dark:bg-zinc-900">
          <h2 className="text-3xl font-semibold tracking-tighter text-[#1a0107] dark:text-white">Edit Parameters</h2>
          <button
            type="button"
            onClick={() => {
              setFormData(profile);
              setIsEditing(false);
            }}
            className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 shadow-sm border border-gray-200 transition-all hover:scale-105"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative h-48 md:h-64 bg-[#f8f6f5] dark:bg-zinc-800 group">
          {formData.coverPhoto && <img src={formData.coverPhoto} alt="Cover" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-[#1a0107]/40 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all backdrop-blur-sm">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
            >
              <Camera size={20} /> Update Cover Art
            </button>
            <input
              type="file"
              ref={coverInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, 'coverPhoto')}
            />
          </div>
        </div>

        <div className="px-8 sm:px-16 pb-16 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-10 -mt-16 sm:-mt-20 mb-10 relative z-10">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[6px] border-white bg-[#2a020b] flex items-center justify-center shadow-xl overflow-hidden relative mx-auto sm:mx-0 group shrink-0">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl text-[#fdb813] font-serif italic">
                  {formData.name ? formData.name.charAt(0) : 'U'}
                </span>
              )}
              <div
                className="absolute inset-0 bg-[#1a0107]/50 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all backdrop-blur-sm cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={32} className="text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, 'profilePicture')}
            />
            <div className="flex-1 sm:mb-6 mt-4 sm:mt-0 opacity-0 hidden sm:block">Spacer</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">Full Name</label>
              <input
                type="text"
                className="w-full p-4 bg-[#f8f6f5] dark:bg-zinc-800 text-[#1a0107] dark:text-white font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Dela Cruz"
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">Professional Bio</label>
              <textarea
                rows={4}
                className="w-full p-4 bg-[#f8f6f5] dark:bg-zinc-800 text-[#1a0107] dark:text-white font-medium rounded-[2rem] outline-none focus:ring-2 focus:ring-[#7a0016] resize-none border border-transparent focus:border-[#7a0016]/20 transition-all leading-relaxed"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="A brief overview of your goals..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">Student ID</label>
              <input
                type="text"
                className="w-full p-4 bg-[#f8f6f5] dark:bg-zinc-800 text-[#1a0107] dark:text-white font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="202X-XXXXX"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">Degree Program</label>
              <input
                type="text"
                className="w-full p-4 bg-[#f8f6f5] dark:bg-zinc-800 text-[#1a0107] dark:text-white font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="BS Information Technology"
              />
            </div>

            <div className="md:col-span-2 mt-8 mb-4">
              <h3 className="text-2xl font-semibold tracking-tighter text-[#1a0107] dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-6">
                Deployment Settings
              </h3>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">Host Company</label>
              <input
                type="text"
                className="w-full p-4 bg-[#f8f6f5] dark:bg-zinc-800 text-[#1a0107] dark:text-white font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Organization Name"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">Supervisor</label>
              <input
                type="text"
                className="w-full p-4 bg-[#f8f6f5] dark:bg-zinc-800 text-[#1a0107] dark:text-white font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.supervisor}
                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                placeholder="Supervisor Name"
              />
            </div>
            <div className="md:col-span-2 bg-[#fffdf8] dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-[#fde59b]/50 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#8a6d3b] dark:text-white uppercase tracking-widest mb-3">
                  Target Yield Capacity
                </label>
                <p className="text-base text-[#8a6d3b]/80 dark:text-zinc-400 max-w-sm font-light">
                  Define the total capital (hours) required to complete your program.
                </p>
              </div>
              <input
                type="number"
                min="1"
                required
                className="w-full md:w-56 p-4 text-center border-2 border-white dark:border-zinc-800 rounded-[2rem] focus:ring-2 focus:ring-[#fdb813] outline-none bg-white dark:bg-zinc-900 font-semibold tracking-tighter text-3xl text-[#7a0016] dark:text-white shadow-sm transition-all"
                value={formData.targetHours}
                onChange={(e) =>
                  setFormData({ ...formData, targetHours: e.target.value === '' ? 0 : Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end pt-16 gap-4">
            <button
              type="button"
              onClick={() => {
                setFormData(profile);
                setIsEditing(false);
              }}
              className="px-8 py-4 text-gray-500 dark:text-gray-400 font-semibold hover:bg-gray-50 rounded-full transition-colors text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1a0107] dark:bg-zinc-800 hover:bg-[#4a0414] dark:hover:bg-zinc-700 text-white px-8 py-4 rounded-full flex items-center justify-center gap-3 font-medium transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-base"
            >
              <Save size={20} /> Save Configurations
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
