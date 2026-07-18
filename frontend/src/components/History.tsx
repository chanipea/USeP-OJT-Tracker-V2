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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

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

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginatedLogs = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pb-12 pt-6 px-4 relative">
      {/* Confirm Deletion Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a0107]/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 max-w-sm w-full shadow-2xl border border-[#f0ebe1] dark:border-zinc-800">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
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
                className="flex-1 py-4 rounded-full font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
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

      {/* 1. Bento Header (Command Center) */}
      <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
        <div className="md:col-span-4 xl:col-span-4 bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 border border-[#f0ebe1] dark:border-zinc-800 shadow-sm flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f8f6f5] dark:bg-zinc-800 border border-[#f0ebe1] dark:border-zinc-800 mb-6 w-fit">
            <List size={14} className="text-[#7a0016] dark:text-[#fca5a5]" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">Transparent Ledger</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-[#1a0107] dark:text-white mb-4">
            Transaction History
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-light leading-relaxed max-w-xl">
            A complete, transparent ledger of all your deployed hours, categories, and moods.
          </p>
        </div>

        <div className="md:col-span-2 xl:col-span-2 flex flex-col gap-4 md:gap-6">
          <div className="flex-1 bg-[#1a0107] dark:bg-zinc-800 rounded-[2.5rem] p-8 border border-[#2a020b] dark:border-zinc-700 shadow-lg flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 text-[#fdb813]/10 group-hover:text-[#fdb813]/20 transition-colors">
               <BookOpen size={120} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-2 block">Total Accumulated Yield</span>
              <span className="text-5xl font-semibold tracking-tighter text-[#fdb813]">
                {totalHoursCompleted.toFixed(1)} <span className="text-2xl text-white tracking-normal">hrs</span>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <button onClick={handleExportPDF} className="bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-[#7a0016]/20 hover:border-red-100 dark:hover:border-[#7a0016]/30 text-[#7a0016] dark:text-[#fca5a5] border border-[#f0ebe1] dark:border-zinc-800 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-sm group">
              <FileText size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest text-center">Export PDF</span>
            </button>
            <button onClick={handleExportExcel} className="bg-white dark:bg-zinc-900 hover:bg-green-50 dark:hover:bg-emerald-900/20 hover:border-green-100 dark:hover:border-emerald-800/30 text-green-700 dark:text-emerald-400 border border-[#f0ebe1] dark:border-zinc-800 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-sm group">
              <FileSpreadsheet size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest text-center">Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bento Ledger Grid */}
      {sorted.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 auto-rows-max">
            {paginatedLogs.map((log) => (
              <div key={log.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-[#f0ebe1] dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col h-full group">
              {/* Date & Time Header */}
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-zinc-800 bg-[#f8f6f5] dark:bg-zinc-800/30 flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-semibold tracking-tight text-[#1a0107] dark:text-white mb-3">{formatDate(log.date)}</h4>
                  <span className="text-[10px] bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border border-gray-200 dark:border-zinc-700 shadow-sm inline-block">
                    {formatTime(log.startTime)} — {formatTime(log.endTime)}
                  </span>
                </div>
                <div className="text-right shrink-0 bg-white dark:bg-zinc-800 px-4 py-3 rounded-3xl border border-gray-100 dark:border-zinc-700 shadow-sm flex flex-col items-center justify-center">
                  <span className="block text-2xl font-semibold tracking-tighter text-[#7a0016] dark:text-[#fca5a5] leading-none mb-1">
                    {Number(log.hours).toFixed(1)}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">Yield</span>
                </div>
              </div>
              
              {/* Content Body */}
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-6">
                  {(log.moods || []).map((m) => (
                    <span key={m} className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border ${MOOD_BADGE_CLASS[m] || 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-zinc-700'}`}>{m}</span>
                  ))}
                  {(log.categories || []).map((c) => (
                    <span key={c} className="text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 border">{c}</span>
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 font-medium text-lg leading-relaxed mb-6">
                  {log.tasks}
                </p>

                {log.diary && (
                  <div className="mb-6 p-5 bg-[#faf9f8] dark:bg-zinc-800/50 rounded-[1.5rem] border border-gray-100 dark:border-zinc-700/50">
                    <span className="text-[10px] font-bold text-[#1a0107] dark:text-white uppercase tracking-widest mb-2 block">Narrative Report</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed whitespace-pre-wrap">{log.diary}</p>
                  </div>
                )}

                {/* Attachments */}
                {log.attachments && log.attachments.length > 0 && (
                  <div className="mt-auto pt-6 border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-[#1a0107] dark:text-white uppercase tracking-widest mb-3 block">Evidence Attached</span>
                    <div className="flex flex-wrap gap-3">
                      {log.attachments.map((src, idx) => (
                        <button key={idx} onClick={() => setLightbox({ logId: log.id, images: log.attachments!, currentIndex: idx })} className="block hover:opacity-80 transition-opacity hover:scale-105 transform">
                          <img src={src} alt="Attachment" className="w-16 h-16 object-cover rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-700" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-6 py-5 bg-[#f8f6f5] dark:bg-zinc-900 border-t border-[#f0ebe1] dark:border-zinc-800 flex justify-end gap-3 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(log)} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:text-[#d97706] hover:border-[#fde59b] text-gray-400 flex items-center justify-center transition-all shadow-sm">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => setDeleteConfirmId(log.id)} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:text-red-500 hover:border-red-200 text-gray-400 flex items-center justify-center transition-all shadow-sm">
                  <Trash2 size={16} />
                </button>
              </div>

              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-[#1a0107] dark:text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-[#1a0107] dark:text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-16 border border-[#f0ebe1] dark:border-zinc-800 text-center shadow-sm">
           <div className="w-24 h-24 bg-[#f8f6f5] dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8">
             <List size={36} className="text-gray-300 dark:text-gray-600" />
           </div>
           <h3 className="text-3xl font-semibold tracking-tight text-[#1a0107] dark:text-white mb-4">Ledger Empty</h3>
           <p className="text-gray-500 dark:text-gray-400 text-lg font-light mb-10 max-w-md mx-auto">
             Deploy your first hours to start tracking your capital growth.
           </p>
           <button onClick={onAddClick} className="bg-[#1a0107] dark:bg-white text-white dark:text-[#1a0107] hover:bg-[#4a0414] dark:hover:bg-gray-200 px-10 py-4 rounded-full font-semibold transition-all shadow-xl hover:-translate-y-1">
             Log Hours Now
           </button>
        </div>
      )}

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
