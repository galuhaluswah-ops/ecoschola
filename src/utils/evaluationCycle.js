/**
 * 5-Day Championship Evaluation Cycle Engine (EcoSchola Production)
 * 
 * Mengatur siklus evaluasi mingguan/5-harian:
 * 1. Default / 0 Poin: Menampilkan status netral & memotivasi "🌱 Pejuang Aktif • Siklus Evaluasi 5 Hari"
 * 2. Periode Berjalan: Memberikan label "Peringkat Sementara"
 * 3. Akhir Siklus (Hari ke-5): Menyematkan gelar resmi "Juara Minggu Ini 🥇🥈🥉"
 */

export const CYCLE_DURATION_DAYS = 5;

// Anchor start timestamp (Release date: 18 Oktober 2026 WIB)
export const EVALUATION_ANCHOR_DATE = new Date('2026-10-18T00:00:00+07:00');

/**
 * Menghitung status siklus evaluasi 5 harian saat ini
 * @param {Date} now - Tanggal evaluasi (default: saat ini)
 */
export function getEvaluationCycle(now = new Date()) {
  const current = now instanceof Date ? now : new Date(now);
  const diffMs = Math.max(0, current.getTime() - EVALUATION_ANCHOR_DATE.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const batchNumber = Math.floor(diffDays / CYCLE_DURATION_DAYS) + 1;
  const dayInBatch = (diffDays % CYCLE_DURATION_DAYS) + 1; // 1 s/d 5
  const daysRemaining = CYCLE_DURATION_DAYS - (diffDays % CYCLE_DURATION_DAYS); // 5 s/d 1
  const isFinalDay = dayInBatch === CYCLE_DURATION_DAYS;

  return {
    batchNumber,
    dayInBatch,
    daysRemaining,
    isFinalDay,
    daysRemainingText: isFinalDay 
      ? 'Hari Ini Penobatan Juara! 🎉' 
      : `${daysRemaining} Hari Lagi`,
    countdownBadge: isFinalDay 
      ? '⏳ Penentuan Juara Hari Ini!' 
      : `⏳ Penentuan Badge Juara: ${daysRemaining} Hari Lagi`
  };
}

/**
 * Menentukan status dan badge kejuaraan kelas secara dinamis
 * @param {object} classData - Data kelas { name, points, rank }
 * @param {Array} leaderboard - Seluruh daftar leaderboard kelas
 * @param {boolean} isOfficialApproval - Apakah telah disahkan manual oleh guru
 */
export function getClassChampionshipStatus(classData, leaderboard = [], isOfficialApproval = false) {
  const points = classData?.points || 0;
  const maxPoints = Array.isArray(leaderboard) && leaderboard.length > 0 
    ? Math.max(...leaderboard.map(c => c.points || 0), 0)
    : points;
  const hasCompetitionStarted = maxPoints > 0;
  const cycle = getEvaluationCycle();

  // 1. KONDISI DEFAULT / PERIODE BERJALAN AWAL (0 Poin)
  if (!hasCompetitionStarted || points === 0) {
    return {
      isNeutral: true,
      badgeText: '🌱 Pejuang Aktif • Siklus Evaluasi 5 Hari',
      subText: cycle.countdownBadge,
      statusLabel: 'Klasemen Awal • Siap Beraksi',
      rankBadge: 'Peringkat Bersama',
      theme: 'neutral'
    };
  }

  // 2. PERIODE AKHIR SIKLUS (Hari ke-5) ATAU DISAHKAN OLEH GURU / SUPERADMIN
  if (cycle.isFinalDay || isOfficialApproval) {
    const rank = classData.rank || 1;
    let badgeText = 'Sahabat Hijau 🍃';
    let theme = 'green';

    if (rank === 1) {
      badgeText = 'Juara 1 Minggu Ini 🥇';
      theme = 'gold';
    } else if (rank === 2) {
      badgeText = 'Juara 2 Minggu Ini 🥈';
      theme = 'silver';
    } else if (rank === 3) {
      badgeText = 'Juara 3 Minggu Ini 🥉';
      theme = 'bronze';
    }

    return {
      isNeutral: false,
      badgeText,
      subText: `Penobatan Resmi Batch #${cycle.batchNumber}`,
      statusLabel: `Juara Resmi #${rank}`,
      rankBadge: `Juara #${rank}`,
      theme
    };
  }

  // 3. PERIODE SEDANG BERJALAN (Poin > 0, Menunggu Evaluasi Batch)
  const rank = classData.rank || 1;
  let badgeText = `Peringkat #${rank} Sementara`;
  let theme = 'blue';

  if (rank === 1) {
    badgeText = 'Peringkat 1 Sementara ⭐';
    theme = 'gold-soft';
  } else if (rank === 2) {
    badgeText = 'Peringkat 2 Sementara 🥈';
    theme = 'silver-soft';
  } else if (rank === 3) {
    badgeText = 'Peringkat 3 Sementara 🥉';
    theme = 'bronze-soft';
  }

  return {
    isNeutral: false,
    badgeText,
    subText: cycle.countdownBadge,
    statusLabel: `Peringkat Sementara #${rank}`,
    rankBadge: `Peringkat #${rank} (Sementara)`,
    theme
  };
}
