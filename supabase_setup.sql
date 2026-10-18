-- ============================================================================
-- ECOSCHOLA SUPABASE CLOUD SETUP & MASTER SEEDING SCRIPT (CLEAN PRODUCTION STATE)
-- Jalankan script ini di Dashboard Supabase: SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABEL-TABEL UTAMA (DDL)
-- ============================================================================

-- A. Tabel Kelas Resmi (7 Kelas SMP: 7A, 7B, 8A, 8B, 8C, 9A, 9B)
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    nama_kelas TEXT,
    homeroom_teacher TEXT,
    wali_kelas TEXT,
    teacher_subject TEXT DEFAULT 'Guru IPA & Pembina Adiwiyata',
    teacher_avatar TEXT DEFAULT '👩‍🏫',
    class_leader TEXT,
    ketua_kelas TEXT,
    leader_avatar TEXT DEFAULT '👦',
    total_students INT DEFAULT 32,
    total_siswa INT DEFAULT 32,
    pin_akses TEXT DEFAULT '1234',
    points INT DEFAULT 0,
    total_poin INT DEFAULT 0,
    total_kg NUMERIC(8,2) DEFAULT 0,
    sampah_terkumpul_kg NUMERIC(8,2) DEFAULT 0,
    trees_adopted TEXT DEFAULT '0',
    pohon_adopsi TEXT DEFAULT '0',
    energy_discipline_percent NUMERIC(5,2) DEFAULT 100.0,
    clean_score NUMERIC(5,2) DEFAULT 100.0,
    audit_count INT DEFAULT 0,
    slogan_kelas TEXT DEFAULT 'Bersih, Hijau, dan Berprestasi!',
    motto TEXT DEFAULT 'Bersih, Hijau, dan Berprestasi!',
    badge TEXT DEFAULT 'Siap Beraksi 🌱',
    level TEXT DEFAULT 'Kader Pemula Level 1',
    avatar TEXT DEFAULT '🌱',
    last_audit_status TEXT DEFAULT 'Belum Diaudit',
    piket_groups JSONB DEFAULT '[]'::jsonb,
    cadres JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. Tabel Pengguna (Guru, Kader Siswa, Superadmin)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    teacher_name TEXT,
    user_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('siswa', 'guru', 'superadmin')),
    class_name TEXT,
    class_id TEXT REFERENCES public.classes(id) ON DELETE SET NULL,
    pin TEXT NOT NULL DEFAULT '1234',
    title TEXT DEFAULT 'Warga Sekolah',
    avatar TEXT DEFAULT '🌱',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. Tabel Katalog Pohon & Flora Sekolah
CREATE TABLE IF NOT EXISTS public.trees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    scientific_name TEXT,
    category TEXT NOT NULL,
    responsible_class TEXT NOT NULL,
    co2_absorption_kg_per_year NUMERIC(6,2) DEFAULT 15.0,
    location TEXT DEFAULT 'Halaman Sekolah',
    total_quantity INT DEFAULT 1,
    health_status TEXT DEFAULT 'Sangat Sehat',
    water_status TEXT DEFAULT 'Sudah Disiram 🌿',
    last_watered TEXT DEFAULT 'Hari ini',
    planted_year INT DEFAULT 2026,
    care_person TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT ARRAY['Adiwiyata'],
    image TEXT,
    qr_code_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. Tabel Transaksi Setoran Bank Sampah
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    class_name TEXT NOT NULL,
    waste_type TEXT NOT NULL,
    category TEXT NOT NULL,
    weight_kg NUMERIC(6,2) NOT NULL,
    total_price NUMERIC(10,2) DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    co2_saved NUMERIC(6,2) DEFAULT 0,
    date TEXT NOT NULL,
    verified_by TEXT DEFAULT 'Kasir Bank Sampah Siswa',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. Tabel Master Misi Harian
