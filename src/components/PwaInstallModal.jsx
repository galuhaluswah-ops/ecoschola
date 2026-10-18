import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  X, 
  Share, 
  PlusSquare, 
  ShieldCheck, 
  Zap,
  Sparkles
} from 'lucide-react';

export default function PwaInstallModal({ 
  isOpen, 
  onClose, 
  onInstallNative, 
  canInstallNative, 
  isInstalled 
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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] w-screen h-screen h-[100dvh] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E0F7FA] border border-[#B2DFDB] flex items-center justify-center text-2xl shadow-xs">
            📱
          </div>
          <div>
            <span className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider block">
              Aplikasi Siswa Adiwiyata
            </span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              Pasang EcoSchola di HP
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
          Pasang aplikasi EcoSchola langsung di layar utama HP-mu agar gampang setor sampah dan cek kebersihan kelas setiap hari!
        </p>

        {/* Features Checklist */}
        <div className="space-y-2 mb-5 bg-[#E0F2F1] p-3.5 rounded-xl border border-[#B2DFDB] text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span><strong>Akses Cepat 1 Ketukan:</strong> Langsung dari layar beranda HP.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span><strong>Hemat Kuota & Ringan:</strong> Tanpa perlu unduh dari PlayStore/AppStore.</span>
          </div>
        </div>

        {/* Action Button: Oranye Tropis CTA */}
        {isInstalled ? (
          <div className="w-full py-3.5 px-4 rounded-xl bg-[#E8F5E9] text-[#2E7D32] font-black text-xs text-center border border-[#A5D6A7]">
            Aplikasi sudah terpasang di perangkat ini! 🎉
          </div>
        ) : canInstallNative ? (
          <button
            onClick={onInstallNative}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white font-black text-sm flex items-center justify-center gap-2 shadow-orange transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Pasang Sekarang</span>
          </button>
        ) : (
          <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-800">Cara pasang manual:</p>
            <p>1. Ketuk ikon <strong>Bagikan / Titik Tiga (⋮)</strong> di peramban.</p>
            <p>2. Pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</p>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
