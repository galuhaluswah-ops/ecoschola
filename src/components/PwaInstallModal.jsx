import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  X, 
  Share2, 
  PlusSquare, 
  ShieldCheck, 
  Zap,
  Sparkles,
  QrCode,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { isIOSDevice, isMobileDevice, getInstallUrl, shareAppInvite } from '../utils/pwaHelper';

export default function PwaInstallModal({ 
  isOpen, 
  onClose, 
  onInstallNative, 
  canInstallNative, 
  isInstalled,
  defaultTab = 'install' // 'install' | 'share'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [copiedToast, setCopiedToast] = useState(false);
  const isIOS = isIOSDevice();
  const isMobile = isMobileDevice();
  const installUrl = getInstallUrl();

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

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

  const handleShareClick = async () => {
    const res = await shareAppInvite();
    if (res.method === 'clipboard' || res.success) {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const handleCopyLinkOnly = async () => {
    try {
      await navigator.clipboard.writeText(installUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    } catch {
      // fallback
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] w-screen h-screen h-[100dvh] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-teal-100 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-800 overflow-hidden my-auto animate-pop">
        
        {/* Floating Copied Toast */}
        {copiedToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pop">
            <Check className="w-3.5 h-3.5" />
            <span>Tautan instalasi berhasil disalin! 📋</span>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E0F7FA] to-[#B2DFDB] border border-[#80CBC4] flex items-center justify-center text-2xl shadow-xs shrink-0">
            📲
          </div>
          <div>
            <span className="text-[11px] font-black tracking-wider uppercase text-[#0D9488] block">
              PWA SMART INSTALLER
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
              {activeTab === 'share' ? 'Bagikan Aplikasi Al Uswah Green' : 'Pasang Al Uswah Green di HP'}
            </h3>
          </div>
        </div>

        {/* Tab Switcher: Pasang vs Bagikan */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'install'
                ? 'bg-white text-[#0D9488] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pasang Aplikasi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'share'
                ? 'bg-white text-[#0D9488] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan Link / QR</span>
          </button>
        </div>

        {activeTab === 'install' ? (
          <div>
            <p className="text-xs text-slate-600 mb-3.5 leading-relaxed">
              Pasang aplikasi Al Uswah Green langsung di layar utama HP kamu agar tampil <strong>layar penuh (tanpa bilah browser)</strong>, hemat kuota, dan secepat aplikasi bawaan!
            </p>

            {/* Keunggulan PWA */}
            <div className="space-y-1.5 mb-4 bg-[#E0F2F1]/80 p-3 rounded-2xl border border-[#B2DFDB] text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span><strong>Layar Penuh (Standalone):</strong> Bebas gangguan address bar.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span><strong>Hemat Kuota & Ringan:</strong> Tanpa instal dari PlayStore/AppStore.</span>
              </div>
            </div>

            {/* State Condition: Sudah terpasang */}
            {isInstalled ? (
              <div className="w-full py-3 px-4 rounded-xl bg-[#E8F5E9] text-[#2E7D32] font-black text-xs text-center border border-[#A5D6A7]">
                Aplikasi sudah terpasang di perangkat ini! 🎉
              </div>
            ) : isIOS ? (
              /* Panduan Khusus iOS / Safari (2 Langkah Ramah) */
              <div className="space-y-2.5 bg-gradient-to-br from-slate-50 to-[#E0F7FA]/30 p-3.5 rounded-2xl border border-teal-100 text-xs text-slate-700">
                <div className="font-extrabold text-[#0D9488] flex items-center gap-1.5">
                  <span>🍎</span>
                  <span>Panduan Instalasi di iPhone / iPad (Safari):</span>
                </div>
                <div className="space-y-2 pt-1 text-slate-700 font-medium">
                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                    <span className="w-5 h-5 rounded-full bg-[#E0F7FA] text-[#0D9488] font-black flex items-center justify-center text-[11px] shrink-0">
                      1
                    </span>
                    <div>
                      <span>Ketuk ikon </span>
                      <strong className="text-slate-900 inline-flex items-center gap-1 font-bold">
                        Bagikan (Share) <span className="text-sm">⎋</span>
                      </strong>
                      <span> di bilah menu bawah layar Safari.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                    <span className="w-5 h-5 rounded-full bg-[#E0F7FA] text-[#0D9488] font-black flex items-center justify-center text-[11px] shrink-0">
                      2
                    </span>
                    <div>
                      <span>Gulir ke bawah, pilih </span>
                      <strong className="text-[#0D9488] font-bold">
                        "Tambahkan ke Layar Utama" (Add to Home Screen)
                      </strong>
                      <span> lalu ketuk <strong>Tambah</strong>.</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : canInstallNative ? (
              /* Android / Chromium One-Click Direct Prompt */
              <button
                type="button"
                onClick={onInstallNative}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-orange transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Pasang Aplikasi Sekarang (1-Klik)</span>
              </button>
            ) : (
              /* Tampilan Desktop / Fallback Android Manual */
              <div className="space-y-3">
                {!isMobile ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600">
                      Buka di HP untuk memasang aplikasi:
                    </span>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <QRCodeSVG value={installUrl} size={110} level="M" />
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Arahkan kamera HP ke QR Code di atas 📸
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">Cara pasang manual di Chrome:</p>
                    <p>1. Ketuk ikon <strong>Titik Tiga (⋮)</strong> di sudut kanan atas.</p>
                    <p>2. Pilih <strong>"Pasang aplikasi"</strong> atau <strong>"Tambahkan ke Layar utama"</strong>.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* TAB BAGIKAN / SHARE LINK & QR */
          <div className="space-y-3.5">
            <p className="text-xs text-slate-600 leading-relaxed">
              Bagikan link instalasi aplikasi ini ke WhatsApp, grup kelas, atau rekan guru agar mereka bisa langsung memasang Al Uswah Green di HP masing-masing!
            </p>

            {/* QR Code Container */}
            <div className="p-3.5 bg-gradient-to-br from-[#E0F7FA]/40 to-slate-50 border border-teal-100 rounded-2xl flex flex-col items-center justify-center gap-2">
              <div className="p-2.5 bg-white rounded-2xl border border-teal-100/80 shadow-xs">
                <QRCodeSVG value={installUrl} size={130} level="M" />
              </div>
              <span className="text-[11px] font-bold text-[#0D9488]">
                Scan QR Code untuk Menginstal di HP
              </span>
            </div>

            {/* Share Link Actions */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleShareClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:from-[#1B5E20] text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan ke WhatsApp / Media Sosial</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLinkOnly}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Tautan Instalasi</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