CREATE TABLE IF NOT EXISTS public.daily_missions (
    id TEXT PRIMARY KEY,
    day_index INT NOT NULL CHECK (day_index BETWEEN 0 AND 6),
    day_name TEXT NOT NULL,
    theme TEXT NOT NULL,
    title TEXT NOT NULL,
    desc_text TEXT NOT NULL,
    points INT NOT NULL DEFAULT 30,
    icon TEXT DEFAULT '🌱',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. Tabel Riwayat Misi Selesai per Kelas
CREATE TABLE IF NOT EXISTS public.mission_completions (
    id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL REFERENCES public.daily_missions(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    date_key TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. Tabel Log Aktivitas Lingkungan
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    actor TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Aksi Lingkungan',
    impact TEXT,
    icon TEXT DEFAULT '🌱',
    time TEXT DEFAULT 'Baru saja',
    status TEXT DEFAULT 'Selesai',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. Tabel Ringkasan Karbon Tunggal
CREATE TABLE IF NOT EXISTS public.school_carbon_stats (
    id INT PRIMARY KEY DEFAULT 1,
    trees_cataloged INT DEFAULT 0,
    co2_reduced_kg NUMERIC(10,2) DEFAULT 0.0,
    co2_target_kg NUMERIC(10,2) DEFAULT 3500.0,
    waste_diverted_kg NUMERIC(10,2) DEFAULT 0.0,
    waste_target_kg NUMERIC(10,2) DEFAULT 2000.0,
    energy_efficiency_percent NUMERIC(5,2) DEFAULT 100.0,
    energy_saved_kwh NUMERIC(10,2) DEFAULT 0.0,
    tree_co2_capacity_per_year NUMERIC(10,2) DEFAULT 0.0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) & PUBLIC DEMO POLICIES
-- ============================================================================

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_carbon_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access on classes" ON public.classes;
CREATE POLICY "Public full access on classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on users" ON public.users;
CREATE POLICY "Public full access on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on trees" ON public.trees;
CREATE POLICY "Public full access on trees" ON public.trees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on transactions" ON public.transactions;
CREATE POLICY "Public full access on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on daily_missions" ON public.daily_missions;
CREATE POLICY "Public full access on daily_missions" ON public.daily_missions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on mission_completions" ON public.mission_completions;
CREATE POLICY "Public full access on mission_completions" ON public.mission_completions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on activity_logs" ON public.activity_logs;
CREATE POLICY "Public full access on activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on school_carbon_stats" ON public.school_carbon_stats;
CREATE POLICY "Public full access on school_carbon_stats" ON public.school_carbon_stats FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 4. MASTER SEEDING (KONDISI BERSIH 7 KELAS, GURU, SUPERADMIN & MISI)
-- ============================================================================

-- A. Seeding 7 Kelas Resmi (Clean State: 0 Poin, 0 Kg, 0 Pohon, Disiplin 100%)
INSERT INTO public.classes (
    id, name, nama_kelas, homeroom_teacher, wali_kelas, teacher_subject,
    class_leader, ketua_kelas, total_students, total_siswa, pin_akses,
    points, total_poin, total_kg, sampah_terkumpul_kg, trees_adopted, pohon_adopsi,
    energy_discipline_percent, clean_score, audit_count, slogan_kelas, motto, badge, level, avatar, last_audit_status,
    piket_groups, cadres
) VALUES
(
    '7A', 'Kelas 7A', 'Kelas 7A', 'Nur Laila Indrawati, S.Si.', 'Nur Laila Indrawati, S.Si.', 'Guru Biologi & Pembina Apotek Hidup',
    'Zhafir Al-Ghifari', 'Zhafir Al-Ghifari', 32, 32, '1234',
    0, 0, 0.0, 0.0, '0', '0',
    100.0, 100.0, 0, 'Langkah Kecil Kelas 7A, Dampak Besar Bagi Bumi!', 'Langkah Kecil Kelas 7A, Dampak Besar Bagi Bumi!',
    'Siap Beraksi 🌱', 'Kader Pemula Level 1', '🌱', 'Belum Diaudit',
    '[
        {"day": "Senin", "leader": "Adinda Putri", "members": ["Zhafir", "Amir", "Bunga", "Danang", "Elsa", "Fikri"]},
        {"day": "Selasa", "leader": "Galang Surya", "members": ["Hana", "Ilham", "Jesika", "Kharis", "Linda", "Maulana"]},
        {"day": "Rabu", "leader": "Naufal Hadi", "members": ["Olivia", "Prabu", "Rian", "Syifa", "Tari", "Usman"]},
        {"day": "Kamis", "leader": "Vidia Sari", "members": ["Wahyu", "Yulia", "Zaki", "Arif", "Bianca", "Dinda"]},
        {"day": "Jumat (Piket Akbar)", "leader": "Kader Adiwiyata 7A", "members": ["Seluruh Siswa Kelas 7A"]}
    ]'::jsonb,
    '[
        {"name": "Zhafir Al-Ghifari", "role": "Koordinator Lingkungan 7A", "badge": "Ketua Kader"},
        {"name": "Adinda Putri", "role": "Duta Pemilahan Sampah", "badge": "Bank Sampah"},
        {"name": "Galang Surya", "role": "Duta Konservasi Air", "badge": "Pokja Air"}
    ]'::jsonb
),
(
    '7B', 'Kelas 7B', 'Kelas 7B', 'Siti Rahmawati, S.Pd.', 'Siti Rahmawati, S.Pd.', 'Guru Seni Budaya & Kreasi 3R Daur Ulang',
    'Muhammad Rizky', 'Muhammad Rizky', 30, 30, '1234',
    0, 0, 0.0, 0.0, '0', '0',
    100.0, 100.0, 0, '7B Beraksi, Bebas Sampah Plastik Sekali Pakai!', '7B Beraksi, Bebas Sampah Plastik Sekali Pakai!',
    'Siap Beraksi 🌱', 'Kader Pemula Level 1', '🌾', 'Belum Diaudit',
    '[
        {"day": "Senin", "leader": "Alya Zahra", "members": ["Rizky", "Aril", "Bima", "Chika", "Danu", "Eni"]},
        {"day": "Selasa", "leader": "Fathan Alif", "members": ["Gina", "Haikal", "Intan", "Jaka", "Keira", "Latif"]},
        {"day": "Rabu", "leader": "Mawar Indah", "members": ["Nico", "Olla", "Pandji", "Qiana", "Rasyid", "Salma"]},
        {"day": "Kamis", "leader": "Taufan Jaya", "members": ["Uswah", "Viona", "Wisnu", "Xylo", "Yumna", "Zaid"]},
        {"day": "Jumat (Piket Akbar)", "leader": "Kader Adiwiyata 7B", "members": ["Seluruh Siswa Kelas 7B"]}
    ]'::jsonb,
    '[
        {"name": "Muhammad Rizky", "role": "Koordinator Lingkungan 7B", "badge": "Ketua Kader"},
        {"name": "Alya Zahra", "role": "Duta Tumbler & Misting Kantin", "badge": "Anti Plastik"},
        {"name": "Fathan Alif", "role": "Petugas Kebun TOGA", "badge": "Pokja Flora"}
    ]'::jsonb
),
(
    '8A', 'Kelas 8A', 'Kelas 8A', 'Dra. Sri Wahyuni, M.Pd.', 'Dra. Sri Wahyuni, M.Pd.', 'Guru IPA & Pembina Adiwiyata',
    'Rayhan Aditya Pratama', 'Rayhan Aditya Pratama', 32, 32, '1234',
    0, 0, 0.0, 0.0, '0', '0',
    100.0, 100.0, 0, '8A Bersih, Hijau, Berprestasi dan Juara!', '8A Bersih, Hijau, Berprestasi dan Juara!',
    'Siap Beraksi 🌱', 'Kader Pemula Level 1', '🌿', 'Belum Diaudit',
    '[
        {"day": "Senin", "leader": "Aisyah Putri", "members": ["Rayhan", "Bagas", "Citra", "Dimas", "Eka", "Fahri"]},
        {"day": "Selasa", "leader": "Budi Santoso", "members": ["Gita", "Hafiz", "Indah", "Joko", "Kirana", "Lutfi"]},
        {"day": "Rabu", "leader": "Maya Anggraini", "members": ["Nadia", "Oki", "Pandu", "Qori", "Rizky", "Salsabila"]},
        {"day": "Kamis", "leader": "Tiara Melani", "members": ["Umar", "Vina", "Wawan", "Xavier", "Yusuf", "Zahra"]},
        {"day": "Jumat (Piket Akbar)", "leader": "Kader Adiwiyata 8A", "members": ["Seluruh Siswa Kelas 8A (Operasi Semut & Pemilahan Sampah)"]}
    ]'::jsonb,
    '[
        {"name": "Rayhan Aditya", "role": "Koordinator Lingkungan Kelas", "badge": "Ketua Kader"},
        {"name": "Aisyah Putri", "role": "Duta Pilah Sampah & Bank Sampah", "badge": "Bank Sampah"},
        {"name": "Pandu Setiawan", "role": "Petugas Hemat Energi & Listrik", "badge": "Hemat Energi"},
        {"name": "Citra Kirana", "role": "Penyiram & Pemelihara Tanaman", "badge": "Pokja Flora"}
    ]'::jsonb
),
(
    '8B', 'Kelas 8B', 'Kelas 8B', 'Drs. H. Mulyadi, M.Pd.', 'Drs. H. Mulyadi, M.Pd.', 'Guru IPS & Pembina Pengurangan Plastik',
    'Bagas Satria', 'Bagas Satria', 31, 31, '1234',
    0, 0, 0.0, 0.0, '0', '0',
    100.0, 100.0, 0, 'Generasi Peduli Bumi, Aksi Nyata Bukan Janji!', 'Generasi Peduli Bumi, Aksi Nyata Bukan Janji!',
    'Siap Beraksi 🌱', 'Kader Pemula Level 1', '🌻', 'Belum Diaudit',
    '[
        {"day": "Senin", "leader": "Sinta Dewi", "members": ["Bagas", "Aldi", "Bella", "Chandra", "Dewi", "Fajar"]},
        {"day": "Selasa", "leader": "Gilang Ramadhan", "members": ["Hendra", "Indra", "Jihan", "Kartika", "Lestari", "Mirza"]},
        {"day": "Rabu", "leader": "Nanda Pratama", "members": ["Okta", "Panji", "Qonita", "Reno", "Sari", "Tegar"]},
        {"day": "Kamis", "leader": "Vira Anjani", "members": ["Wulan", "Yoga", "Zulfikar", "Annisa", "Bima", "Citra"]},
        {"day": "Jumat (Piket Akbar)", "leader": "Kader Adiwiyata 8B", "members": ["Seluruh Siswa Kelas 8B"]}
    ]'::jsonb,
    '[
        {"name": "Bagas Satria", "role": "Koordinator Lingkungan 8B", "badge": "Ketua Kader"},
        {"name": "Sinta Dewi", "role": "Duta Bank Sampah", "badge": "Bank Sampah"},
        {"name": "Gilang Ramadhan", "role": "Pengawas Hemat Energi", "badge": "Hemat Listrik"}
    ]'::jsonb
),
(
    '8C', 'Kelas 8C', 'Kelas 8C', 'Bambang Hariyanto, S.Pd.', 'Bambang Hariyanto, S.Pd.', 'Guru PJOK & Pembina Olahraga Hijau',
    'Dinda Safitri', 'Dinda Safitri', 28, 28, '1234',
    0, 0, 0.0, 0.0, '0', '0',
    100.0, 100.0, 0, 'Tertib, Disiplin, dan Bersahabat dengan Alam!', 'Tertib, Disiplin, dan Bersahabat dengan Alam!',
    'Siap Beraksi 🌱', 'Kader Pemula Level 1', '🌱', 'Belum Diaudit',
    '[
        {"day": "Senin", "leader": "Doni Prasetyo", "members": ["Dinda", "Adit", "Budi", "Cinta", "Doni", "Evi"]},
        {"day": "Selasa", "leader": "Fitriani", "members": ["Gani", "Hanafi", "Ika", "Jono", "Kezia", "Lukman"]},
        {"day": "Rabu", "leader": "Maman", "members": ["Nila", "Oman", "Putri", "Qori", "Radit", "Sari"]},
        {"day": "Kamis", "leader": "Tono", "members": ["Ujang", "Vivi", "Widi", "Xena", "Yani", "Zul"]},
        {"day": "Jumat (Piket Akbar)", "leader": "Kader Adiwiyata 8C", "members": ["Seluruh Siswa Kelas 8C"]}
    ]'::jsonb,
    '[
        {"name": "Dinda Safitri", "role": "Koordinator Lingkungan 8C", "badge": "Ketua Kader"},
        {"name": "Doni Prasetyo", "role": "Duta Hemat Listrik", "badge": "Hemat Energi"},
        {"name": "Fitriani", "role": "Kader Pengomposan", "badge": "Kompos"}
    ]'::jsonb
),
(
    '9A', 'Kelas 9A', 'Kelas 9A', 'Endang Purwaningsih, S.Pd.', 'Endang Purwaningsih, S.Pd.', 'Guru Bahasa Indonesia & Pembina Literasi Hijau',
    'Alifia Maharani', 'Alifia Maharani', 29, 29, '1234',
    0, 0, 0.0, 0.0, '0', '0',
    100.0, 100.0, 0, 'Hijaukan Sekolah, Sejukkan Masa Depan!', 'Hijaukan Sekolah, Sejukkan Masa Depan!',
    'Siap Beraksi 🌱', 'Kader Pemula Level 1', '🍀', 'Belum Diaudit',
    '[
        {"day": "Senin", "leader": "Bagus Wicaksono", "members": ["Alifia", "Agus", "Bernad", "Cindy", "Darto", "Erna"]},
        {"day": "Selasa", "leader": "Fany Rahma", "members": ["Guntur", "Hani", "Ivan", "Joy", "Kinan", "Lukman"]},
        {"day": "Rabu", "leader": "Miko Ardi", "members": ["Novia", "Oni", "Prima", "Qisti", "Reza", "Sinta"]},
        {"day": "Kamis", "leader": "Tomi Setiawan", "members": ["Ulfa", "Vero", "Wahid", "Xena", "Yopi", "Zaskia"]},
        {"day": "Jumat (Piket Akbar)", "leader": "Kader Adiwiyata 9A", "members": ["Seluruh Siswa Kelas 9A"]}
    ]'::jsonb,
    '[
        {"name": "Alifia Maharani", "role": "Koordinator Lingkungan 9A", "badge": "Ketua Kader"},
        {"name": "Bagus Wicaksono", "role": "Duta Kompos & Biopori", "badge": "Kompos"},
        {"name": "Fany Rahma", "role": "Duta Pengurangan Kertas", "badge": "Bank Sampah"}
    ]'::jsonb
),
(
    '9B', 'Kelas 9B', 'Kelas 9B', 'Ahmad Zulkarnain, S.Pd.', 'Ahmad Zulkarnain, S.Pd.', 'Guru Matematika & Pembina Kompos',
    'Farhan Mahendra', 'Farhan Mahendra', 30, 30, '1234',
    0, 0, 0.0, 0.0, '0', '0',
    100.0, 100.0, 0, 'Tumbuh Bersama Alam, Raih Prestasi Gemilang!', 'Tumbuh Bersama Alam, Raih Prestasi Gemilang!',
    'Siap Beraksi 🌱', 'Kader Pemula Level 1', '🌳', 'Belum Diaudit',
    '[
        {"day": "Senin", "leader": "Rina Kusuma", "members": ["Farhan", "Alif", "Bella", "Candra", "Dina", "Edo"]},
        {"day": "Selasa", "leader": "Gani Prakoso", "members": ["Hesti", "Irfan", "Julia", "Kiki", "Leo", "Mona"]},
        {"day": "Rabu", "leader": "Nina Marlina", "members": ["Oscar", "Putra", "Rara", "Surya", "Taufik", "Ulya"]},
        {"day": "Kamis", "leader": "Vino Bastian", "members": ["Winda", "Yoga", "Zainal", "Anisa", "Bayu", "Caca"]},
        {"day": "Jumat (Piket Akbar)", "leader": "Kader Adiwiyata 9B", "members": ["Seluruh Siswa Kelas 9B"]}
    ]'::jsonb,
    '[
        {"name": "Farhan Mahendra", "role": "Ketua Pokja Kelas 9B", "badge": "Ketua Kader"},
        {"name": "Rina Kusuma", "role": "Kader Bank Sampah", "badge": "Bank Sampah"},
        {"name": "Gani Prakoso", "role": "Kader Efisiensi Energi", "badge": "Hemat Listrik"}
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    points = EXCLUDED.points,
    total_poin = EXCLUDED.total_poin,
    total_kg = EXCLUDED.total_kg,
    sampah_terkumpul_kg = EXCLUDED.sampah_terkumpul_kg,
    trees_adopted = EXCLUDED.trees_adopted,
    pohon_adopsi = EXCLUDED.pohon_adopsi,
    energy_discipline_percent = EXCLUDED.energy_discipline_percent,
    clean_score = EXCLUDED.clean_score,
    audit_count = EXCLUDED.audit_count,
    badge = EXCLUDED.badge,
    level = EXCLUDED.level,
    last_audit_status = EXCLUDED.last_audit_status;

