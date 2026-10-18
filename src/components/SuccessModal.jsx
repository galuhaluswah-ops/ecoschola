import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, CheckCircle2, X } from 'lucide-react';

/**
 * Reusable SuccessModal Component
 * Displays clean confirmation pop-up with pure backdrop blur (no black tint),
 * highlighting results, points gained, and navigation actions.
 */
export default function SuccessModal({
  isOpen,
  onClose,
  data,
  onViewLeaderboard
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const isAudit = data.type === 'audit';

  return createPortal(
    <div className="fixed inset-0 z-[100] w-screen h-screen h-[100dvh] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-teal-100 max-w-md w-full text-center transition-all duration-300 max-h-[88vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Centered Animated Icon */}
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-emerald-100 text-emerald-600 shadow-xs">
          {isAudit ? (
            <Trophy className="w-8 h-8 text-[#2E7D32]" />
          ) : (
            <CheckCircle2 className="w-9 h-9 text-[#2E7D32]" />
          )}
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          {data.title || 'Aksi Berhasil Terkirim! 🎉'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
          {data.subtitle}
        </p>

        {/* Highlight Card with Mint / Soft Teal Gradient */}
        <div className="bg-gradient-to-br from-[#E0F7FA]/70 to-[#B2DFDB]/70 rounded-2xl p-4 my-4 border border-teal-200/60 shadow-xs text-left">
          {isAudit ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-teal-100/80">
                <span className="text-xs font-bold text-slate-600">Kelas yang Diperiksa:</span>
                <span className="text-xs font-black text-slate-800">{data.targetClass}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-teal-100/80">
                <span className="text-xs font-bold text-slate-600">Skor Penilaian:</span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-800">{data.score}</span>
                  {data.predicate && (
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-gradient-to-t from-yellow-400 to-yellow-200 text-amber-950 border border-yellow-300 shadow-xs">
                      {data.predicate}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs font-bold text-slate-600">Poin Ditambahkan:</span>
                <span className="text-sm font-black text-[#2E7D32] bg-white/90 px-2.5 py-0.5 rounded-lg border border-[#80CBC4] shadow-xs">
                  {data.pointsGained}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-teal-100/80">
                <span className="text-xs font-bold text-slate-600">Kelas Penyetor:</span>
                <span className="text-xs font-black text-slate-800">{data.targetClass}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-teal-100/80">
                <span className="text-xs font-bold text-slate-600">Sampah Terpilah:</span>
                <span className="text-xs font-black text-slate-800">{data.weightText}</span>
              </div>
              {data.rupiahText && (
                <div className="flex items-center justify-between pb-2 border-b border-teal-100/80">
                  <span className="text-xs font-bold text-slate-600">Nilai Kas Tabungan:</span>
                  <span className="text-xs font-black text-slate-800">+{data.rupiahText}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs font-bold text-slate-600">Poin & Reduksi CO₂:</span>
                <span className="text-xs font-black text-[#2E7D32] bg-white/90 px-2.5 py-0.5 rounded-lg border border-[#80CBC4] shadow-xs">
                  {data.pointsGained} {data.co2Text ? `• ${data.co2Text}` : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Primary Action Button (Tropical Orange) */}
          <button
            type="button"
            id="modal-view-leaderboard-btn"
            onClick={onViewLeaderboard || onClose}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-orange transition-all active:scale-95 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>Lihat Papan Juara 🏆</span>
          </button>

          {/* Secondary Action Button */}
          <button
            type="button"
            id="modal-close-btn"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <span>Selesai & Tutup</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
