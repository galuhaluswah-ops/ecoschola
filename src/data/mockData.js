// Mock Data for EcoSchola - Smart Adiwiyata & School Carbon Tracker (SMP Edition)

export const initialSchoolInfo = {
  name: "SMP Negeri 1 Adiwiyata Nusantara",
  npsn: "20108921",
  district: "Semarang, Jawa Tengah",
  status: "Sekolah Adiwiyata Mandiri",
  year: "2026/2027",
  greenScore: 95.2,
  totalStudents: 860,
  totalClasses: 18,
  activeBiopori: 48,
  headmaster: "Drs. Bambang Haryono, M.Pd.",
  ecoCoordinator: "Nurul Aini, S.Pd., M.Si."
};

export const initialCarbonStats = {
  co2ReducedKg: 0,
  co2TargetKg: 3500,
  wasteDivertedKg: 0,
  wasteTargetKg: 2000,
  energyEfficiencyPercent: 100,
  energySavedKwh: 0,
  treesCataloged: 0,
  compostHarvestedKg: 0,
  monthlyReductionPercent: 0,
  treeCO2CapacityPerYear: 0
};

export const dailyMissionsData = [
  { id: "MIS-1", title: "Piket Bersih Kolong Meja", desc: "Pastikan laci dan lantai kelas bebas sampah sebelum bel", points: 50, icon: "🧹", completed: false },
  { id: "MIS-2", title: "Matikan Lampu Saat Istirahat", desc: "Padamkan lampu & kipas saat kelas kosong ke kantin", points: 40, icon: "💡", completed: false },
  { id: "MIS-3", title: "Setor 3 Botol Plastik Bekas", desc: "Kumpulkan botol minum ke Bank Sampah sekolah", points: 35, icon: "🧴", completed: false },
  { id: "MIS-4", title: "Siram Pot Tanaman Kelas", desc: "Beri air untuk Lidah Buaya atau tanaman asuh kelasmu", points: 25, icon: "🪴", completed: false }
];

