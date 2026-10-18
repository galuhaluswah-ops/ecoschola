import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { sanitizeInput, validateNumericInput } from '../utils/security';

const PRESET_EMOJIS = ['🧹', '💡', '🧴', '🪴', '🍂', '🚰', '🍱', '🔌', '✨', '🐜', '🍃', '📚', '🪟', '📢', '🎒', '🍽️'];
const PRESET_POINTS = [20, 25, 30, 35, 40, 45, 50, 60];

export default function ManageMissionsModal({
  isOpen,
  onClose,
  activeDayIndex,
  dayPackage,
  onAddMission,
  onUpdateMission,
  onDeleteMission,
  onResetDayPackage
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPoints, setNewPoints] = useState(35);
  const [newIcon, setNewIcon] = useState('🌱');
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPoints, setEditPoints] = useState(35);
  const [editIcon, setEditIcon] = useState('🌱');

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

  const missions = dayPackage?.missions || [];

  const handleStartEdit = (m) => {
    setEditingId(m.id);
    setEditTitle(m.title);
    setEditDesc(m.desc);
    setEditPoints(m.points);
    setEditIcon(m.icon || '🌱');
  };

  const handleSaveEdit = (missionId) => {
    const cleanTitle = sanitizeInput(editTitle, 50);
    const cleanDesc = sanitizeInput(editDesc, 160);
    if (!cleanTitle) return;
    const ptsValidation = validateNumericInput(editPoints, { min: 5, max: 200, fieldName: 'Poin Misi' });

    if (onUpdateMission) {
      onUpdateMission(activeDayIndex, missionId, {
        title: cleanTitle,
        desc: cleanDesc || 'Misi lingkungan khusus dari Pembina Adiwiyata',
        points: ptsValidation.isValid ? ptsValidation.value : 35,
        icon: editIcon
      });
    }
    setEditingId(null);
    setSuccessToast('Misi berhasil diperbarui! ✨');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleCreateMission = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanTitle = sanitizeInput(newTitle, 50);
    const cleanDesc = sanitizeInput(newDesc, 160);

    if (!cleanTitle) {
      setErrorMsg('Harap masukkan judul misi (maksimal 50 karakter)!');
      return;
    }

    const ptsValidation = validateNumericInput(newPoints, { min: 5, max: 200, fieldName: 'Poin Misi' });
    if (!ptsValidation.isValid) {
      setErrorMsg(ptsValidation.error);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);

    if (onAddMission) {
      onAddMission(activeDayIndex, {
        title: cleanTitle,
        desc: cleanDesc || 'Misi lingkungan khusus dari Pembina Adiwiyata',
        points: ptsValidation.value,
        icon: newIcon
      });
    }

    setNewTitle('');
    setNewDesc('');
    setNewPoints(35);
    setNewIcon('🌱');
    setErrorMsg('');
    setActiveTab('list');
    setSuccessToast('Misi baru berhasil ditambahkan! 🎉');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleDelete = (missionId) => {
    if (missions.length <= 1) {
      alert('Minimal harus ada 1 misi untuk hari ini!');
      return;
    }
    if (window.confirm('Hapus misi ini dari daftar hari ini?')) {
      if (onDeleteMission) onDeleteMission(activeDayIndex, missionId);
      setSuccessToast('Misi berhasil dihapus');
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm(`Kembalikan seluruh misi hari ${dayPackage?.dayName} ke paket standar default?`)) {
      if (onResetDayPackage) onResetDayPackage(activeDayIndex);
      setEditingId(null);
      setSuccessToast(`Misi ${dayPackage?.dayName} dikembalikan ke default! 🔄`);
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] w-screen h-screen h-[100dvh] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-[#B2DFDB] rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-800 max-h-[88vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-10"
          aria-label="Tutup modal kelola misi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pb-3 border-b border-slate-100 space-y-1 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-200 text-xs font-black">
            <span>👨‍🏫 Akses Guru / Pembina Adiwiyata</span>
          </div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span>{dayPackage?.icon}</span>
            <span>Kelola Misi — Hari {dayPackage?.dayName}</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Tema: <strong className="text-[#2E7D32] font-black">{dayPackage?.theme}</strong>
          </p>
        </div>

        {/* Success / Error Notification */}
        {successToast && (
          <div className="mt-3 p-3 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] text-xs font-bold text-[#2E7D32] flex items-center gap-2 animate-pop">
            <span>✨</span>
            <span>{successToast}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2 animate-pop">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Segmented Tabs (Daftar Misi vs Tambah Misi) */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 mt-4 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-white text-[#2E7D32] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📋 Daftar Misi Aktif ({missions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-white text-[#FF9800] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Misi Kustom</span>
          </button>
        </div>

        {/* TAB 1: DAFTAR MISI HARI INI */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {missions.map((m) => {
                const isEditing = editingId === m.id;

                if (isEditing) {
                  return (
                    <div key={m.id} className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editIcon}
                          onChange={(e) => setEditIcon(e.target.value)}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-center text-xl shrink-0"
                          maxLength={3}
                        />
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Judul misi..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Deskripsi singkat misi..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-medium"
                      />
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <span>Bobot Poin:</span>
                          <select
                            value={editPoints}
                            onChange={(e) => setEditPoints(Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-[#2E7D32]"
                          >
                            {PRESET_POINTS.map(p => (
                              <option key={p} value={p}>+{p} Pts</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(m.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Simpan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-center justify-between gap-3 group hover:border-[#80CBC4] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-xs">
                        {m.icon || '🌱'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate">
                          {m.title}
                        </span>
                        <span className="text-xs text-slate-500 block truncate">
                          {m.desc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-xl bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-xs font-black">
                        +{m.points} Pts
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(m)}
                        className="p-2 rounded-xl bg-white hover:bg-orange-50 text-slate-500 hover:text-orange-600 border border-slate-200 transition-colors cursor-pointer"
                        title="Edit misi ini"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        className="p-2 rounded-xl bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
                        title="Hapus misi ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={handleReset}
                className="text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 font-bold cursor-pointer"
                title="Kembalikan paket misi ke bawaan kurikulum Adiwiyata"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Misi {dayPackage?.dayName} ke Standar</span>
              </button>
              <span className="text-slate-400 font-medium">
                {missions.length} misi aktif
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: FORM TAMBAH MISI KUSTOM BARU */}
        {activeTab === 'add' && (
          <form onSubmit={handleCreateMission} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pilih Emoji Ikon Misi:
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewIcon(emoji)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all cursor-pointer ${
                      newIcon === emoji 
                        ? 'bg-[#E8F5E9] border-[#2E7D32] scale-110 shadow-xs' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Judul Misi Lingkungan *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Contoh: Operasi Bersih Wastafel Selasar"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-800 focus:outline-none focus:border-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Deskripsi Singkat / Arahan Siswa
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Contoh: Pastikan saluran wastafel bebas sampah daun dan sabun tersedia"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-700 focus:outline-none focus:border-[#2E7D32]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Bobot Nilai Poin Adiwiyata:
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_POINTS.map(pts => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setNewPoints(pts)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      newPoints === pts 
                        ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-xs' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    +{pts} Pts
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3 text-white font-black text-xs rounded-xl shadow-orange transition-all flex items-center justify-center gap-1.5 ${
                  isSubmitting
                    ? 'bg-slate-400 cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] cursor-pointer'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Menambahkan...' : `Tambahkan ke Hari ${dayPackage?.dayName}`}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* Modal Actions */}
        <div className="pt-4 mt-4 border-t border-slate-150 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
