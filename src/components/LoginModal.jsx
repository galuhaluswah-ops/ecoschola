import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  KeyRound, 
  School, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowRight,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { SMP_CLASSES, OFFICIAL_GURU_ACCOUNTS } from '../data/mockData';

export default function LoginModal({ 
  isOpen, 
  onClose, 
  currentClass = 'Kelas 8A', 
  onLoginSuccess,
  isGate = false
}) {
  const [activeRole, setActiveRole] = useState('siswa'); // 'siswa' | 'guru'
  const [selectedClass, setSelectedClass] = useState(currentClass || 'Kelas 8A');
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Guru specific credentials
  const [guruId, setGuruId] = useState('');
  const [guruPassword, setGuruPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState(null);

  const classList = SMP_CLASSES.map(cls => ({
    value: cls,
    label: cls
  }));

  // Lock body scroll when modal is open as overlay (not in gate mode)
  useEffect(() => {
    if (isOpen && !isGate) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isGate]);

  if (!isGate && !isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeRole === 'siswa') {
      if (!pinInput || pinInput.length < 4) {
        setErrorMsg('Masukkan PIN minimal 4 angka ya! (Contoh demo: 1234)');
        return;
      }
      onLoginSuccess({
        role: 'siswa',
        className: selectedClass,
        userName: `Kader ${selectedClass}`,
        pin: pinInput
      });
      if (!isGate && onClose) onClose();
    } else {
      // Guru / Pembina / Superadmin Validation
      const cleanUsername = (guruId || '').trim().toLowerCase();
      if (!cleanUsername) {
        setErrorMsg('Silakan masukkan ID Pengguna / Username pembina!');
        return;
      }
      if (!guruPassword) {
        setErrorMsg('Silakan masukkan Kata Sandi!');
        return;
      }

      const matched = OFFICIAL_GURU_ACCOUNTS.find(
        acc => acc.username.toLowerCase() === cleanUsername && 
               (acc.password === guruPassword || acc.alternatePassword === guruPassword)
      );

      if (!matched) {
        setErrorMsg('ID Pengguna atau Kata Sandi salah! Gunakan akun resmi: gareta.eco atau wyumna.eco (Sandi: 1234)');
        return;
      }

      onLoginSuccess({
        role: matched.role,
        className: 'Kelas 8A',
        guruRole: matched.title,
        teacherName: matched.teacherName,
        userName: matched.userName,
        username: matched.username,
        isSuperadmin: matched.role === 'superadmin'
      });
      if (!isGate && onClose) onClose();
    }
  };


  const modalContent = (
    <div className={isGate 
      ? "min-h-screen min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#E0F7FA] via-white to-[#B2DFDB] relative overflow-hidden" 
      : "fixed inset-0 z-[100] w-screen h-screen h-[100dvh] overflow-y-auto flex items-center justify-center p-4 backdrop-blur-2xl bg-gradient-to-br from-[#E0F7FA]/95 via-[#E8F5E9]/95 to-[#B2DFDB]/95 animate-in fade-in zoom-in-95 duration-200"
    }>
      {/* Decorative ambient background glows */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-[#80CBC4]/35 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-[#FFE0B2]/35 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E0F2F1]/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-white border border-[#B2DFDB] rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-800 overflow-y-auto max-h-[90vh] my-auto z-10">
        
        {/* Close Button - Sembunyikan jika gerbang login utama */}
        {!isGate && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Tutup modal login"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Mascot / Leaf 3D Header Illustration */}
        <div className="text-center space-y-2 pt-1">
          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2E7D32] via-[#4CAF50] to-[#81C784] shadow-[0_6px_16px_rgba(46,125,50,0.35)] border-2 border-white mx-auto transform hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
              <path 
                d="M19.5 3.5C14.5 3.5 6 7 4 14C3.5 15.5 4.5 17 6 17C7.5 17 11 16 14 13C17 10 20.5 5 19.5 3.5Z" 
                fill="url(#leaf3dModalLoginClean)" 
              />
              <path d="M4 20L11 13" stroke="#E8F5E9" strokeWidth="2" strokeLinecap="round" />
              <path d="M11 13C12.5 11.5 15 10 17 9" stroke="#E8F5E9" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
              <defs>
                <linearGradient id="leaf3dModalLoginClean" x1="4" y1="20" x2="19.5" y2="3.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1B5E20" />
                  <stop offset="0.45" stopColor="#43A047" />
                  <stop offset="0.85" stopColor="#A5D6A7" />
                  <stop offset="1" stopColor="#E8F5E9" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-white/70 blur-[0.5px]" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Masuk Akun EcoSchola 🍃
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
              Kelola jejak karbon, bank sampah digital, dan aksi Adiwiyata sekolahmu.
            </p>
          </div>
        </div>

        {/* Role Switcher Tabs (Kader Siswa vs Guru / Pembina) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 mt-4">
          <button
            type="button"
            onClick={() => {
              setActiveRole('siswa');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'siswa'
                ? 'bg-white text-[#2E7D32] shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-[#2E7D32]" />
            <span>Kader Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('guru');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'guru'
                ? 'bg-white text-[#2E7D32] shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#FF9800]" />
            <span>Guru / Pembina</span>
          </button>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 mt-4">
          
          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl animate-pop flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {activeRole === 'siswa' ? (
            <>
              {/* 1. Custom Dropdown: PILIH KELAS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Pilih Kelas:</span>
                </label>
                <CustomDropdown
                  id="login-class-dropdown"
                  value={selectedClass}
                  onChange={setSelectedClass}
                  options={classList}
                  placeholder="Pilih Kelas Kamu"
                  buttonClassName="border-teal-100/90 text-xs sm:text-sm font-bold"
                />
              </div>

              {/* 2. Input KATA SANDI / PIN KELAS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#FF9800]" />
                    <span>Kata Sandi / PIN Kelas:</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    maxLength={10}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Masukkan PIN / Sandi Kelas"
                    id="login-pin-input"
                    className="w-full bg-[#F8FAFC] border border-teal-100/90 rounded-xl pl-3.5 pr-11 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-colors tracking-widest shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    aria-label="Tampilkan PIN"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Form Guru / Pembina */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <span>ID Pengguna / Username:</span>
                  </span>
                  <span className="text-xs font-normal text-slate-400">Contoh: gareta.eco</span>
                </label>
                <input
                  type="text"
                  id="login-guru-username"
                  value={guruId}
                  onChange={(e) => setGuruId(e.target.value)}
                  placeholder="Contoh: gareta.eco atau wyumna.eco"
                  className="w-full bg-[#F8FAFC] border border-teal-100/90 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-colors shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#FF9800]" />
                    <span>Kata Sandi / Password:</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-guru-password"
                    value={guruPassword}
                    onChange={(e) => setGuruPassword(e.target.value)}
                    placeholder="Masukkan kata sandi pembina"
                    className="w-full bg-[#F8FAFC] border border-teal-100/90 rounded-xl pl-3.5 pr-11 py-2.5 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-colors shadow-xs tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    aria-label="Tampilkan Password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}


          {/* Tombol Masuk Aksen Oranye Tropis (#FF9800) */}
          <button
            type="submit"
            id="login-submit-btn"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-orange transition-all active:scale-95 cursor-pointer"
          >
            <span>Masuk Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );

  if (isGate) {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
}