// Bank Misi Lingkungan Otomatis 7 Hari Bertema
export const dailyMissionsBank = {
  1: { // Senin
    dayName: "Senin",
    theme: "Fokus Kebersihan & Kerapian Kelas",
    tagline: "Awali pekan dengan ruang belajar rapi, bersih, dan harum",
    icon: "🧹",
    color: "#2E7D32",
    missions: [
      { id: "MIS-SENIN-1", title: "Piket Bersih Kolong Meja", desc: "Pastikan laci dan lantai kelas bebas sampah sebelum bel masuk", points: 50, icon: "🧹" },
      { id: "MIS-SENIN-2", title: "Rapikan Sudut Baca & Pojok Hijau", desc: "Tata buku literasi dan rapikan display mading lingkungan kelas", points: 30, icon: "📚" },
      { id: "MIS-SENIN-3", title: "Bersihkan Papan Tulis & Tempat Spidol", desc: "Lap papan tulis hingga bersih dan rapikan penghapus serta spidol", points: 25, icon: "✨" },
      { id: "MIS-SENIN-4", title: "Cek Tempat Sampah Terpilah 3 Warna", desc: "Pastikan bak organik, anorganik, dan residu tidak tercampur", points: 35, icon: "🗑️" }
    ]
  },
  2: { // Selasa
    dayName: "Selasa",
    theme: "Fokus Hemat Energi & Konservasi Air",
    tagline: "Disiplin matikan listrik dan hemat setiap tetes air bersih",
    icon: "💡",
    color: "#F57F17",
    missions: [
      { id: "MIS-SELASA-1", title: "Matikan Lampu Saat Istirahat", desc: "Padamkan lampu & kipas angin saat kelas kosong ke kantin/masjid", points: 40, icon: "💡" },
      { id: "MIS-SELASA-2", title: "Cek Keran Air Wastafel Tidak Menetes", desc: "Pastikan keran air cuci tangan selasar tertutup rapat sempurna", points: 35, icon: "🚰" },
      { id: "MIS-SELASA-3", title: "Cabut Colokan Elektronik Siang Hari", desc: "Cabut kabel proyektor, speaker, dan charger yang tidak terpakai", points: 30, icon: "🔌" },
      { id: "MIS-SELASA-4", title: "Buka Jendela untuk Ventilasi Alami", desc: "Maksimalkan pencahayaan dan angin segar alami tanpa kipas", points: 25, icon: "🪟" }
    ]
  },
  3: { // Rabu
    dayName: "Rabu",
    theme: "Fokus Bank Sampah & Gerakan 3R",
    tagline: "Kurangi timbulan sampah plastik dengan misting dan daur ulang",
    icon: "🧴",
    color: "#00838F",
    missions: [
      { id: "MIS-RABU-1", title: "Setor 3 Botol Plastik Bekas", desc: "Kumpulkan botol minum bersih ke Bank Sampah kelas / sekolah", points: 35, icon: "🧴" },
      { id: "MIS-RABU-2", title: "Bawa Tumbler & Kotak Makan Sendiri", desc: "Bebas sampah plastik sekali pakai saat jajan di kantin sehat", points: 45, icon: "🍱" },
      { id: "MIS-RABU-3", title: "Pilah Kertas & Buku Tulis Rusak", desc: "Kumpulkan kertas ulangan/buku tanpa klip logam ke kardus daur ulang", points: 30, icon: "📦" },
      { id: "MIS-RABU-4", title: "Habiskan Makanan (Zero Food Waste)", desc: "Makan siang tuntas tanpa sisa makanan yang terbuang sia-sia", points: 30, icon: "🍽️" }
    ]
  },
  4: { // Kamis
    dayName: "Kamis",
    theme: "Fokus Asuh Tanaman & Flora Sekolah",
    tagline: "Rawat tanaman asuh kelas dan hijaukan halaman sekolah",
    icon: "🪴",
    color: "#2E7D32",
    missions: [
      { id: "MIS-KAMIS-1", title: "Siram Pot Tanaman Asuh Kelas", desc: "Beri air secukupnya pada tanaman hias dan TOGA di depan kelas", points: 25, icon: "🪴" },
      { id: "MIS-KAMIS-2", title: "Cabut Rumput Liar di Taman Kelas", desc: "Bersihkan gulma di sekitar pot tanaman dan lubang biopori", points: 40, icon: "🌿" },
      { id: "MIS-KAMIS-3", title: "Bersihkan Debu Daun Tanaman Hias", desc: "Lap debu di daun Sansevieria agar fotosintesis & serapan CO₂ maksimal", points: 20, icon: "🍃" },
      { id: "MIS-KAMIS-4", title: "Tabur Kompos Organik pada Pot", desc: "Beri 2 sendok kompos matang hasil olahan komposter sekolah", points: 45, icon: "🌱" }
    ]
  },
  5: { // Jumat
    dayName: "Jumat",
    theme: "Jumat Bersih & Pengomposan Organik",
    tagline: "Aksi gotong royong massal memilah daun dan membersihkan lingkungan",
    icon: "🍂",
    color: "#D84315",
    missions: [
      { id: "MIS-JUMAT-1", title: "Kumpulkan Daun Kering untuk Kompos", desc: "Kumpulkan serasah daun kering ke komposter drum rotary sekolah", points: 50, icon: "🍂" },
      { id: "MIS-JUMAT-2", title: "Bersihkan Kaca Jendela Ruang Kelas", desc: "Lap kaca jendela luar dan dalam agar cahaya alami masuk maksimal", points: 40, icon: "✨" },
      { id: "MIS-JUMAT-3", title: "Operasi Semut Halaman & Koridor", desc: "Pungut sampah liar bersama seluruh warga sekolah selama 15 menit", points: 45, icon: "🐜" },
      { id: "MIS-JUMAT-4", title: "Periksa Lubang Resapan Biopori", desc: "Cek dan masukkan daun gugur ke lubang biopori halaman kelas", points: 35, icon: "🕳️" }
    ]
  },
  6: { // Sabtu
    dayName: "Sabtu",
    theme: "Edukasi, Kampanye & Inovasi Adiwiyata",
    tagline: "Sebarkan inspirasi gaya hidup hijau dan inovasi daur ulang P5",
    icon: "📢",
    color: "#7B1FA2",
    missions: [
      { id: "MIS-SABTU-1", title: "Bagikan Tips Hemat Energi ke Grup Kelas", desc: "Kirim pesan pengingat mematikan dispenser & lampu sebelum libur", points: 30, icon: "📢" },
      { id: "MIS-SABTU-2", title: "Cek Kebersihan Laci Meja Sebelum Pulang", desc: "Pastikan meja rapi dan bebas remah makanan menjelang akhir pekan", points: 40, icon: "🎒" },
      { id: "MIS-SABTU-3", title: "Catat Ide Inovasi Daur Ulang P5", desc: "Tuliskan ide kreasi sampah anorganik untuk proyek Adiwiyata kelas", points: 35, icon: "💡" },
      { id: "MIS-SABTU-4", title: "Periksa Keran Toilet Sebelum Pulang", desc: "Pastikan fasilitas sanitasi sekolah tidak ada yang bocor/terbuka", points: 30, icon: "🚿" }
    ]
  },
  0: { // Minggu
    dayName: "Minggu",
    theme: "Aksi Lingkungan di Rumah & Komunitas",
    tagline: "Praktikkan kebiasaan Adiwiyata sekolah di lingkungan keluarga",
    icon: "🏡",
    color: "#0277BD",
    missions: [
      { id: "MIS-MINGGU-1", title: "Bantu Siram Tanaman di Rumah", desc: "Terapkan kebiasaan merawat tanaman sekolah di pekarangan rumah", points: 30, icon: "🏡" },
      { id: "MIS-MINGGU-2", title: "Gunakan Tas Belanja Kain Saat Belanja", desc: "Gunakan totebag kain saat berbelanja akhir pekan bersama orang tua", points: 40, icon: "🛍️" },
      { id: "MIS-MINGGU-3", title: "Matikan Lampu Kamar Saat Tidur", desc: "Hemat daya listrik dan rasakan istirahat lebih sehat tanpa cahaya", points: 30, icon: "🌙" },
      { id: "MIS-MINGGU-4", title: "Siapkan Tumbler & Kotak Bekal Senin", desc: "Cuci dan siapkan bekal sehat untuk hari pertama masuk sekolah", points: 25, icon: "🥤" }
    ]
  }
};

// 6 Bulan Terakhir untuk Recharts Interaktif
export const sixMonthTrendData = [
  { month: "Mei 2026", shortMonth: "Mei", co2ReductionKg: 490, co2TargetKg: 450, adiwiyataScore: 84.5, energyEfficiency: 16.5, wasteCollectedKg: 210 },
  { month: "Jun 2026", shortMonth: "Jun", co2ReductionKg: 415, co2TargetKg: 400, adiwiyataScore: 86.2, energyEfficiency: 17.2, wasteCollectedKg: 175 },
  { month: "Jul 2026", shortMonth: "Jul", co2ReductionKg: 460, co2TargetKg: 430, adiwiyataScore: 88.0, energyEfficiency: 18.4, wasteCollectedKg: 195 },
  { month: "Agu 2026", shortMonth: "Agu", co2ReductionKg: 495, co2TargetKg: 460, adiwiyataScore: 90.5, energyEfficiency: 19.8, wasteCollectedKg: 220 },
  { month: "Sep 2026", shortMonth: "Sep", co2ReductionKg: 520, co2TargetKg: 480, adiwiyataScore: 92.4, energyEfficiency: 20.6, wasteCollectedKg: 240 },
  { month: "Okt 2026", shortMonth: "Okt", co2ReductionKg: 540, co2TargetKg: 500, adiwiyataScore: 94.8, energyEfficiency: 21.8, wasteCollectedKg: 270 }
];

