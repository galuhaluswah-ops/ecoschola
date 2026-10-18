import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Trophy, 
  Trash2, 
  TreePine, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Award,
  ChevronRight,
  Heart,
  Flame,
  QrCode,
  ShieldCheck,
  Lightbulb,
  Calendar,
  FastForward,
  Settings,
  Plus,
  Droplets
} from 'lucide-react';
import ecoDataService from '../services/ecoDataService';
import ManageMissionsModal from '../components/ManageMissionsModal';
import { getClassChampionshipStatus, getEvaluationCycle } from '../utils/evaluationCycle';

export default function HomeView({
  schoolInfo,
  carbonStats,
  myClass = "Kelas 8A",
  leaderboard = [],
  setLeaderboard,
  missions = [],
  setMissions,
  onNavigate,
  recentActivities = [],
  onOpenClassProfile,
  onOpenLogin,
  onAddRecentActivity,
  userSession
}) {
  const isGuru = userSession?.role === 'guru' || userSession?.role === 'superadmin';

  // Class Data & 5-Day Championship Status
  const currentClassData = useMemo(() => {
    return leaderboard.find(c => c.name === myClass) || {
      name: myClass,
      points: 0,
      rank: 1,
      totalKg: 0,
      plantedTrees: 0
    };
  }, [leaderboard, myClass]);

  const championshipStatus = useMemo(() => {
    return getClassChampionshipStatus(currentClassData, leaderboard);
  }, [currentClassData, leaderboard]);

  // Auto-Daily Rotation & Day Simulation State
  const [dayOffset, setDayOffset] = useState(0);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [dayPackage, setDayPackage] = useState(null);

  // Compute simulated date and active day index
  const simulatedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  const activeDayIndex = simulatedDate.getDay();
  const dateKey = useMemo(() => ecoDataService.getDateKey(simulatedDate), [simulatedDate]);

  // Load Day Package with completion statuses for current class & dateKey
  const loadDayPackage = useCallback(async () => {
    const pkg = await ecoDataService.getDayMissionsForClass(activeDayIndex, myClass, dateKey);
    setDayPackage(pkg);
  }, [activeDayIndex, myClass, dateKey]);

  useEffect(() => {
    loadDayPackage();
  }, [loadDayPackage]);

  const activeMissions = dayPackage?.missions || [];
  const completedCount = useMemo(() => {
    return activeMissions.filter(m => m.completed).length;
  }, [activeMissions]);

  // Days array for day pills
  const DAYS_LIST = useMemo(() => [
    { index: 1, label: 'Sen' },
    { index: 2, label: 'Sel' },
    { index: 3, label: 'Rab' },
    { index: 4, label: 'Kam' },
    { index: 5, label: 'Jum' },
    { index: 6, label: 'Sab' },
    { index: 0, label: 'Min' }
  ], []);

  // Handlers for Day Simulation
  const handleNextDaySimulation = () => {
    setDayOffset(prev => prev + 1);
  };

  const handleSelectDay = (targetDayIndex) => {
    const todayIndex = new Date().getDay();
    let diff = targetDayIndex - todayIndex;
    if (diff < 0) diff += 7;
    setDayOffset(diff);
  };

  // Memoized current class data from leaderboard
  const classData = useMemo(() => {
    return leaderboard.find(c => c.name === myClass) || leaderboard[0];
  }, [leaderboard, myClass]);

  // Memoized total carbon metrics calculation for high performance
  const carbonMetrics = useMemo(() => {
    const trees = carbonStats?.treesCataloged !== undefined ? Number(carbonStats.treesCataloged) : 0;
    const co2PerTreeKg = 14;
    const estAbsorption = Number(carbonStats?.totalCo2AbsorptionKgPerYear) || (trees * co2PerTreeKg);
    const energyPercent = carbonStats?.energyEfficiencyPercent !== undefined ? Number(carbonStats.energyEfficiencyPercent) : 100;
    return {
      trees,
      estAbsorption,
      energyPercent
    };
  }, [carbonStats]);

  // Helper to render visual icon instead of raw text
  const renderActivityIcon = useCallback((icon) => {
    if (icon === 'trash') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#E0F7FA] border border-[#B2DFDB] flex items-center justify-center text-[#00838F] shrink-0 shadow-xs">
          <Trash2 className="w-5 h-5" />
        </div>
      );
    }
    if (icon === 'tree' || icon === 'leaf' || icon === 'plant') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center text-[#2E7D32] shrink-0 shadow-xs">
          <TreePine className="w-5 h-5" />
        </div>
      );
    }
    if (icon === 'droplet' || icon === 'droplets' || icon === 'water') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#E0F7FA] border border-[#B2DFDB] flex items-center justify-center text-[#0288D1] shrink-0 shadow-xs">
          <Droplets className="w-5 h-5 text-cyan-600" />
        </div>
      );
    }
    if (icon === 'zap' || icon === 'energy') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#FFF9C4] border border-[#FFF176] flex items-center justify-center text-[#F57F17] shrink-0 shadow-xs">
          <Zap className="w-5 h-5" />
        </div>
      );
    }
    if (icon === 'sparkles' || icon === 'check' || icon === 'audit') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#F3E5F5] border border-[#E1BEE7] flex items-center justify-center text-[#7B1FA2] shrink-0 shadow-xs">
          <Sparkles className="w-5 h-5" />
        </div>
      );
    }
    if (icon === 'award' || icon === 'trophy' || icon === 'medal') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-[#FFF9C4] border border-[#FFF176] flex items-center justify-center text-[#F57F17] shrink-0 shadow-xs">
          <Award className="w-5 h-5" />
        </div>
      );
    }

    // Guard: If icon is an unmapped string identifier (like english words), don't render raw text
    const isWordString = typeof icon === 'string' && /^[a-zA-Z_-]+$/.test(icon.trim());
    const displayEmoji = isWordString ? '🌱' : (icon || '🌱');

    // Fallback: render emoji in soft pastel rounded container
    return (
      <div className="w-10 h-10 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-xs">
        {displayEmoji}
      </div>
    );
  }, []);

  // Toggle mission completion with real-time leaderboard and points sync
  const handleToggleMission = useCallback(async (missionId) => {
    const target = activeMissions.find(m => m.id === missionId);
    if (!target) return;
    const willBeCompleted = !target.completed;

    const updatedPackage = await ecoDataService.toggleDayMission(activeDayIndex, missionId, myClass, dateKey);
    setDayPackage(updatedPackage);

    // Update leaderboard in App
    if (setLeaderboard) {
      const refreshedLeaderboard = await ecoDataService.getLeaderboard();
      setLeaderboard(refreshedLeaderboard);
    }

    // Update live activities feed
    if (onAddRecentActivity && willBeCompleted) {
      onAddRecentActivity({
        id: `ACT-${Date.now()}`,
        time: 'Baru saja',
        icon: target.icon === '🧹' ? 'trash' : target.icon === '💡' ? 'zap' : target.icon === '🪴' ? 'tree' : 'sparkles',
        title: target.title,
        actor: `${myClass} (Kader Siswa)`,
        description: `Menuntaskan misi ${dayPackage?.dayName}: "${target.title}"`,
        category: 'Misi Lingkungan',
        impact: `+${target.points} Poin Adiwiyata`,
        status: 'Selesai'
      });
    }
  }, [activeMissions, activeDayIndex, myClass, dateKey, dayPackage?.dayName, onAddRecentActivity, setLeaderboard]);

  // Guru Actions
  const handleAddCustomMission = async (dayIdx, newMissionData) => {
    await ecoDataService.addCustomMissionToDay(dayIdx, newMissionData);
    await loadDayPackage();
  };

  const handleUpdateMission = async (dayIdx, missionId, updatedFields) => {
    await ecoDataService.updateMissionInDay(dayIdx, missionId, updatedFields);
    await loadDayPackage();
  };

  const handleDeleteMission = async (dayIdx, missionId) => {
    await ecoDataService.deleteMissionFromDay(dayIdx, missionId);
    await loadDayPackage();
  };

  const handleResetDayPackage = async (dayIdx) => {
    await ecoDataService.resetDayMissionsToDefault(dayIdx);
    await loadDayPackage();
  };

  return (
    <div className="space-y-6 pb-20 animate-pop">
      
      {/* Friendly Hero Banner with 3D Leaf Illustration & Soft Turquoise Gradient */}
      <div className="bg-gradient-to-br from-[#E0F7FA]/90 via-white to-[#B2DFDB]/70 p-6 sm:p-8 rounded-2xl border border-[#80CBC4]/60 shadow-md relative overflow-hidden backdrop-blur-xs">
        {/* Subtle decorative glow */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#80CBC4]/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 top-0 w-24 h-24 bg-[#FFE0B2]/40 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#80CBC4] text-xs font-bold text-[#2E7D32] shadow-xs">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isGuru ? 'bg-[#FF9800]' : 'bg-[#2E7D32]'}`} />
              <span>
                {isGuru 
                  ? `👨‍🏫 Mode Pembina: ${userSession?.userName || 'Guru Adiwiyata'}`
                  : `Kader Adiwiyata Remaja • ${schoolInfo?.name || 'SMPN 1 Adiwiyata Nusantara'}`
                }
              </span>
            </div>

            {/* Title with Modern 3D Vector Leaf Illustration */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <span>
                  {isGuru 
                    ? (userSession?.role === 'superadmin' 
                        ? 'Halo, Superadmin EcoSchola! 🌿' 
                        : `Halo, ${userSession?.userName || 'Pembina Gareta'}! 🌿`)
                    : 'Halo, Pejuang Bumi!'}
                </span>
              </h1>
              
              {/* 3D Glossy Leaf Vector Element */}
              <div className="relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#2E7D32] via-[#4CAF50] to-[#81C784] shadow-[0_4px_12px_rgba(46,125,50,0.35)] border border-white/60 transform hover:rotate-12 transition-transform cursor-pointer">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                  <path 
                    d="M19.5 3.5C14.5 3.5 6 7 4 14C3.5 15.5 4.5 17 6 17C7.5 17 11 16 14 13C17 10 20.5 5 19.5 3.5Z" 
                    fill="url(#leaf3dGrad)" 
                  />
                  <path 
                    d="M4 20L11 13" 
                    stroke="#E8F5E9" 
                    strokeWidth="1.8" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M11 13C12.5 11.5 15 10 17 9" 
                    stroke="#E8F5E9" 
                    strokeWidth="1.2" 
                    strokeLinecap="round" 
                    strokeOpacity="0.8" 
                  />
                  <defs>
                    <linearGradient id="leaf3dGrad" x1="4" y1="20" x2="19.5" y2="3.5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1B5E20" />
                      <stop offset="0.45" stopColor="#43A047" />
                      <stop offset="0.85" stopColor="#A5D6A7" />
                      <stop offset="1" stopColor="#E8F5E9" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Shiny highlight reflection */}
                <div className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-white/70 blur-[0.5px]" />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
              {isGuru ? 'Anda memantau aktivitas dan pencapaian ' : 'Kamu login sebagai '}
              <button
                type="button"
                onClick={onOpenClassProfile}
                className="font-extrabold text-[#2E7D32] hover:text-[#1B5E20] bg-white hover:bg-[#E0F7FA] px-2.5 py-0.5 rounded-lg border border-[#80CBC4] shadow-xs inline-flex items-center gap-1 transition-all cursor-pointer underline decoration-dotted"
                title="Klik untuk melihat Profil & Regu Piket Kelas"
              >
                <span>{myClass}</span>
                <span className="text-xs">🔍</span>
              </button>
              {isGuru 
                ? '. Kelola audit kebersihan, rekap bank sampah, dan verifikasi plakat pohon.'
                : '. Ayo selesaikan misi lingkungan hari ini dan bawa kelasmu jadi Juara 1!'
              }
            </p>
          </div>

          {/* Badge Level Card with 5-Day Championship Evaluation Cycle - Clickable to open Profile */}
          <div 
            onClick={onOpenClassProfile}
            className="bg-white hover:bg-[#E0F7FA]/40 p-4 rounded-2xl border border-[#B2DFDB] hover:border-[#80CBC4] shadow-md shrink-0 flex items-center gap-3.5 cursor-pointer transition-all active:scale-95 group max-w-xs sm:max-w-sm"
            title="Klik untuk melihat Profil Kelas Lengkap & Detail Evaluasi 5 Hari"
          >
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform ${
              championshipStatus.isNeutral
                ? 'bg-gradient-to-t from-emerald-100 to-teal-50 border-emerald-300 text-emerald-700 shadow-xs'
                : championshipStatus.theme === 'gold'
                ? 'bg-gradient-to-t from-yellow-400 to-yellow-200 border-yellow-300 shadow-gold'
                : 'bg-gradient-to-t from-teal-100 to-teal-50 border-teal-300 shadow-xs'
            }`}>
              {championshipStatus.isNeutral ? '🌱' : '🏆'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Status Kelas</span>
                <span className="text-xs text-[#FF9800] font-bold group-hover:underline">Buka Profil ➜</span>
              </div>
              
              {/* Lencana Status Kejuaraan / Evaluasi 5 Hari */}
              <div className={`inline-block px-2.5 py-0.5 rounded-lg font-black text-xs border shadow-xs my-0.5 ${
                championshipStatus.isNeutral
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : championshipStatus.theme === 'gold'
                  ? 'bg-gradient-to-t from-yellow-400 to-yellow-200 text-amber-950 border-yellow-300'
                  : 'bg-teal-50 text-teal-900 border-teal-300'
              }`}>
                {championshipStatus.badgeText}
              </div>

              {/* Sub-teks info: ⏳ Penentuan Badge Juara: X Hari Lagi & Poin */}
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-amber-700 block">
                  {championshipStatus.subText}
                </span>
                <span className="text-xs font-bold text-[#2E7D32] block">
                  {currentClassData.points > 0 ? `Peringkat #${currentClassData.rank} • ` : 'Klasemen Awal • '}
                  <strong className="text-sm font-black text-[#2E7D32]">
                    {(currentClassData.points || 0).toLocaleString('id-ID')}
                  </strong> Poin
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Cards Metrik Utama (Container Putih, Sudut rounded-2xl, Shadow-md) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* 1. Poin Kelasmu (Teks Kritis: Hijau Zamrud) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF9C4] text-[#F57F17] border border-[#FFF176] flex items-center justify-center text-xl shadow-xs">
              ⭐
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FEFAE0] text-amber-800 border border-[#FAF3C0]">
              Poin Kelasmu
            </span>
          </div>
          <div className="mt-3">
            {/* Teks Status Poin Kritis: Hijau Zamrud */}
            <span className="text-2xl sm:text-3xl font-black text-[#2E7D32] tracking-tight block">
              {classData?.points.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              +{completedCount * 30} poin dari misi hari ini
            </span>
          </div>
        </div>

        {/* 2. Sampah Terpilah (Ikon & Aksen: Hijau Zamrud #2E7D32) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center text-xl shadow-xs">
              🧴
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E0F2F1] text-[#2E7D32] border border-[#B2DFDB]">
              Setor Sampah
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight block">
              {classData?.totalKg !== undefined ? classData.totalKg : 0} <span className="text-sm font-semibold text-slate-500">Kg</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Botol plastik & kardus
            </span>
          </div>
        </div>

        {/* 3. Pohon Terdata (Ikon: Hijau Zamrud #2E7D32) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center text-xl shadow-xs">
              🌳
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
              Pohon Terdata
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight block">
              {carbonMetrics.trees} <span className="text-sm font-semibold text-slate-500">Btg</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              100% dipasangi QR Plakat
            </span>
          </div>
        </div>

        {/* 4. Disiplin Listrik (Ikon: Kuning Emas #FBC02D) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF9C4] text-[#F57F17] border border-[#FFF176] flex items-center justify-center text-xl shadow-gold">
              💡
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFF9C4] text-amber-900 border border-[#FFF176]">
              Disiplin Listrik
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight block">
              {carbonMetrics.energyPercent}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Lampu mati saat ruang kosong
            </span>
          </div>
        </div>

      </div>

      {/* Misi Lingkungan Hari Ini & Tombol Aksi Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Misi Lingkungan Harian */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-md space-y-4">
          
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🎯</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-slate-800">Misi Lingkungan Hari Ini</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E0F7FA] text-[#00838F] border border-[#B2DFDB]">
                    📅 Tema Hari Ini: {dayPackage?.themeTitle || 'Fokus Kebersihan'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[#2E7D32] font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {dayPackage?.dayName || 'Hari Ini'} ({dateKey})
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    🔄 Misi berganti otomatis setiap pukul 00:00
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {isGuru && (
                <button
                  type="button"
                  onClick={() => setManageModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] border border-[#FFCC80] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Kelola atau edit misi untuk role Guru/Pembina"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Kelola / Edit Misi</span>
                </button>
              )}
              <span className="text-xs font-black px-3 py-1.5 rounded-full bg-[#E0F2F1] text-[#2E7D32] border border-[#B2DFDB] shadow-xs">
                {completedCount} dari {activeMissions.length} Selesai 🎉
              </span>
            </div>
          </div>

          {/* Bar Simulasi Demo Penjurian */}
          <div className="p-2.5 sm:p-3 bg-gradient-to-r from-slate-50 to-[#E0F7FA]/30 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <FastForward className="w-3.5 h-3.5 text-[#00838F]" />
                Simulasi Demo:
              </span>
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {DAYS_LIST.map((d) => {
                  const isActive = activeDayIndex === d.index;
                  return (
                    <button
                      key={d.index}
                      type="button"
                      onClick={() => handleSelectDay(d.index)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2E7D32] text-white shadow-xs scale-105'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNextDaySimulation}
                className="px-3 py-1 rounded-xl bg-white hover:bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                title="Simulasi loncat ke hari berikutnya"
              >
                <span>⏭️ Simulasi Hari Berikutnya</span>
              </button>
              {dayOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => setDayOffset(0)}
                  className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
                  title="Kembali ke hari ini sesuai tanggal sistem"
                >
                  Reset Hari
                </button>
              )}
            </div>
          </div>

          {/* Interactive Mission Checklist */}
          <div className="space-y-2.5 transition-all duration-300">
            {activeMissions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm font-semibold">Belum ada misi untuk hari ini.</p>
                {isGuru && (
                  <button
                    type="button"
                    onClick={() => setManageModalOpen(true)}
                    className="mt-2 text-xs font-bold text-[#2E7D32] underline cursor-pointer"
                  >
                    + Tambah Misi Kustom Sekarang
                  </button>
                )}
              </div>
            ) : (
              activeMissions.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => handleToggleMission(m.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    m.completed 
                      ? 'bg-[#E8F5E9]/50 border-[#C8E6C9] text-slate-700' 
                      : 'bg-slate-50/80 hover:bg-[#E0F7FA]/30 border-slate-200/80 hover:border-[#80CBC4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                        m.completed 
                          ? 'bg-[#2E7D32] text-white shadow-xs' 
                          : 'border-2 border-slate-300 bg-white hover:border-[#2E7D32]'
                      }`}
                    >
                      {m.completed ? <CheckCircle2 className="w-4 h-4" /> : null}
                    </button>
                    <div>
                      <span className={`text-sm font-bold block ${m.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {m.icon || '🌱'} {m.title}
                      </span>
                      <span className="text-xs text-slate-500 block">
                        {m.desc}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-black px-2.5 py-1 rounded-xl shrink-0 ${
                    m.completed 
                      ? 'bg-white text-[#2E7D32] border border-[#C8E6C9]' 
                      : 'bg-gradient-to-r from-[#FF9800] to-[#F57C00] text-white shadow-xs'
                  }`}>
                    +{m.points} Pts
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Kartu Tips Kader Istimewa (Latar Hijau Toska Sangat Muda #E0F2F1 + Bola Lampu Oranye #FF9800) */}
          <div className="p-3.5 bg-[#E0F2F1] border border-[#B2DFDB] rounded-2xl text-xs text-slate-700 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#FFF3E0] text-[#FF9800] border border-[#FFE0B2] flex items-center justify-center shrink-0 text-lg shadow-xs">
              💡
            </div>
            <div>
              <span className="font-extrabold text-[#2E7D32] block">Tips Kader Adiwiyata:</span>
              <span className="text-slate-600">
                Foto kegiatan piket dan setoran sampah kelas bisa dilaporkan ke guru pendamping untuk bonus poin tambahan!
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Tombol Aksi Cepat Ramah Jempol */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-md space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="text-xl">⚡</span>
            <h3 className="font-bold text-sm text-slate-800">Aksi Cepat Siswa</h3>
          </div>

          <div className="space-y-2.5">
            {/* Setor Sampah */}
            <button
              onClick={() => onNavigate('aksi', 'setor')}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#E0F7FA]/60 to-white hover:from-[#E0F7FA] border border-[#B2DFDB] text-left flex items-center justify-between group transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center text-xl shadow-xs">
                  ♻️
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block group-hover:text-[#2E7D32] transition-colors">
                    Setor Sampah Kelas
                  </span>
                  <span className="text-xs text-slate-500">Timbang plastik & kardus</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF9800] group-hover:translate-x-1 transition-all" />
            </button>

            {/* Audit Kebersihan */}
            <button
              onClick={() => onNavigate('aksi', 'audit')}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#FFF3E0]/70 to-white hover:from-[#FFF3E0] border border-[#FFE0B2] text-left flex items-center justify-between group transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] text-[#FF9800] border border-[#FFE0B2] flex items-center justify-center text-xl shadow-xs">
                  🧹
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block group-hover:text-[#F57C00] transition-colors">
                    Cek Kebersihan Kelas
                  </span>
                  <span className="text-xs text-slate-500">Nilai lantai, meja, & listrik</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF9800] group-hover:translate-x-1 transition-all" />
            </button>

            {/* Jelajah Pohon */}
            <button
              onClick={() => onNavigate('pohon')}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#E0F7FA]/70 to-white hover:from-[#E0F7FA] border border-[#80CBC4] text-left flex items-center justify-between group transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center text-xl shadow-xs">
                  🌿
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block group-hover:text-[#2E7D32] transition-colors">
                    Koleksi Pohon & QR
                  </span>
                  <span className="text-xs text-slate-500">Scan & cetak plakat pohon</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF9800] group-hover:translate-x-1 transition-all" />
            </button>

            {/* Papan Juara */}
            <button
              onClick={() => onNavigate('juara')}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#FFF9C4]/60 to-white hover:from-[#FFF9C4] border border-[#FFF176] text-left flex items-center justify-between group transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-t from-yellow-400 to-yellow-200 border border-yellow-300 flex items-center justify-center text-xl shadow-gold">
                  🏆
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block group-hover:text-amber-800 transition-colors">
                    Klasemen Kelas Terhijau
                  </span>
                  <span className="text-xs text-slate-500">Lihat medali kelasmu</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF9800] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

      </div>

      {/* Feed Aksi Siswa Terkini (Container Putih, rounded-2xl, shadow-md) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-md space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="font-bold text-sm text-slate-800">Aksi Hijau Teman-Teman Hari Ini</h3>
          </div>
          <span className="text-xs font-bold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
            Live Update
          </span>
        </div>

        {recentActivities && recentActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentActivities.slice(0, 8).map((act) => (
              <div key={act.id} className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-[#E0F7FA]/30 border border-slate-150 transition-colors flex items-start gap-3">
                {/* Visual Icon with soft pastel background box */}
                {renderActivityIcon(act.icon)}
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-800 block truncate">{act.actor}</span>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                    {act.description || act.action || act.title}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60 text-xs text-slate-400 font-medium">
                    <span>{act.time}</span>
                    <span className="text-[#2E7D32] font-black">{act.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl mb-2.5">
              🌱
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700">
              Belum ada aktivitas tercatat hari ini.
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Yuk, mulai aksi hijau pertamamu lewat setor sampah, siram tanaman, atau tuntaskan misi harian!
            </p>
          </div>
        )}
      </div>

      {/* Modal Kelola Misi Guru / Pembina */}
      <ManageMissionsModal
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        activeDayIndex={activeDayIndex}
        dayPackage={dayPackage}
        onAddMission={handleAddCustomMission}
        onUpdateMission={handleUpdateMission}
        onDeleteMission={handleDeleteMission}
        onResetDayPackage={handleResetDayPackage}
      />

    </div>
  );
}