-- B. Seeding Pengguna Resmi (Guru Gareta, Guru Wyumna, Superadmin, & 7 Siswa)
INSERT INTO public.users (id, username, full_name, teacher_name, user_name, role, class_name, class_id, pin, title, avatar) VALUES
('usr-gareta', 'gareta.eco', 'Pembina Gareta', 'Gareta', 'Pembina Gareta', 'guru', NULL, NULL, '1234', 'Guru Pembina Adiwiyata', '👩‍🏫'),
('usr-wyumna', 'wyumna.eco', 'Pembina Wyumna', 'Wyumna', 'Pembina Wyumna', 'guru', NULL, NULL, '1234', 'Guru Pembina Adiwiyata', '👨‍🏫'),
('usr-admin', 'admin', 'Superadmin EcoSchola', 'Superadmin', 'Superadmin EcoSchola', 'superadmin', NULL, NULL, '1234', 'Superadmin EcoSchola', '🛡️'),
('usr-7a', '7a.eco', 'Zhafir Al-Ghifari (Kader 7A)', NULL, 'Zhafir Al-Ghifari', 'siswa', 'Kelas 7A', '7A', '1234', 'Kader Adiwiyata Kelas 7A', '🌱'),
('usr-7b', '7b.eco', 'Muhammad Rizky (Kader 7B)', NULL, 'Muhammad Rizky', 'siswa', 'Kelas 7B', '7B', '1234', 'Kader Adiwiyata Kelas 7B', '🌾'),
('usr-8a', '8a.eco', 'Ahmad Rayhan (Kader 8A)', NULL, 'Rayhan Aditya Pratama', 'siswa', 'Kelas 8A', '8A', '1234', 'Kader Adiwiyata Kelas 8A', '🌿'),
('usr-8b', '8b.eco', 'Bagas Satria (Kader 8B)', NULL, 'Bagas Satria', 'siswa', 'Kelas 8B', '8B', '1234', 'Kader Adiwiyata Kelas 8B', '🌻'),
('usr-8c', '8c.eco', 'Dinda Safitri (Kader 8C)', NULL, 'Dinda Safitri', 'siswa', 'Kelas 8C', '8C', '1234', 'Kader Adiwiyata Kelas 8C', '🌱'),
('usr-9a', '9a.eco', 'Alifia Maharani (Kader 9A)', NULL, 'Alifia Maharani', 'siswa', 'Kelas 9A', '9A', '1234', 'Kader Adiwiyata Kelas 9A', '🍀'),
('usr-9b', '9b.eco', 'Farhan Mahendra (Kader 9B)', NULL, 'Farhan Mahendra', 'siswa', 'Kelas 9B', '9B', '1234', 'Kader Adiwiyata Kelas 9B', '🌳')
ON CONFLICT (id) DO UPDATE SET
    pin = EXCLUDED.pin,
    role = EXCLUDED.role;