export const monthlyCarbonTrend = sixMonthTrendData;

export const initialPlantList = [];

export const initialWastePrices = [
  { id: "WST-PET", name: "Botol Plastik PET & Mineral", category: "Plastik", pricePerKg: 3500, pointsPerKg: 35, carbonOffsetPerKg: 1.8, desc: "Botol air mineral, botol minuman bersih & terpipihkan" },
  { id: "WST-PLS", name: "Plastik Campur & Gelas Cup", category: "Plastik", pricePerKg: 2000, pointsPerKg: 20, carbonOffsetPerKg: 1.4, desc: "Gelas plastik bersih, kantong kresek tebal terpilah" },
  { id: "WST-KRS", name: "Kertas HVS, Buku & Arsip", category: "Kertas", pricePerKg: 2400, pointsPerKg: 24, carbonOffsetPerKg: 1.2, desc: "Kertas ulangan, buku tulis bekas tanpa jilid kawat" },
  { id: "WST-KRD", name: "Kardus Tebal & Karton Box", category: "Kertas", pricePerKg: 1800, pointsPerKg: 18, carbonOffsetPerKg: 0.9, desc: "Kardus kemasan makanan, paket, dan karton tebal kering" },
  { id: "WST-KLG", name: "Kaleng & Logam Aluminium", category: "Logam", pricePerKg: 9500, pointsPerKg: 95, carbonOffsetPerKg: 4.5, desc: "Kaleng minuman soda/susu, panci bekas, kawat tembaga" },
  { id: "WST-ORG", name: "Organik / Kompos (Sisa Sayur & Buah)", category: "Organik/Kompos", pricePerKg: 1000, pointsPerKg: 15, carbonOffsetPerKg: 0.7, desc: "Sisa buah, sayuran kantin, sisa daun kering untuk komposter" }
];

export const initialWasteTransactions = [];

export const SMP_CLASSES = [
  'Kelas 7A', 'Kelas 7B',
  'Kelas 8A', 'Kelas 8B', 'Kelas 8C',
  'Kelas 9A', 'Kelas 9B'
];

