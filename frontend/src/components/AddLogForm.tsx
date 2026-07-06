// =========================================================
// components/AddLogForm.tsx
// The "Deploy Capital" form for adding or editing a log entry.
// =========================================================

import { useMemo } from 'react';
import type { FormEvent } from 'react';
import { Zap, BrainCircuit, Target, Coffee } from 'lucide-react';
import type { LogFormData, MoodId, CategoryId } from '../types';
import { calculateDuration, CATEGORY_OPTIONS } from '../utils';
import { createLog, updateLog } from '../api';

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
  { id: 'Productive', Icon: Zap, color: 'text-[#d97706]', bg: 'bg-[#fde59b]/20', border: 'border-[#fde59b]' },
  { id: 'Learning', Icon: BrainCircuit, color: 'text-[#7a0016]', bg: 'bg-[#7a0016]/10', border: 'border-[#7a0016]' },
  { id: 'Challenging', Icon: Target, color: 'text-[#2a020b]', bg: 'bg-[#2a020b]/10', border: 'border-[#2a020b]' },
  { id: 'Routine', Icon: Coffee, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-300' },
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
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-700 pb-12">
      <div className="text-center mb-16 mt-8">
        <h2 className="text-5xl font-semibold tracking-tighter text-[#1a0107] mb-6">
          {editingLogId ? 'Update Parameters' : 'Deploy Capital'}
        </h2>
        <p className="text-gray-500 text-lg md:text-xl font-light max-w-2xl mx-auto">
          {editingLogId
            ? 'Modify your previously deployed hours and reflections.'
            : 'Allocate your time into high-performing protocols and track your daily yield accrual and mood.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-14 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#f0ebe1] space-y-10"
      >
        {/* Time & Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-100 pb-10">
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 block">
              Value Date
            </label>
            <input
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-5 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] transition-all border border-transparent focus:border-[#7a0016]/20"
              value={logFormData.date}
              onChange={(e) => setLogFormData({ ...logFormData, date: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 block">
              Time In
            </label>
            <input
              type="time"
              required
              className="w-full p-5 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] transition-all border border-transparent focus:border-[#7a0016]/20"
              value={logFormData.startTime}
              onChange={(e) => setLogFormData({ ...logFormData, startTime: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 block">
              Time Out
            </label>
            <input
              type="time"
              required
              className="w-full p-5 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-2xl outline-none focus:ring-2 focus:ring-[#7a0016] transition-all border border-transparent focus:border-[#7a0016]/20"
              value={logFormData.endTime}
              onChange={(e) => setLogFormData({ ...logFormData, endTime: e.target.value })}
            />
          </div>
        </div>

        {/* Mood Selector */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 block">
              How was your shift?
            </label>
            <button
              type="button"
              onClick={handleSelectAllMoods}
              className="text-xs text-[#7a0016] font-bold uppercase tracking-widest pr-2 hover:underline transition-all"
            >
              {logFormData.moods.length === MOOD_OPTIONS.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = logFormData.moods.includes(mood.id);
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => toggleMood(mood.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all duration-300 border-2
                    ${isSelected ? `${mood.bg} ${mood.border}` : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}
                >
                  <mood.Icon size={24} className={isSelected ? mood.color : 'text-gray-400'} />
                  <span className={`font-semibold text-sm ${isSelected ? 'text-[#1a0107]' : 'text-gray-500'}`}>
                    {mood.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Selector */}
        <div className="space-y-4 border-t border-gray-100 pt-8">
          <div className="flex justify-between items-end mb-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 block">
              Task Categories
            </label>
            <button
              type="button"
              onClick={handleSelectAllCategories}
              className="text-xs text-[#7a0016] font-bold uppercase tracking-widest pr-2 hover:underline transition-all"
            >
              {logFormData.categories.length === CATEGORY_OPTIONS.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = logFormData.categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 border
                    ${
                      isSelected
                        ? 'bg-[#1a0107] text-white border-[#1a0107] shadow-md'
                        : 'bg-[#f8f6f5] text-gray-500 border-transparent hover:border-gray-300'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Computed hours preview */}
        <div className="bg-[#fffdf8] p-8 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center border border-[#fde59b]/50 shadow-sm gap-6 mt-10">
          <div>
            <span className="text-[#8a6d3b] font-semibold text-lg block mb-1">Projected Yield Accrual</span>
            <span className="text-sm text-[#8a6d3b]/70 font-light">Based on allocated timeframes</span>
          </div>
          <div className="text-5xl font-semibold tracking-tighter text-[#1a0107]">
            {calculatedHours.toFixed(2)} <span className="text-xl text-gray-400 font-medium tracking-normal">hrs</span>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 block">
            Execution Strategy & Details
          </label>
          <textarea
            rows={3}
            required
            placeholder="Describe the protocols, tasks, or modules completed..."
            className="w-full p-6 bg-[#f8f6f5] text-[#1a0107] font-medium rounded-[2rem] outline-none focus:ring-2 focus:ring-[#7a0016] transition-all resize-none border border-transparent focus:border-[#7a0016]/20 leading-relaxed"
            value={logFormData.tasks}
            onChange={(e) => setLogFormData({ ...logFormData, tasks: e.target.value })}
          />
        </div>

        {/* Diary */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 block">
            Narrative Report & Reflections
          </label>
          <textarea
            rows={4}
            required
            placeholder="Write your daily diary... What did you learn? Any challenges faced? How did you apply your skills?"
            className="w-full p-6 bg-[#fcfbf9] text-[#1a0107] font-medium rounded-[2rem] outline-none focus:ring-2 focus:ring-[#fdb813] transition-all resize-none border border-transparent focus:border-[#fdb813]/40 leading-relaxed shadow-inner"
            value={logFormData.diary || ''}
            onChange={(e) => setLogFormData({ ...logFormData, diary: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            className="w-full bg-[#1a0107] hover:bg-[#3a0310] text-white py-6 rounded-[2rem] text-xl font-medium transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            {editingLogId ? 'Update Entry Configuration' : 'Deploy Capital'}
          </button>
          {editingLogId && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 py-5 rounded-[2rem] text-lg font-medium transition-all"
            >
              Cancel Modification
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
