import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sparkles,
  Leaf, 
  Trophy, 
  Heart,
  Home,
  CheckCircle2, 
  ChevronDown, 
  UserCheck,
  Check,
  School,
  ExternalLink,
  Lock,
  LogOut,
  Download,
  Share2
} from 'lucide-react';
import { SMP_CLASSES } from '../data/mockData';

export default function Navbar({
  currentTab,
  setCurrentTab,
  canInstallPwa,
  onInstallPwa,
  onShareApp,
  isPwaInstalled,
  schoolInfo,
  myClass = "Kelas 8A",
  userSession,
  syncStatus = 'local',
  onOpenClassProfile,
  onOpenLogin,
  onSelectClass,
  onLogout
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: '🏠' },
    { id: 'aksi', label: 'Setor & Audit', icon: '⚡' },
    { id: 'pohon', label: 'Jelajah Pohon', icon: '🌿' },
    { id: 'juara', label: 'Papan Juara', icon: '🏆' }
  ];

  const classList = useMemo(() => {
    return SMP_CLASSES.map(cls => ({
      name: cls
    }));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleSelectClassItem = (clsName) => {
    if (onSelectClass) onSelectClass(clsName);
    setDropdownOpen(false);
  };

  const isGuru = userSession?.role === 'guru' || userSession?.role === 'superadmin';

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#B2DFDB]/60 transition-colors shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & School Name */}
        <div 
          onClick={() => setCurrentTab('beranda')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E0F7FA] to-[#B2DFDB] border border-[#80CBC4] flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg text-slate-800 tracking-tight">
                Al Uswah Green
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium block leading-tight">
              {schoolInfo?.name || 'SMPIT Al Uswah Banyuwangi'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden sm:flex items-center gap-1 bg-white/70 p-1.5 rounded-2xl border border-[#B2DFDB]/50 shadow-xs backdrop-blur-xs">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`nav-item-link px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2E7D32] to-[#388E3C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#FF9800] hover:bg-slate-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Sync Status, PWA Install & Custom Dropdown Switcher Kelas */}
        <div className="flex items-center gap-2">
          {/* Sync Status Badge in Navbar Header (Desktop) */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black border transition-colors select-none ${
              syncStatus === 'cloud'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
            title={
              syncStatus === 'cloud'
                ? 'Terhubung ke Supabase PostgreSQL Cloud'
                : 'Berjalan dalam Local Storage Hybrid Mode'
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                syncStatus === 'cloud' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{syncStatus === 'cloud' ? '☁️ Cloud Synced' : '⚡ Local Mode'}</span>
          </div>



          {/* Tombol Bagikan Aplikasi */}
          <button
            type="button"
            onClick={onShareApp}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Bagikan Tautan Aplikasi Al Uswah Green"
          >
            <Share2 className="w-3.5 h-3.5 text-[#0D9488]" />
            <span className="hidden sm:inline">Bagikan</span>
          </button>

          {/* Tombol Oranye Pasang Aplikasi (Otomatis disembunyikan jika sudah dalam mode standalone / terpasang) */}
          {!isPwaInstalled && (
            <button
              type="button"
              onClick={onInstallPwa}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-orange active:scale-95 cursor-pointer animate-pulse hover:animate-none"
              title="Pasang Al Uswah Green di Layar Utama HP"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Pasang Aplikasi</span>
            </button>
          )}

          {/* Custom Dropdown Switcher Kelas di Navbar */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              id="nav-class-profile-btn"
              className={`flex items-center gap-2 bg-white/95 hover:bg-[#E0F7FA]/70 border border-teal-100/90 hover:border-[#80CBC4] px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer group active:scale-95 ${
                dropdownOpen ? 'ring-2 ring-[#80CBC4]/50 border-[#80CBC4] bg-[#F8FAFC]' : ''
              }`}
              title="Klik untuk memilih kelas atau melihat profil kelas"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span className={`w-2.5 h-2.5 rounded-full shadow-xs animate-pulse shrink-0 ${
                isGuru ? 'bg-[#FF9800]' : 'bg-[#2E7D32]'
              }`} />
              <div className="text-left flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-800 group-hover:text-[#2E7D32] transition-colors flex items-center gap-1">
                  {myClass}
                  {!isGuru && (
                    <Lock className="w-3 h-3 text-teal-600" />
                  )}
                </span>
                {isGuru && (
                  <span className="px-1.5 py-0.2 rounded-md bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] text-[10px] font-black hidden md:inline">
                    {userSession?.role === 'superadmin' ? 'Admin' : 'Guru'}
                  </span>
                )}
              </div>
              <ChevronDown 
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF9800] transition-transform duration-200 ease-out shrink-0 ${
                  dropdownOpen ? 'rotate-180 text-teal-600' : ''
                }`} 
              />
            </button>

            {/* Menu Dropdown Animasi Halus (rounded-2xl, shadow-xl) */}
            <div
              className={`absolute right-0 mt-2 w-64 bg-white border border-teal-100/80 rounded-2xl shadow-xl overflow-hidden py-1.5 z-50 transition-all duration-200 ease-out origin-top-right ${
                dropdownOpen
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}
            >
              {/* Option 1: Buka Profil Kelas Lengkap & Sync Status Info */}
              <div className="px-3 py-2 border-b border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between pb-1 text-[10px] text-slate-500">
                  <span className="font-semibold">Backend:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                      syncStatus === 'cloud'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        syncStatus === 'cloud' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <span>{syncStatus === 'cloud' ? '☁️ Cloud Synced' : '⚡ Local Mode'}</span>
                  </span>
                </div>
                {isGuru && (
                  <div className="px-2 py-1 rounded-lg bg-orange-50 border border-orange-200 text-[11px] font-bold text-orange-800 flex items-center gap-1.5">
                    <span>👨‍🏫</span>
                    <span className="truncate">{userSession?.userName || 'Mode Guru / Pembina'}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onOpenClassProfile) onOpenClassProfile(myClass);
                  }}
                  className="w-full flex items-center justify-between gap-2 p-2 rounded-xl bg-[#E0F7FA]/60 hover:bg-[#E0F7FA] text-[#00695C] text-xs font-bold transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Profil {myClass} Lengkap</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Differentiated content based on Role */}
              {isGuru ? (
                <>
                  {/* Header Ganti Kelas untuk Guru */}
                  <div className="px-3.5 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Pilih Kelas Dipantau:
                  </div>

                  {/* Class Items List */}
                  <div className="max-h-48 overflow-y-auto">
                    {classList.map((cls) => {
                      const isSelected = cls.name === myClass;
                      return (
                        <button
                          key={cls.name}
                          type="button"
                          onClick={() => handleSelectClassItem(cls.name)}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#E8F5E9] text-[#2E7D32] font-black'
                              : 'text-slate-700 hover:bg-teal-50 hover:text-teal-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{cls.name}</span>
                          </div>

                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Mode Siswa: Informasi Penguncian Kelas & Tombol Ganti Akun */
                <div className="px-3 py-2.5 space-y-2 border-b border-slate-100">
                  <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-teal-900">
                      <Lock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Akun Terkunci ({myClass})</span>
                    </div>
                    <p className="text-[11px] text-teal-800 leading-relaxed">
                      Untuk berpindah kelas, kamu harus masuk kembali menggunakan PIN kelas tujuan.
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Option: Masuk Akun Lain & Keluar */}
              <div className="pt-1.5 mt-1 px-3 pb-1 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onLogout) onLogout();
                    else if (onOpenLogin) onOpenLogin();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-[#FFF3E0] text-slate-700 hover:text-[#E65100] text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#FF9800]" />
                  <span>
                    {userSession?.role === 'guru' ? 'Ganti Akun / Masuk Siswa' : 'Ganti Akun / Keluar'}
                  </span>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Keluar Akun</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