export const classLeaderboard = [
  {
    id: "CLS-7A",
    rank: 1,
    name: "Kelas 7A",
    nama_kelas: "Kelas 7A",
    wali_kelas: "Nur Laila Indrawati, S.Si.",
    ketua_kelas: "Zhafir Al-Ghifari",
    total_siswa: 32,
    totalStudents: 32,
    pin_akses: "1234",
    total_poin: 0,
    points: 0,
    sampah_terkumpul_kg: 0,
    totalKg: 0,
    pohon_adopsi: "Belum Ada",
    treesAdopted: "0",
    disiplin_listrik_persen: 100,
    cleanScore: 100,
    auditCount: 0,
    slogan_kelas: "Langkah Kecil Kelas 7A, Dampak Besar Bagi Bumi!",
    slogan: "Langkah Kecil Kelas 7A, Dampak Besar Bagi Bumi!",
    motto: "Langkah Kecil Kelas 7A, Dampak Besar Bagi Bumi!",
    badge: "Siap Beraksi 🌱",
    level: "Kader Pemula Level 1",
    avatar: "🌱",
    lastAuditStatus: "Belum Diaudit"
  },
  {
    id: "CLS-7B",
    rank: 2,
    name: "Kelas 7B",
    nama_kelas: "Kelas 7B",
    wali_kelas: "Siti Rahmawati, S.Pd.",
    ketua_kelas: "Muhammad Rizky",
    total_siswa: 30,
    totalStudents: 30,
    pin_akses: "1234",
    total_poin: 0,
    points: 0,
    sampah_terkumpul_kg: 0,
    totalKg: 0,
    pohon_adopsi: "Belum Ada",
    treesAdopted: "0",
    disiplin_listrik_persen: 100,
    cleanScore: 100,
    auditCount: 0,
    slogan_kelas: "7B Beraksi, Bebas Sampah Plastik Sekali Pakai!",
    slogan: "7B Beraksi, Bebas Sampah Plastik Sekali Pakai!",
    motto: "7B Beraksi, Bebas Sampah Plastik Sekali Pakai!",
    badge: "Siap Beraksi 🌱",
    level: "Kader Pemula Level 1",
    avatar: "🌾",
    lastAuditStatus: "Belum Diaudit"
  },
  {
    id: "CLS-8A",
    rank: 3,
    name: "Kelas 8A",
    nama_kelas: "Kelas 8A",
    wali_kelas: "Dra. Sri Wahyuni, M.Pd.",
    ketua_kelas: "Rayhan Aditya Pratama",
    total_siswa: 32,
    totalStudents: 32,
    pin_akses: "1234",
    total_poin: 0,
    points: 0,
    sampah_terkumpul_kg: 0,
    totalKg: 0,
    pohon_adopsi: "Belum Ada",
    treesAdopted: "0",
    disiplin_listrik_persen: 100,
    cleanScore: 100,
    auditCount: 0,
    slogan_kelas: "8A Bersih, Hijau, Berprestasi dan Juara!",
    slogan: "8A Bersih, Hijau, Berprestasi dan Juara!",
    motto: "8A Bersih, Hijau, Berprestasi dan Juara!",
    badge: "Siap Beraksi 🌱",
    level: "Kader Pemula Level 1",
    avatar: "🌿",
    lastAuditStatus: "Belum Diaudit"
  },
  {
    id: "CLS-8B",
    rank: 4,
    name: "Kelas 8B",
    nama_kelas: "Kelas 8B",
    wali_kelas: "Drs. H. Mulyadi, M.Pd.",
    ketua_kelas: "Bagas Satria",
    total_siswa: 31,
    totalStudents: 31,
    pin_akses: "1234",
    total_poin: 0,
    points: 0,
    sampah_terkumpul_kg: 0,
    totalKg: 0,
    pohon_adopsi: "Belum Ada",
    treesAdopted: "0",
    disiplin_listrik_persen: 100,
    cleanScore: 100,
    auditCount: 0,
    slogan_kelas: "Generasi Peduli Bumi, Aksi Nyata Bukan Janji!",
    slogan: "Generasi Peduli Bumi, Aksi Nyata Bukan Janji!",
    motto: "Generasi Peduli Bumi, Aksi Nyata Bukan Janji!",
    badge: "Siap Beraksi 🌱",
    level: "Kader Pemula Level 1",
    avatar: "🌻",
    lastAuditStatus: "Belum Diaudit"
  },
  {
    id: "CLS-8C",
    rank: 5,
    name: "Kelas 8C",
    nama_kelas: "Kelas 8C",
    wali_kelas: "Bambang Hariyanto, S.Pd.",
    ketua_kelas: "Dinda Safitri",
    total_siswa: 28,
    totalStudents: 28,
    pin_akses: "1234",
    total_poin: 0,
    points: 0,
    sampah_terkumpul_kg: 0,
    totalKg: 0,
    pohon_adopsi: "Belum Ada",
    treesAdopted: "0",
    disiplin_listrik_persen: 100,
    cleanScore: 100,
    auditCount: 0,
    slogan_kelas: "Tertib, Disiplin, dan Bersahabat dengan Alam!",
    slogan: "Tertib, Disiplin, dan Bersahabat dengan Alam!",
    motto: "Tertib, Disiplin, dan Bersahabat dengan Alam!",
    badge: "Siap Beraksi 🌱",
    level: "Kader Pemula Level 1",
    avatar: "🌱",
    lastAuditStatus: "Belum Diaudit"
  },
  {
    id: "CLS-9A",
    rank: 6,
    name: "Kelas 9A",
    nama_kelas: "Kelas 9A",
    wali_kelas: "Endang Purwaningsih, S.Pd.",
    ketua_kelas: "Alifia Maharani",
    total_siswa: 29,
    totalStudents: 29,
    pin_akses: "1234",
    total_poin: 0,
    points: 0,
    sampah_terkumpul_kg: 0,
    totalKg: 0,
    pohon_adopsi: "Belum Ada",
    treesAdopted: "0",
    disiplin_listrik_persen: 100,
    cleanScore: 100,
    auditCount: 0,
    slogan_kelas: "Hijaukan Sekolah, Sejukkan Masa Depan!",
    slogan: "Hijaukan Sekolah, Sejukkan Masa Depan!",
    motto: "Hijaukan Sekolah, Sejukkan Masa Depan!",
    badge: "Siap Beraksi 🌱",
    level: "Kader Pemula Level 1",
    avatar: "🍀",
    lastAuditStatus: "Belum Diaudit"
  },
  {
    id: "CLS-9B",
    rank: 7,
    name: "Kelas 9B",
    nama_kelas: "Kelas 9B",
    wali_kelas: "Ahmad Zulkarnain, S.Pd.",
    ketua_kelas: "Farhan Mahendra",
    total_siswa: 30,
    totalStudents: 30,
    pin_akses: "1234",
    total_poin: 0,
    points: 0,
    sampah_terkumpul_kg: 0,
    totalKg: 0,
    pohon_adopsi: "Belum Ada",
    treesAdopted: "0",
    disiplin_listrik_persen: 100,
    cleanScore: 100,
    auditCount: 0,
    slogan_kelas: "Tumbuh Bersama Alam, Raih Prestasi Gemilang!",
    slogan: "Tumbuh Bersama Alam, Raih Prestasi Gemilang!",
    motto: "Tumbuh Bersama Alam, Raih Prestasi Gemilang!",
    badge: "Siap Beraksi 🌱",
    level: "Kader Pemula Level 1",
    avatar: "🌳",
    lastAuditStatus: "Belum Diaudit"
  }
];