-- C. Seeding Misi Harian Otomatis (Senin s/d Minggu)
INSERT INTO public.daily_missions (id, day_index, day_name, theme, title, desc_text, points, icon) VALUES
-- SENIN (1)
('MIS-SENIN-1', 1, 'Senin', 'Fokus Kebersihan & Kerapian Kelas', 'Piket Bersih Kolong Meja', 'Pastikan laci dan lantai kelas bebas sampah sebelum bel masuk', 50, '🧹'),
('MIS-SENIN-2', 1, 'Senin', 'Fokus Kebersihan & Kerapian Kelas', 'Rapikan Sudut Baca & Pojok Hijau', 'Tata buku literasi dan rapikan display mading lingkungan kelas', 30, '📚'),
('MIS-SENIN-3', 1, 'Senin', 'Fokus Kebersihan & Kerapian Kelas', 'Bersihkan Papan Tulis & Tempat Spidol', 'Lap papan tulis hingga bersih dan rapikan penghapus serta spidol', 25, '✨'),
('MIS-SENIN-4', 1, 'Senin', 'Fokus Kebersihan & Kerapian Kelas', 'Cek Tempat Sampah Terpilah 3 Warna', 'Pastikan bak organik, anorganik, dan residu tidak tercampur', 35, '🗑️'),
-- SELASA (2)
('MIS-SELASA-1', 2, 'Selasa', 'Fokus Hemat Energi & Konservasi Air', 'Matikan Lampu Saat Istirahat', 'Padamkan lampu & kipas angin saat kelas kosong ke kantin/masjid', 40, '💡'),
('MIS-SELASA-2', 2, 'Selasa', 'Fokus Hemat Energi & Konservasi Air', 'Cek Keran Air Wastafel Tidak Menetes', 'Pastikan keran air cuci tangan selasar tertutup rapat sempurna', 35, '🚰'),
('MIS-SELASA-3', 2, 'Selasa', 'Fokus Hemat Energi & Konservasi Air', 'Cabut Colokan Elektronik Siang Hari', 'Cabut kabel proyektor, speaker, dan charger yang tidak terpakai', 30, '🔌'),
('MIS-SELASA-4', 2, 'Selasa', 'Fokus Hemat Energi & Konservasi Air', 'Buka Jendela untuk Ventilasi Alami', 'Maksimalkan pencahayaan dan angin segar alami tanpa kipas', 25, '🪟'),
-- RABU (3)
('MIS-RABU-1', 3, 'Rabu', 'Fokus Bank Sampah & Gerakan 3R', 'Setor 3 Botol Plastik Bekas', 'Kumpulkan botol minum bersih ke Bank Sampah kelas / sekolah', 35, '🧴'),
('MIS-RABU-2', 3, 'Rabu', 'Fokus Bank Sampah & Gerakan 3R', 'Bawa Tumbler & Kotak Makan Sendiri', 'Bebas sampah plastik sekali pakai saat jajan di kantin sehat', 45, '🍱'),
('MIS-RABU-3', 3, 'Rabu', 'Fokus Bank Sampah & Gerakan 3R', 'Pilah Kertas & Buku Tulis Rusak', 'Kumpulkan kertas ulangan/buku tanpa klip logam ke kardus daur ulang', 30, '📦'),
('MIS-RABU-4', 3, 'Rabu', 'Fokus Bank Sampah & Gerakan 3R', 'Habiskan Makanan (Zero Food Waste)', 'Makan siang tuntas tanpa sisa makanan yang terbuang sia-sia', 30, '🍽️'),
-- KAMIS (4)
('MIS-KAMIS-1', 4, 'Kamis', 'Fokus Asuh Tanaman & Flora Sekolah', 'Siram Pot Tanaman Asuh Kelas', 'Beri air secukupnya pada tanaman hias dan TOGA di depan kelas', 25, '🪴'),
('MIS-KAMIS-2', 4, 'Kamis', 'Fokus Asuh Tanaman & Flora Sekolah', 'Cabut Rumput Liar di Taman Kelas', 'Bersihkan gulma di sekitar pot tanaman dan lubang biopori', 40, '🌿'),
('MIS-KAMIS-3', 4, 'Kamis', 'Fokus Asuh Tanaman & Flora Sekolah', 'Bersihkan Debu Daun Tanaman Hias', 'Lap debu di daun Sansevieria agar fotosintesis & serapan CO₂ maksimal', 20, '🍃'),
('MIS-KAMIS-4', 4, 'Kamis', 'Fokus Asuh Tanaman & Flora Sekolah', 'Tabur Kompos Organik pada Pot', 'Beri 2 sendok kompos matang hasil olahan komposter sekolah', 45, '🌱'),
-- JUMAT (5)
('MIS-JUMAT-1', 5, 'Jumat', 'Jumat Bersih & Pengomposan Organik', 'Kumpulkan Daun Kering untuk Kompos', 'Kumpulkan serasah daun kering ke komposter drum rotary sekolah', 50, '🍂'),
('MIS-JUMAT-2', 5, 'Jumat', 'Jumat Bersih & Pengomposan Organik', 'Bersihkan Kaca Jendela Ruang Kelas', 'Lap kaca jendela luar dan dalam agar cahaya alami masuk maksimal', 40, '✨'),
('MIS-JUMAT-3', 5, 'Jumat', 'Jumat Bersih & Pengomposan Organik', 'Operasi Semut Halaman & Koridor', 'Pungut sampah liar bersama seluruh warga sekolah selama 15 menit', 45, '🐜'),
('MIS-JUMAT-4', 5, 'Jumat', 'Jumat Bersih & Pengomposan Organik', 'Periksa Lubang Resapan Biopori', 'Cek dan masukkan daun gugur ke lubang biopori halaman kelas', 35, '🕳️'),
-- SABTU (6)
('MIS-SABTU-1', 6, 'Sabtu', 'Edukasi, Kampanye & Inovasi Adiwiyata', 'Bagikan Tips Hemat Energi ke Grup Kelas', 'Kirim pesan pengingat mematikan dispenser & lampu sebelum libur', 30, '📢'),
('MIS-SABTU-2', 6, 'Sabtu', 'Edukasi, Kampanye & Inovasi Adiwiyata', 'Cek Kebersihan Laci Meja Sebelum Pulang', 'Pastikan meja rapi dan bebas remah makanan menjelang akhir pekan', 40, '🎒'),
('MIS-SABTU-3', 6, 'Sabtu', 'Edukasi, Kampanye & Inovasi Adiwiyata', 'Catat Ide Inovasi Daur Ulang P5', 'Tuliskan ide kreasi sampah anorganik untuk proyek Adiwiyata kelas', 35, '💡'),
('MIS-SABTU-4', 6, 'Sabtu', 'Edukasi, Kampanye & Inovasi Adiwiyata', 'Periksa Keran Toilet Sebelum Pulang', 'Pastikan fasilitas sanitasi sekolah tidak ada yang bocor/terbuka', 30, '🚿'),
-- MINGGU (0)
('MIS-MINGGU-1', 0, 'Minggu', 'Aksi Lingkungan di Rumah & Komunitas', 'Bantu Siram Tanaman di Rumah', 'Praktikkan kebiasaan merawat tanaman sekolah pada tanaman pekarangan rumah', 30, '🪴'),
('MIS-MINGGU-2', 0, 'Minggu', 'Aksi Lingkungan di Rumah & Komunitas', 'Gunakan Tas Belanja Kain Saat Belanja', 'Tolak kantong plastik sekali pakai saat belanja di minimarket/pasar', 40, '🛍️'),
('MIS-MINGGU-3', 0, 'Minggu', 'Aksi Lingkungan di Rumah & Komunitas', 'Cabut Charger HP yang Tidak Terpakai', 'Kurangi energi vampir di rumah dengan mencabut adaptor dari colokan', 35, '🔌'),
('MIS-MINGGU-4', 0, 'Minggu', 'Aksi Lingkungan di Rumah & Komunitas', 'Siapkan Tumbler & Kotak Bekal Senin', 'Cuci dan siapkan tempat minum ramah lingkungan untuk sekolah besok', 25, '🍱')
ON CONFLICT (id) DO NOTHING;

