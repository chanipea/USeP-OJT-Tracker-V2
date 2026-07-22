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
    <div className="w-full animate-in fade-in duration-700 pb-12 pt-6 relative">
      {/* Confirm Deletion Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a0107]/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-sm p-8 md:p-10 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-zinc-800">
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
        <div className="md:col-span-4 xl:col-span-4 bg-[#ffc1cc] dark:bg-zinc-900 rounded-sm p-8 md:p-10 border-2 border-[#1a0107] dark:border-white flex flex-col justify-center shadow-retro">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-white dark:bg-zinc-800 border-2 border-[#1a0107] dark:border-zinc-700 mb-6 w-fit shadow-retro-sm">
            <List size={14} className="text-[#1a0107] dark:text-[#fca5a5]" />
            <span className="font-bold uppercase tracking-widest text-[#1a0107] dark:text-gray-300">Transparent Ledger</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif-fraunces tracking-tight text-[#1a0107] dark:text-white mb-4">
            Transaction History
          </h2>
          <p className="text-[#1a0107] dark:text-gray-400 text-lg font-bold leading-relaxed max-w-xl">
            A complete, transparent ledger of all your deployed hours, categories, and moods.
          </p>
        </div>

        <div className="md:col-span-2 xl:col-span-2 flex flex-col gap-4 md:gap-6">
          <div className="flex-1 bg-white dark:bg-zinc-800 rounded-sm p-8 border-2 border-[#1a0107] dark:border-white shadow-retro flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 text-[#1a0107]/5 dark:text-white/5 group-hover:text-[#1a0107]/10 dark:group-hover:text-white/10 transition-colors">
               <BookOpen size={120} strokeWidth={2} />
            </div>
            <div className="relative z-10">
              <span className="font-cursive-caveat text-xl text-[#1a0107] dark:text-gray-300 tracking-widest mb-2 block">Total Accumulated Yield</span>
              <span className="text-5xl font-serif-fraunces text-[#1a0107] dark:text-white">
                {totalHoursCompleted.toFixed(1)} <span className="text-2xl text-[#1a0107] dark:text-gray-400 tracking-normal font-sans font-bold">hrs</span>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <button onClick={handleExportPDF} className="bg-white dark:bg-zinc-900 text-[#1a0107] dark:text-[#fca5a5] border-2 border-[#1a0107] dark:border-white rounded-sm p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-retro-sm hover:translate-y-1 hover:shadow-none hover:bg-[#ffc1cc] group">
              <FileText size={24} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold uppercase tracking-widest text-center text-xs">Export PDF</span>
            </button>
            <button onClick={handleExportExcel} className="bg-white dark:bg-zinc-900 text-[#1a0107] dark:text-[#fca5a5] border-2 border-[#1a0107] dark:border-white rounded-sm p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-retro-sm hover:translate-y-1 hover:shadow-none hover:bg-[#d1f2eb] group">
              <FileSpreadsheet size={24} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold uppercase tracking-widest text-center text-xs">Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bento Ledger Grid */}
      {sorted.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 auto-rows-max">
            {paginatedLogs.map((log) => (
              <div key={log.id} className="bg-[#fdfaf5] dark:bg-[#1a1a1a] drop-shadow-retro transition-transform flex flex-col h-full group hover:-translate-y-1 relative receipt-edge font-mono py-4 my-[10px]">
              
              {/* Receipt Header (Date & Time) */}
              <div className="p-6 md:p-8 flex justify-between items-start border-b-2 border-dashed border-[#1a0107]/30 dark:border-white/30">
                <div>
                  <h4 className="text-xl font-bold tracking-tight text-[#1a0107] dark:text-white mb-2 uppercase">{formatDate(log.date)}</h4>
                  <span className="text-sm text-[#1a0107] dark:text-gray-300 font-bold uppercase tracking-widest inline-block">
                    {formatTime(log.startTime)} — {formatTime(log.endTime)}
                  </span>
                </div>
                <div className="text-right shrink-0 px-2 py-1 flex flex-col items-end justify-center">
                  <span className="block text-3xl font-bold tracking-tighter text-[#1a0107] dark:text-white leading-none mb-1">
                    {Number(log.hours).toFixed(2)}
                  </span>
                  <span className="text-xs text-[#1a0107]/70 dark:text-gray-400 font-bold tracking-widest uppercase">QTY (HRS)</span>
                </div>
              </div>
              
              {/* Content Body */}
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-6 border-b-2 border-dashed border-[#1a0107]/30 dark:border-white/30 pb-6">
                  {(log.moods || []).map((m) => (
                    <span key={m} className="text-xs font-bold uppercase tracking-widest text-[#1a0107] dark:text-white">{m}</span>
                  ))}
                  {(log.categories || []).map((c) => (
                    <span key={c} className="text-xs font-bold uppercase tracking-widest text-[#1a0107]/70 dark:text-gray-400">/ {c}</span>
                  ))}
                </div>

                <p className="text-[#1a0107] dark:text-white font-bold text-base leading-relaxed mb-6 whitespace-pre-wrap uppercase">
                  {log.tasks}
                </p>

                {log.diary && (
                  <div className="mb-6 pt-6 border-t-2 border-dashed border-[#1a0107]/30 dark:border-white/30">
                    <span className="text-xs font-bold text-[#1a0107]/70 dark:text-gray-400 uppercase tracking-widest mb-3 block">Notes</span>
                    <p className="text-sm text-[#1a0107] dark:text-gray-300 font-bold leading-relaxed whitespace-pre-wrap uppercase">{log.diary}</p>
                  </div>
                )}

                {/* Attachments */}
                {log.attachments && log.attachments.length > 0 && (
                  <div className="mt-auto pt-6 border-t-2 border-dashed border-[#1a0107]/30 dark:border-white/30">
                    <span className="text-xs font-bold text-[#1a0107]/70 dark:text-gray-400 uppercase tracking-widest mb-3 block">Evidence Attached</span>
                    <div className="flex flex-wrap gap-3">
                      {log.attachments.map((src, idx) => (
                        <button key={idx} onClick={() => setLightbox({ logId: log.id, images: log.attachments!, currentIndex: idx })} className="block hover:opacity-80 transition-all hover:-translate-y-1 transform bg-[#fdfaf5] dark:bg-[#1a1a1a] p-1 border-2 border-[#1a0107] dark:border-white shadow-[2px_2px_0px_#1a0107] dark:shadow-[2px_2px_0px_white]">
                          <img src={src} alt="Attachment" className="w-16 h-16 object-cover grayscale contrast-125" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-6 md:px-8 pt-4 border-t-2 border-dashed border-[#1a0107]/30 dark:border-white/30 flex justify-between gap-3 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-bold text-[#1a0107]/50 dark:text-gray-500 uppercase tracking-widest self-center">END OF RECEIPT</span>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(log)} className="px-3 py-2 text-xs font-bold uppercase tracking-widest border-2 border-[#1a0107] dark:border-white text-[#1a0107] dark:text-white hover:bg-[#1a0107] hover:text-white dark:hover:bg-white dark:hover:text-[#1a0107] transition-all">
                    Edit
                  </button>
                  <button onClick={() => setDeleteConfirmId(log.id)} className="px-3 py-2 text-xs font-bold uppercase tracking-widest border-2 border-[#1a0107] dark:border-white text-[#1a0107] dark:text-white hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                    Void
                  </button>
                </div>
              </div>
              
              {/* Barcode graphic for extra receipt flavor */}
              <div className="px-6 md:px-8 mt-6 mb-2 flex justify-center opacity-50 dark:opacity-80">
                <div className="h-8 w-4/5 bg-[repeating-linear-gradient(90deg,#1a0107_0,#1a0107_2px,transparent_2px,transparent_4px)] dark:bg-[repeating-linear-gradient(90deg,white_0,white_2px,transparent_2px,transparent_4px)]"></div>
              </div>

              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-12 h-12 rounded-sm bg-white dark:bg-zinc-900 border-2 border-[#1a0107] dark:border-white flex items-center justify-center text-[#1a0107] dark:text-white shadow-retro-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffc1cc] transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-12 h-12 rounded-sm bg-white dark:bg-zinc-900 border-2 border-[#1a0107] dark:border-white flex items-center justify-center text-[#1a0107] dark:text-white shadow-retro-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffc1cc] transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#fdfaf5] dark:bg-zinc-900 rounded-sm p-16 border-2 border-[#1a0107] dark:border-white text-center shadow-retro max-w-2xl mx-auto">
           <div className="w-24 h-24 bg-white dark:bg-zinc-800 border-2 border-[#1a0107] shadow-retro-sm rounded-full flex items-center justify-center mx-auto mb-8">
             <List size={36} className="text-[#1a0107] dark:text-gray-400" />
           </div>
           <h3 className="text-4xl font-serif-fraunces tracking-tight text-[#1a0107] dark:text-white mb-4">Ledger Empty</h3>
           <p className="text-[#1a0107] dark:text-gray-400 text-lg font-bold mb-10 max-w-md mx-auto">
             Deploy your first hours to start tracking your capital growth.
           </p>
           <button onClick={onAddClick} className="bg-[#ffb6c1] dark:bg-white text-[#1a0107] hover:bg-[#ffc1cc] dark:hover:bg-gray-200 px-10 py-4 rounded-sm font-bold border-2 border-[#1a0107] shadow-retro-sm hover:translate-y-1 hover:shadow-none transition-all">
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
