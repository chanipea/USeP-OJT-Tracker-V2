// =========================================================
// components/History.tsx
// Full ledger of logged hours with edit & delete actions.
// =========================================================

import { useState } from 'react';
import { List, AlertCircle, Edit2, Trash2, BookOpen, FileText, FileSpreadsheet, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { LogEntry, Profile } from '../types';
import { formatDate, formatTime } from '../utils';
import { deleteLog } from '../api';
import { exportToPDF, exportToExcel } from '../exportUtils';

interface Props {
  logs: LogEntry[];
  profile: Profile;
  totalHoursCompleted: number;
  notify: (message: string, type?: 'success' | 'error') => void;
  onEdit: (log: LogEntry) => void;
  onDeleted: () => void;
  onAddClick: () => void;
}

interface LightboxState {
  logId: number;
  images: string[];
  currentIndex: number;
}

const MOOD_BADGE_CLASS: Record<string, string> = {
  Productive: 'bg-amber-100/60 dark:bg-[#fdb813]/10 text-amber-700 dark:text-[#fdb813] border border-amber-200 dark:border-[#fdb813]/20',
  Learning: 'bg-[#7a0016]/10 dark:bg-[#b31b34]/15 text-[#7a0016] dark:text-[#fca5a5] border border-[#7a0016]/20 dark:border-[#b31b34]/30',
  Challenging: 'bg-[#4a0414]/10 dark:bg-[#721c24]/20 text-[#4a0414] dark:text-[#fca5a5]/80 border border-[#4a0414]/20 dark:border-[#721c24]/40',
  Routine: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50',
};

export default function History({ logs, profile, totalHoursCompleted, notify, onEdit, onDeleted, onAddClick }: Props) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return;
    try {
      await deleteLog(deleteConfirmId);
      notify('Entry liquidated successfully.');
      setDeleteConfirmId(null);
      onDeleted();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not delete entry.', 'error');
      setDeleteConfirmId(null);
    }
  };

  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleExportPDF = () => {
    exportToPDF(sorted, profile);
    notify('PDF exported successfully!');
  };

  const handleExportExcel = () => {
    exportToExcel(sorted, profile);
    notify('Excel exported successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700 pb-12 relative">
      {/* Confirm Deletion Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a0107]/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 max-w-sm w-full shadow-2xl border border-[#f0ebe1] dark:border-zinc-800">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tighter text-[#1a0107] dark:text-white mb-2 text-center">
              Confirm Liquidation
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-light mb-8 text-center leading-relaxed">
              This will permanently remove the logged hours and adjust your progress. Proceed?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-4 rounded-full font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-4 rounded-full font-semibold text-white bg-[#7a0016] hover:bg-[#5c0010] transition-colors shadow-lg shadow-[#7a0016]/20"
              >
                Liquidate
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 mt-8 gap-6 px-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f6f5] dark:bg-zinc-800 border border-[#f0ebe1] dark:border-zinc-800 mb-6">
            <List size={14} className="text-[#7a0016] dark:text-[#fca5a5]" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">Transparent Ledger</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-[#1a0107] dark:text-white mb-4">
            Transaction History
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-light max-w-xl leading-relaxed">
            A complete, transparent ledger of all your deployed hours, categories, and moods.
          </p>
        </div>
        <div className="flex flex-col gap-4 items-end">
          <div className="bg-white dark:bg-zinc-900 px-8 py-5 rounded-[2rem] flex flex-col items-end border border-[#f0ebe1] dark:border-zinc-800 shadow-sm">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">
              Total Accumulated Yield
            </span>
            <span className="text-4xl font-semibold tracking-tighter text-[#7a0016] dark:text-[#fca5a5]">
              {totalHoursCompleted.toFixed(1)} <span className="text-lg text-gray-400 tracking-normal">hrs</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="bg-white dark:bg-zinc-900 hover:bg-red-50 text-[#7a0016] dark:text-[#fca5a5] border border-red-100 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="Export as PDF"
            >
              <FileText size={16} /> PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-white dark:bg-zinc-900 hover:bg-green-50 text-green-700 border border-green-100 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="Export as Excel"
            >
              <FileSpreadsheet size={16} /> Excel
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#f0ebe1] dark:border-zinc-800">
        {sorted.length > 0 ? (
          <div className="space-y-4">
            {sorted.map((log) => (
              <div
                key={log.id}
                className="group p-6 md:p-8 rounded-[2.5rem] hover:bg-[#f8f6f5] dark:bg-zinc-800 border border-transparent hover:border-[#f0ebe1] dark:border-zinc-800 transition-all flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center justify-between"
              >
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h4 className="text-xl font-semibold tracking-tight text-[#1a0107] dark:text-white mr-2">
                      {formatDate(log.date)}
                    </h4>
                    <span className="text-xs bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-full font-bold uppercase tracking-widest border border-gray-100 dark:border-zinc-800 shadow-sm">
                      {formatTime(log.startTime)} — {formatTime(log.endTime)}
                    </span>
                    {(log.moods || []).map((m) => (
                      <span
                        key={m}
                        className={`text-[10px] px-3 py-2 rounded-full font-bold uppercase tracking-widest ${
                          MOOD_BADGE_CLASS[m] || 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-light text-base md:text-lg mb-4">
                    {log.tasks}
                  </p>

                  {log.diary && (
                    <div className="mb-4 p-5 bg-[#faf9f8] dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
                      <h5 className="text-xs font-bold text-[#1a0107] dark:text-white uppercase tracking-widest mb-2">Narrative Report</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-light leading-relaxed whitespace-pre-wrap">{log.diary}</p>
                    </div>
                  )}

                  {/* Attachments */}
                  {log.attachments && log.attachments.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 dark:border-zinc-800 pt-4">
                      <h5 className="text-xs font-bold text-[#1a0107] dark:text-white uppercase tracking-widest mb-3">Evidence Attached</h5>
                      <div className="flex flex-wrap gap-4">
                        {log.attachments.map((src, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setLightbox({ logId: log.id, images: log.attachments!, currentIndex: idx })}
                            className="block hover:opacity-80 transition-opacity"
                          >
                            <img src={src} alt="Attachment" className="w-24 h-24 object-cover rounded-xl shadow-sm border border-gray-200 dark:border-zinc-700" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {(log.categories || []).map((c) => (
                      <span
                        key={c}
                        className="text-[11px] text-gray-500 dark:text-zinc-300 font-bold uppercase tracking-wider bg-gray-100 dark:bg-zinc-800/60 border border-transparent dark:border-zinc-700/50 px-3 py-1.5 rounded-full"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-6 md:pt-0 border-gray-100 dark:border-zinc-800 shrink-0">
                  <div className="text-right">
                    <span className="block text-4xl font-semibold tracking-tighter text-[#1a0107] dark:text-white">
                      {Number(log.hours).toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">Yield</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => onEdit(log)}
                      className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:bg-[#fde59b]/20 hover:border-[#fde59b] hover:text-[#d97706] text-gray-400 flex items-center justify-center transition-all shadow-sm group-hover:shadow-md"
                      title="Edit Entry"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(log.id)}
                      className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-gray-400 flex items-center justify-center transition-all shadow-sm group-hover:shadow-md"
                      title="Liquidate Entry"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-[#f8f6f5] dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8">
              <List size={36} className="text-gray-300" />
            </div>
            <h3 className="text-3xl font-semibold tracking-tight text-[#1a0107] dark:text-white mb-4">Ledger Empty</h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-light mb-10 max-w-md mx-auto">
              Deploy your first hours to start tracking your capital growth.
            </p>
            <button
              onClick={onAddClick}
              className="bg-[#1a0107] hover:bg-[#4a0414] text-white px-10 py-4 rounded-full font-medium transition-all shadow-xl"
            >
              Log Hours Now
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 z-50"
          >
            <X size={32} />
          </button>
          
          <div className="relative w-full max-w-5xl flex items-center justify-center h-full">
            {lightbox.images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex - 1 + lightbox.images.length) % lightbox.images.length }); }}
                className="absolute left-4 md:left-8 text-white hover:text-gray-300 p-4 bg-black/50 rounded-full hover:bg-black/70 transition-all z-50"
              >
                <ChevronLeft size={36} />
              </button>
            )}

            <img
              src={lightbox.images[lightbox.currentIndex]}
              alt="Evidence"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl relative z-40"
            />

            {lightbox.images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length }); }}
                className="absolute right-4 md:right-8 text-white hover:text-gray-300 p-4 bg-black/50 rounded-full hover:bg-black/70 transition-all z-50"
              >
                <ChevronRight size={36} />
              </button>
            )}

            <div className="absolute bottom-6 left-0 right-0 text-center text-white/70 font-medium z-50">
              {lightbox.currentIndex + 1} / {lightbox.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