-- D. Seeding Ringkasan Karbon Awal (Clean State: 0 Kg, 0 Pohon, 100% Efisiensi)
INSERT INTO public.school_carbon_stats (id, trees_cataloged, co2_reduced_kg, co2_target_kg, waste_diverted_kg, waste_target_kg, energy_efficiency_percent, energy_saved_kwh, tree_co2_capacity_per_year)
VALUES (1, 0, 0.0, 3500.0, 0.0, 2000.0, 100.0, 0.0, 0.0)
ON CONFLICT (id) DO UPDATE SET
    trees_cataloged = EXCLUDED.trees_cataloged,
    co2_reduced_kg = EXCLUDED.co2_reduced_kg,
    waste_diverted_kg = EXCLUDED.waste_diverted_kg,
    energy_efficiency_percent = EXCLUDED.energy_efficiency_percent,
    energy_saved_kwh = EXCLUDED.energy_saved_kwh,
    tree_co2_capacity_per_year = EXCLUDED.tree_co2_capacity_per_year;

-- CATATAN:
-- Tabel 'trees', 'transactions', dan 'activity_logs' sengaja dikosongkan (Clean State).
-- Pengguna dapat langsung memasukkan data pohon riil dan transaksi setor sampah melalui aplikasi.

SELECT 'Database EcoSchola siap digunakan dalam kondisi Clean Production State!' AS status;
