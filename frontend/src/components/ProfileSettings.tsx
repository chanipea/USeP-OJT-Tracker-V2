// =========================================================
// components/ProfileSettings.tsx
// View + edit mode for the student's profile & OJT settings.
// =========================================================

import { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { User, Mail, Phone, Edit2, X, Camera, Briefcase, Save, Download, Upload, Palette, Bell, Target } from 'lucide-react';
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
      <div className="max-w-6xl mx-auto animate-in fade-in duration-700 pb-12 mt-8 px-4 relative">
        {/* Background Ambient Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#7a0016]/5 via-transparent to-[#fdb813]/5 rounded-[4rem] blur-3xl opacity-50" />
        
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* Main Identity - Floating Card */}
          <div className="flex-1 lg:max-w-md xl:max-w-lg bg-white/70 dark:bg-zinc-900/70 backdrop-blur-3xl rounded-[3rem] p-8 md:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white dark:border-zinc-800 relative group overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#1a0107]/5 to-transparent z-0 pointer-events-none" />
            <button
              onClick={() => { setFormData(profile); setIsEditing(true); }}
              className="absolute top-8 right-8 z-20 w-12 h-12 bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-700 backdrop-blur-md text-[#1a0107] dark:text-white rounded-full flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105 border border-white/60 dark:border-zinc-700/60"
            >
              <Edit2 size={18} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center mt-4">
              <div className="relative mb-8 group-hover:scale-105 transition-transform duration-500">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] bg-[#2a020b] flex items-center justify-center shadow-2xl overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
                  ) : (
                    <span className="text-6xl text-[#fdb813] font-serif italic">{profile.name ? profile.name.charAt(0) : 'U'}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-[#7a0016] rounded-[2.5rem] blur-2xl -z-10 opacity-30 group-hover:opacity-50 transition-opacity duration-500 translate-y-4" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#1a0107] dark:text-white mb-3">
                {profile.name || 'Anonymous User'}
              </h1>
              <p className="text-lg text-[#7a0016] dark:text-[#fca5a5] font-medium tracking-wide uppercase">
                {profile.program || 'Degree Program Pending'}
              </p>
              
              {profile.bio && (
                <p className="mt-8 text-gray-500 dark:text-gray-400 leading-relaxed font-light text-base md:text-lg max-w-sm">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Right Side Info & Stats */}
          <div className="flex-1 flex flex-col gap-6 md:gap-8">
            
            {/* Massive Target Hours Card */}
            <div className="bg-[#1a0107] dark:bg-black rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-2xl group flex flex-col justify-between min-h-[300px] border border-transparent dark:border-zinc-800/80">
              <div className="absolute -right-20 -top-20 text-[#7a0016]/40 dark:text-[#fca5a5]/10 group-hover:rotate-12 transition-transform duration-700">
                <Target size={300} strokeWidth={0.5} />
              </div>
              <div className="relative z-10">
                <span className="text-xs font-bold text-[#fdb813] uppercase tracking-widest block mb-4">
                  Target Yield Capacity
                </span>
                <div className="flex items-end gap-2">
                  <div className="text-8xl md:text-[8rem] leading-none font-semibold tracking-tighter text-white">
                    {profile.targetHours}
                  </div>
                  <span className="text-2xl text-gray-400 font-medium mb-4">hrs</span>
                </div>
              </div>
              <p className="relative z-10 mt-8 text-gray-400 font-light max-w-xs text-sm">
                Total scheduled capital to fulfill the internship curriculum requirements.
              </p>
            </div>

            {/* Sub-cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Institution Card */}
              <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white dark:border-zinc-800 shadow-sm flex flex-col gap-6 justify-center">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Host Organization</span>
                  <div className="text-xl font-semibold text-[#1a0107] dark:text-white truncate">{profile.company || '—'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Supervisor</span>
                  <div className="text-xl font-semibold text-[#1a0107] dark:text-white truncate">{profile.supervisor || '—'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Student ID</span>
                  <div className="text-lg font-medium text-gray-500 dark:text-gray-400 font-mono tracking-wider">{profile.studentId || '—'}</div>
                </div>
              </div>

              {/* Action / Systems Card */}
              <div className="flex flex-col gap-6 md:gap-8">
                <div className="bg-[#fffdf8]/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-[#fde59b]/50 dark:border-zinc-700 flex flex-col justify-between flex-1 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-bold text-[#8a6d3b] dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Bell size={12} className="text-[#7a0016] dark:text-[#fca5a5]" /> Shift Reminders
                      </span>
                      <p className="text-sm font-medium text-[#1a0107] dark:text-white">Daily 5:00 PM</p>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={downloadBackup}
                    className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-zinc-800 text-[#1a0107] dark:text-white border border-white dark:border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-sm group"
                  >
                    <Download size={20} className="text-[#7a0016] dark:text-[#fca5a5] group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center">Backup</span>
                  </button>
                  <button
                    onClick={() => restoreInputRef.current?.click()}
                    className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-zinc-800 text-[#1a0107] dark:text-white border border-white dark:border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-sm group"
                  >
                    <Upload size={20} className="text-[#7a0016] dark:text-[#fca5a5] group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center">Restore</span>
                  </button>
                  <input type="file" ref={restoreInputRef} className="hidden" accept=".json,application/json" onChange={handleRestoreSelect} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-700 pb-12 mt-8 px-4">
      {cropState.open && (
        <ImageCropperModal
          src={cropState.src}
          aspect={cropState.aspect}
          onComplete={handleCropComplete}
          onCancel={() => setCropState({ open: false, src: '', field: '', aspect: 1 })}
        />
      )}

      <form onSubmit={handleSubmit} className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_12px_60px_rgb(0,0,0,0.05)] border border-white/80 dark:border-zinc-800/80 p-8 md:p-12 relative overflow-hidden">
        
        {/* Background Ambient Gradient */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#7a0016]/10 to-transparent z-0 pointer-events-none" />

        <div className="relative z-10 flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter text-[#1a0107] dark:text-white">Profile Configuration</h2>
          <button
            type="button"
            onClick={() => { setFormData(profile); setIsEditing(false); }}
            className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-sm border border-gray-100 dark:border-zinc-700 transition-all hover:scale-105"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Column: Visuals & Core Identity */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start gap-8">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-48 h-48 rounded-[2.5rem] bg-[#2a020b] flex items-center justify-center shadow-xl overflow-hidden group-hover:scale-95 transition-transform duration-300">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl text-[#fdb813] font-serif italic">{formData.name ? formData.name.charAt(0) : 'U'}</span>
                )}
                <div className="absolute inset-0 bg-[#1a0107]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <Camera size={32} className="text-white" />
                </div>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageSelect(e, 'profilePicture')} />

            <div className="w-full space-y-2 mt-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">Student ID</label>
              <input
                type="text"
                className="w-full p-5 bg-white/80 dark:bg-zinc-900/80 text-[#1a0107] dark:text-white font-mono tracking-wider font-medium rounded-3xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-gray-100 dark:border-zinc-800 shadow-inner transition-all"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="202X-XXXXX"
              />
            </div>
            
            <div className="w-full bg-[#1a0107] dark:bg-black rounded-[2.5rem] p-8 mt-4 shadow-xl text-center">
              <label className="text-[10px] font-bold text-[#fdb813] uppercase tracking-widest block mb-4">Target Yield (Hrs)</label>
              <input
                type="number"
                min="1"
                required
                className="w-full bg-transparent text-6xl text-white font-semibold tracking-tighter text-center outline-none border-b-2 border-[#7a0016] focus:border-[#fdb813] transition-colors pb-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                value={formData.targetHours}
                onChange={(e) => setFormData({ ...formData, targetHours: e.target.value === '' ? 0 : Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Right Column: Text Fields */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">Full Name</label>
              <input
                type="text"
                className="w-full p-5 bg-white/80 dark:bg-zinc-900/80 text-[#1a0107] dark:text-white font-medium rounded-3xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-gray-100 dark:border-zinc-800 shadow-inner transition-all text-xl"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Dela Cruz"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">Degree Program</label>
              <input
                type="text"
                className="w-full p-5 bg-white/80 dark:bg-zinc-900/80 text-[#1a0107] dark:text-white font-medium rounded-3xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-gray-100 dark:border-zinc-800 shadow-inner transition-all"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="BS Information Technology"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">Professional Bio</label>
              <textarea
                rows={3}
                className="w-full p-5 bg-white/80 dark:bg-zinc-900/80 text-[#1a0107] dark:text-white font-medium rounded-[2rem] outline-none focus:ring-2 focus:ring-[#7a0016] resize-none border border-gray-100 dark:border-zinc-800 shadow-inner transition-all leading-relaxed"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="A brief overview of your goals..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">Host Company</label>
                <input
                  type="text"
                  className="w-full p-5 bg-white/80 dark:bg-zinc-900/80 text-[#1a0107] dark:text-white font-medium rounded-3xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-gray-100 dark:border-zinc-800 shadow-inner transition-all"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Organization Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">Supervisor</label>
                <input
                  type="text"
                  className="w-full p-5 bg-white/80 dark:bg-zinc-900/80 text-[#1a0107] dark:text-white font-medium rounded-3xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-gray-100 dark:border-zinc-800 shadow-inner transition-all"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                  placeholder="Supervisor Name"
                />
              </div>
            </div>

            <div className="flex justify-end pt-8 mt-4 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#1a0107] dark:bg-zinc-800 hover:bg-[#4a0414] dark:hover:bg-zinc-700 text-white px-10 py-5 rounded-full flex items-center justify-center gap-3 font-medium transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
              >
                <Save size={20} /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
