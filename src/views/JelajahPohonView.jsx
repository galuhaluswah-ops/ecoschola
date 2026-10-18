import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  TreePine, 
  Search, 
  QrCode, 
  Plus, 
  X, 
  Printer, 
  Leaf, 
  Heart, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Share2,
  Droplets,
  Sun,
  Wind,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Check,
  Calendar,
  Eye,
  AlertCircle,
  Camera
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CustomDropdown from '../components/CustomDropdown';
import { SMP_CLASSES } from '../data/mockData';
import { sanitizeInput, validateNumericInput } from '../utils/security';

// 4 Preset Thumbnail Foto Tanaman Populer (Opsi B)
const SAMPLE_PLANT_PHOTOS = [
  {
    name: 'Trembesi Rindang',
    tag: 'Peneduh Lapangan',
    url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Pucuk Merah',
    tag: 'Penyerap Polutan',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Lidah Mertua',
    tag: 'Indoor & Radiasi',
    url: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Lidah Buaya (TOGA)',
    tag: 'Apotek Hidup',
    url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80'
  }
];

export default function JelajahPohonView({ 
  plantList = [], 
  setPlantList, 
  setCarbonStats, 
  onAddRecentActivity,
  userSession,
  myClass,
  setLeaderboard
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeQrModal, setActiveQrModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlantForDetail, setSelectedPlantForDetail] = useState(null);

  // New Plant Form State
  const [newName, setNewName] = useState('');
  const [newScientific, setNewScientific] = useState('');
  const [newCategory, setNewCategory] = useState('Pohon Pelindung');
  const [newClass, setNewClass] = useState(myClass || userSession?.className || 'Kelas 8A');
  const [newLocation, setNewLocation] = useState('Halaman Depan');
  const [newAbsorption, setNewAbsorption] = useState('15');
  const [newNotes, setNewNotes] = useState('');
  
  // Photo Upload & Preset States
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'sample'
  const [newPhoto, setNewPhoto] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isSubmittingPlant, setIsSubmittingPlant] = useState(false);
  const [isWateringPlant, setIsWateringPlant] = useState(false);
  const fileInputRef = useRef(null);

  const [toastMsg, setToastMsg] = useState(null);

  // Body Scroll Lock when any modal is open
  useEffect(() => {
    if (showAddModal || activeQrModal || selectedPlantForDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddModal, activeQrModal, selectedPlantForDetail]);

  const categories = useMemo(() => ['Semua', 'Pohon Pelindung', 'TOGA', 'Penyerap Radiasi Indoor'], []);

  // Filter Plants with useMemo for high performance
  const filteredPlants = useMemo(() => {
    return plantList.filter(plant => {
      const matchesSearch = 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.responsibleClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plant.location && plant.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = 
        selectedCategory === 'Semua' || plant.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [plantList, searchTerm, selectedCategory]);

  // Compress Image File to Lightweight Base64 (max dimension 480px, JPEG quality 0.65 ~25-40KB)
  const compressImageFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        return reject(new Error('Format file harus berupa gambar (JPG, PNG, atau WebP).'));
      }
      if (file.size > 5 * 1024 * 1024) {
        return reject(new Error('Ukuran file maksimal 5MB.'));
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Gagal memproses gambar.'));
        img.onload = () => {
          const maxDim = 480;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to lightweight JPEG quality 0.65 (approx 25-40KB) to prevent QuotaExceededError
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
          resolve(compressedBase64);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const compressed = await compressImageFile(file);
      setNewPhoto(compressed);
    } catch (err) {
      setUploadError(err.message || 'Gagal memproses foto gambar.');
    } finally {
      setUploading(false);
    }
  };

  // Handle Add Plant with real-time sync to carbonStats and live activities
  const handleAddPlant = (e) => {
    e.preventDefault();
    if (isSubmittingPlant) return;

    const cleanName = sanitizeInput(newName, 50);
    if (!cleanName) {
      setUploadError('Nama tanaman wajib diisi (maksimal 50 karakter).');
      return;
    }

    const absValidation = validateNumericInput(newAbsorption, {
      min: 0.1,
      max: 200,
      fieldName: 'Daya Serap Karbon'
    });
    if (!absValidation.isValid) {
      setUploadError(absValidation.error);
      return;
    }

    setIsSubmittingPlant(true);
    setTimeout(() => {
      setIsSubmittingPlant(false);
    }, 1500);

    const cleanScientific = sanitizeInput(newScientific, 60);
    const cleanLocation = sanitizeInput(newLocation, 60);
    const cleanNotes = sanitizeInput(newNotes, 160);
    const absorptionVal = absValidation.value;
    const newId = `PLN-0${plantList.length + 1}`;
    
    // Default eco-friendly description if empty
    const defaultDescriptions = {
      'Pohon Pelindung': 'Pohon peneduh rindang penyejuk suhu mikro sekolah dengan kanopi daun lebat yang aktif menyerap karbon.',
      'TOGA': 'Tanaman obat keluarga bernilai edukasi siswa, menjaga kebugaran warga sekolah dan bahan apotek hidup alami.',
      'Penyerap Radiasi Indoor': 'Tanaman pembersih udara yang efektif menyaring partikel polutan dan menghasilkan oksigen bersih.'
    };
    const finalNotes = cleanNotes || defaultDescriptions[newCategory] || 'Koleksi flora Adiwiyata sekolah yang dirawat rutin untuk mendukung pelestarian lingkungan.';
    const finalPhoto = newPhoto || SAMPLE_PLANT_PHOTOS[0].url;

    const newPlantObj = {
      id: newId,
      name: cleanName,
      scientificName: cleanScientific || cleanName,
      category: newCategory,
      responsibleClass: newClass,
      co2AbsorptionKgPerYear: absorptionVal,
      location: cleanLocation || 'Halaman Sekolah',
      totalQuantity: 1,
      healthStatus: 'Sangat Sehat',
      waterStatus: 'Sudah Disiram 🌿',
      lastWatered: 'Hari ini, baru didata',
      notes: finalNotes,
      tags: [newCategory, 'Koleksi Baru', 'Adiwiyata'],
      image: finalPhoto,
      qrCodeId: `ECO-${cleanName.toUpperCase().replace(/\s+/g, '')}-00${plantList.length + 1}`
    };

    setPlantList([newPlantObj, ...plantList]);
    setShowAddModal(false);

    // Sync Pohon Terdata to Carbon Stats & Beranda
    if (setCarbonStats) {
      setCarbonStats(prev => ({
        ...prev,
        treesCataloged: (prev?.treesCataloged || plantList.length) + 1,
        totalCo2AbsorptionKgPerYear: (prev?.totalCo2AbsorptionKgPerYear || 5240) + absorptionVal
      }));
    }

    // Sync to Live Recent Activities feed
    if (onAddRecentActivity) {
      onAddRecentActivity({
        id: `ACT-${Date.now()}`,
        time: 'Baru saja',
        icon: 'tree',
        title: `Pohon Baru: ${cleanName}`,
        actor: `${newClass} (Kader Siswa)`,
        description: `Menambahkan koleksi tanaman "${cleanName}" (${cleanScientific || cleanName}) di ${cleanLocation || 'Halaman Sekolah'}.`,
        category: 'Jelajah Pohon',
        impact: `+${absorptionVal} kg CO₂/thn`,
        status: 'Selesai'
      });
    }

    setToastMsg(`Yey! Tanaman "${cleanName}" berhasil ditambahkan ke katalog sekolah! 🌱`);
    setTimeout(() => setToastMsg(null), 4000);

    // Reset Form
    setNewName('');
    setNewScientific('');
    setNewNotes('');
    setNewPhoto('');
    setNewLocation('Halaman Depan');
    setNewAbsorption('15');
    setUploadError(null);
  };

  // Handle Water Plant (Catat Sudah Disiram Hari Ini +15 Poin)
  const handleWaterPlant = (plant) => {
    if (!plant || isWateringPlant) return;

    setIsWateringPlant(true);
    setTimeout(() => {
      setIsWateringPlant(false);
    }, 1500);

    const nowTimeStr = `Hari ini, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

    // 1. Update status in plantList
    const updatedPlants = plantList.map(p => {
      if (p.id === plant.id) {
        return {
          ...p,
          waterStatus: 'Sudah Disiram 🌿',
          lastWatered: nowTimeStr
        };
      }
      return p;
    });
    setPlantList(updatedPlants);

    // 2. Update active detail modal object so the badge turns green immediately
    setSelectedPlantForDetail(prev => prev ? {
      ...prev,
      waterStatus: 'Sudah Disiram 🌿',
      lastWatered: nowTimeStr
    } : null);

    // 3. Award +15 Points to the adopting class in Leaderboard
    if (setLeaderboard) {
      setLeaderboard(prev => prev.map(cls => {
        if (cls.name === plant.responsibleClass) {
          return {
            ...cls,
            points: (cls.points || 0) + 15
          };
        }
        return cls;
      }));
    }

    // 4. Add to recent activities
    if (onAddRecentActivity) {
      onAddRecentActivity({
        id: `ACT-${Date.now()}`,
        time: 'Baru saja',
        icon: 'droplet',
        title: `Siram Tanaman: ${plant.name}`,
        actor: `${userSession?.className || plant.responsibleClass} (Kader Siswa)`,
        description: `Melakukan penyiraman tanaman "${plant.name}" di ${plant.location || 'sekolah'}.`,
        category: 'Asuh Tanaman',
        impact: '+15 Poin Kelas',
        status: 'Selesai'
      });
    }

    setToastMsg(`Alhamdulillah! Tanaman "${plant.name}" telah disiram. +15 Poin untuk ${plant.responsibleClass}! 💧🌿`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-6 pb-20 animate-pop">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#E0F7FA]/90 via-white to-[#B2DFDB]/70 p-6 sm:p-7 rounded-2xl border border-[#80CBC4]/60 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#80CBC4] text-xs font-bold text-[#2E7D32] mb-2 shadow-xs">
            <span>🌿</span>
            <span>Koleksi Flora Sekolah & Identitas QR Plakat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Jelajah Pohon & Tanaman 🌳
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            Kenali nama lokal, nama latin, dan cetak plakat QR Code unik untuk ditempel di pohon dan tanaman asuh kelasmu. Klik kartu pohon untuk melihat info detail & mencatat penyiraman!
          </p>
        </div>

        {/* CTA Tambah Tanaman: Oranye Tropis */}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-3 bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-orange transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tanaman Baru</span>
        </button>
      </div>

      {/* Success Notification Toast */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-slate-800 font-bold text-xs flex items-center gap-3 shadow-md animate-pop">
          <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
          <span className="flex-1">{toastMsg}</span>
        </div>
      )}

      {/* Search Bar & Category Filter Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama pohon, nama latin, atau kelas penanggung jawab..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2E7D32]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#2E7D32] to-[#388E3C] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-[#E0F7FA] text-slate-600'
              }`}
            >
              {cat === 'Pohon Pelindung' ? '🌳 Peneduh' : cat === 'TOGA' ? '🪴 TOGA' : cat === 'Penyerap Radiasi Indoor' ? '🍃 Penyerap Polusi' : '🌿 Semua'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Kartu Tanaman Bergaya Interaktif & Polaroid */}
      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlants.map(plant => {
          const isWatered = !(plant.waterStatus || '').includes('Perlu');
          return (
            <div 
              key={plant.id}
              onClick={() => setSelectedPlantForDetail(plant)}
              className="bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Photo Card with Category Badge */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img 
                    src={plant.image} 
                    alt={plant.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  
                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-black text-slate-800 shadow-sm border border-slate-200/60">
                      {plant.category === 'Pohon Pelindung' ? '🌳 Peneduh' : plant.category === 'TOGA' ? '🪴 Apotek Hidup' : '🍃 Penyerap Polusi'}
                    </span>
                  </div>

                  {/* Total Quantity Tag */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/70 backdrop-blur-md text-white text-xs font-extrabold shadow-sm">
                      {plant.totalQuantity || 1} Pohon
                    </span>
                  </div>
                </div>

                {/* Plant Info Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-[#2E7D32] transition-colors">
                      {plant.name}
                    </h3>
                    <p className="text-xs italic text-slate-500 font-medium">
                      {plant.scientificName}
                    </p>
                  </div>

                  {/* Badges for Responsible Class & Location */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="text-sm">🏫</span>
                      <span>Asuh: <strong className="text-slate-800">{plant.responsibleClass}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{plant.location || 'Halaman Sekolah'}</span>
                    </div>
                  </div>

                  {/* Carbon Absorption Highlight Box */}
                  <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Serapan Karbon:</span>
                    <span className="font-black text-[#2E7D32]">
                      {plant.co2AbsorptionKgPerYear} kg CO₂/thn
                    </span>
                  </div>

                  {/* Water Status Chip */}
                  <div className="flex items-center justify-between pt-0.5 text-xs">
                    <span className="text-slate-500 font-medium">Status Air:</span>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isWatered 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {plant.waterStatus || 'Sudah Disiram 🌿'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action: Lihat QR Plakat */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveQrModal(plant);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#E0F7FA] hover:bg-[#B2DFDB] border border-[#80CBC4] text-[#00695C] text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#00695C]" />
                  <span>Lihat QR Plakat Pohon</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-teal-200 shadow-sm space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-3xl shadow-xs">
            🌳
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            {plantList.length === 0 ? "Belum ada tanaman terdata" : "Tanaman tidak ditemukan"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {plantList.length === 0
              ? "🌳 Belum ada tanaman terdata. Klik '+ Tambah Tanaman Baru' untuk mulai mendata flora sekolahmu!"
              : "Coba ubah kata kunci pencarian atau pilih kategori lain."}
          </p>
          {plantList.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] text-white text-xs font-black shadow-orange hover:shadow-none transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Tanaman Baru</span>
            </button>
          )}
        </div>
      )}

      {/* =======================================================
          MODAL DETAIL INFORMASI POHON (REACT PORTAL + VIEWPORT CENTER)
          ======================================================= */}
      {selectedPlantForDetail && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen h-[100dvh] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-teal-100 w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Gambar Besar (Hero Image) */}
            <div className="relative w-full h-56 sm:h-64 bg-slate-900 overflow-hidden shrink-0 group">
              <img 
                src={selectedPlantForDetail.image} 
                alt={selectedPlantForDetail.name} 
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-black/30 pointer-events-none" />

              {/* Top Floating Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap max-w-[80%]">
                <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-black text-slate-800 shadow-sm border border-slate-200/60">
                  {selectedPlantForDetail.category === 'Pohon Pelindung' ? '🌳 Pohon Pelindung' : selectedPlantForDetail.category === 'TOGA' ? '🪴 Apotek Hidup (TOGA)' : '🍃 Penyerap Polutan'}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-mono font-bold text-teal-300 border border-teal-400/30">
                  {selectedPlantForDetail.qrCodeId || `ECO-TREE-${selectedPlantForDetail.id}`}
                </span>
              </div>

              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={() => setSelectedPlantForDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/65 text-white backdrop-blur-md transition-colors cursor-pointer z-10"
                aria-label="Tutup modal detail"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Bottom Row on Hero: Location & Health Status */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                  <span className="font-semibold truncate max-w-[190px] sm:max-w-xs">{selectedPlantForDetail.location || 'Halaman Sekolah'}</span>
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/85 backdrop-blur-md px-2.5 py-1 rounded-xl text-white font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedPlantForDetail.healthStatus || 'Sangat Sehat'}</span>
                </div>
              </div>
            </div>

            {/* Body Form (Scrollable di dalam modal) */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              
              {/* Identitas Tanaman */}
              <div className="space-y-1 pb-1 border-b border-slate-100">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  {selectedPlantForDetail.name}
                </h2>
                <p className="text-xs sm:text-sm font-semibold italic text-teal-700">
                  {selectedPlantForDetail.scientificName}
                </p>
              </div>

              {/* 3 Kotak Metrik Dampak (Grid 3 Kolom Pastel) */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* 1. Serapan Karbon */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-2xl text-center space-y-1">
                  <span className="text-lg sm:text-xl block">💨</span>
                  <div className="font-black text-xs sm:text-sm text-[#2E7D32]">
                    {selectedPlantForDetail.co2AbsorptionKgPerYear || 15} kg
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-500">
                    CO₂ / Tahun
                  </div>
                </div>

                {/* 2. Kelas Pengadopsi */}
                <div className="p-3 bg-teal-50/80 border border-teal-100 rounded-2xl text-center space-y-1">
                  <span className="text-lg sm:text-xl block">🏫</span>
                  <div className="font-black text-xs sm:text-sm text-teal-900 truncate">
                    {selectedPlantForDetail.responsibleClass || 'Kelas 8A'}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-500">
                    Kelas Perawat
                  </div>
                </div>

                {/* 3. Status Perawatan */}
                <div className="p-3 bg-cyan-50/80 border border-cyan-100 rounded-2xl text-center space-y-1">
                  <span className="text-lg sm:text-xl block">💧</span>
                  <div className={`font-black text-[10px] sm:text-[11px] rounded-md px-1.5 py-0.5 inline-block ${
                    (selectedPlantForDetail.waterStatus || 'Sudah Disiram 🌿').includes('Perlu')
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedPlantForDetail.waterStatus || 'Sudah Disiram 🌿'}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-semibold text-slate-500 truncate">
                    {selectedPlantForDetail.lastWatered || 'Hari ini'}
                  </div>
                </div>
              </div>

              {/* Deskripsi & Manfaat Ekologis */}
              <div className="bg-gradient-to-br from-[#E0F7FA]/60 via-[#E8F5E9]/50 to-white p-4 rounded-2xl border border-teal-100/80 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌿</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Manfaat Ekologis & Edukasi Adiwiyata
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedPlantForDetail.notes || selectedPlantForDetail.description || 'Pohon peneduh rindang penyejuk suhu mikro sekolah dengan kanopi daun lebat yang aktif menyerap karbon.'}
                </p>

                {/* Panduan Perawatan Singkat (Water & Sunlight) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-teal-100/60 text-xs">
                  <div className="flex items-start gap-2 bg-white/75 p-2.5 rounded-xl border border-teal-50">
                    <Droplets className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block text-[11px]">Kebutuhan Air:</strong>
                      <span className="text-[11px] text-slate-600">Siram 1x sehari (pagi/sore hari).</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-white/75 p-2.5 rounded-xl border border-teal-50">
                    <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block text-[11px]">Intensitas Cahaya:</strong>
                      <span className="text-[11px] text-slate-600">Sinar matahari pagi / terbuka.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Modal (Sticky di bawah) */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row gap-2.5 shrink-0">
              {/* Tombol 1: Siram Pohon (+15 Poin) */}
              <button
                type="button"
                disabled={isWateringPlant}
                onClick={() => handleWaterPlant(selectedPlantForDetail)}
                className={`flex-1 py-3 px-4 rounded-xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all ${
                  isWateringPlant 
                    ? 'bg-slate-400 cursor-not-allowed opacity-80' 
                    : 'bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] active:scale-95 cursor-pointer'
                }`}
              >
                <Droplets className="w-4 h-4 text-cyan-200" />
                <span>{isWateringPlant ? 'Mencatat Siram...' : '💧 Catat Sudah Disiram Hari Ini (+15 Poin)'}</span>
              </button>

              {/* Tombol 2: Lihat & Cetak Plakat QR */}
              <button
                type="button"
                onClick={() => {
                  const target = selectedPlantForDetail;
                  setSelectedPlantForDetail(null);
                  setActiveQrModal(target);
                }}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-orange transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <QrCode className="w-4 h-4" />
                <span>📱 Cetak Plakat QR</span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* =======================================================
          MODAL POP-UP QR CODE PLAKAT (SIAP CETAK STIKER POHON)
          ======================================================= */}
      {activeQrModal && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen h-[100dvh] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-teal-100 max-w-sm w-full p-6 text-center my-auto animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <button
              onClick={() => setActiveQrModal(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              aria-label="Tutup plakat QR"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Plakat Header */}
            <div className="space-y-1 pt-2">
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold border border-[#C8E6C9]">
                Plakat Edukasi Adiwiyata
              </span>
              <h3 className="text-lg font-black text-slate-800">{activeQrModal.name}</h3>
              <p className="text-xs italic text-slate-500">{activeQrModal.scientificName}</p>
            </div>

            {/* QR Code Container (Crisp & Scannable) */}
            <div className="p-5 bg-[#E8F5E9] rounded-2xl border border-[#C8E6C9] inline-block shadow-inner">
              <QRCodeSVG
                value={`https://ecoschola.sch.id/flora/${activeQrModal.id}`}
                size={170}
                bgColor="#E8F5E9"
                fgColor="#1B5E20"
                level="M"
              />
              <span className="block text-xs font-mono font-bold text-slate-600 mt-2">
                ID: {activeQrModal.qrCodeId}
              </span>
            </div>

            {/* Plakat Details */}
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1 text-left border border-slate-100">
              <div className="flex justify-between">
                <span>Penanggung Jawab:</span>
                <span className="font-bold text-slate-800">{activeQrModal.responsibleClass}</span>
              </div>
              <div className="flex justify-between">
                <span>Lokasi Tanam:</span>
                <span className="font-medium text-slate-800">{activeQrModal.location}</span>
              </div>
              <div className="flex justify-between">
                <span>Serapan Karbon:</span>
                <span className="font-bold text-[#2E7D32]">{activeQrModal.co2AbsorptionKgPerYear} kg CO₂/thn</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:from-[#F57C00] hover:to-[#E65100] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-orange cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Plakat Stiker</span>
              </button>
              <button
                onClick={() => setActiveQrModal(null)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =======================================================
          MODAL TAMBAH KOLEKSI TANAMAN BARU (REACT PORTAL + 3 SECTIONS)
          ======================================================= */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen h-[100dvh] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-teal-100 w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal (Sticky di atas) */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-black text-base sm:text-lg text-slate-800 flex items-center gap-2">
                <span>🌱</span>
                <span>Tambah Tanaman Sekolah</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Wrapper */}
            <form onSubmit={handleAddPlant} className="flex flex-col flex-1 overflow-hidden">
              
              {/* Body Form (Scrollable di dalam modal) */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                
                {/* 1. Nama Lokal Tanaman */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lokal Tanaman *</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Lidah Mertua, Pohon Mangga"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-800 focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>

                {/* 2. Nama Latin / Ilmiah */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Latin (Ilmiah)</label>
                  <input
                    type="text"
                    placeholder="Misal: Sansevieria trifasciata"
                    value={newScientific}
                    onChange={(e) => setNewScientific(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-800 focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>

                {/* 3. Kategori Flora & Kelas Asuh */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori Flora</label>
                    <CustomDropdown
                      value={newCategory}
                      onChange={setNewCategory}
                      options={[
                        'Pohon Pelindung',
                        'TOGA',
                        'Penyerap Radiasi Indoor'
                      ]}
                      placeholder="Pilih Kategori"
                      buttonClassName="py-2.5 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kelas Asuh</label>
                    <CustomDropdown
                      value={newClass}
                      onChange={setNewClass}
                      options={SMP_CLASSES}
                      placeholder="Pilih Kelas Asuh"
                      buttonClassName="py-2.5 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* 4. Lokasi & Serapan Karbon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Lokasi Tanam di Sekolah</label>
                    <input
                      type="text"
                      placeholder="Misal: Samping Musholla, Lapangan Upacara"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-800 focus:outline-none focus:border-[#2E7D32]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estimasi Serapan Karbon (kg/thn)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newAbsorption}
                      onChange={(e) => setNewAbsorption(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-[#2E7D32]"
                    />
                  </div>
                </div>

                {/* 5. Deskripsi & Manfaat Tanaman (Opsional) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Deskripsi & Manfaat Ekologis <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Misal: Pohon peneduh penyejuk lapangan, menyerap debu, atau khasiat herbal..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>

                {/* 6. Foto Tanaman (Opsi A: Upload Kamera/Galeri, Opsi B: Sampel Cepat) */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700">Foto Tanaman</label>
                    {/* Toggle Opsi Upload vs Sampel */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPhotoMode('upload')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-colors cursor-pointer ${
                          photoMode === 'upload' 
                            ? 'bg-white text-[#2E7D32] shadow-xs' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        📁 Unggah File
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoMode('sample')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-colors cursor-pointer ${
                          photoMode === 'sample' 
                            ? 'bg-white text-[#2E7D32] shadow-xs' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        🖼️ Foto Sampel
                      </button>
                    </div>
                  </div>

                  {/* Mode Upload: File Input & Canvas Compression */}
                  {photoMode === 'upload' && (
                    <div>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-teal-200 hover:border-[#2E7D32] bg-teal-50/30 hover:bg-teal-50/60 rounded-2xl p-4 text-center cursor-pointer transition-colors"
                      >
                        <UploadCloud className="w-7 h-7 mx-auto text-[#2E7D32] mb-1.5" />
                        <span className="font-bold text-slate-800 block text-xs">
                          {uploading ? 'Sedang mengompresi gambar...' : 'Klik untuk Pilih Foto dari Kamera HP / Galeri'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Maks 5MB • Otomatis dikompresi ringan via HTML5 Canvas agar hemat memori
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mode Sampel: 4 Foto Pilihan Cepat */}
                  {photoMode === 'sample' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SAMPLE_PLANT_PHOTOS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewPhoto(sample.url)}
                          className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                            newPhoto === sample.url 
                              ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/30 bg-emerald-50' 
                              : 'border-slate-200 bg-white hover:border-teal-300'
                          }`}
                        >
                          <img src={sample.url} alt={sample.name} loading="lazy" decoding="async" className="w-full h-14 object-cover rounded-lg mb-1" />
                          <span className="font-bold text-[10px] text-slate-800 block truncate">{sample.name}</span>
                          <span className="text-[9px] text-slate-500 block truncate">{sample.tag}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Error Upload Alert */}
                  {uploadError && (
                    <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-[11px] font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Preview Foto yang Terpilih */}
                  {newPhoto && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 animate-pop">
                      <img 
                        src={newPhoto} 
                        alt="Pratinjau Foto" 
                        loading="lazy"
                        decoding="async"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#2E7D32]">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Foto Siap Disimpan</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          Kompresi ringan berhasil • Aman di LocalStorage
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewPhoto('')}
                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer shrink-0"
                        title="Hapus / Ganti foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer Modal (Sticky di bawah) */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlant}
                  className={`flex-1 py-3 px-4 font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all text-white ${
                    isSubmittingPlant 
                      ? 'bg-slate-400 cursor-not-allowed opacity-80' 
                      : 'bg-gradient-to-r from-[#2E7D32] to-[#388E3C] hover:from-[#1B5E20] hover:to-[#2E7D32] active:scale-95 cursor-pointer'
                  }`}
                >
                  {isSubmittingPlant ? 'Menyimpan...' : 'Simpan Tanaman'}
                </button>
              </div>
            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
