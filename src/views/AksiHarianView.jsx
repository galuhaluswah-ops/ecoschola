import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PlusCircle, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  Scale, 
  Coins, 
  Zap, 
  ShieldCheck, 
  Star, 
  Smile, 
  AlertCircle,
  Clock,
  ArrowRight,
  Trophy,
  Lock,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CustomDropdown from '../components/CustomDropdown';
import SuccessModal from '../components/SuccessModal';
import { SMP_CLASSES } from '../data/mockData';
import { sanitizeInput, validateNumericInput } from '../utils/security';

export default function AksiHarianView({
  initialSubTab = 'setor',
  transactions,
  setTransactions,
  leaderboard,
  setLeaderboard,
  carbonStats,
  setCarbonStats,
  onAddRecentActivity,
  onNavigate,
  userSession,
  myClass = 'Kelas 8A'
}) {
  const isGuru = userSession?.role === 'guru' || userSession?.role === 'superadmin';
  const [activeTab, setActiveTab] = useState(initialSubTab); // 'setor' | 'audit'

  // --- Pop-up Modal Konfirmasi Berhasil State ---
  const [successModal, setSuccessModal] = useState(null);
  const [isAuditSubmitted, setIsAuditSubmitted] = useState(false);
  const [isSetorSubmitted, setIsSetorSubmitted] = useState(false);
  const [isSubmittingSetor, setIsSubmittingSetor] = useState(false);
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);

  // --- State Form Setor Sampah ---
  const [setorClass, setSetorClass] = useState(myClass || 'Kelas 8A');
  const [selectedWasteType, setSelectedWasteType] = useState('plastik');
  const [weightInput, setWeightInput] = useState('');
  const [successToast, setSuccessToast] = useState(null);

  // Role-Based Locking: if student, lock setorClass and auditClass to myClass
  useEffect(() => {
    if (!isGuru && myClass) {
      setSetorClass(myClass);
      setAuditClass(myClass);
    }
  }, [isGuru, myClass]);

  // Waste types with pastel colors and child-friendly icons
  const wasteCategories = [
    {
      id: 'plastik',
      name: 'Botol Plastik PET',
      category: 'Plastik',
      icon: '🧴',
      pricePerKg: 3500,
      pointsPerKg: 35,
      co2PerKg: 1.8,
      bg: 'bg-[#E0F7FA]/50',
      border: 'border-[#B2DFDB]',
      activeBorder: 'border-[#00838F] bg-[#E0F7FA] shadow-xs',
      badge: 'Banyak di Kantin'
    },
    {
      id: 'kertas',
      name: 'Kardus & Kertas',
      category: 'Kertas',
      icon: '📦',
      pricePerKg: 2000,
      pointsPerKg: 20,
      co2PerKg: 1.1,
      bg: 'bg-[#FFF9C4]/40',
      border: 'border-[#FFF176]',
      activeBorder: 'border-[#F57F17] bg-[#FFF9C4] shadow-xs',
      badge: 'Buku & Kotak Bekas'
    },
    {
      id: 'logam',
      name: 'Kaleng Minuman',
      category: 'Logam',
      icon: '🥫',
      pricePerKg: 9500,
      pointsPerKg: 95,
      co2PerKg: 4.5,
      bg: 'bg-[#FFF3E0]/50',
      border: 'border-[#FFE0B2]',
      activeBorder: 'border-[#E65100] bg-[#FFF3E0] shadow-xs',
      badge: 'Nilai Paling Tinggi!'
    },
    {
      id: 'organik',
      name: 'Organik / Sisa Buah',
      category: 'Organik/Kompos',
      icon: '🍎',
      pricePerKg: 1000,
      pointsPerKg: 15,
      co2PerKg: 0.7,
      bg: 'bg-[#E8F5E9]/50',
      border: 'border-[#C8E6C9]',
      activeBorder: 'border-[#2E7D32] bg-[#E8F5E9] shadow-xs',
      badge: 'Bahan Pupuk Kompos'
    }
  ];

  const currentWaste = wasteCategories.find(w => w.id === selectedWasteType) || wasteCategories[0];
  const weightNum = parseFloat(weightInput) || 0;
  const rewardPoints = Math.round(weightNum * currentWaste.pointsPerKg);
  const rewardCo2 = Number((weightNum * currentWaste.co2PerKg).toFixed(1));

  // --- State Form Audit Kebersihan ---
  const [auditClass, setAuditClass] = useState(myClass || 'Kelas 8A');
  const [inspectorName, setInspectorName] = useState(() => 
    userSession?.role === 'guru' 
      ? (userSession?.userName || 'Dra. Hj. Siti Nurhaliza (Guru Pembina)') 
      : 'Regu Piket Kader Adiwiyata'
  );
  const [floorStatus, setFloorStatus] = useState('good'); // 'perfect' | 'good' | 'bad'
  const [wasteStatus, setWasteStatus] = useState('good');
  const [electricityStatus, setElectricityStatus] = useState('perfect');
  const [auditNotes, setAuditNotes] = useState('');

  const classOptions = SMP_CLASSES;

  // Calculate audit score with useMemo
  const finalAuditScore = useMemo(() => {
    const getScoreValue = (status) => (status === 'perfect' ? 100 : status === 'good' ? 85 : 60);
    return Math.round(
      getScoreValue(floorStatus) * 0.35 +
      getScoreValue(wasteStatus) * 0.35 +
      getScoreValue(electricityStatus) * 0.3
    );
  }, [floorStatus, wasteStatus, electricityStatus]);

  // Submit Setor Sampah with strict validation & anti-double submit
  const handleSubmitSetor = (e) => {
    e.preventDefault();
    if (isSubmittingSetor || isSetorSubmitted) return;

    const numCheck = validateNumericInput(weightInput, { min: 0.1, max: 500 });
    if (!numCheck.isValid) {
      setSuccessToast(`⚠️ ${numCheck.error || 'Masukkan berat sampah valid antara 0.1 s/d 500 kg!'}`);
      setTimeout(() => setSuccessToast(null), 3500);
      return;
    }

    setIsSubmittingSetor(true);
    setTimeout(() => setIsSubmittingSetor(false), 1500);

    const validWeight = Number(numCheck.value.toFixed(1));
    const finalPoints = Math.round(validWeight * currentWaste.pointsPerKg);
    const finalCo2 = Number((validWeight * currentWaste.co2PerKg).toFixed(1));

    const newTxId = `TX-${Date.now().toString().slice(-4)}`;
    const newTx = {
      id: newTxId,
      className: setorClass,
      wasteType: currentWaste.name,
      category: currentWaste.category,
      weightKg: validWeight,
      totalPrice: 0,
      points: finalPoints,
      date: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      verifiedBy: 'Kasir Bank Sampah Siswa',
      co2Saved: finalCo2
    };

    setTransactions([newTx, ...transactions].slice(0, 50));

    // Update Leaderboard
    if (setLeaderboard) {
      setLeaderboard(prev => {
        const updated = prev.map(item => {
          if (item.name === setorClass) {
            return {
              ...item,
              totalKg: Number((item.totalKg + weightNum).toFixed(1)),
              points: item.points + rewardPoints
            };
          }
          return item;
        });
        updated.sort((a, b) => b.points - a.points);
        return updated.map((item, idx) => ({ ...item, rank: idx + 1 }));
      });
    }

    // Update School Carbon Stats
    if (setCarbonStats) {
      setCarbonStats(prev => ({
        ...prev,
        wasteDivertedKg: Number((prev.wasteDivertedKg + weightNum).toFixed(1)),
        co2AbsorbedKg: Number((prev.co2AbsorbedKg + rewardCo2).toFixed(1))
      }));
    }

    // Real-time synchronization: add to "Aksi Hijau Teman-Teman Hari Ini"
    if (onAddRecentActivity) {
      onAddRecentActivity({
        id: `ACT-${Date.now()}`,
        time: 'Baru saja',
        icon: 'trash',
        title: `Setoran ${currentWaste.name}`,
        actor: `${setorClass} (Bank Sampah)`,
        description: `${setorClass} menyetor ${weightNum} kg ${currentWaste.name}`,
        category: 'Bank Sampah',
        impact: `+${rewardPoints} Poin • -${rewardCo2} CO2e`,
        status: 'Terverifikasi'
      });
    }

    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2E7D32', '#FF9800', '#FFD600', '#00B4D8']
      });
    } catch (e) {}

    setIsSetorSubmitted(true);

    // Tampilkan Pop-up Modal Konfirmasi Berhasil
    setSuccessModal({
      type: 'setor',
      title: 'Setoran Sampah Berhasil! 🎉',
      targetClass: setorClass,
      subtitle: `Setoran sampah dari ${setorClass} telah berhasil tercatat di Bank Sampah Digital Al Uswah Green.`,
      weightText: `${validWeight} Kg ${currentWaste.name}`,
      co2Text: `-${finalCo2} CO2e`,
      pointsGained: `+${finalPoints} Poin Juara`
    });

    setSuccessToast(`Yey! ${setorClass} berhasil setor ${validWeight} kg ${currentWaste.name}. Meraih +${finalPoints} Poin & cegah ${finalCo2} CO2e! 🎉`);
    setTimeout(() => setSuccessToast(null), 5000);
    setWeightInput('');
  };

  // Submit Audit Kebersihan with input sanitization & anti-double submit
  const handleSubmitAudit = (e) => {
    e.preventDefault();
    if (isSubmittingAudit || isAuditSubmitted) return;

    const cleanInspector = sanitizeInput(inspectorName, 50);
    const cleanNotes = sanitizeInput(auditNotes, 160);

    if (!cleanInspector) {
      setSuccessToast('⚠️ Harap isi nama pemeriksa / tim kader audit (maks. 50 karakter)!');
      setTimeout(() => setSuccessToast(null), 3500);
      return;
    }

    setIsSubmittingAudit(true);
    setTimeout(() => setIsSubmittingAudit(false), 1500);

    const pointsGained = finalAuditScore * 10;

    if (setLeaderboard) {
      setLeaderboard(prev => {
        const updated = prev.map(item => {
          if (item.name === auditClass) {
            return {
              ...item,
              points: item.points + pointsGained,
              cleanScore: Math.round(((item.cleanScore || 90) + finalAuditScore) / 2),
              lastAuditStatus: `Audit Nilai ${finalAuditScore}/100 • ${floorStatus === 'perfect' ? 'Sangat Rapi' : 'Tertib'}`
            };
          }
          return item;
        });
        updated.sort((a, b) => b.points - a.points);
        return updated.map((item, idx) => ({ ...item, rank: idx + 1 }));
      });
    }

    // Real-time synchronization: add to "Aksi Hijau Teman-Teman Hari Ini"
    if (onAddRecentActivity) {
      onAddRecentActivity({
        id: `ACT-${Date.now()}`,
        time: 'Baru saja',
        icon: 'sparkles',
        title: `Audit Kebersihan & Energi`,
        actor: `${auditClass} (Inspeksi)`,
        description: `Inspeksi harian meraih skor ${finalAuditScore}/100 oleh ${inspectorName}`,
        category: 'Audit Kebersihan',
        impact: `+${pointsGained} Poin • Disiplin Bersih`,
        status: 'Terverifikasi'
      });
    }

    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2E7D32', '#FF9800', '#FFD600', '#00B4D8']
      });
    } catch (e) {}

    setIsAuditSubmitted(true);

    // Tampilkan Pop-up Modal Konfirmasi Berhasil
    setSuccessModal({
      type: 'audit',
      title: 'Nilai Berhasil Terkirim! 🎉',
      targetClass: auditClass,
      subtitle: `Data audit kebersihan dan hemat energi untuk ${auditClass} telah berhasil disimpan ke sistem Al Uswah Green.`,
      score: `${finalAuditScore} / 100`,
      predicate: finalAuditScore >= 90 ? '⭐⭐⭐⭐⭐ Sangat Rapi' : finalAuditScore >= 75 ? '⭐⭐⭐⭐ Baik' : '⭐⭐ Perlu Ditingkatkan',
      pointsGained: `+${pointsGained} Poin Juara`,
      inspector: inspectorName
    });

    setSuccessToast(`Nilai audit untuk ${auditClass} berhasil disimpan! Skor: ${finalAuditScore}/100 (+${pointsGained} Poin Juara) ⭐`);
    setTimeout(() => setSuccessToast(null), 5000);
    setAuditNotes('');
  };

  return (
    <div className="space-y-6 pb-20 animate-pop">
      
      {/* Role Notice Banner for Guru / Pembina */}
      {userSession?.role === 'guru' && (
        <div className="p-4 bg-gradient-to-r from-orange-50 via-[#FFF9C4]/30 to-amber-50 border border-orange-200 rounded-2xl flex items-center justify-between text-xs text-orange-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-lg shrink-0">
              👨‍🏫
            </div>
            <div>
              <span className="font-extrabold block text-slate-800">Mode Guru / Pembina Adiwiyata Aktif</span>
              <span className="text-slate-600">Anda memiliki wewenang penuh mengaudit kebersihan, memvalidasi bank sampah, dan mengubah nilai seluruh kelas 7A - 9B.</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-orange-200/80 text-orange-950 font-black text-[11px] shrink-0 border border-orange-300 hidden sm:inline">
            Akses Penuh
          </span>
        </div>
      )}

      {/* 2 Big Thumb-Friendly Segmented Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-[#B2DFDB]/70 shadow-md flex items-center gap-2">
        <button
          onClick={() => setActiveTab('setor')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'setor'
              ? 'bg-gradient-to-r from-[#2E7D32] to-[#388E3C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-[#E0F7FA]/40'
          }`}
        >
          <span className="text-lg">🧴</span>
          <span>Setor Bank Sampah</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-gradient-to-r from-[#2E7D32] to-[#388E3C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-[#E0F7FA]/40'
          }`}
        >
          <span className="text-lg">🧹</span>
          <span>Cek Kebersihan Kelas</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-slate-800 font-bold text-xs flex items-center gap-3 shadow-md animate-pop">
          <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
          <span className="flex-1">{successToast}</span>
        </div>
      )}

      {/* ==========================================
          TAB 1: SETOR BANK SAMPAH (SUPER SIMPEL)
          ========================================== */}
      {activeTab === 'setor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Input Form (Card Putih, rounded-2xl, shadow-md) */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-md space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="text-2xl">⚖️</span>
              <div>
                <h2 className="text-base font-extrabold text-slate-800">Form Setor Sampah Kelas</h2>
                <p className="text-xs text-slate-500">Pilih jenis sampah, masukkan berat, dan kumpulkan poin!</p>
              </div>
            </div>

            <form onSubmit={handleSubmitSetor} className="space-y-5">
              
              {/* Step 1: Pilih Kelas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>1. Pilih Kelas Penyetor:</span>
                  {!isGuru && (
                    <span className="text-[11px] font-semibold text-teal-700 lowercase">
                      (otomatis terkunci ke kelasmu)
                    </span>
                  )}
                </label>
                {isGuru ? (
                  <CustomDropdown
                    id="setor-class-dropdown"
                    value={setorClass}
                    onChange={setSetorClass}
                    options={classOptions}
                    placeholder="Pilih Kelas Penyetor"
                    buttonClassName="py-3 text-sm font-bold"
                  />
                ) : (
                  <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-900 cursor-not-allowed shadow-xs select-none transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 text-sm shadow-xs font-black">
                        🏫
                      </div>
                      <div>
                        <span className="text-sm font-black block text-teal-950">{myClass}</span>
                        <span className="text-[11px] font-semibold text-teal-700/80 block">Kader Penyetor Resmi</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-teal-300 text-teal-800 text-xs font-bold shadow-xs">
                      <Lock className="w-3.5 h-3.5 text-teal-600" />
                      <span>🔒 Terkunci Sesuai Akun Kelasmu</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Pilih Jenis Sampah dengan Kartu Visual */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Pilih Jenis Sampah:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {wasteCategories.map(cat => {
                    const isSelected = selectedWasteType === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedWasteType(cat.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected ? cat.activeBorder : `${cat.bg} ${cat.border} opacity-85 hover:opacity-100`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{cat.icon}</span>
                          {isSelected && <span className="text-xs font-black text-[#2E7D32]">✓</span>}
                        </div>
                        <div className="mt-2">
                          <span className="text-xs font-extrabold text-slate-800 block leading-tight">{cat.name}</span>
                          <span className="text-xs font-black text-[#2E7D32] block mt-1">
                            +{cat.pointsPerKg} Poin/kg
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Berat Timbangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Berat Sampah (Kilogram):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="Misal: 4.5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-16 py-3.5 text-base font-black text-slate-800 focus:outline-none focus:border-[#2E7D32]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">
                    KG
                  </span>
                </div>

                {/* Quick Weight Presets */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400 font-medium">Pintas:</span>
                  {[1, 2, 5, 10].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setWeightInput(String(val))}
                      className="px-3 py-1 bg-slate-100 hover:bg-[#E0F7FA] rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      +{val} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Kotak Perolehan Poin & Cegah Karbon Otomatis */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E0F7FA]/70 via-[#E8F5E9]/50 to-[#FFF9C4]/40 border border-[#B2DFDB] space-y-2">
                <span className="text-xs font-extrabold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF9800]" /> Perolehan Poin & Cegah Karbon untuk {setorClass}:
                </span>
                <div className="grid grid-cols-2 gap-3 text-center pt-1">
                  <div className="bg-white p-3 rounded-xl border border-[#B2DFDB] shadow-xs">
                    <span className="text-xs text-slate-500 block font-medium">Poin Adiwiyata</span>
                    <span className="text-base sm:text-lg font-black text-[#2E7D32]">
                      +{rewardPoints} pts
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#B2DFDB] shadow-xs">
                    <span className="text-xs text-slate-500 block font-medium">Cegah Karbon</span>
                    <span className="text-base sm:text-lg font-black text-sky-700">
                      {rewardCo2} CO2e
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol Utama Call-to-Action (CTA) Oranye Tropis dengan Anti Double-Submit */}
              <button
                type="submit"
                id="submit-setor-btn"
                disabled={weightNum <= 0 || weightNum > 500 || isSetorSubmitted || isSubmittingSetor}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  isSetorSubmitted
                    ? 'bg-[#2E7D32] text-white shadow-xs cursor-default'
                    : isSubmittingSetor
                    ? 'bg-slate-300 text-slate-500 cursor-wait'
                    : weightNum > 0 && weightNum <= 500
                    ? 'bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white shadow-orange active:scale-98 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>
                  {isSetorSubmitted 
                    ? '✅ Setoran Berhasil Disimpan' 
                    : isSubmittingSetor 
                    ? '⏳ Memproses Setoran...' 
                    : 'Kirim Setoran Sampah 🚀'}
                </span>
              </button>
            </form>
          </div>

          {/* Right Column: Riwayat Setoran Terkini (Maksimal 8 Transaksi) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> Setoran Terakhir
              </h3>
              <span className="text-xs font-semibold text-slate-400">Terbaru</span>
            </div>

            {transactions && transactions.length > 0 ? (
              <div className="space-y-2.5">
                {transactions.slice(0, 8).map(tx => (
                  <div key={tx.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{tx.className}</span>
                      <span className="text-slate-500">{tx.wasteType} • {tx.weightKg} kg</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sky-700 block">-{tx.co2Saved || Number((tx.weightKg * 1.5).toFixed(1))} CO2e</span>
                      <span className="font-black text-[#2E7D32]">+{tx.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-3 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl mb-2">
                  ⚖️
                </div>
                <p className="text-xs font-bold text-slate-700">Belum ada setoran sampah hari ini.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Yuk, pilah sampah kelasmu dan lakukan setoran pertama!</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: AUDIT KEBERSIHAN KELAS (RAMAH ANAK)
          ========================================== */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-md space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <span className="text-2xl">🧹</span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-800">Cek Kebersihan & Listrik Kelas</h2>
              <p className="text-xs text-slate-500">Bantu kader Adiwiyata menilai kondisi kelas hari ini!</p>
            </div>
          </div>

          <form onSubmit={handleSubmitAudit} className="space-y-6">
            
            {/* Pilih Kelas & Nama Kader */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Kelas yang Diperiksa:</span>
                  {!isGuru && (
                    <span className="text-[11px] font-semibold text-teal-700 lowercase">
                      (lapor mandiri)
                    </span>
                  )}
                </label>
                {isGuru ? (
                  <CustomDropdown
                    id="audit-class-dropdown"
                    value={auditClass}
                    onChange={setAuditClass}
                    options={classOptions}
                    placeholder="Pilih Kelas yang Diperiksa"
                    buttonClassName="py-3 text-sm font-bold"
                  />
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-900 cursor-not-allowed shadow-xs select-none transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 text-sm shadow-xs font-black">
                        🏫
                      </div>
                      <div>
                        <span className="text-sm font-black block text-teal-950">{myClass}</span>
                        <span className="text-[11px] font-semibold text-teal-700/80 block">Lapor Mandiri Kebersihan Kelas</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 border border-teal-300 text-teal-800 text-xs font-bold shadow-xs">
                      <Lock className="w-3.5 h-3.5 text-teal-600" />
                      <span>🔒 Terkunci Sesuai Akun Kelasmu</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Petugas Pemeriksa:
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#2E7D32]"
                />
              </div>
            </div>

            {/* 3 Indikator Utama dengan Tombol Tap Emoji */}
            <div className="space-y-4">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                3 Indikator Penilaian:
              </span>

              {/* Indikator 1: Lantai & Meja */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span>🧹</span> 1. Kebersihan Lantai & Meja
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">Bobot 35%</span>
                </div>
                <p className="text-xs text-slate-500">Lantai disapu bersih, kolong meja bebas sampah kertas/plastik.</p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'perfect', label: '🌟 Kinclong', desc: 'Sangat Bersih' },
                    { id: 'good', label: '👍 Cukup', desc: 'Ada sedikit debu' },
                    { id: 'bad', label: '⚠️ Kotor', desc: 'Perlu disapu' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFloorStatus(opt.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        floorStatus === opt.id
                          ? 'bg-[#2E7D32] text-white border-[#1B5E20] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-extrabold">{opt.label}</span>
                      <span className="text-xs opacity-80 block">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Indikator 2: Pemilahan Sampah */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span>🗑️</span> 2. Pemilahan Sampah (Organik & Anorganik)
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">Bobot 35%</span>
                </div>
                <p className="text-xs text-slate-500">Tempat sampah terpisah rapi, tidak ada plastik di bak daun/makanan.</p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'perfect', label: '🌟 Terpisah Rapi', desc: '100% Benar' },
                    { id: 'good', label: '👍 Lumayan', desc: 'Terselip 1-2 sampah' },
                    { id: 'bad', label: '⚠️ Tercampur', desc: 'Belum dipilah' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setWasteStatus(opt.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        wasteStatus === opt.id
                          ? 'bg-[#2E7D32] text-white border-[#1B5E20] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-extrabold">{opt.label}</span>
                      <span className="text-xs opacity-80 block">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Indikator 3: Hemat Listrik */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span>💡</span> 3. Disiplin Alat Listrik (Lampu / AC / Kipas)
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">Bobot 30%</span>
                </div>
                <p className="text-xs text-slate-500">Lampu, kipas, AC, dan proyektor padam saat kelas kosong.</p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'perfect', label: '🌟 Padam Semua', desc: 'Disiplin Hemat' },
                    { id: 'good', label: '👍 1 Alat Nyala', desc: 'Lupa matikan kipas' },
                    { id: 'bad', label: '⚠️ Menyala Semua', desc: 'Boros listrik' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setElectricityStatus(opt.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        electricityStatus === opt.id
                          ? 'bg-[#2E7D32] text-white border-[#1B5E20] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-extrabold">{opt.label}</span>
                      <span className="text-xs opacity-80 block">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Skor Total Preview */}
            <div className="p-4 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block">Hasil Skor Penilaian:</span>
                <span className="text-2xl font-black text-slate-800">{finalAuditScore} / 100</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-900 bg-gradient-to-t from-yellow-400 to-yellow-200 px-3 py-1 rounded-lg border border-yellow-300 shadow-xs inline-block">
                  {finalAuditScore >= 90 ? '⭐⭐⭐⭐⭐ Sangat Baik' : finalAuditScore >= 75 ? '⭐⭐⭐⭐ Baik' : '⭐⭐ Perlu Ditingkatkan'}
                </span>
                <span className="text-xs font-extrabold text-[#2E7D32] block mt-1">
                  Bonus: +{finalAuditScore * 10} Poin Juara
                </span>
              </div>
            </div>

            {/* CTA Submit Button (Oranye Tropis) dengan Anti Double-Submit */}
            <button
              type="submit"
              id="submit-audit-btn"
              disabled={isAuditSubmitted || isSubmittingAudit}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                isAuditSubmitted
                  ? 'bg-[#2E7D32] text-white shadow-xs cursor-default'
                  : isSubmittingAudit
                  ? 'bg-slate-300 text-slate-500 cursor-wait'
                  : 'bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white shadow-orange active:scale-98 cursor-pointer'
              }`}
            >
              <span>
                {isAuditSubmitted 
                  ? '✅ Nilai Hari Ini Sudah Terkirim' 
                  : isSubmittingAudit 
                  ? '⏳ Mengirim Penilaian...' 
                  : 'Kirim Nilai Kebersihan Kelas ⭐'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* Reusable SuccessModal Component */}
      <SuccessModal
        isOpen={!!successModal}
        data={successModal}
        onClose={() => {
          setSuccessModal(null);
          setTimeout(() => {
            setIsAuditSubmitted(false);
            setIsSetorSubmitted(false);
          }, 800);
        }}
        onViewLeaderboard={() => {
          setSuccessModal(null);
          setIsAuditSubmitted(false);
          setIsSetorSubmitted(false);
          if (onNavigate) onNavigate('juara');
        }}
      />

    </div>
  );
}
