import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Users, 
  UserCheck, 
  Sparkles, 
  Award, 
  Calendar, 
  ShieldCheck, 
  TreePine, 
  Trash2, 
  LogOut,
  ChevronRight,
  Smile,
  Heart,
  Edit3,
  Save,
  Plus,
  Lock,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { getClassProfile } from '../data/mockData';
import { getClassChampionshipStatus } from '../utils/evaluationCycle';
import { sanitizeInput, validateNumericInput } from '../utils/security';

export default function ClassProfileModal({ 
  isOpen, 
  onClose, 
  currentClass = 'Kelas 8A', 
  leaderboard = [], 
  userSession,
  classProfiles = {},
  onSaveProfile,
  onSwitchAccount,
  onOpenLogin,
  onLogout
}) {
  const [profileTab, setProfileTab] = useState('piket'); // 'piket' | 'kader'
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState(null);

  // Active profile from prop or mockData
  const baseProfile = classProfiles[currentClass] || getClassProfile(currentClass);
  const classStats = leaderboard.find(c => c.name === currentClass) || {
    name: currentClass,
    rank: 1,
    points: 0,
    totalKg: 0,
    cleanScore: 100,
    badge: '🌱 Pejuang Aktif • Siklus Evaluasi 5 Hari'
  };

  const championshipStatus = useMemo(() => {
    return getClassChampionshipStatus(classStats, leaderboard);
  }, [classStats, leaderboard]);

  const isGuru = userSession?.role === 'guru';
  const isSuperadmin = userSession?.role === 'superadmin';

  // Role & Ownership Permission:
  // - Siswa: ONLY CAN EDIT THEIR OWN CLASS (matching session className)
  // - Superadmin: full access to edit all 7 classes
  // - Guru: Read-Only
  const canEdit = Boolean(
    isSuperadmin || 
    (userSession?.role === 'siswa' && userSession?.className === currentClass)
  );

  // Edit Form States
  const [formData, setFormData] = useState({
    homeroomTeacher: '',
    teacherSubject: '',
    classLeader: '',
    totalStudents: 32,
    motto: '',
    piketGroups: [],
    cadres: []
  });

  const [activeEditDay, setActiveEditDay] = useState('Senin');
  const [newMemberName, setNewMemberName] = useState('');
  const [newCadreName, setNewCadreName] = useState('');
  const [newCadreRole, setNewCadreRole] = useState('');

  // Sync form data whenever modal opens or currentClass changes
  useEffect(() => {
    if (baseProfile) {
      setFormData({
        homeroomTeacher: baseProfile.homeroomTeacher || baseProfile.wali_kelas || '',
        teacherSubject: baseProfile.teacherSubject || 'Guru IPA & Pembina Adiwiyata',
        classLeader: baseProfile.classLeader || baseProfile.ketua_kelas || '',
        totalStudents: baseProfile.totalStudents || baseProfile.total_siswa || 32,
        motto: baseProfile.motto || baseProfile.slogan_kelas || '',
        piketGroups: baseProfile.piketGroups ? JSON.parse(JSON.stringify(baseProfile.piketGroups)) : [
          { day: "Senin", leader: "", members: [] },
          { day: "Selasa", leader: "", members: [] },
          { day: "Rabu", leader: "", members: [] },
          { day: "Kamis", leader: "", members: [] },
          { day: "Jumat", leader: "", members: [] }
        ],
        cadres: baseProfile.cadres ? JSON.parse(JSON.stringify(baseProfile.cadres)) : []
      });
      setIsEditing(false);
      setSaveSuccessMsg(null);
      setSaveErrorMsg(null);
    }
  }, [baseProfile, currentClass, isOpen]);

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

  // Piket Group Helpers
  const currentPiketGroup = formData.piketGroups.find(g => g.day.toLowerCase().includes(activeEditDay.toLowerCase())) || formData.piketGroups[0];

  const handleUpdatePiketLeader = (newLeader) => {
    setFormData(prev => ({
      ...prev,
      piketGroups: prev.piketGroups.map(g => {
        if (g.day.toLowerCase().includes(activeEditDay.toLowerCase())) {
          return { ...g, leader: sanitizeInput(newLeader, 50) };
        }
        return g;
      })
    }));
  };

  const handleAddPiketMember = (e) => {
    if (e) e.preventDefault();
    const cleanName = sanitizeInput(newMemberName, 50);
    if (!cleanName) return;

    setFormData(prev => ({
      ...prev,
      piketGroups: prev.piketGroups.map(g => {
        if (g.day.toLowerCase().includes(activeEditDay.toLowerCase())) {
          if (g.members.includes(cleanName)) return g;
          return { ...g, members: [...g.members, cleanName] };
        }
        return g;
      })
    }));
    setNewMemberName('');
  };

  const handleRemovePiketMember = (memberToRemove) => {
    setFormData(prev => ({
      ...prev,
      piketGroups: prev.piketGroups.map(g => {
        if (g.day.toLowerCase().includes(activeEditDay.toLowerCase())) {
          return { ...g, members: g.members.filter(m => m !== memberToRemove) };
        }
        return g;
      })
    }));
  };

  // Cadre Helpers
  const handleAddCadre = (e) => {
    if (e) e.preventDefault();
    const cleanName = sanitizeInput(newCadreName, 50);
    const cleanRole = sanitizeInput(newCadreRole, 50);
    if (!cleanName) return;

    setFormData(prev => ({
      ...prev,
      cadres: [
        ...prev.cadres,
        {
          name: cleanName,
          role: cleanRole || 'Kader Lingkungan',
          badge: 'Kader'
        }
      ]
    }));
    setNewCadreName('');
    setNewCadreRole('');
  };

  const handleRemoveCadre = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      cadres: prev.cadres.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Save changes handler
  const handleSaveSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setSaveErrorMsg(null);

    const cleanHomeroom = sanitizeInput(formData.homeroomTeacher, 50);
    const cleanSubject = sanitizeInput(formData.teacherSubject, 60);
    const cleanLeader = sanitizeInput(formData.classLeader, 50);
    const cleanMotto = sanitizeInput(formData.motto, 160);

    if (!cleanHomeroom) {
      setSaveErrorMsg('Nama Wali Kelas tidak boleh kosong (maksimal 50 karakter)!');
      return;
    }
    if (!cleanLeader) {
      setSaveErrorMsg('Nama Ketua Kelas tidak boleh kosong (maksimal 50 karakter)!');
      return;
    }

    const studentsVal = validateNumericInput(formData.totalStudents, {
      min: 10,
      max: 50,
      fieldName: 'Total Siswa'
    });
    if (!studentsVal.isValid) {
      setSaveErrorMsg(studentsVal.error);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);

    try {
      if (onSaveProfile) {
        await onSaveProfile(currentClass, {
          homeroomTeacher: cleanHomeroom,
          wali_kelas: cleanHomeroom,
          teacherSubject: cleanSubject || 'Guru IPA & Pembina Adiwiyata',
          classLeader: cleanLeader,
          ketua_kelas: cleanLeader,
          totalStudents: studentsVal.value,
          total_siswa: studentsVal.value,
          motto: cleanMotto || 'Bersih, Hijau, dan Berprestasi!',
          slogan_kelas: cleanMotto || 'Bersih, Hijau, dan Berprestasi!',
          piketGroups: formData.piketGroups,
          cadres: formData.cadres
        });
      }

      setSaveSuccessMsg(`✅ Profil & Tim Piket ${currentClass} berhasil diperbarui!`);
      setIsEditing(false);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      setSaveErrorMsg('Gagal menyimpan profil: ' + err.message);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] w-screen h-screen h-[100dvh] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-[#B2DFDB] rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-800 max-h-[88vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-10"
          aria-label="Tutup profil kelas"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-pop">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {saveErrorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-pop">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        {/* Header Profile Card with Soft Teal Gradient */}
        <div className="bg-gradient-to-br from-[#E0F7FA]/90 via-[#E8F5E9]/60 to-[#FFF9C4]/40 p-5 rounded-2xl border border-[#B2DFDB] relative overflow-hidden space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#80CBC4] flex items-center justify-center text-3xl shadow-sm shrink-0">
                {classStats?.avatar || '🌱'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-slate-800">{baseProfile.name || currentClass}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full font-black text-xs border shadow-xs ${
                    championshipStatus.isNeutral
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : championshipStatus.theme === 'gold'
                      ? 'bg-gradient-to-t from-yellow-400 to-yellow-200 text-amber-950 border-yellow-300'
                      : 'bg-teal-50 text-teal-900 border-teal-300'
                  }`}>
                    {championshipStatus.badgeText}
                  </span>
                  {isGuru && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-extrabold text-[10px] border border-orange-200">
                      👨‍🏫 Mode Pembina
                    </span>
                  )}
                  {isSuperadmin && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[10px] border border-purple-200">
                      🛡️ Superadmin
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-[#2E7D32]">
                  {baseProfile.sloganBadge || 'Kader Adiwiyata Unggulan'}
                </p>
                <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1.5 mt-0.5">
                  <span>{championshipStatus.subText}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[#2E7D32]">{(classStats.points || 0).toLocaleString('id-ID')} Poin</span>
                </p>
              </div>
            </div>

            {/* Edit Profile CTA Button (Only when canEdit is true) */}
            {canEdit && !isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                id="btn-edit-profil-kelas"
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white font-extrabold text-xs flex items-center gap-2 shadow-orange transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profil</span>
              </button>
            ) : !canEdit ? (
              <div className="px-2.5 py-1 rounded-xl bg-white/80 border border-slate-200 text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Hanya Baca</span>
              </div>
            ) : null}
          </div>

          {/* Slogan / Motto Kelas Adiwiyata */}
          {!isEditing && (
            <div className="p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-[#B2DFDB] text-xs">
              <span className="font-extrabold text-[#2E7D32] block mb-0.5">Slogan & Motto Kelas:</span>
              <p className="italic font-bold text-slate-700">
                "{baseProfile.motto || baseProfile.slogan_kelas}"
              </p>
            </div>
          )}
        </div>

        {/* ========================================================
            MODE EDIT FORM: TAMPIL JIKA isEditing === true
            ======================================================== */}
        {isEditing ? (
          <form onSubmit={handleSaveSubmit} className="my-4 space-y-4 animate-pop">
            
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>✏️</span>
                <span>Mode Edit Profil Kelas Aktif ({currentClass})</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-200/80 rounded-md">
                {isSuperadmin ? 'Superadmin Access' : 'Akses Kader Kelas'}
              </span>
            </div>

            {/* 1. Nama Wali Kelas & Mata Pelajaran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Wali Kelas:
                </label>
                <input
                  type="text"
                  value={formData.homeroomTeacher}
                  onChange={(e) => setFormData(prev => ({ ...prev, homeroomTeacher: e.target.value }))}
                  placeholder="Contoh: Bpk. Ahmad Fauzi, S.Pd"
                  className="w-full bg-[#F8FAFC] border border-teal-100 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-colors shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mata Pelajaran / Tugas:
                </label>
                <input
                  type="text"
                  value={formData.teacherSubject}
                  onChange={(e) => setFormData(prev => ({ ...prev, teacherSubject: e.target.value }))}
                  placeholder="Contoh: Guru IPA & Pembina Adiwiyata"
                  className="w-full bg-[#F8FAFC] border border-teal-100 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-colors shadow-xs"
                />
              </div>
            </div>

            {/* 2. Nama Ketua Kelas & Total Siswa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Ketua Kelas:
                </label>
                <input
                  type="text"
                  value={formData.classLeader}
                  onChange={(e) => setFormData(prev => ({ ...prev, classLeader: e.target.value }))}
                  placeholder="Contoh: Farhan Pratama"
                  className="w-full bg-[#F8FAFC] border border-teal-100 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-colors shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jumlah Total Siswa:
                </label>
                <input
                  type="number"
                  min={10}
                  max={50}
                  value={formData.totalStudents}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalStudents: e.target.value }))}
                  placeholder="Contoh: 32"
                  className="w-full bg-[#F8FAFC] border border-teal-100 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-colors shadow-xs"
                />
              </div>
            </div>

            {/* 3. Slogan / Motto Adiwiyata Kelas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Slogan / Motto Adiwiyata Kelas:
              </label>
              <input
                type="text"
                value={formData.motto}
                onChange={(e) => setFormData(prev => ({ ...prev, motto: e.target.value }))}
                placeholder="Contoh: 8A Bersih, Hijau, Berprestasi dan Juara!"
                className="w-full bg-[#F8FAFC] border border-teal-100 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-colors shadow-xs"
              />
            </div>

            {/* 4. Manajemen Tim Piket Kelas (Senin - Jumat) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🧹</span>
                  <span>Kelola Tim Piket Harian</span>
                </span>
                <span className="text-[11px] font-bold text-[#2E7D32]">
                  Pilih Hari untuk Mengedit Anggota
                </span>
              </div>

              {/* Day Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((day) => {
                  const isActive = activeEditDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveEditDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#2E7D32] text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Active Day Group Editor */}
              {currentPiketGroup && (
                <div className="p-3.5 bg-white border border-teal-100 rounded-xl space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Ketua / Koordinator Piket Hari {activeEditDay}:
                    </label>
                    <input
                      type="text"
                      value={currentPiketGroup.leader || ''}
                      onChange={(e) => handleUpdatePiketLeader(e.target.value)}
                      placeholder={`Nama ketua piket hari ${activeEditDay}`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#2E7D32]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                      Anggota Tim Piket ({currentPiketGroup.members?.length || 0} Siswa):
                    </label>

                    {/* Member chips with delete button */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {currentPiketGroup.members?.map((member, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E0F7FA] text-[#00695C] border border-[#B2DFDB] text-xs font-bold animate-pop"
                        >
                          <span>{member}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePiketMember(member)}
                            className="hover:text-red-600 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-white"
                            title="Hapus siswa"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {(!currentPiketGroup.members || currentPiketGroup.members.length === 0) && (
                        <span className="text-xs text-slate-400 italic">Belum ada anggota piket untuk hari ini.</span>
                      )}
                    </div>

                    {/* Add member input & button */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPiketMember();
                          }
                        }}
                        placeholder={`Tambah nama siswa ke piket ${activeEditDay}...`}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#2E7D32]"
                      />
                      <button
                        type="button"
                        onClick={handleAddPiketMember}
                        className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Kelola Kader Lingkungan Kelas */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🌿</span>
                <span>Kader Lingkungan Inti ({formData.cadres?.length || 0})</span>
              </span>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {formData.cadres?.map((cadre, idx) => (
                  <div key={idx} className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{cadre.name}</span>
                      <span className="text-slate-500 text-[11px]">{cadre.role}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCadre(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Hapus kader"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Cadre Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  value={newCadreName}
                  onChange={(e) => setNewCadreName(e.target.value)}
                  placeholder="Nama kader baru..."
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#2E7D32]"
                />
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newCadreRole}
                    onChange={(e) => setNewCadreRole(e.target.value)}
                    placeholder="Jabatan / Pokja..."
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#2E7D32]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCadre}
                    className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions for Edit Mode */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="submit"
                id="btn-save-class-profile"
                disabled={isSubmitting}
                className={`flex-1 py-3 px-4 rounded-xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  isSubmitting
                    ? 'bg-slate-400 cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] shadow-orange active:scale-95 cursor-pointer'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSaveErrorMsg(null);
                }}
                className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>

          </form>
        ) : (
          /* ========================================================
             MODE TAMPIL NORMAL (READ-ONLY / VIEW MODE)
             ======================================================== */
          <>
            {/* Wali Kelas, Ketua Kelas & Total Siswa Grid (100% Horizontally Aligned) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch my-4">
              
              {/* 1. Wali Kelas */}
              <div className="flex flex-col items-center justify-start text-center p-5 h-full bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 shrink-0 border border-teal-100/80 bg-teal-50/40 shadow-2xs">
                  {baseProfile.teacherAvatar || '👩‍🏫'}
                </div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Wali Kelas
                </span>
                <div className="flex-1 flex items-center justify-center my-1 px-1">
                  <span className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                    {baseProfile.homeroomTeacher || baseProfile.wali_kelas}
                  </span>
                </div>
                <div className="mt-auto pt-3 w-full">
                  <div className="w-full py-2 px-3 rounded-xl bg-teal-50/80 border border-teal-200/60 text-teal-800 text-xs font-semibold flex items-center justify-center min-h-[44px] leading-tight text-center">
                    {baseProfile.teacherSubject || 'Guru IPA & Pembina Adiwiyata'}
                  </div>
                </div>
              </div>

              {/* 2. Ketua Kelas */}
              <div className="flex flex-col items-center justify-start text-center p-5 h-full bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 shrink-0 border border-teal-100/80 bg-teal-50/40 shadow-2xs">
                  {baseProfile.leaderAvatar || '👦'}
                </div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Ketua Kelas
                </span>
                <div className="flex-1 flex items-center justify-center my-1 px-1">
                  <span className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                    {baseProfile.classLeader || baseProfile.ketua_kelas}
                  </span>
                </div>
                <div className="mt-auto pt-3 w-full">
                  <div className="w-full py-2 px-3 rounded-xl bg-teal-50/80 border border-teal-200/60 text-teal-800 text-xs font-semibold flex items-center justify-center min-h-[44px] leading-tight text-center">
                    Koordinator Piket
                  </div>
                </div>
              </div>

              {/* 3. Total Siswa */}
              <div className="flex flex-col items-center justify-start text-center p-5 h-full bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 shrink-0 border border-teal-100/80 bg-teal-50/40 shadow-2xs">
                  👥
                </div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Total Siswa
                </span>
                <div className="flex-1 flex items-center justify-center my-1 px-1">
                  <span className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                    {baseProfile.totalStudents || baseProfile.total_siswa} Siswa
                  </span>
                </div>
                <div className="mt-auto pt-3 w-full">
                  <div className="w-full py-2 px-3 rounded-xl bg-teal-50/80 border border-teal-200/60 text-teal-800 text-xs font-semibold flex items-center justify-center min-h-[44px] leading-tight text-center">
                    100% Aktif Kader
                  </div>
                </div>
              </div>

            </div>

            {/* 3 Metrik Pencapaian Kelas */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-[#E0F7FA]/40 rounded-xl border border-[#B2DFDB] text-center mb-4">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Poin Adiwiyata</span>
                <span className="text-base sm:text-lg font-black text-[#2E7D32]">
                  {classStats.points?.toLocaleString('id-ID')} pts
                </span>
              </div>
              <div className="border-x border-[#B2DFDB]/80 px-1">
                <span className="text-xs text-slate-500 font-medium block">Sampah Terkumpul</span>
                <span className="text-base sm:text-lg font-black text-slate-800">
                  {classStats.totalKg} kg
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Skor Kebersihan</span>
                <span className="text-base sm:text-lg font-black text-[#2E7D32]">
                  {classStats.cleanScore || 96}/100
                </span>
              </div>
            </div>

            {/* Segmented Tabs: Jadwal Piket vs Kader Kelas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setProfileTab('piket')}
                  className={`flex-1 py-2 rounded-lg font-black text-xs transition-all cursor-pointer ${
                    profileTab === 'piket'
                      ? 'bg-white text-[#2E7D32] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🧹 Jadwal Kelompok Piket
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTab('kader')}
                  className={`flex-1 py-2 rounded-lg font-black text-xs transition-all cursor-pointer ${
                    profileTab === 'kader'
                      ? 'bg-white text-[#2E7D32] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🌿 Kader Lingkungan Kelas
                </button>
              </div>

              {/* Tab 1: Jadwal Piket */}
              {profileTab === 'piket' && (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {baseProfile.piketGroups?.map((group) => (
                    <div key={group.day} className="p-3 rounded-xl bg-slate-50 border border-slate-150 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                          <span>Hari {group.day}</span>
                        </span>
                        <span className="text-xs font-bold text-[#FF9800]">
                          Ketua: {group.leader || 'Koordinator Tim'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {group.members?.map((m, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-xs font-medium">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Kader Lingkungan */}
              {profileTab === 'kader' && (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {baseProfile.cadres?.map((cadre, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#E0F2F1] text-[#2E7D32] flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 block">{cadre.name}</span>
                          <span className="text-slate-500">{cadre.role}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] font-black text-xs">
                        {cadre.badge || 'Kader'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 mt-4 border-t border-slate-150 space-y-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSwitchAccount) onSwitchAccount();
                    else if (onOpenLogin) onOpenLogin();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white font-black text-xs flex items-center justify-center gap-2 shadow-orange transition-all active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Ganti Akun / Masuk Kelas Lain</span>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors cursor-pointer border border-red-200"
                    title="Keluar dari sesi saat ini"
                  >
                    Keluar
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>,
    document.body
  );
}
