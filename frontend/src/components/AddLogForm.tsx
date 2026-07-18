// =========================================================
// components/AddLogForm.tsx
// The "Deploy Capital" form for adding or editing a log entry.
// =========================================================

import { useMemo } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Zap, BrainCircuit, Target, Coffee, ImagePlus, X } from 'lucide-react';
import type { LogFormData, MoodId, CategoryId } from '../types';
import { calculateDuration, CATEGORY_OPTIONS } from '../utils';
import { createLog, updateLog } from '../api';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/airbnb.css';

interface Props {
  logFormData: LogFormData;
  setLogFormData: (data: LogFormData) => void;
  editingLogId: number | null;
  onCancel: () => void;
  onSaved: () => void;
  notify: (message: string, type?: 'success' | 'error') => void;
}

const MOOD_OPTIONS: {
  id: MoodId;
  Icon: typeof Zap;
  color: string;
  bg: string;
  border: string;
}[] = [
  { id: 'Productive', Icon: Zap, color: 'text-amber-600 dark:text-[#fdb813]', bg: 'bg-amber-100/60 dark:bg-[#fdb813]/10', border: 'border-amber-200 dark:border-[#fdb813]/30' },
  { id: 'Learning', Icon: BrainCircuit, color: 'text-[#7a0016] dark:text-[#fca5a5]', bg: 'bg-[#7a0016]/10 dark:bg-[#b31b34]/15', border: 'border-[#7a0016]/50 dark:border-[#b31b34]/40' },
  { id: 'Challenging', Icon: Target, color: 'text-[#4a0414] dark:text-[#fca5a5]/80', bg: 'bg-[#4a0414]/10 dark:bg-[#721c24]/20', border: 'border-[#4a0414]/40 dark:border-[#721c24]/40' },
  { id: 'Routine', Icon: Coffee, color: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800/60', border: 'border-zinc-300 dark:border-zinc-700' },
];

export default function AddLogForm({
  logFormData,
  setLogFormData,
  editingLogId,
  onCancel,
  onSaved,
  notify,
}: Props) {
  const calculatedHours = useMemo(
    () => calculateDuration(logFormData.startTime, logFormData.endTime),
    [logFormData.startTime, logFormData.endTime]
  );

  const handleSelectAllMoods = () => {
    if (logFormData.moods.length === MOOD_OPTIONS.length) {
      setLogFormData({ ...logFormData, moods: [] });
    } else {
      setLogFormData({ ...logFormData, moods: MOOD_OPTIONS.map((m) => m.id) });
    }
  };

  const handleSelectAllCategories = () => {
    if (logFormData.categories.length === CATEGORY_OPTIONS.length) {
      setLogFormData({ ...logFormData, categories: [] });
    } else {
      setLogFormData({ ...logFormData, categories: [...CATEGORY_OPTIONS] });
    }
  };

  const toggleMood = (id: MoodId) => {
    const current = logFormData.moods;
    setLogFormData({
      ...logFormData,
      moods: current.includes(id) ? current.filter((m) => m !== id) : [...current, id],
    });
  };

  const toggleCategory = (cat: CategoryId) => {
    const current = logFormData.categories;
    setLogFormData({
      ...logFormData,
      categories: current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat],
    });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    let loadedCount = 0;
    const newAttachments: string[] = [...(logFormData.attachments || [])];

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newAttachments.push(reader.result as string);
        loadedCount++;
        if (loadedCount === fileArray.length) {
          setLogFormData({ ...logFormData, attachments: newAttachments });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...(logFormData.attachments || [])];
    newAttachments.splice(index, 1);
    setLogFormData({ ...logFormData, attachments: newAttachments });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (calculatedHours <= 0) return notify('End time must be after start time.', 'error');
    if (!logFormData.tasks.trim()) return notify('Please enter tasks accomplished.', 'error');
    if (!logFormData.diary?.trim()) return notify('Please write your narrative reflection.', 'error');
    if (logFormData.moods.length === 0) return notify('Please select at least one shift reflection.', 'error');
    if (logFormData.categories.length === 0) return notify('Please select at least one task category.', 'error');

    try {
      if (editingLogId) {
        await updateLog(editingLogId, logFormData);
        notify('Entry configurations updated successfully!');
      } else {
        await createLog(logFormData);
        notify('Capital & Journal deployed successfully!');
      }
      onSaved();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Something went wrong saving your entry.', 'error');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800 bg-[#faf9f8] dark:bg-zinc-900/50 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1a0107] dark:text-white">
            {editingLogId ? 'Update Parameters' : 'Deploy Capital'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {editingLogId ? 'Modify your previously deployed hours and reflections.' : 'Allocate your time and track yield accrual.'}
          </p>
        </div>
        <button 
          onClick={onCancel}
          type="button"
          className="w-10 h-10 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors shadow-sm border border-gray-200 dark:border-zinc-700 shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto p-6 md:p-8 flex-1">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
        
        {/* Temporal Tile (Col Span 1) */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block">Value Date</label>
              <Flatpickr
                options={{ dateFormat: 'Y-m-d', maxDate: new Date() }}
                className="w-full p-4 bg-[#f8f6f5] dark:bg-zinc-800 text-[#1a0107] dark:text-white font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] transition-all border border-transparent focus:border-[#7a0016]/20"
                value={logFormData.date}
                onChange={(dates, dateStr) => { if (dateStr) setLogFormData({ ...logFormData, date: dateStr }) }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block">Time In</label>
              <Flatpickr
                options={{ enableTime: true, noCalendar: true, dateFormat: 'h:i K' }}
                className="w-full p-4 bg-[#f8f6f5] dark:bg-zinc-800 text-[#1a0107] dark:text-white font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] transition-all border border-transparent focus:border-[#7a0016]/20"
                value={logFormData.startTime}
                onChange={([date]) => {
                  if (date) {
                    setLogFormData({ ...logFormData, startTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block">Time Out</label>
              <Flatpickr
                options={{ enableTime: true, noCalendar: true, dateFormat: 'h:i K' }}
                className="w-full p-4 bg-[#f8f6f5] dark:bg-zinc-800 text-[#1a0107] dark:text-white font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] transition-all border border-transparent focus:border-[#7a0016]/20"
                value={logFormData.endTime}
                onChange={([date]) => {
                  if (date) {
                    setLogFormData({ ...logFormData, endTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) });
                  }
                }}
              />
            </div>
          </div>
          
          <div className="mt-8 bg-[#fffdf8] dark:bg-zinc-800/80 p-6 rounded-3xl border border-[#fde59b]/50 dark:border-zinc-700/50 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a6d3b]/70 dark:text-zinc-400 mb-2">Projected Yield</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tighter text-[#1a0107] dark:text-white">{calculatedHours.toFixed(2)}</span>
              <span className="text-gray-400 font-medium">hrs</span>
            </div>
          </div>
        </div>

        {/* Reflection & Skill Tiles (Col Span 1 or 2) */}
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
          {/* Mood Selector Tile */}
          <div className="bg-[#f8f6f5] dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm flex-1">
            <div className="flex justify-between items-end mb-6">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2 block">Shift Reflection</label>
              <button type="button" onClick={handleSelectAllMoods} className="text-[10px] text-[#7a0016] dark:text-[#fca5a5] font-bold uppercase tracking-widest pr-2 hover:underline transition-all">
                {logFormData.moods.length === MOOD_OPTIONS.length ? 'Unselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = logFormData.moods.includes(mood.id);
                return (
                  <button key={mood.id} type="button" onClick={() => toggleMood(mood.id)} className={`flex flex-col items-center gap-3 p-4 md:p-6 rounded-3xl transition-all duration-300 border-2 ${isSelected ? `${mood.bg} ${mood.border}` : 'bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 hover:border-gray-200 shadow-sm hover:-translate-y-1'}`}>
                    <mood.Icon size={24} className={isSelected ? mood.color : 'text-gray-400'} />
                    <span className={`font-bold text-xs uppercase tracking-wider ${isSelected ? 'text-[#1a0107] dark:text-white' : 'text-gray-400'}`}>{mood.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selector Tile */}
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm flex-1">
            <div className="flex justify-between items-end mb-6">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2 block">Task Categories</label>
              <button type="button" onClick={handleSelectAllCategories} className="text-[10px] text-[#7a0016] dark:text-[#fca5a5] font-bold uppercase tracking-widest pr-2 hover:underline transition-all">
                {logFormData.categories.length === CATEGORY_OPTIONS.length ? 'Unselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = logFormData.categories.includes(cat);
                return (
                  <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${isSelected ? 'bg-[#1a0107] text-white dark:bg-white dark:text-[#1a0107] border-[#1a0107] dark:border-white shadow-md' : 'bg-[#f8f6f5] dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border border-transparent hover:border-gray-300 dark:hover:border-zinc-600'}`}>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Narrative Tiles (Col Span 3) */}
        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-[#fffdfb] dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm hover:shadow-lg transition-shadow">
            <label className="text-xs font-bold text-[#1a0107] dark:text-white uppercase tracking-widest pl-2 mb-4 block">Execution Strategy & Tasks</label>
            <textarea
              rows={5}
              required
              placeholder="Describe the protocols, tasks, or modules completed..."
              className="w-full p-6 bg-[#f8f6f5] dark:bg-zinc-800 text-[#1a0107] dark:text-white font-medium rounded-3xl outline-none focus:ring-2 focus:ring-[#7a0016] transition-all resize-none border border-transparent focus:border-[#7a0016]/20 leading-relaxed shadow-inner"
              value={logFormData.tasks}
              onChange={(e) => setLogFormData({ ...logFormData, tasks: e.target.value })}
            />
          </div>
          <div className="bg-gradient-to-br from-[#faf9f8] to-[#f8f6f5] dark:from-zinc-900 dark:to-zinc-800/80 rounded-[2.5rem] p-8 md:p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm hover:shadow-lg transition-shadow">
            <label className="text-xs font-bold text-[#fdb813] uppercase tracking-widest pl-2 mb-4 block">Narrative Report & Diary</label>
            <textarea
              rows={5}
              required
              placeholder="Write your daily diary... What did you learn? Any challenges faced? How did you apply your skills?"
              className="w-full p-6 bg-white dark:bg-zinc-900 text-[#1a0107] dark:text-white font-medium rounded-3xl outline-none focus:ring-2 focus:ring-[#fdb813] transition-all resize-none border border-transparent focus:border-[#fdb813]/40 leading-relaxed shadow-sm"
              value={logFormData.diary || ''}
              onChange={(e) => setLogFormData({ ...logFormData, diary: e.target.value })}
            />
          </div>
        </div>

        {/* Evidence Dropzone (Col Span 3) */}
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2 flex items-center gap-2 mb-4">
            <ImagePlus size={16} /> Evidence / Photo Attachments
          </label>
          <div className="p-8 bg-[#f8f6f5] dark:bg-zinc-800 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-700 hover:border-[#7a0016]/40 transition-colors flex flex-col items-center justify-center min-h-[160px]">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:uppercase file:tracking-widest file:font-bold file:bg-[#1a0107] file:text-white hover:file:bg-[#4a0414] dark:file:bg-white dark:file:text-[#1a0107] cursor-pointer mx-auto"
            />
            
            {(logFormData.attachments && logFormData.attachments.length > 0) && (
              <div className="flex flex-wrap gap-4 mt-8 justify-center w-full">
                {logFormData.attachments.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img src={src} alt="Attachment" className="w-24 h-24 object-cover rounded-2xl shadow-md border border-white dark:border-zinc-700" />
                    <button type="button" onClick={() => removeAttachment(idx)} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 group-hover:scale-100">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Action Bar (Col Span 3) */}
        <div className="md:col-span-2 lg:col-span-3 mt-4 flex flex-col gap-4">
          <button type="submit" className="w-full bg-[#1a0107] dark:bg-zinc-800 hover:bg-[#4a0414] dark:hover:bg-zinc-700 text-white py-4 rounded-2xl text-lg font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            {editingLogId ? 'Update Entry' : 'Deploy Capital'}
          </button>
          <button type="button" onClick={onCancel} className="w-full bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 py-4 rounded-2xl text-base font-medium transition-all shadow-sm">
            Cancel
          </button>
        </div>

        </form>
      </div>
    </div>
  );
}