export const initialAuditItems = [
  {
    id: "AUD-01",
    zone: "Ruang Kelas & Koridor",
    criteria: "Pemilahan tempat sampah 3 jenis (Organik, Anorganik, Residu/B3) tersedia dan berlabel jelas di setiap kelas",
    score: 10,
    maxScore: 10,
    status: "pass",
    notes: "Semua 30 ruang kelas telah memiliki 3 bak sampah terpilah."
  },
  {
    id: "AUD-02",
    zone: "Ruang Kelas & Koridor",
    criteria: "Pemanfaatan pencahayaan alami & ventilasi silang (Lampu dimatikan saat matahari cukup)",
    score: 9,
    maxScore: 10,
    status: "pass",
    notes: "Sebagian besar jendela dibuka saat pagi, lampu padam."
  },
  {
    id: "AUD-03",
    zone: "Kantin Sehat Ramah Lingkungan",
    criteria: "Larangan kemasan plastik sekali pakai (Siswa wajib membawa tumbler & kotak makan misting)",
    score: 9.5,
    maxScore: 10,
    status: "pass",
    notes: "Kantin menggunakan piring kaca/melamin cuci ulang dan daun pisang."
  },
  {
    id: "AUD-04",
    zone: "Kantin Sehat Ramah Lingkungan",
    criteria: "Tersedia wastafel cuci tangan dengan sabun cair ramah lingkungan & saluran pembuangan grease trap",
    score: 9,
    maxScore: 10,
    status: "pass",
    notes: "Grease trap dibersihkan rutin tiap hari Jumat."
  },
  {
    id: "AUD-05",
    zone: "Konservasi Energi & Listrik",
    criteria: "SOP Penggunaan AC diatur pada suhu optimal 24°C - 26°C dan dimatikan 30 menit sebelum pulang",
    score: 8.5,
    maxScore: 10,
    status: "warning",
    notes: "Perlu edukasi ulang ke ruang guru gedung barat yang kadang set 20°C."
  },
  {
    id: "AUD-06",
    zone: "Konservasi Energi & Listrik",
    criteria: "Penggunaan 100% lampu LED hemat energi dan sensor timer pada penerangan luar koridor",
    score: 10,
    maxScore: 10,
    status: "pass",
    notes: "Semua bohlam CFL lama sudah diganti LED Philips 9W/14W."
  },
  {
    id: "AUD-07",
    zone: "Konservasi Air & Drainase",
    criteria: "Lubang resapan biopori aktif terawat dan diisi sampah daun kering secara berkala",
    score: 9.5,
    maxScore: 10,
    status: "pass",
    notes: "64 titik biopori berfungsi optimal menampung air hujan."
  },
  {
    id: "AUD-08",
    zone: "Konservasi Air & Drainase",
    criteria: "Sistem pemanenan air hujan (Rainwater Harvesting) tersambung ke tangki penyiraman tanaman",
    score: 9.0,
    maxScore: 10,
    status: "pass",
    notes: "Kapasitas toren 2.000 liter terisi penuh untuk siram taman."
  },
  {
    id: "AUD-09",
    zone: "Sanitasi & Toilet Ramah Lingkungan",
    criteria: "Kran air menggunakan model tekan/sensor otomatis hemat air dan tidak ada kebocoran",
    score: 9.0,
    maxScore: 10,
    status: "pass",
    notes: "Pemeriksaan pipa mingguan bebas bocor."
  },
  {
    id: "AUD-10",
    zone: "Taman Sekolah & Green House",
    criteria: "Keberagaman hayati (minimal 30 varietas pohon, tanaman hias, TOGA) terawat rapi",
    score: 10,
    maxScore: 10,
    status: "pass",
    notes: "Green house memiliki 42 varietas tanaman hidup bersertifikat."
  }
];

export const adiwiyataStandards = [
  {
    code: "STD-1",
    title: "Kebijakan Berwawasan Lingkungan",
    description: "Visi, misi, RKAS, dan anggaran operasional sekolah yang mengintegrasikan pelestarian lingkungan hidup.",
    weight: 20,
    achievedScore: 96.5,
    status: "Sangat Baik",
    evidenceCount: 18,
    indicators: [
      "Visi dan Misi sekolah memuat kepedulian lingkungan secara eksplisit",
      "Rencana Kerja Jangka Menengah (RKJM) & RKT memuat program Adiwiyata",
      "Alokasi anggaran 20%+ dari dana BOS/BPOPP untuk sarana lingkungan hidup",
      "Kemitraan aktif dengan DLH kota, Dinas Kehutanan, dan Komite Sekolah"
    ]
  },
  {
    code: "STD-2",
    title: "Pelaksanaan Kurikulum Berbasis Lingkungan",
    description: "Integrasi kompetensi lingkungan hidup dalam modul ajar, silabus, dan proyek P5 (Gaya Hidup Berkelanjutan).",
    weight: 30,
    achievedScore: 93.0,
    status: "Sangat Baik",
    evidenceCount: 24,
    indicators: [
      "100% mata pelajaran mengintegrasikan isu perubahan iklim & jejak karbon",
      "Proyek P5 tema Gaya Hidup Berkelanjutan menghasilkan produk inovasi daur ulang",
      "Praktik pembuatan pupuk kompos cair & padat dalam pelajaran IPA/Biologi",
      "Karya ilmiah siswa mengenai efisiensi energi terbarukan di sekolah"
    ]
  },
  {
    code: "STD-3",
    title: "Kegiatan Lingkungan Berbasis Partisipatif",
    description: "Keterlibatan aktif seluruh warga sekolah, kader Adiwiyata, komite, dan aksi pelestarian lingkungan sekitar.",
    weight: 20,
    achievedScore: 97.0,
    status: "Unggul",
    evidenceCount: 32,
    indicators: [
      "Aksi Jumat Bersih & Operasi Semut rutin setiap pekan melibatkan 100% siswa",
      "Kader Adiwiyata Sekolah (Pokja Sampah, Energi, Air, Pohon) bertugas aktif",
      "Gerakan Sedekah Sampah & Bank Sampah Digital berjalan konsisten",
      "Aksi tanam pohon bersama warga lingkungan sekitar sekolah / hutan kota"
    ]
  },
  {
    code: "STD-4",
    title: "Pengelolaan Sarana Pendukung Ramah Lingkungan",
    description: "Ketersediaan fasilitas sanitasi, drainase ramah lingkungan, biopori, green house, komposter, dan panel surya.",
    weight: 30,
    achievedScore: 94.0,
    status: "Sangat Baik",
    evidenceCount: 29,
    indicators: [
      "Green House dan Rumah Jamur terawat serta menghasilkan panen rutin",
      "64 sumur resapan biopori aktif dan 1 instalasi pemanen air hujan (PAH)",
      "Kantin sehat bebas 5P (Pengawet, Pewarna, Pemanis, Penyedap buatan, Plastik)",
      "Pemanfaatan panel surya mini 1.2 kWp untuk penerangan taman malam hari"
    ]
  }
];

