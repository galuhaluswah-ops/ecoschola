import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  TrendingUp, 
  Star, 
  CheckCircle2, 
  Filter,
  Medal,
  Flame
} from 'lucide-react';

export default function PapanJuaraView({ leaderboard = [], schoolInfo, onOpenClassProfile }) {
  const [gradeFilter, setGradeFilter] = useState('all'); // 'all' | '7' | '8' | '9'

  // Memoized sorted leaderboard by points (descending) with calculated rank
  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort((a, b) => (b.points || 0) - (a.points || 0)).map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [leaderboard]);

  // Memoized filter leaderboard by grade
  const filteredLeaderboard = useMemo(() => {
    return sortedLeaderboard.filter(c => {
      if (gradeFilter === 'all') return true;
      return c.name.includes(`Kelas ${gradeFilter}`);
    });
  }, [sortedLeaderboard, gradeFilter]);

  // Memoized Top 3 Classes for the Podium
  const { rank1, rank2, rank3 } = useMemo(() => {
    return {
      rank1: sortedLeaderboard[0] || null,
      rank2: sortedLeaderboard[1] || null,
      rank3: sortedLeaderboard[2] || null
    };
  }, [sortedLeaderboard]);

  return (
    <div className="space-y-6 pb-20 animate-pop">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#E0F7FA]/90 via-white to-[#B2DFDB]/70 p-6 sm:p-7 rounded-2xl border border-[#80CBC4]/60 shadow-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#80CBC4] text-xs font-bold text-[#2E7D32] mb-2 shadow-xs">
          <span>🏆</span>
          <span>Klasemen Resmi Sekolah Adiwiyata 2026/2027</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
          Papan Juara Kelas Terhijau 🥇
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Peringkat kelas dihitung otomatis dari poin setor sampah, kepatuhan hemat listrik, dan hasil audit kebersihan harian.
        </p>
      </div>

      {/* ===================================================
          PODIUM TOP 3 KELAS TERHIJAU (CERIA & VISUAL SMP)
          =================================================== */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-md">
        <div className="text-center pb-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Podium Kehormatan
          </span>
          <h2 className="text-lg font-black text-slate-800">Top 3 Kelas Paling Ramah Lingkungan</h2>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 max-w-xl mx-auto">
          
          {/* Rank 2: Juara Perak (Left) */}
          {rank2 && (
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-2xl shadow-sm">
                  {rank2.avatar || '🌿'}
                </div>
                <span className="absolute -top-2 -right-1.5 w-6 h-6 rounded-full bg-slate-300 border border-white text-slate-700 font-black text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
              </div>
              <div className="w-full">
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 block truncate">{rank2.name}</span>
                <span className="text-xs font-black text-[#2E7D32] block">{rank2.points.toLocaleString('id-ID')} pts</span>
              </div>
              {/* Podium Block */}
              <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl border-t-4 border-slate-300 flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-black text-slate-400">🥈</span>
              </div>
            </div>
          )}

          {/* Rank 1: Juara Emas (Center - Highest) */}
          {rank1 && (
            <div className="flex flex-col items-center text-center space-y-2 -mt-4">
              <div className="text-2xl animate-bounce">👑</div>
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-t from-yellow-400 to-yellow-200 border-2 border-yellow-300 flex items-center justify-center text-3xl shadow-gold">
                  {rank1.avatar || '🌱'}
                </div>
                <span className="absolute -top-2 -right-1.5 w-7 h-7 rounded-full bg-gradient-to-t from-yellow-400 to-yellow-200 border border-white text-amber-950 font-black text-xs flex items-center justify-center shadow-xs">
                  1
                </span>
              </div>
              <div className="w-full">
                <span className="text-xs sm:text-base font-black text-slate-800 block truncate">{rank1.name}</span>
                {/* Teks Status Poin Kritis: Hijau Zamrud */}
                <span className="text-xs sm:text-sm font-black text-[#2E7D32] block">{rank1.points.toLocaleString('id-ID')} pts</span>
                <span className="text-xs font-bold text-slate-500 block">{rank1.totalKg} kg sampah</span>
              </div>
              {/* Podium Block Emas */}
              <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-yellow-400/90 to-yellow-200/90 rounded-t-2xl border-t-4 border-yellow-400 flex items-center justify-center shadow-md">
                <span className="text-2xl sm:text-3xl font-black text-amber-800">🥇</span>
              </div>
            </div>
          )}

          {/* Rank 3: Juara Perunggu (Right) */}
          {rank3 && (
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFE0B2] border-2 border-[#FFB74D] flex items-center justify-center text-2xl shadow-sm">
                  {rank3.avatar || '🌳'}
                </div>
                <span className="absolute -top-2 -right-1.5 w-6 h-6 rounded-full bg-[#FFB74D] border border-white text-amber-950 font-black text-xs flex items-center justify-center shadow-xs">
                  3
                </span>
              </div>
              <div className="w-full">
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 block truncate">{rank3.name}</span>
                <span className="text-xs font-black text-[#2E7D32] block">{rank3.points.toLocaleString('id-ID')} pts</span>
              </div>
              {/* Podium Block Perunggu */}
              <div className="w-full h-20 sm:h-22 bg-gradient-to-t from-[#FFE0B2] to-[#FFF3E0] rounded-t-2xl border-t-4 border-[#FFB74D] flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-black text-amber-700">🥉</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Filter Jenjang Kelas (Semua / Kelas 7 / 8 / 9) */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Medal className="w-4 h-4 text-[#2E7D32]" />
          <span>Daftar Klasemen Lengkap</span>
        </h3>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold shadow-xs">
          {[
            { id: 'all', label: 'Semua Kelas' },
            { id: '7', label: 'Kelas 7' },
            { id: '8', label: 'Kelas 8' },
            { id: '9', label: 'Kelas 9' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setGradeFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                gradeFilter === f.id
                  ? 'bg-gradient-to-r from-[#2E7D32] to-[#388E3C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List Kartu Klasemen Kelas (Cards Putih, rounded-2xl, shadow-md) */}
      <div className="space-y-3">
        {filteredLeaderboard.map((item) => (
          <div
            key={item.name}
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              item.rank === 1
                ? 'bg-gradient-to-r from-[#FEFAE0]/80 to-white border-amber-300 shadow-md'
                : item.rank === 2
                ? 'bg-gradient-to-r from-slate-50 to-white border-slate-200 shadow-md'
                : item.rank === 3
                ? 'bg-gradient-to-r from-[#FFF3E0]/70 to-white border-[#FFE0B2] shadow-md'
                : 'bg-white border-slate-100 shadow-md hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3.5">
              {/* Rank Number Pill */}
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                item.rank === 1 ? 'bg-gradient-to-t from-yellow-400 to-yellow-200 text-amber-950 border border-yellow-300 shadow-gold' :
                item.rank === 2 ? 'bg-slate-300 text-slate-800' :
                item.rank === 3 ? 'bg-[#FFB74D] text-amber-950' :
                'bg-slate-100 text-slate-600'
              }`}>
                #{item.rank}
              </div>

              {/* Avatar & Class Title */}
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{item.avatar || '🌱'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-800">{item.name}</span>
                    
                    {/* Lencana Pemenang Juara */}
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-xs ${
                      item.rank === 1 
                        ? 'bg-gradient-to-t from-yellow-400 to-yellow-200 text-amber-950 border-yellow-300' 
                        : item.rank === 2
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : item.rank === 3
                        ? 'bg-[#FFF3E0] text-amber-900 border-[#FFE0B2]'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {item.badge}
                    </span>

                    {/* Tombol Buka Profil Kelas */}
                    {onOpenClassProfile && (
                      <button
                        type="button"
                        onClick={() => onOpenClassProfile(item.name)}
                        className="px-2 py-0.5 rounded-md bg-[#E0F7FA] hover:bg-[#B2DFDB] text-[#00695C] text-[11px] font-bold border border-[#80CBC4]/60 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                        title={`Buka Profil ${item.name}`}
                      >
                        <span>📋 Profil</span>
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium block">
                    {item.lastAuditStatus || item.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics: Kg & Points (Teks Kritis: Hijau Zamrud #2E7D32) */}
            <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 text-right">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Sampah Terpilah</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">{item.totalKg} kg</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Nilai Kebersihan</span>
                <span className="text-xs sm:text-sm font-bold text-[#2E7D32]">{item.cleanScore || 90}/100</span>
              </div>
              <div className="bg-white px-3.5 py-1.5 rounded-xl border border-[#B2DFDB] shadow-xs">
                <span className="text-xs text-slate-400 block font-medium">Poin Adiwiyata</span>
                <span className="text-sm sm:text-base font-black text-[#2E7D32]">
                  {item.points.toLocaleString('id-ID')} <span className="text-xs font-bold text-[#2E7D32]">pts</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
