-- ============================================================================
-- EcoSchola: Smart Adiwiyata & School Carbon Tracker
-- Production-Ready Database Schema Blueprint
-- Compatible with: PostgreSQL 14+, Supabase, Firebase / MySQL
-- ============================================================================

-- Enable UUID extension if on PostgreSQL / Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TABEL: classes (Data Master 9 Kelas SMP 7A - 9C)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS class_audits CASCADE;
DROP TABLE IF EXISTS waste_deposits CASCADE;
DROP TABLE IF EXISTS trees CASCADE;
DROP TABLE IF EXISTS classes CASCADE;

CREATE TABLE classes (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    nama_kelas VARCHAR(20) NOT NULL UNIQUE,          -- contoh: 'Kelas 8A', 'Kelas 7A'
    wali_kelas VARCHAR(100) NOT NULL,               -- contoh: 'Dra. Sri Wahyuni, M.Pd.'
    ketua_kelas VARCHAR(100) NOT NULL,              -- contoh: 'Rayhan Aditya Pratama'
    total_siswa INT NOT NULL DEFAULT 32,
    pin_akses VARCHAR(10) NOT NULL DEFAULT '1234',   -- PIN 4-angka autentikasi kader
    total_poin INT NOT NULL DEFAULT 0,
    total_kg_sampah NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    skor_kebersihan INT NOT NULL DEFAULT 90,
    status_medali VARCHAR(50) NOT NULL DEFAULT 'Bintang Hijau ⭐',
    avatar VARCHAR(10) NOT NULL DEFAULT '🌱',
    motto TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk sorting leaderboard cepat
CREATE INDEX idx_classes_total_poin ON classes (total_poin DESC);

-- ----------------------------------------------------------------------------
-- 2. TABEL: waste_deposits (Bank Sampah Digital Sekolah)
-- ----------------------------------------------------------------------------
CREATE TABLE waste_deposits (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    class_id VARCHAR(36) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    jenis_sampah VARCHAR(100) NOT NULL,             -- contoh: 'Botol Plastik PET'
    kategori VARCHAR(50) NOT NULL,                  -- 'Plastik', 'Kertas', 'Logam', 'Organik/Kompos'
    berat_kg NUMERIC(8, 2) NOT NULL CHECK (berat_kg > 0),
    total_rupiah INT NOT NULL DEFAULT 0,
    poin_didapat INT NOT NULL DEFAULT 0,
    estimasi_co2_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    petugas_verifikasi VARCHAR(100) DEFAULT 'Kasir Bank Sampah Siswa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_waste_class_id ON waste_deposits (class_id);
CREATE INDEX idx_waste_created_at ON waste_deposits (created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. TABEL: class_audits (Inspeksi Kebersihan, Pemilahan & Efisiensi Energi)
-- ----------------------------------------------------------------------------
CREATE TABLE class_audits (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    class_id VARCHAR(36) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    auditor_name VARCHAR(100) NOT NULL,            -- contoh: 'Regu Piket Kader' / 'Dra. Hj. Siti'
    auditor_role VARCHAR(50) NOT NULL DEFAULT 'Kader Siswa', -- 'Kader Siswa' | 'Guru / Pembina'
    skor_kebersihan INT NOT NULL CHECK (skor_kebersihan BETWEEN 0 AND 100),
    skor_energi INT NOT NULL CHECK (skor_energi BETWEEN 0 AND 100),
    skor_pemilahan INT NOT NULL CHECK (skor_pemilahan BETWEEN 0 AND 100),
    total_skor INT NOT NULL CHECK (total_skor BETWEEN 0 AND 100),
    poin_bonus INT NOT NULL DEFAULT 0,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audits_class_id ON class_audits (class_id);
CREATE INDEX idx_audits_created_at ON class_audits (created_at DESC);

-- ----------------------------------------------------------------------------
-- 4. TABEL: trees (Jelajah Pohon & Katalog QR Plakat)
-- ----------------------------------------------------------------------------
CREATE TABLE trees (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    kode_qr VARCHAR(50) NOT NULL UNIQUE,            -- contoh: 'ECO-TREMBESI-001'
    nama_lokal VARCHAR(100) NOT NULL,               -- contoh: 'Pohon Trembesi'
    nama_latin VARCHAR(100),                        -- contoh: 'Samanea saman'
    kategori VARCHAR(50) NOT NULL,                  -- 'Pohon Pelindung', 'TOGA', 'Penyerap Radiasi Indoor'
    class_id_pengadopsi VARCHAR(36) REFERENCES classes(id) ON DELETE SET NULL,
    serapan_co2_tahunan NUMERIC(8, 2) NOT NULL DEFAULT 15.0, -- kg CO2 per tahun
    lokasi VARCHAR(100) NOT NULL DEFAULT 'Halaman Depan',
    status_perawatan VARCHAR(50) NOT NULL DEFAULT 'Sangat Sehat',
    total_jumlah INT NOT NULL DEFAULT 1,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trees_kode_qr ON trees (kode_qr);
CREATE INDEX idx_trees_class_id ON trees (class_id_pengadopsi);

-- ----------------------------------------------------------------------------
-- 5. TABEL: activity_logs (Live Update Aksi Hijau Teman-Teman Hari Ini)
-- ----------------------------------------------------------------------------
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    class_id VARCHAR(36) REFERENCES classes(id) ON DELETE SET NULL,
    aktor VARCHAR(100) NOT NULL,                    -- contoh: 'Kelas 8A (Kader Siswa)'
    tipe_aksi VARCHAR(50) NOT NULL,                 -- 'trash' | 'tree' | 'zap' | 'sparkles'
    kategori VARCHAR(50) NOT NULL,                  -- 'Bank Sampah', 'Audit Kebersihan', 'Jelajah Pohon', 'Misi Lingkungan'
    deskripsi TEXT NOT NULL,
    poin_perubahan INT NOT NULL DEFAULT 0,
    co2_dampak VARCHAR(100),                        -- contoh: '+300 Poin • -27.0 Kg CO₂'
    status VARCHAR(50) NOT NULL DEFAULT 'Selesai',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_created_at ON activity_logs (created_at DESC);

-- ----------------------------------------------------------------------------
-- VIEW: v_leaderboard (Klasemen Real-time dengan Rank Dinamis)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_leaderboard AS
SELECT 
    id,
    nama_kelas,
    wali_kelas,
    ketua_kelas,
    total_poin,
    total_kg_sampah,
    skor_kebersihan,
    avatar,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY total_poin DESC) = 1 THEN 'Juara Emas 🥇'
        WHEN ROW_NUMBER() OVER (ORDER BY total_poin DESC) = 2 THEN 'Juara Perak 🥈'
        WHEN ROW_NUMBER() OVER (ORDER BY total_poin DESC) = 3 THEN 'Juara Perunggu 🥉'
        WHEN ROW_NUMBER() OVER (ORDER BY total_poin DESC) <= 5 THEN 'Regu Teladan ⭐'
        ELSE 'Tunas Hijau 🌱'
    END AS status_medali,
    ROW_NUMBER() OVER (ORDER BY total_poin DESC) AS rank
FROM classes;

-- ============================================================================
-- SEED DATA: 9 KELAS SMP (7A - 9C) & DATA AWAL RESMI
-- ============================================================================

INSERT INTO classes (id, nama_kelas, wali_kelas, ketua_kelas, total_siswa, pin_akses, total_poin, total_kg_sampah, skor_kebersihan, status_medali, avatar, motto) VALUES
('cls-8a', 'Kelas 8A', 'Dra. Sri Wahyuni, M.Pd.', 'Rayhan Aditya Pratama', 32, '1234', 6820, 194.5, 96, 'Juara Emas 🥇', '🌱', '8A Bersih, Hijau, Berprestasi dan Juara!'),
('cls-9b', 'Kelas 9B', 'Ahmad Zulkarnain, S.Pd.', 'Farhan Mahendra', 30, '1234', 6140, 178.2, 94, 'Juara Perak 🥈', '🌿', 'Tumbuh Bersama Alam, Raih Prestasi Gemilang!'),
('cls-7a', 'Kelas 7A', 'Nur Laila Indrawati, S.Si.', 'Zhafir Al-Ghifari', 32, '1234', 5490, 156.0, 91, 'Juara Perunggu 🥉', '🌳', 'Langkah Kecil Kelas 7A, Dampak Besar Bagi Bumi!'),
('cls-8b', 'Kelas 8B', 'Budi Santoso, S.Pd.', 'Gita Ayu Wardani', 32, '1234', 4980, 142.8, 89, 'Regu Teladan ⭐', '🌻', 'Sampah Jadi Berkah, Prestasi Semakin Merekah!'),
('cls-9a', 'Kelas 9A', 'Endang Susilowati, M.Pd.', 'Kevin Maulana', 31, '1234', 4720, 135.5, 88, 'Regu Teladan ⭐', '🍀', 'Hijaukan Sekolah, Sukseskan Adiwiyata!'),
('cls-7c', 'Kelas 7C', 'Rahmat Hidayat, S.Pd.', 'Danang Prasetyo', 32, '1234', 4150, 112.0, 85, 'Tunas Hijau 🌱', '🌾', 'Peduli Lingkungan Sejak Dini!'),
('cls-7b', 'Kelas 7B', 'Siti Fatimah, S.Pd.', 'Jesika Nurul', 32, '1234', 3890, 104.2, 84, 'Tunas Hijau 🌱', '🌿', 'Bersih Kelasku, Segar Udaranya!'),
('cls-8c', 'Kelas 8C', 'Hendra Gunawan, M.Pd.', 'Tio Nugroho', 32, '1234', 3620, 98.6, 82, 'Sahabat Hijau 🍃', '🌱', 'Hemat Listrik, Jaga Bumi Kita!'),
('cls-9c', 'Kelas 9C', 'Dewi Lestari, S.Pd.', 'Adit Saputra', 30, '1234', 3410, 91.0, 80, 'Sahabat Hijau 🍃', '🌾', 'Generasi Emas Peduli Alam Bebas!');

-- Initial Waste Transactions
INSERT INTO waste_deposits (id, class_id, jenis_sampah, kategori, berat_kg, total_rupiah, poin_didapat, estimasi_co2_kg, petugas_verifikasi, created_at) VALUES
('tx-101', 'cls-8a', 'Botol Plastik PET', 'Plastik', 18.5, 64750, 648, 33.3, 'Ahmad Fauzi', NOW() - INTERVAL '2 hours'),
('tx-102', 'cls-9b', 'Kardus Tebal & Karton', 'Kertas', 24.0, 43200, 432, 21.6, 'Siti Rahma', NOW() - INTERVAL '4 hours'),
('tx-103', 'cls-7a', 'Organik / Sisa Buah', 'Organik/Kompos', 22.0, 22000, 330, 15.4, 'Nurul Aini', NOW() - INTERVAL '1 day');

-- Initial Trees
INSERT INTO trees (id, kode_qr, nama_lokal, nama_latin, kategori, class_id_pengadopsi, serapan_co2_tahunan, lokasi, status_perawatan, total_jumlah) VALUES
('tr-01', 'ECO-TREMBESI-001', 'Pohon Trembesi (Pohon Hujan)', 'Samanea saman', 'Pohon Pelindung', 'cls-8a', 28.5, 'Halaman Utama Sekolah', 'Sangat Sehat', 8),
('tr-02', 'ECO-LIDAHMERTUA-002', 'Lidah Mertua (Sansevieria)', 'Sansevieria trifasciata', 'Penyerap Radiasi Indoor', 'cls-8a', 4.2, 'Koridor Kelas Lantai 1 & 2', 'Sangat Sehat', 45),
('tr-03', 'ECO-TABEBUYA-003', 'Tabebuya Kuning', 'Handroanthus chrysotrichus', 'Pohon Pelindung', 'cls-7a', 18.2, 'Taman Depan Gerbang Utama', 'Sangat Sehat', 14),
('tr-04', 'ECO-LIDAHBUAYA-004', 'Lidah Buaya (Aloe Vera)', 'Aloe barbadensis miller', 'TOGA', 'cls-8a', 3.8, 'Taman Herbal TOGA Samping Lab', 'Sangat Sehat', 28),
('tr-05', 'ECO-PUCUKMERAH-005', 'Pucuk Merah', 'Syzygium myrtifolium', 'Pohon Pelindung', 'cls-8b', 12.0, 'Pembatas Lapangan Upacara', 'Sehat', 30);

-- Initial Activity Logs
INSERT INTO activity_logs (id, class_id, aktor, tipe_aksi, kategori, deskripsi, poin_perubahan, co2_dampak, status, created_at) VALUES
('act-01', 'cls-8a', 'Kelas 8A (Kader Siswa)', 'trash', 'Bank Sampah', 'Kelas 8A menyetor 15 kg sampah plastik botol PET ke Bank Sampah', 300, '+300 Poin • -27.0 Kg CO₂', 'Terverifikasi', NOW() - INTERVAL '10 minutes'),
('act-02', 'cls-7c', 'Kader Adiwiyata (Tim 7C)', 'tree', 'Konservasi Pohon', 'Pohon Mahoni #04 disiram dengan air hujan terolah', 50, 'Tandon Air Hujan Aktif', 'Selesai', NOW() - INTERVAL '35 minutes'),
('act-03', 'cls-9b', 'Kelas 9B (Regu Piket Harum)', 'sparkles', 'Audit Kebersihan', 'Inspeksi kelas meraih skor 98% higienis & bebas plastik', 980, '100% Tumbler & Misting', 'Memenuhi SOP', NOW() - INTERVAL '2 hours');