export const liveRecentActivities = [];

export const OFFICIAL_GURU_ACCOUNTS = [
  {
    id: "gareta.eco",
    username: "gareta.eco",
    password: "1234",
    name: "Gareta",
    teacherName: "Gareta",
    userName: "Pembina Gareta",
    role: "guru",
    title: "Guru Pembina Adiwiyata",
    avatar: "👩‍🏫"
  },
  {
    id: "wyumna.eco",
    username: "wyumna.eco",
    password: "1234",
    name: "Wyumna",
    teacherName: "Wyumna",
    userName: "Pembina Wyumna",
    role: "guru",
    title: "Guru Pembina Adiwiyata",
    avatar: "👨‍🏫"
  },
  {
    id: "admin",
    username: "admin",
    password: "1234",
    alternatePassword: "admin123",
    name: "Superadmin",
    teacherName: "Superadmin",
    userName: "Superadmin EcoSchola",
    role: "superadmin",
    title: "Superadmin EcoSchola",
    avatar: "🛡️"
  }
];

export const classesProfileData = {
  "Kelas 8A": {
    id: "CLS-8A",
    name: "Kelas 8A",
    nama_kelas: "Kelas 8A",
    homeroomTeacher: "Dra. Sri Wahyuni, M.Pd.",
    wali_kelas: "Dra. Sri Wahyuni, M.Pd.",
    teacherAvatar: "👩‍🏫",
    teacherSubject: "Guru IPA & Pembina Adiwiyata",
    classLeader: "Rayhan Aditya Pratama",
    ketua_kelas: "Rayhan Aditya Pratama",
    leaderAvatar: "👦",
    totalStudents: 32,
    total_siswa: 32,
    pin_akses: "1234",
    motto: "8A Bersih, Hijau, Berprestasi dan Juara!",
    slogan_kelas: "8A Bersih, Hijau, Berprestasi dan Juara!",
    sloganBadge: "Eco Champion 2026/2027",
    assignedTree: "Belum Ada",
    pohon_adopsi: "Belum Ada",
    piketGroups: [
      { day: "Senin", leader: "Aisyah Putri", members: ["Rayhan", "Bagas", "Citra", "Dimas", "Eka", "Fahri"] },
      { day: "Selasa", leader: "Budi Santoso", members: ["Gita", "Hafiz", "Indah", "Joko", "Kirana", "Lutfi"] },
      { day: "Rabu", leader: "Maya Anggraini", members: ["Nadia", "Oki", "Pandu", "Qori", "Rizky", "Salsabila"] },
      { day: "Kamis", leader: "Tiara Melani", members: ["Umar", "Vina", "Wawan", "Xavier", "Yusuf", "Zahra"] },
      { day: "Jumat (Piket Akbar)", leader: "Kader Adiwiyata 8A", members: ["Seluruh Siswa Kelas 8A (Operasi Semut & Pemilahan Sampah)"] }
    ],
    cadres: [
      { name: "Rayhan Aditya", role: "Koordinator Lingkungan Kelas", badge: "Ketua Kader" },
      { name: "Aisyah Putri", role: "Duta Pilah Sampah & Bank Sampah", badge: "Bank Sampah" },
      { name: "Pandu Setiawan", role: "Petugas Hemat Energi & Listrik", badge: "Hemat Energi" },
      { name: "Citra Kirana", role: "Penyiram & Pemelihara Tanaman", badge: "Pokja Flora" }
    ]
  },
  "Kelas 9B": {
    id: "CLS-9B",
    name: "Kelas 9B",
    nama_kelas: "Kelas 9B",
    homeroomTeacher: "Ahmad Zulkarnain, S.Pd.",
    wali_kelas: "Ahmad Zulkarnain, S.Pd.",
    teacherAvatar: "👨‍🏫",
    teacherSubject: "Guru Matematika & Pembina Kompos",
    classLeader: "Farhan Mahendra",
    ketua_kelas: "Farhan Mahendra",
    leaderAvatar: "🧑",
    totalStudents: 30,
    total_siswa: 30,
    pin_akses: "1234",
    motto: "Tumbuh Bersama Alam, Raih Prestasi Gemilang!",
    slogan_kelas: "Tumbuh Bersama Alam, Raih Prestasi Gemilang!",
    sloganBadge: "Pahlawan Kompos",
    assignedTree: "Belum Ada",
    pohon_adopsi: "Belum Ada",
    piketGroups: [
      { day: "Senin", leader: "Rina Kusuma", members: ["Farhan", "Alif", "Bella", "Candra", "Dina", "Edo"] },
      { day: "Selasa", leader: "Gani Prakoso", members: ["Hesti", "Irfan", "Julia", "Kiki", "Leo", "Mona"] },
      { day: "Rabu", leader: "Nina Marlina", members: ["Oscar", "Putra", "Rara", "Surya", "Taufik", "Ulya"] },
      { day: "Kamis", leader: "Vino Bastian", members: ["Winda", "Yoga", "Zainal", "Anisa", "Bayu", "Caca"] },
      { day: "Jumat (Piket Akbar)", leader: "Kader Adiwiyata 9B", members: ["Seluruh Siswa Kelas 9B"] }
    ],
    cadres: [
      { name: "Farhan Mahendra", role: "Ketua Pokja Kelas 9B", badge: "Ketua Kader" },
      { name: "Rina Kusuma", role: "Kader Bank Sampah", badge: "Bank Sampah" },
      { name: "Gani Prakoso", role: "Kader Efisiensi Energi", badge: "Hemat Listrik" }
    ]
  },
  "Kelas 7A": {
    id: "CLS-7A",
    name: "Kelas 7A",
    nama_kelas: "Kelas 7A",
    homeroomTeacher: "Nur Laila Indrawati, S.Si.",
    wali_kelas: "Nur Laila Indrawati, S.Si.",
    teacherAvatar: "👩‍🏫",
    teacherSubject: "Guru Biologi & Pembina Apotek Hidup",
    classLeader: "Zhafir Al-Ghifari",
    ketua_kelas: "Zhafir Al-Ghifari",
    leaderAvatar: "👦",
    totalStudents: 32,
    total_siswa: 32,
    pin_akses: "1234",
    motto: "Langkah Kecil Kelas 7A, Dampak Besar Bagi Bumi!",
    slogan_kelas: "Langkah Kecil Kelas 7A, Dampak Besar Bagi Bumi!",
    sloganBadge: "Sahabat Pohon",
    assignedTree: "Belum Ada",
    pohon_adopsi: "Belum Ada",
    piketGroups: [
      { day: "Senin", leader: "Adinda Putri", members: ["Zhafir", "Amir", "Bunga", "Danang", "Elsa", "Fikri"] },
      { day: "Selasa", leader: "Galang Surya", members: ["Hana", "Ilham", "Jesika", "Kharis", "Linda", "Maulana"] },
      { day: "Rabu", leader: "Naufal Hadi", members: ["Olivia", "Prabu", "Rian", "Syifa", "Tari", "Usman"] },
      { day: "Kamis", leader: "Vidia Sari", members: ["Wahyu", "Yulia", "Zaki", "Arif", "Bianca", "Dinda"] },
      { day: "Jumat (Piket Akbar)", leader: "Kader Adiwiyata 7A", members: ["Seluruh Siswa Kelas 7A"] }
    ],
    cadres: [
      { name: "Zhafir Al-Ghifari", role: "Koordinator Lingkungan 7A", badge: "Ketua Kader" },
      { name: "Adinda Putri", role: "Duta Pemilahan Sampah", badge: "Bank Sampah" },
      { name: "Galang Surya", role: "Duta Konservasi Air", badge: "Pokja Air" }
    ]
  },
  "Kelas 8B": {
    id: "CLS-8B",
    name: "Kelas 8B",
    nama_kelas: "Kelas 8B",
    homeroomTeacher: "Drs. H. Mulyadi, M.Pd.",
    wali_kelas: "Drs. H. Mulyadi, M.Pd.",
    teacherAvatar: "👨‍🏫",
    teacherSubject: "Guru IPS & Pembina Pengurangan Plastik",
    classLeader: "Bagas Satria",
    ketua_kelas: "Bagas Satria",
    leaderAvatar: "👦",
    totalStudents: 31,
    total_siswa: 31,
    pin_akses: "1234",
    motto: "Generasi Peduli Bumi, Aksi Nyata Bukan Janji!",
    slogan_kelas: "Generasi Peduli Bumi, Aksi Nyata Bukan Janji!",
    sloganBadge: "Ksatria Bumi",
    assignedTree: "Belum Ada",
    pohon_adopsi: "Belum Ada",
    piketGroups: [
      { day: "Senin", leader: "Sinta Dewi", members: ["Bagas", "Aldi", "Bella", "Chandra", "Dewi", "Fajar"] },
      { day: "Selasa", leader: "Gilang Ramadhan", members: ["Hendra", "Indra", "Jihan", "Kartika", "Lestari", "Mirza"] },
      { day: "Rabu", leader: "Nanda Pratama", members: ["Okta", "Panji", "Qonita", "Reno", "Sari", "Tegar"] },
      { day: "Kamis", leader: "Vira Anjani", members: ["Wulan", "Yoga", "Zulfikar", "Annisa", "Bima", "Citra"] },
      { day: "Jumat (Piket Akbar)", leader: "Kader Adiwiyata 8B", members: ["Seluruh Siswa Kelas 8B"] }
    ],
    cadres: [
      { name: "Bagas Satria", role: "Koordinator Lingkungan 8B", badge: "Ketua Kader" },
      { name: "Sinta Dewi", role: "Duta Bank Sampah", badge: "Bank Sampah" },
      { name: "Gilang Ramadhan", role: "Pengawas Hemat Energi", badge: "Hemat Listrik" }
    ]
  },
  "Kelas 9A": {
    id: "CLS-9A",
    name: "Kelas 9A",
    nama_kelas: "Kelas 9A",
    homeroomTeacher: "Endang Purwaningsih, S.Pd.",
    wali_kelas: "Endang Purwaningsih, S.Pd.",
    teacherAvatar: "👩‍🏫",
    teacherSubject: "Guru Bahasa Indonesia & Pembina Literasi Hijau",
    classLeader: "Alifia Maharani",
    ketua_kelas: "Alifia Maharani",
    leaderAvatar: "👧",
    totalStudents: 29,
    total_siswa: 29,
    pin_akses: "1234",
    motto: "Hijaukan Sekolah, Sejukkan Masa Depan!",
    slogan_kelas: "Hijaukan Sekolah, Sejukkan Masa Depan!",
    sloganBadge: "Pejuang Bersih",
    assignedTree: "Belum Ada",
    pohon_adopsi: "Belum Ada",
    piketGroups: [
      { day: "Senin", leader: "Bagus Wicaksono", members: ["Alifia", "Agus", "Bernad", "Cindy", "Darto", "Erna"] },
      { day: "Selasa", leader: "Fany Rahma", members: ["Guntur", "Hani", "Ivan", "Joy", "Kinan", "Lukman"] },
      { day: "Rabu", leader: "Miko Ardi", members: ["Novia", "Oni", "Prima", "Qisti", "Reza", "Sinta"] },
      { day: "Kamis", leader: "Tomi Setiawan", members: ["Ulfa", "Vero", "Wahid", "Xena", "Yopi", "Zaskia"] },
      { day: "Jumat (Piket Akbar)", leader: "Kader Adiwiyata 9A", members: ["Seluruh Siswa Kelas 9A"] }
    ],
    cadres: [
      { name: "Alifia Maharani", role: "Koordinator Lingkungan 9A", badge: "Ketua Kader" },
      { name: "Bagus Wicaksono", role: "Duta Kompos & Biopori", badge: "Kompos" },
      { name: "Fany Rahma", role: "Duta Pengurangan Kertas", badge: "Bank Sampah" }
    ]
  },
  "Kelas 7B": {
    id: "CLS-7B",
    name: "Kelas 7B",
    nama_kelas: "Kelas 7B",
    homeroomTeacher: "Siti Rahmawati, S.Pd.",
    wali_kelas: "Siti Rahmawati, S.Pd.",
    teacherAvatar: "👩‍🏫",
    teacherSubject: "Guru Seni Budaya & Kreasi 3R Daur Ulang",
    classLeader: "Muhammad Rizky",
    ketua_kelas: "Muhammad Rizky",
    leaderAvatar: "👦",
    totalStudents: 30,
    total_siswa: 30,
    pin_akses: "1234",
    motto: "7B Beraksi, Bebas Sampah Plastik Sekali Pakai!",
    slogan_kelas: "7B Beraksi, Bebas Sampah Plastik Sekali Pakai!",
    sloganBadge: "Relawan Alam",
    assignedTree: "Belum Ada",
    pohon_adopsi: "Belum Ada",
    piketGroups: [
      { day: "Senin", leader: "Alya Zahra", members: ["Rizky", "Aril", "Bima", "Chika", "Danu", "Eni"] },
      { day: "Selasa", leader: "Fathan Alif", members: ["Gina", "Haikal", "Intan", "Jaka", "Keira", "Latif"] },
      { day: "Rabu", leader: "Mawar Indah", members: ["Nico", "Olla", "Pandji", "Qiana", "Rasyid", "Salma"] },
      { day: "Kamis", leader: "Taufan Jaya", members: ["Uswah", "Viona", "Wisnu", "Xylo", "Yumna", "Zaid"] },
      { day: "Jumat (Piket Akbar)", leader: "Kader Adiwiyata 7B", members: ["Seluruh Siswa Kelas 7B"] }
    ],
    cadres: [
      { name: "Muhammad Rizky", role: "Koordinator Lingkungan 7B", badge: "Ketua Kader" },
      { name: "Alya Zahra", role: "Duta Tumbler & Misting Kantin", badge: "Anti Plastik" },
      { name: "Fathan Alif", role: "Petugas Kebun TOGA", badge: "Pokja Flora" }
    ]
  },
  "Kelas 8C": {
    id: "CLS-8C",
    name: "Kelas 8C",
    nama_kelas: "Kelas 8C",
    homeroomTeacher: "Bambang Hariyanto, S.Pd.",
    wali_kelas: "Bambang Hariyanto, S.Pd.",
    teacherAvatar: "👨‍🏫",
    teacherSubject: "Guru PJOK & Pembina Olahraga Hijau",
    classLeader: "Dinda Safitri",
    ketua_kelas: "Dinda Safitri",
    leaderAvatar: "👧",
    totalStudents: 28,
    total_siswa: 28,
    pin_akses: "1234",
    motto: "Tertib, Disiplin, dan Bersahabat dengan Alam!",
    slogan_kelas: "Tertib, Disiplin, dan Bersahabat dengan Alam!",
    sloganBadge: "Kader Pemula",
    assignedTree: "Belum Ada",
    pohon_adopsi: "Belum Ada",
    piketGroups: [
      { day: "Senin", leader: "Doni Prasetyo", members: ["Dinda", "Adit", "Budi", "Cinta", "Doni", "Evi"] },
      { day: "Selasa", leader: "Fitriani", members: ["Gani", "Hanafi", "Ika", "Jono", "Kezia", "Lukman"] },
      { day: "Rabu", leader: "Maman", members: ["Nila", "Oman", "Putri", "Qori", "Radit", "Sari"] },
      { day: "Kamis", leader: "Tono", members: ["Ujang", "Vivi", "Widi", "Xena", "Yani", "Zul"] },
      { day: "Jumat (Piket Akbar)", leader: "Kader Adiwiyata 8C", members: ["Seluruh Siswa Kelas 8C"] }
    ],
    cadres: [
      { name: "Dinda Safitri", role: "Koordinator Lingkungan 8C", badge: "Ketua Kader" },
      { name: "Doni Prasetyo", role: "Duta Hemat Listrik", badge: "Hemat Energi" },
      { name: "Fitriani", role: "Kader Pengomposan", badge: "Kompos" }
    ]
  }
};

export const getClassProfile = (className) => {
  if (classesProfileData[className]) {
    return classesProfileData[className];
  }
  // Default to 8A if not found
  return classesProfileData["Kelas 8A"];
};
