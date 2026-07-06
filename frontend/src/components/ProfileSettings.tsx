// =========================================================
// components/ProfileSettings.tsx
// View + edit mode for the student's profile & OJT settings.
// =========================================================

import { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { User, Mail, Phone, Edit2, X, Camera, Briefcase, Save } from 'lucide-react';
import type { Profile } from '../types';
import { saveProfile } from '../api';
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
        <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#f0ebe1] overflow-hidden">
          <div className="h-72 md:h-96 w-full relative bg-[#f8f6f5]">
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
              className="absolute top-8 right-8 bg-white/90 backdrop-blur-md hover:bg-white text-[#1a0107] px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Edit2 size={16} /> Edit Details
            </button>
          </div>

          <div className="px-8 sm:px-16 pb-16 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-10 -mt-24 sm:-mt-28 mb-10 relative z-10">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[8px] border-white bg-[#2a020b] flex items-center justify-center shadow-xl overflow-hidden shrink-0 mx-auto sm:mx-0">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl text-[#fdb813] font-serif italic">
                    {profile.name ? profile.name.charAt(0) : 'U'}
                  </span>
                )}
              </div>
              <div className="text-center sm:text-left flex-1 sm:mb-6 mt-4 sm:mt-0">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-[#1a0107] mb-2">
                  {profile.name || 'Anonymous User'}
                </h1>
                <p className="text-xl md:text-2xl text-[#7a0016] font-medium tracking-tight">
                  {profile.program || 'Degree Program Pending'}
                </p>
              </div>
            </div>

            {profile.bio && (
              <div className="mb-16 pb-12 border-b border-gray-100">
                <p className="text-2xl text-gray-500 leading-relaxed max-w-3xl mx-auto sm:mx-0 font-light">
                  {profile.bio}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f6f5] border border-[#f0ebe1] mb-2">
                  <User size={14} className="text-[#7a0016]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Identity Details</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student ID</span>
                  <div className="text-xl font-medium text-[#1a0107]">{profile.studentId || '—'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
                  <div className="text-xl font-medium text-[#1a0107] flex items-center gap-3">
                    {profile.email || '—'} {profile.email && <Mail size={18} className="text-gray-300" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Number</span>
                  <div className="text-xl font-medium text-[#1a0107] flex items-center gap-3">
                    {profile.phone || '—'} {profile.phone && <Phone size={18} className="text-gray-300" />}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f6f5] border border-[#f0ebe1] mb-2">
                  <Briefcase size={14} className="text-[#7a0016]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Deployment Details</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Host Organization</span>
                  <div className="text-xl font-medium text-[#1a0107]">{profile.company || '—'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Supervisor</span>
                  <div className="text-xl font-medium text-[#1a0107]">{profile.supervisor || '—'}</div>
                </div>
                <div className="bg-[#fffdf8] p-8 rounded-[2rem] border border-[#fde59b]/50 shadow-sm mt-8">
                  <span className="text-xs text-[#8a6d3b] uppercase font-bold tracking-widest block mb-2">
                    Target Yield Capacity
                  </span>
                  <div className="text-5xl font-semibold tracking-tighter text-[#7a0016]">
                    {profile.targetHours} <span className="text-2xl text-gray-400 font-medium tracking-normal">hours</span>
                  </div>
                </div>
              </div>
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
        className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#f0ebe1] overflow-hidden"
      >
        <div className="flex justify-between items-center p-8 md:px-12 border-b border-gray-100 bg-[#faf9f8]">
          <h2 className="text-3xl font-semibold tracking-tighter text-[#1a0107]">Edit Parameters</h2>
          <button
            type="button"
            onClick={() => {
              setFormData(profile);
              setIsEditing(false);
            }}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm border border-gray-200 transition-all hover:scale-105"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative h-64 md:h-80 bg-[#f8f6f5] group">
          {formData.coverPhoto && <img src={formData.coverPhoto} alt="Cover" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-[#1a0107]/40 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all backdrop-blur-sm">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="bg-white text-[#1a0107] px-8 py-4 rounded-full font-semibold flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform text-lg"
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
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-10 -mt-24 sm:-mt-28 mb-10 relative z-10">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[8px] border-white bg-[#2a020b] flex items-center justify-center shadow-xl overflow-hidden relative mx-auto sm:mx-0 group shrink-0">
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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Full Name</label>
              <input
                type="text"
                className="w-full p-5 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Dela Cruz"
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Professional Bio</label>
              <textarea
                rows={4}
                className="w-full p-5 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-[2rem] outline-none focus:ring-2 focus:ring-[#7a0016] resize-none border border-transparent focus:border-[#7a0016]/20 transition-all leading-relaxed"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="A brief overview of your goals..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Student ID</label>
              <input
                type="text"
                className="w-full p-5 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="202X-XXXXX"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Degree Program</label>
              <input
                type="text"
                className="w-full p-5 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="BS Information Technology"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Email</label>
              <input
                type="email"
                className="w-full p-5 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@usep.edu.ph"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Phone</label>
              <input
                type="tel"
                className="w-full p-5 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+63 900..."
              />
            </div>

            <div className="md:col-span-2 mt-8 mb-4">
              <h3 className="text-2xl font-semibold tracking-tighter text-[#1a0107] border-b border-gray-100 pb-6">
                Deployment Settings
              </h3>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Host Company</label>
              <input
                type="text"
                className="w-full p-5 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Organization Name"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Supervisor</label>
              <input
                type="text"
                className="w-full p-5 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] border border-transparent focus:border-[#7a0016]/20 transition-all"
                value={formData.supervisor}
                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                placeholder="Supervisor Name"
              />
            </div>
            <div className="md:col-span-2 bg-[#fffdf8] p-10 rounded-[2.5rem] border border-[#fde59b]/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#8a6d3b] uppercase tracking-widest mb-3">
                  Target Yield Capacity
                </label>
                <p className="text-base text-[#8a6d3b]/80 max-w-sm font-light">
                  Define the total capital (hours) required to complete your program.
                </p>
              </div>
              <input
                type="number"
                min="1"
                required
                className="w-full md:w-56 p-5 text-center border-2 border-white rounded-[2rem] focus:ring-2 focus:ring-[#fdb813] outline-none bg-white font-semibold tracking-tighter text-4xl text-[#7a0016] shadow-sm transition-all"
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
              className="px-10 py-5 text-gray-500 font-semibold hover:bg-gray-50 rounded-full transition-colors text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1a0107] hover:bg-[#3a0310] text-white px-12 py-5 rounded-full flex items-center justify-center gap-3 font-medium transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
            >
              <Save size={22} /> Save Configurations
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
