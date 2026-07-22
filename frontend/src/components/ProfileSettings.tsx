// =========================================================
// components/ProfileSettings.tsx
// View + edit mode for the student's profile & OJT settings.
// =========================================================

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { ChangeEvent, FormEvent } from 'react';
import { User, Mail, Phone, Edit2, X, Camera, Briefcase, Save, Download, Upload, Palette, Bell, Target, RefreshCw } from 'lucide-react';
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [formData, setFormData] = useState<Profile>(profile);
  const [cropState, setCropState] = useState<CropState>({ open: false, src: '', field: '', aspect: 1 });

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 200], [-15, 15]);

  const lanyardPathLeft = useTransform(
    [dragX, dragY],
    ([x, y]: [number, number]) => {
      const anchorX = 80;
      const anchorY = -200;
      const targetX = 155 + x;
      const targetY = 160 + y; // Threads behind the D-ring
      return `M ${anchorX} ${anchorY} L ${targetX} ${targetY}`;
    }
  );

  const lanyardPathRight = useTransform(
    [dragX, dragY],
    ([x, y]: [number, number]) => {
      const anchorX = 260;
      const anchorY = -200;
      const targetX = 185 + x;
      const targetY = 160 + y; // Threads behind the D-ring
      return `M ${anchorX} ${anchorY} L ${targetX} ${targetY}`;
    }
  );

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
      <div className="w-full animate-in fade-in duration-700 pb-12 mt-8 relative">
        {/* Background Ambient Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#7a0016]/5 via-transparent to-[#fdb813]/5 blur-3xl opacity-50" />
        
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* Main Identity - Draggable ID Card */}
          <div className="flex-1 lg:max-w-md xl:max-w-lg relative flex flex-col items-center pt-8 md:pt-12 z-40">
            
            {/* Dynamic SVG Sling (V-Shape) */}
            <svg className="absolute w-[340px] h-[500px] pointer-events-none z-0 overflow-visible" style={{ top: '-150px', left: '50%', transform: 'translateX(-50%)' }}>
              {/* Left Strap Shadow */}
              <motion.path d={lanyardPathLeft} stroke="#1a0107" strokeWidth="32" fill="none" strokeLinecap="round" className="drop-shadow-md" />
              {/* Left Strap Base */}
              <motion.path d={lanyardPathLeft} stroke="#7a0016" strokeWidth="26" fill="none" strokeLinecap="round" />
              {/* Left Strap Inner Detail */}
              <motion.path d={lanyardPathLeft} stroke="#fdfaf5" strokeWidth="18" strokeDasharray="10 15" fill="none" strokeLinecap="round" style={{ opacity: 0.15 }} />
              <motion.path d={lanyardPathLeft} stroke="#fdfaf5" strokeWidth="2" strokeDasharray="4 6" fill="none" strokeLinecap="round" style={{ opacity: 0.6 }} />

              {/* Right Strap Shadow */}
              <motion.path d={lanyardPathRight} stroke="#1a0107" strokeWidth="32" fill="none" strokeLinecap="round" className="drop-shadow-md" />
              {/* Right Strap Base */}
              <motion.path d={lanyardPathRight} stroke="#7a0016" strokeWidth="26" fill="none" strokeLinecap="round" />
              {/* Right Strap Inner Detail */}
              <motion.path d={lanyardPathRight} stroke="#fdfaf5" strokeWidth="18" strokeDasharray="10 15" fill="none" strokeLinecap="round" style={{ opacity: 0.15 }} />
              <motion.path d={lanyardPathRight} stroke="#fdfaf5" strokeWidth="2" strokeDasharray="4 6" fill="none" strokeLinecap="round" style={{ opacity: 0.6 }} />
              
              {/* Lanyard Top Connector (Behind Neck) */}
              <path d="M 70 -200 Q 170 -240 270 -200" stroke="#7a0016" strokeWidth="26" fill="none" strokeLinecap="round" />
              <path d="M 70 -200 Q 170 -240 270 -200" stroke="#1a0107" strokeWidth="32" fill="none" strokeLinecap="round" style={{ zIndex: -1 }} />
            </svg>

            {/* Static Toolbar Wrapper */}
            <div className="relative w-full max-w-[340px] h-0 z-50 pointer-events-none">
              <div className="absolute -right-4 sm:-right-14 top-40 flex flex-col gap-4 pointer-events-auto">
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-10 h-10 bg-white hover:bg-gray-200 text-[#1a0107] border-2 border-[#1a0107] shadow-[2px_2px_0px_#1a0107] rounded-sm flex items-center justify-center transition-all active:translate-y-1 active:shadow-none cursor-pointer"
                  title="Flip Card"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={() => { setFormData(profile); setIsEditing(true); }}
                  className="w-10 h-10 bg-[#fdb813] hover:bg-[#ffc1cc] text-[#1a0107] border-2 border-[#1a0107] shadow-[2px_2px_0px_#1a0107] rounded-sm flex items-center justify-center transition-all active:translate-y-1 active:shadow-none cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>

            <motion.div
              drag
              dragSnapToOrigin
              dragElastic={0.15}
              dragTransition={{ bounceStiffness: 400, bounceDamping: 10 }}
              style={{ x: dragX, y: dragY, rotate, originX: 0.5, originY: -0.1, perspective: 1500 }}
              className="relative z-10 w-full max-w-[340px] flex flex-col cursor-grab active:cursor-grabbing items-center mt-2"
            >
              {/* Realistic Lanyard Clip (Lobster Clasp) */}
              <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[50px] h-[80px] z-20 pointer-events-none drop-shadow-md">
                <svg width="50" height="80" viewBox="0 0 50 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#9ca3af" />
                      <stop offset="30%" stopColor="#f3f4f6" />
                      <stop offset="70%" stopColor="#d1d5db" />
                      <stop offset="100%" stopColor="#6b7280" />
                    </linearGradient>
                    <linearGradient id="metalDark" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6b7280" />
                      <stop offset="50%" stopColor="#9ca3af" />
                      <stop offset="100%" stopColor="#4b5563" />
                    </linearGradient>
                  </defs>

                  {/* D-Ring */}
                  <path d="M 5 25 C 5 5, 45 5, 45 25" stroke="#1a0107" strokeWidth="10" strokeLinecap="round" fill="none" />
                  <path d="M 5 25 C 5 5, 45 5, 45 25" stroke="url(#metal)" strokeWidth="6" strokeLinecap="round" fill="none" />
                  
                  {/* Swivel Base */}
                  <rect x="5" y="22" width="40" height="8" rx="3" fill="#1a0107" />
                  <rect x="7" y="24" width="36" height="4" rx="2" fill="url(#metal)" />

                  {/* Swivel Pin */}
                  <rect x="18" y="30" width="14" height="6" fill="#1a0107" />
                  <rect x="20" y="30" width="10" height="6" fill="url(#metalDark)" />

                  {/* Clasp Body */}
                  <path d="M 15 36 L 35 36 L 32 60 L 18 60 Z" fill="#1a0107" />
                  <path d="M 17 38 L 33 38 L 30 58 L 20 58 Z" fill="url(#metal)" />
                  
                  {/* Thumb Lever */}
                  <rect x="10" y="42" width="6" height="12" rx="3" fill="#1a0107" />
                  <rect x="12" y="44" width="4" height="8" rx="2" fill="url(#metalDark)" />

                  {/* Hook going through the card hole */}
                  <path d="M 25 55 C 38 55, 38 75, 25 75 C 18 75, 18 68, 25 68" stroke="#1a0107" strokeWidth="8" strokeLinecap="round" fill="none" />
                  <path d="M 25 55 C 38 55, 38 75, 25 75 C 18 75, 18 68, 25 68" stroke="url(#metal)" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </div>

              {/* The Flipping Container */}
              <motion.div 
                className="relative w-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* FRONT FACE */}
                <div 
                  className="relative z-10 w-full bg-[#fdfaf5] border-2 border-[#1a0107] shadow-retro flex flex-col overflow-hidden rounded-sm"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Card Header Hole */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-white rounded-full shadow-inner border-2 border-[#1a0107] z-20"></div>
                  
                  {/* Header Section */}
                  <div className="w-full bg-[#1a0107] pt-12 pb-4 px-6 text-center text-[#fdfaf5]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-serif-fraunces text-2xl tracking-tighter text-[#fdb813]">USeP</span>
                      <div className="text-right leading-tight flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase bg-[#fdb813] text-[#1a0107] px-1.5 py-0.5 shadow-[2px_2px_0px_#7a0016] rounded-sm mb-1">OJT Tracker</span>
                        <span className="text-[9px] uppercase tracking-wider text-[#fca5a5] font-bold">2026-2027</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold tracking-widest uppercase mb-1 text-[#fdfaf5]">Student ID</h3>
                    <p className="text-[9px] uppercase tracking-widest border-t border-[#fdfaf5]/30 pt-1 text-[#fdb813]">{profile.college || 'University of Southeastern Philippines'}</p>
                  </div>

                  {/* Photo Area */}
                  <div className="relative flex flex-col items-center bg-[#fdfaf5] pt-8 pb-6">
                    {/* Vertical Text background */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-6xl font-serif-fraunces text-[#fdb813]/20 uppercase tracking-tighter origin-center select-none pointer-events-none">
                      {profile.name?.split(' ')[0] || 'USER'}
                    </div>
                    
                    <div className="relative z-10 w-44 h-52 bg-[#2a020b] border-2 border-[#1a0107] shadow-[4px_4px_0px_#7a0016] overflow-hidden mb-2 p-1.5">
                      {profile.profilePicture ? (
                        <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover border-2 border-[#1a0107]" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#2a020b] border-2 border-[#1a0107]">
                          <span className="text-6xl text-[#fdb813] font-serif italic">{profile.name ? profile.name.charAt(0) : 'U'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Footer */}
                  <div className="w-full bg-[#1a0107] py-6 px-4 text-center text-[#fdfaf5] border-t-4 border-[#7a0016]">
                    <h2 className="text-3xl font-serif-fraunces tracking-tighter uppercase leading-none mb-2 text-[#fdb813]">
                      {profile.name || 'Anonymous'}
                    </h2>
                    <p className="text-xs font-bold tracking-widest uppercase text-[#fca5a5]">
                      {profile.company || profile.program || 'Student'}
                    </p>
                  </div>
                </div>

                {/* BACK FACE */}
                <div 
                  className="absolute inset-0 bg-[#fdfaf5] border-2 border-[#1a0107] shadow-retro flex flex-col overflow-hidden rounded-sm"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {/* Card Header Hole (Matching Front) */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-white rounded-full shadow-inner border-2 border-[#1a0107] z-20"></div>
                  
                  {/* Back Header Section */}
                  <div className="w-full bg-[#1a0107] pt-12 pb-4 px-6 text-center text-[#fdfaf5] border-b-4 border-[#7a0016]">
                    <h3 className="text-xl font-bold tracking-widest uppercase mb-1 text-[#fdb813]">Additional Details</h3>
                  </div>

                  <div className="flex-1 p-6 flex flex-col gap-6 text-[#1a0107] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                    <div className="bg-white p-3 border-2 border-[#1a0107] shadow-sm">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Email Address</span>
                      <p className="font-bold text-sm truncate">{profile.email || 'Not Provided'}</p>
                    </div>
                    <div className="bg-white p-3 border-2 border-[#1a0107] shadow-sm">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Phone Number</span>
                      <p className="font-bold text-sm">{profile.phone || 'Not Provided'}</p>
                    </div>
                    <div className="bg-white p-3 border-2 border-[#1a0107] shadow-sm flex-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Biography / Notes</span>
                      <p className="text-xs italic leading-relaxed">{profile.bio || 'No additional notes or emergency details provided.'}</p>
                    </div>
                    
                    <div className="mt-auto bg-[#ffc1cc] p-4 border-2 border-[#1a0107] text-center shadow-[4px_4px_0px_#7a0016]">
                      <span className="text-[10px] font-bold text-[#7a0016] uppercase tracking-widest block mb-1">Required Target Hours</span>
                      <p className="font-serif-fraunces text-4xl tracking-tighter text-[#1a0107]">{profile.targetHours} <span className="text-sm font-sans text-[#7a0016]">hrs</span></p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side Info & Stats */}
          <div className="flex-1 flex flex-col gap-6 md:gap-8">
            
            {/* Massive Target Hours Card */}
            <div className="bg-[#1a0107] dark:bg-black rounded-sm p-10 md:p-14 relative overflow-hidden shadow-retro border-2 border-[#1a0107] dark:border-white group flex flex-col justify-between min-h-[300px]">
              <div className="absolute -right-20 -top-20 text-[#7a0016]/40 dark:text-[#fca5a5]/10 transition-transform duration-700">
                <Target size={300} strokeWidth={0.5} />
              </div>
              <div className="relative z-10">
                <span className="font-cursive-caveat text-3xl text-[#fdb813] block mb-4">
                  Target Yield Capacity
                </span>
                <div className="flex items-baseline gap-2">
                  <div className="text-8xl md:text-[8rem] leading-none font-serif-fraunces tracking-tighter text-white">
                    {profile.targetHours}
                  </div>
                  <span className="text-2xl text-white font-bold mb-4 font-sans">hrs</span>
                </div>
              </div>
              <p className="relative z-10 mt-8 text-gray-400 font-light max-w-xs text-sm">
                Total scheduled capital to fulfill the internship curriculum requirements.
              </p>
            </div>

            {/* Sub-cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Institution Card */}
              <div className="bg-[#d1f2eb] dark:bg-zinc-900/60 rounded-sm p-8 border-2 border-[#1a0107] dark:border-white shadow-retro flex flex-col gap-6 justify-center">
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
                <div className="bg-[#ffc1cc] dark:bg-zinc-800/80 rounded-sm p-8 border-2 border-[#1a0107] dark:border-zinc-700 flex flex-col justify-between flex-1 shadow-retro">
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
                    className="bg-white hover:bg-[#ffc1cc] text-[#1a0107] dark:text-white border-2 border-[#1a0107] dark:border-white rounded-sm p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-retro-sm hover:translate-y-1 hover:shadow-none group"
                  >
                    <Download size={20} className="text-[#1a0107] dark:text-[#fca5a5] group-hover:-translate-y-1 transition-transform" />
                    <span className="font-bold uppercase tracking-widest text-center text-xs">Backup</span>
                  </button>
                  <button
                    onClick={() => restoreInputRef.current?.click()}
                    className="bg-white hover:bg-[#d1f2eb] text-[#1a0107] dark:text-white border-2 border-[#1a0107] dark:border-white rounded-sm p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-retro-sm hover:translate-y-1 hover:shadow-none group"
                  >
                    <Upload size={20} className="text-[#1a0107] dark:text-[#fca5a5] group-hover:-translate-y-1 transition-transform" />
                    <span className="font-bold uppercase tracking-widest text-center text-xs">Restore</span>
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
    <div className="w-full animate-in slide-in-from-bottom-8 duration-700 pb-12 mt-8">
      {cropState.open && (
        <ImageCropperModal
          src={cropState.src}
          aspect={cropState.aspect}
          onComplete={handleCropComplete}
          onCancel={() => setCropState({ open: false, src: '', field: '', aspect: 1 })}
        />
      )}

      <form onSubmit={handleSubmit} className="bg-[#fdfaf5] dark:bg-zinc-900 border-2 border-[#1a0107] dark:border-white p-8 md:p-12 shadow-retro max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-12 border-b-2 border-dashed border-[#1a0107]/20 dark:border-zinc-800 pb-8">
          <h2 className="text-4xl font-serif-fraunces tracking-tighter text-[#1a0107] dark:text-white">Profile Configuration</h2>
          <button
            type="button"
            onClick={() => { setFormData(profile); setIsEditing(false); }}
            className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-sm flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Column: Visuals & Core Identity */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start gap-8">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-48 h-56 p-3 bg-white border-2 border-[#1a0107] shadow-retro flex flex-col items-center transition-transform hover:-translate-y-1">
                <div className="w-full h-40 bg-[#2a020b] border-2 border-[#1a0107] flex items-center justify-center overflow-hidden relative">
                  {formData.profilePicture ? (
                    <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl text-[#fdb813] font-serif italic">{formData.name ? formData.name.charAt(0) : 'U'}</span>
                  )}
                  <div className="absolute inset-0 bg-[#1a0107]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <Camera size={32} className="text-white" />
                  </div>
                </div>
                <span className="mt-4 font-cursive-caveat text-xl text-[#1a0107]">Change Me!</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageSelect(e, 'profilePicture')} />

            <div className="w-full space-y-2 mt-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">Student ID</label>
              <input
                type="text"
                className="w-full p-4 bg-white dark:bg-zinc-800 text-[#1a0107] dark:text-white font-mono tracking-wider font-bold rounded-sm outline-none focus:translate-y-1 focus:shadow-none border-2 border-[#1a0107] shadow-retro-sm transition-all"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="202X-XXXXX"
              />
            </div>
            
            <div className="w-full bg-[#1a0107] dark:bg-black rounded-sm p-8 mt-4 shadow-retro border-2 border-[#1a0107] dark:border-white text-center">
              <label className="text-[10px] font-bold text-[#fdb813] uppercase tracking-widest block mb-4">Target Yield (Hrs)</label>
              <input
                type="number"
                min="1"
                required
                className="w-full bg-transparent text-6xl text-white font-serif-fraunces tracking-tighter text-center outline-none border-b-4 border-dashed border-[#ffb6c1] focus:border-[#fdb813] transition-colors pb-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
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
                className="w-full p-4 bg-white dark:bg-zinc-800 text-[#1a0107] dark:text-white font-bold rounded-sm outline-none focus:translate-y-1 focus:shadow-none border-2 border-[#1a0107] shadow-retro-sm transition-all text-xl"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Dela Cruz"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">Degree Program</label>
              <input
                type="text"
                className="w-full p-4 bg-white dark:bg-zinc-800 text-[#1a0107] dark:text-white font-bold rounded-sm outline-none focus:translate-y-1 focus:shadow-none border-2 border-[#1a0107] shadow-retro-sm transition-all"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="BS Information Technology"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">Professional Bio</label>
              <textarea
                rows={3}
                className="w-full p-4 bg-white dark:bg-zinc-800 text-[#1a0107] dark:text-white font-bold rounded-sm outline-none focus:translate-y-1 focus:shadow-none resize-none border-2 border-[#1a0107] shadow-retro-sm transition-all leading-relaxed"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="A brief overview of your goals..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">College / University</label>
                <input
                  type="text"
                  className="w-full p-4 bg-white dark:bg-zinc-800 text-[#1a0107] dark:text-white font-bold rounded-sm outline-none focus:translate-y-1 focus:shadow-none border-2 border-[#1a0107] shadow-retro-sm transition-all"
                  value={formData.college || ''}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="University of Southeastern Philippines"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">Host Company</label>
                <input
                  type="text"
                  className="w-full p-4 bg-white dark:bg-zinc-800 text-[#1a0107] dark:text-white font-bold rounded-sm outline-none focus:translate-y-1 focus:shadow-none border-2 border-[#1a0107] shadow-retro-sm transition-all"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Organization Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4 block">Supervisor</label>
                <input
                  type="text"
                  className="w-full p-4 bg-white dark:bg-zinc-800 text-[#1a0107] dark:text-white font-bold rounded-sm outline-none focus:translate-y-1 focus:shadow-none border-2 border-[#1a0107] shadow-retro-sm transition-all"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                  placeholder="Supervisor Name"
                />
              </div>
            </div>

            <div className="flex justify-end pt-8 mt-4 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#ffb6c1] dark:bg-zinc-800 hover:bg-[#ffc1cc] dark:hover:bg-zinc-700 text-[#1a0107] dark:text-white px-10 py-4 rounded-sm flex items-center justify-center gap-3 font-bold transition-all shadow-[4px_4px_0px_#1a0107] hover:translate-y-1 hover:shadow-none border-2 border-[#1a0107] dark:border-zinc-700 text-lg"
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
