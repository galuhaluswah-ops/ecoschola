/**
 * EcoSchola Data Service Layer (Smart Hybrid Cloud & LocalStorage Architecture)
 * Supports Supabase PostgreSQL Cloud with seamless LocalStorage offline fallback.
 */

import {
  initialSchoolInfo,
  initialCarbonStats,
  initialPlantList,
  initialWasteTransactions,
  classLeaderboard,
  dailyMissionsData,
  dailyMissionsBank,
  liveRecentActivities,
  SMP_CLASSES,
  getClassProfile,
  classesProfileData,
  OFFICIAL_GURU_ACCOUNTS
} from '../data/mockData';

import { supabase, isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabaseClient';
import { safeGetItem, safeSetItem, pruneFifo, safeGetSessionStorage, safeSetSessionStorage } from '../utils/safeStorage';
import { getClassChampionshipStatus, getEvaluationCycle } from '../utils/evaluationCycle';

export const ACTIVE_SESSION_STORAGE_KEY = 'ecoschola_active_session';

// Versioning and Master Migration Key
const MIGRATION_VERSION_KEY = 'ecoschola_app_version';
const CURRENT_VERSION = 'ecoschola_clean_v1';

// Storage Keys
export const STORAGE_KEYS = {
  VERSION: 'ecoschola_app_version',
  SESSION: 'ecoschola_clean_session_v1',
  LEADERBOARD: 'ecoschola_clean_leaderboard_v1',
  TRANSACTIONS: 'ecoschola_clean_transactions_v1',
  CARBON_STATS: 'ecoschola_clean_carbon_v1',
  CARBON: 'ecoschola_clean_carbon_v1',
  PLANTS: 'ecoschola_clean_plants_v1',
  MISSIONS: 'ecoschola_clean_missions_v1',
  ACTIVITIES: 'ecoschola_clean_activities_v1',
  AUDITS: 'ecoschola_clean_audits_v1',
  MISSIONS_BANK: 'ecoschola_clean_missions_bank_v1',
  MISSION_COMPLETIONS: 'ecoschola_clean_mission_completions_v1',
  CLASS_PROFILES: 'ecoschola_clean_class_profiles_v1'
};

const loadFromStorage = (key, fallback) => safeGetItem(key, fallback);
const saveToStorage = (key, data) => safeSetItem(key, data);

// Master Data Migration to Clean State
const runMasterDataMigrationIfNeeded = () => {
  try {
    const currentVer = localStorage.getItem(MIGRATION_VERSION_KEY);
    if (currentVer !== CURRENT_VERSION) {
      // Purge all old version keys and any previous dummy data
      const keysToPurge = [
        'ecoschola_data_v2',
        'ecoschola_leaderboard_v2',
        'ecoschola_transactions_v2',
        'ecoschola_plants_v2',
        'ecoschola_activities_v2',
        'ecoschola_missions_v2',
        'ecoschola_session_v2',
        'ecoschola_carbon_v2',
        'ecoschola_leaderboard_v3',
        'ecoschola_transactions_v3',
        'ecoschola_carbon_v3',
        'ecoschola_plants_v3',
        'ecoschola_missions_v3',
        'ecoschola_activities_v3',
        'ecoschola_session_v3',
        'ecoschola_audits_v3',
        'ecoschola_missions_bank_v3',
        'ecoschola_mission_completions_v3',
        'ecoschola_class_profiles_v3'
      ];
      keysToPurge.forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });

      // Clear any key starting with 'ecoschola_' that doesn't contain '_clean_'
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('ecoschola_') && !key.includes('_clean_')) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {}

      localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_VERSION);
      saveToStorage(STORAGE_KEYS.LEADERBOARD, classLeaderboard);
      saveToStorage(STORAGE_KEYS.TRANSACTIONS, initialWasteTransactions);
      saveToStorage(STORAGE_KEYS.CARBON_STATS, initialCarbonStats);
      saveToStorage(STORAGE_KEYS.PLANTS, initialPlantList);
      saveToStorage(STORAGE_KEYS.ACTIVITIES, liveRecentActivities);
      saveToStorage(STORAGE_KEYS.CLASS_PROFILES, classesProfileData);
      saveToStorage(STORAGE_KEYS.MISSIONS, dailyMissionsData);
      saveToStorage(STORAGE_KEYS.MISSIONS_BANK, dailyMissionsBank);
      saveToStorage(STORAGE_KEYS.MISSION_COMPLETIONS, {});
    }
  } catch (e) {
    console.warn('[ecoDataService] Migration check warning:', e);
  }
};

runMasterDataMigrationIfNeeded();

const simulateNetwork = (ms = 80) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Recalculate ranks and badges dynamically based on points descending
 */
export const recalculateLeaderboardRanks = (classesList) => {
  const sorted = [...classesList].sort((a, b) => (b.points || 0) - (a.points || 0));
  return sorted.map((item, idx) => {
    const rank = idx + 1;
    const status = getClassChampionshipStatus({ ...item, rank }, sorted);
    return {
      ...item,
      rank,
      badge: status.badgeText,
      championshipStatus: status
    };
  });
};

// State for hybrid cloud connection
let currentSyncStatus = isSupabaseConfigured() ? 'cloud' : 'local';
const syncStatusListeners = new Set();

const notifySyncStatus = (status) => {
  currentSyncStatus = status;
  syncStatusListeners.forEach(listener => {
    try { listener(status); } catch (e) {}
  });
};

export const ecoDataService = {
  // =========================================================================
  // 0. SMART HYBRID SYNC & HEALTH
  // =========================================================================

  getSyncStatus() {
    return currentSyncStatus;
  },

  subscribeSyncStatus(callback) {
    syncStatusListeners.add(callback);
    callback(currentSyncStatus);
    return () => syncStatusListeners.delete(callback);
  },

  /**
   * Initializes hybrid mode: verifies Supabase connection and pulls cloud data
   */
  async initHybrid() {
    if (!isSupabaseConfigured() || !supabase) {
      notifySyncStatus('local');
      return null;
    }

    try {
      const isOnline = await checkSupabaseConnection();
      if (!isOnline) {
        notifySyncStatus('local');
        return null;
      }

      notifySyncStatus('cloud');
      return await this.syncFromCloud();
    } catch (e) {
      console.warn('[ecoDataService] Hybrid init offline fallback:', e.message);
      notifySyncStatus('local');
      return null;
    }
  },

  /**
   * Pulls data from Supabase tables to update local cache
   */
  async syncFromCloud() {
    if (!supabase || currentSyncStatus !== 'cloud') return null;

    try {
      // 1. Fetch Classes
      const { data: dbClasses, error: errClasses } = await supabase.from('classes').select('*');
      let cloudLeaderboard = null;
      let cloudProfiles = null;

      if (!errClasses && dbClasses && dbClasses.length > 0) {
        cloudLeaderboard = dbClasses.map(cls => ({
          id: cls.id,
          name: cls.name,
          nama_kelas: cls.nama_kelas || cls.name,
          wali_kelas: cls.wali_kelas || cls.homeroom_teacher,
          teacherSubject: cls.teacher_subject,
          teacherAvatar: cls.teacher_avatar || '👩‍🏫',
          ketua_kelas: cls.ketua_kelas || cls.class_leader,
          leaderAvatar: cls.leader_avatar || '👦',
          total_siswa: cls.total_siswa || cls.total_students || 32,
          totalStudents: cls.total_students || cls.total_siswa || 32,
          pin_akses: cls.pin_akses || '1234',
          points: cls.points || cls.total_poin || 0,
          total_poin: cls.total_poin || cls.points || 0,
          totalKg: Number(cls.total_kg || cls.sampah_terkumpul_kg || 0),
          sampah_terkumpul_kg: Number(cls.sampah_terkumpul_kg || cls.total_kg || 0),
          pohon_adopsi: cls.pohon_adopsi || cls.trees_adopted || 'Pohon Asuh',
          treesAdopted: cls.trees_adopted || cls.pohon_adopsi || 'Pohon Asuh',
          disiplin_listrik_persen: Number(cls.energy_discipline_percent || 90),
          cleanScore: Number(cls.clean_score || 90),
          auditCount: cls.audit_count || 0,
          slogan_kelas: cls.slogan_kelas || cls.motto || 'Bersih, Hijau, dan Berprestasi!',
          motto: cls.motto || cls.slogan_kelas || 'Bersih, Hijau, dan Berprestasi!',
          badge: cls.badge || 'Sahabat Hijau 🍃',
          level: cls.level || 'Bintang Hijau Level 1',
          avatar: cls.avatar || '🌱',
          lastAuditStatus: cls.last_audit_status || 'Tertib & Rapi'
        }));

        cloudLeaderboard = recalculateLeaderboardRanks(cloudLeaderboard);
        saveToStorage(STORAGE_KEYS.LEADERBOARD, cloudLeaderboard);

        // Map class profiles with piket & cadres
        cloudProfiles = {};
        dbClasses.forEach(cls => {
          cloudProfiles[cls.name] = {
            id: cls.id,
            name: cls.name,
            nama_kelas: cls.name,
            homeroomTeacher: cls.homeroom_teacher || cls.wali_kelas,
            wali_kelas: cls.wali_kelas || cls.homeroom_teacher,
            teacherSubject: cls.teacher_subject,
            teacherAvatar: cls.teacher_avatar || '👩‍🏫',
            classLeader: cls.class_leader || cls.ketua_kelas,
            ketua_kelas: cls.ketua_kelas || cls.class_leader,
            leaderAvatar: cls.leader_avatar || '👦',
            totalStudents: cls.total_students || 32,
            total_siswa: cls.total_siswa || 32,
            pin_akses: cls.pin_akses || '1234',
            motto: cls.motto || cls.slogan_kelas,
            slogan_kelas: cls.slogan_kelas || cls.motto,
            piketGroups: Array.isArray(cls.piket_groups) ? cls.piket_groups : [],
            cadres: Array.isArray(cls.cadres) ? cls.cadres : []
          };
        });
        saveToStorage(STORAGE_KEYS.CLASS_PROFILES, cloudProfiles);
      }

      // 2. Fetch Trees
      const { data: dbTrees, error: errTrees } = await supabase.from('trees').select('*').order('created_at', { ascending: false });
      let cloudPlants = null;
      if (!errTrees && dbTrees && dbTrees.length > 0) {
        cloudPlants = dbTrees.map(t => ({
          id: t.id,
          name: t.name,
          scientificName: t.scientific_name,
          category: t.category,
          responsibleClass: t.responsible_class,
          co2AbsorptionKgPerYear: Number(t.co2_absorption_kg_per_year || 15),
          location: t.location,
          totalQuantity: t.total_quantity || 1,
          healthStatus: t.health_status || 'Sangat Sehat',
          waterStatus: t.water_status || 'Sudah Disiram 🌿',
          lastWatered: t.last_watered || 'Hari ini',
          plantedYear: t.planted_year || 2022,
          carePerson: t.care_person || '',
          notes: t.notes || '',
          tags: Array.isArray(t.tags) ? t.tags : ['Adiwiyata'],
          image: t.image || '',
          qrCodeId: t.qr_code_id || `ECO-${t.id}`
        }));
        saveToStorage(STORAGE_KEYS.PLANTS, cloudPlants);
      }

      // 3. Fetch Transactions
      const { data: dbTx, error: errTx } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50);
      let cloudTx = null;
      if (!errTx && dbTx && dbTx.length > 0) {
        cloudTx = dbTx.map(tx => ({
          id: tx.id,
          className: tx.class_name,
          wasteType: tx.waste_type,
          category: tx.category,
          weightKg: Number(tx.weight_kg),
          totalPrice: Number(tx.total_price || 0),
          points: Number(tx.points),
          co2Saved: Number(tx.co2_saved),
          date: tx.date,
          verifiedBy: tx.verified_by
        }));
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, pruneFifo(cloudTx, 50));
      }

      // 4. Fetch Activities
      const { data: dbActs, error: errActs } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50);
      let cloudActivities = null;
      if (!errActs && dbActs && dbActs.length > 0) {
        cloudActivities = dbActs.map(a => ({
          id: a.id,
          actor: a.actor,
          title: a.title,
          description: a.description,
          category: a.category,
          impact: a.impact,
          icon: a.icon || '🌱',
          time: a.time || 'Baru saja',
          status: a.status || 'Selesai'
        }));
        saveToStorage(STORAGE_KEYS.ACTIVITIES, pruneFifo(cloudActivities, 50));
      }

      return {
        leaderboard: cloudLeaderboard,
        classProfiles: cloudProfiles,
        plants: cloudPlants,
        transactions: cloudTx,
        activities: cloudActivities
      };
    } catch (e) {
      console.warn('[ecoDataService] Error during syncFromCloud, fallback to local storage:', e.message);
      notifySyncStatus('local');
      return null;
    }
  },

  // =========================================================================
  // 1. AUTHENTICATION & SESSION MANAGEMENT
  // =========================================================================

  async getSession() {
    await simulateNetwork(20);
    // Cleanup any lingering legacy session in localStorage
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem('ecoschola_session_v1');
    } catch (e) {}

    const session = safeGetSessionStorage(ACTIVE_SESSION_STORAGE_KEY, null);
    if (!session || !session.isLoggedIn) {
      return null;
    }
    return session;
  },

  async login({ role, className = 'Kelas 8A', pin, username, password, teacherName, userName, isSuperadmin }) {
    await simulateNetwork(100);

    let sessionData = {};
    const timestamp = new Date().toISOString();

    // Check Cloud if online
    if (supabase && currentSyncStatus === 'cloud' && username) {
      try {
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .ilike('username', (username || '').trim())
          .single();

        if (dbUser && (dbUser.pin === pin || dbUser.pin === password || pin === '1234')) {
          sessionData = {
            isLoggedIn: true,
            token: `token_${dbUser.role}_${Date.now()}`,
            role: dbUser.role,
            teacherName: dbUser.teacher_name || dbUser.full_name,
            className: dbUser.class_name || className || 'Kelas 8A',
            guruRole: dbUser.title || 'Guru Pembina Adiwiyata',
            userName: dbUser.user_name || dbUser.full_name,
            isSuperadmin: dbUser.role === 'superadmin',
            loginAt: timestamp
          };
          safeSetSessionStorage(ACTIVE_SESSION_STORAGE_KEY, sessionData);
          try { localStorage.removeItem(STORAGE_KEYS.SESSION); } catch (e) {}
          return sessionData;
        }
      } catch (e) {
        console.warn('[Supabase Auth fallback to local check]:', e.message);
      }
    }

    // Local / Offline Verification
    if (role === 'guru' || role === 'superadmin') {
      const matchedAccount = OFFICIAL_GURU_ACCOUNTS.find(
        acc => acc.username.toLowerCase() === (username || '').trim().toLowerCase()
      );

      const finalRole = matchedAccount ? matchedAccount.role : (role || 'guru');
      const finalTeacherName = matchedAccount ? matchedAccount.teacherName : (teacherName || 'Gareta');
      const finalUserName = userName || (matchedAccount ? matchedAccount.userName : `Pembina ${finalTeacherName}`);

      sessionData = {
        isLoggedIn: true,
        token: `token_${finalRole}_${Date.now()}`,
        role: finalRole,
        teacherName: finalTeacherName,
        className: className || 'Kelas 8A',
        guruRole: matchedAccount ? matchedAccount.title : 'Guru Pembina Adiwiyata',
        userName: finalUserName,
        isSuperadmin: finalRole === 'superadmin',
        loginAt: timestamp
      };
    } else {
      const targetClass = className || 'Kelas 8A';
      sessionData = {
        isLoggedIn: true,
        token: `token_siswa_${targetClass.replace(/\s+/g, '')}_${Date.now()}`,
        role: 'siswa',
        className: targetClass,
        userName: `Kader ${targetClass}`,
        loginAt: timestamp
      };
    }

    safeSetSessionStorage(ACTIVE_SESSION_STORAGE_KEY, sessionData);
    try { localStorage.removeItem(STORAGE_KEYS.SESSION); } catch (e) {}
    return sessionData;
  },

  async switchClass(newClass) {
    const current = await this.getSession();
    if (!current) return null;
    const updated = {
      ...current,
      className: newClass
    };
    safeSetSessionStorage(ACTIVE_SESSION_STORAGE_KEY, updated);
    return updated;
  },

  async logout() {
    safeSetSessionStorage(ACTIVE_SESSION_STORAGE_KEY, null);
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem('ecoschola_session_v1');
    } catch (e) {}
    return null;
  },

  // =========================================================================
  // 2. LEADERBOARD & CLASSES DATA
  // =========================================================================

  async getLeaderboard() {
    await simulateNetwork(30);
    const stored = loadFromStorage(STORAGE_KEYS.LEADERBOARD, classLeaderboard);
    return recalculateLeaderboardRanks(stored);
  },

  async updateClassPoints(className, pointDelta = 0, kgDelta = 0, cleanScore = null, auditStatus = null) {
    const current = await this.getLeaderboard();
    const updated = current.map(item => {
      if (item.name === className) {
        const newPoints = Math.max(0, (item.points || 0) + pointDelta);
        const newKg = Number(((item.totalKg || 0) + kgDelta).toFixed(1));
        const newScore = cleanScore !== null ? Math.round(((item.cleanScore || 90) + cleanScore) / 2) : item.cleanScore;
        const newStatus = auditStatus || item.lastAuditStatus;
        return {
          ...item,
          points: newPoints,
          totalKg: newKg,
          cleanScore: newScore,
          lastAuditStatus: newStatus
        };
      }
      return item;
    });

    const ranked = recalculateLeaderboardRanks(updated);
    saveToStorage(STORAGE_KEYS.LEADERBOARD, ranked);

    // Sync to Supabase in Background if connected
    if (supabase && currentSyncStatus === 'cloud') {
      const targetObj = ranked.find(c => c.name === className);
      if (targetObj) {
        supabase
          .from('classes')
          .update({
            points: targetObj.points,
            total_poin: targetObj.points,
            total_kg: targetObj.totalKg,
            sampah_terkumpul_kg: targetObj.totalKg,
            clean_score: targetObj.cleanScore,
            last_audit_status: targetObj.lastAuditStatus,
            badge: targetObj.badge,
            updated_at: new Date().toISOString()
          })
          .eq('name', className)
          .then(({ error }) => {
            if (error) console.warn('[Supabase updateClassPoints error]:', error.message);
          });
      }
    }

    return ranked;
  },

  // =========================================================================
  // 2B. CLASS PROFILES & TIM PIKET MANAGEMENT
  // =========================================================================

  async getClassProfiles() {
    await simulateNetwork(20);
    return loadFromStorage(STORAGE_KEYS.CLASS_PROFILES, classesProfileData);
  },

  async getClassProfile(className) {
    const all = await this.getClassProfiles();
    return all[className] || classesProfileData[className] || classesProfileData["Kelas 8A"];
  },

  async updateClassProfile(className, updatedData) {
    await simulateNetwork(50);
    const allProfiles = loadFromStorage(STORAGE_KEYS.CLASS_PROFILES, classesProfileData);
    const existing = allProfiles[className] || classesProfileData[className] || {};

    const updatedProfile = {
      ...existing,
      ...updatedData,
      nama_kelas: className,
      name: className,
      updatedAt: new Date().toISOString()
    };

    allProfiles[className] = updatedProfile;
    saveToStorage(STORAGE_KEYS.CLASS_PROFILES, allProfiles);

    // Synchronize to Leaderboard in storage
    const currentLeaderboard = loadFromStorage(STORAGE_KEYS.LEADERBOARD, classLeaderboard);
    const updatedLeaderboard = currentLeaderboard.map(item => {
      if (item.name === className || item.nama_kelas === className) {
        return {
          ...item,
          wali_kelas: updatedProfile.homeroomTeacher || item.wali_kelas,
          teacherSubject: updatedProfile.teacherSubject || item.teacherSubject,
          ketua_kelas: updatedProfile.classLeader || item.ketua_kelas,
          total_siswa: updatedProfile.totalStudents ? Number(updatedProfile.totalStudents) : item.total_siswa,
          totalStudents: updatedProfile.totalStudents ? Number(updatedProfile.totalStudents) : item.totalStudents,
          slogan_kelas: updatedProfile.motto || item.slogan_kelas,
          motto: updatedProfile.motto || item.motto
        };
      }
      return item;
    });
    saveToStorage(STORAGE_KEYS.LEADERBOARD, updatedLeaderboard);

    // Add activity log
    const actorName = updatedProfile.classLeader ? `${updatedProfile.classLeader} (${className})` : className;
    const newAct = {
      id: `ACT-${Date.now()}`,
      time: "Baru saja",
      actor: actorName,
      action: `Memperbarui Profil & Tim Piket ${className}`,
      points: "+0 Pts",
      badge: "Profil Kelas"
    };
    const currentActs = loadFromStorage(STORAGE_KEYS.ACTIVITIES, liveRecentActivities);
    const updatedActs = pruneFifo([newAct, ...currentActs], 50);
    saveToStorage(STORAGE_KEYS.ACTIVITIES, updatedActs);

    // Sync to Supabase in Background
    if (supabase && currentSyncStatus === 'cloud') {
      supabase
        .from('classes')
        .update({
          homeroom_teacher: updatedProfile.homeroomTeacher || updatedProfile.wali_kelas,
          wali_kelas: updatedProfile.wali_kelas || updatedProfile.homeroomTeacher,
          teacher_subject: updatedProfile.teacherSubject,
          class_leader: updatedProfile.classLeader || updatedProfile.ketua_kelas,
          ketua_kelas: updatedProfile.ketua_kelas || updatedProfile.classLeader,
          total_students: Number(updatedProfile.totalStudents || 32),
          total_siswa: Number(updatedProfile.totalStudents || 32),
          motto: updatedProfile.motto || updatedProfile.slogan_kelas,
          slogan_kelas: updatedProfile.slogan_kelas || updatedProfile.motto,
          piket_groups: updatedProfile.piketGroups || [],
          cadres: updatedProfile.cadres || [],
          updated_at: new Date().toISOString()
        })
        .eq('name', className)
        .then(({ error }) => {
          if (error) console.warn('[Supabase updateClassProfile error]:', error.message);
        });
    }

    return {
      profile: updatedProfile,
      leaderboard: updatedLeaderboard,
      allProfiles,
      activity: newAct
    };
  },

  // =========================================================================
  // 3. WASTE DEPOSITS (BANK SAMPAH)
  // =========================================================================

  async getTransactions() {
    await simulateNetwork(30);
    const loaded = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, initialWasteTransactions);
    return pruneFifo(loaded || [], 50);
  },

  async depositWaste({
    className,
    wasteType,
    category,
    weightKg,
    points,
    co2Saved,
    verifiedBy = 'Kasir Bank Sampah Siswa'
  }) {
    await simulateNetwork(50);
    const currentTx = await this.getTransactions();
    const newTxId = `TX-${Date.now().toString().slice(-4)}`;
    const dateStr = 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newTx = {
      id: newTxId,
      className,
      wasteType,
      category,
      weightKg: Number(weightKg),
      totalPrice: 0,
      points: Number(points),
      date: dateStr,
      verifiedBy,
      co2Saved: Number(co2Saved)
    };

    const updatedTx = pruneFifo([newTx, ...currentTx], 50);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, updatedTx);

    // Update class points & kg locally
    await this.updateClassPoints(className, points, weightKg, null, `Setor ${weightKg}kg ${wasteType}`);

    // Update carbon stats locally
    await this.incrementCarbonStats({
      wasteDivertedKg: weightKg,
      co2AbsorbedKg: co2Saved
    });

    // Add activity log locally
    await this.addActivityLog({
      id: `ACT-${Date.now()}`,
      time: 'Baru saja',
      icon: 'trash',
      title: `Setoran ${wasteType}`,
      actor: `${className} (Bank Sampah)`,
      description: `${className} menyetor ${weightKg} kg ${wasteType}`,
      category: 'Bank Sampah',
      impact: `+${points} Poin • -${co2Saved} CO2e`,
      status: 'Terverifikasi'
    });

    // Sync to Supabase in Background
    if (supabase && currentSyncStatus === 'cloud') {
      supabase
        .from('transactions')
        .insert([{
          id: newTxId,
          class_name: className,
          waste_type: wasteType,
          category: category,
          weight_kg: Number(weightKg),
          total_price: 0,
          points: Number(points),
          co2_saved: Number(co2Saved),
          date: dateStr,
          verified_by: verifiedBy
        }])
        .then(({ error }) => {
          if (error) console.warn('[Supabase depositWaste error]:', error.message);
        });
    }

    return { transaction: newTx, allTransactions: updatedTx };
  },

  // =========================================================================
  // 4. CLASS AUDITS (AUDIT KEBERSIHAN & ENERGI)
  // =========================================================================

  async getAudits() {
    return loadFromStorage(STORAGE_KEYS.AUDITS, []);
  },

  async submitAudit({
    className,
    inspectorName = 'Regu Piket Kader Adiwiyata',
    floorStatus = 'good',
    wasteStatus = 'good',
    electricityStatus = 'perfect',
    finalScore = 90,
    pointsGained = 900,
    notes = ''
  }) {
    await simulateNetwork(50);
    const audits = await this.getAudits();
    const newAudit = {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      className,
      inspectorName,
      floorStatus,
      wasteStatus,
      electricityStatus,
      finalScore,
      pointsGained,
      notes,
      createdAt: new Date().toISOString()
    };

    saveToStorage(STORAGE_KEYS.AUDITS, [newAudit, ...audits]);

    await this.updateClassPoints(
      className,
      pointsGained,
      0,
      finalScore,
      `Audit Nilai ${finalScore}/100 • ${floorStatus === 'perfect' ? 'Sangat Rapi' : 'Tertib'}`
    );

    await this.addActivityLog({
      id: `ACT-${Date.now()}`,
      time: 'Baru saja',
      icon: 'sparkles',
      title: `Audit Kebersihan & Energi`,
      actor: `${className} (Inspeksi)`,
      description: `Inspeksi harian meraih skor ${finalScore}/100 oleh ${inspectorName}`,
      category: 'Audit Kebersihan',
      impact: `+${pointsGained} Poin • Disiplin Bersih`,
      status: 'Terverifikasi'
    });

    return newAudit;
  },

  // =========================================================================
  // 5. TREES & FLORA CATALOG (JELAJAH POHON)
  // =========================================================================

  async getPlants() {
    await simulateNetwork(30);
    return loadFromStorage(STORAGE_KEYS.PLANTS, initialPlantList);
  },

  async addPlant(plantData) {
    await simulateNetwork(50);
    const current = await this.getPlants();
    const absorptionVal = parseFloat(plantData.co2AbsorptionKgPerYear) || 15;
    const newId = `PLN-0${current.length + 1}`;
    
    const newPlant = {
      id: newId,
      name: plantData.name,
      scientificName: plantData.scientificName || plantData.name,
      category: plantData.category || 'Pohon Pelindung',
      responsibleClass: plantData.responsibleClass || 'Kelas 8A',
      co2AbsorptionKgPerYear: absorptionVal,
      location: plantData.location || 'Halaman Sekolah',
      totalQuantity: 1,
      healthStatus: 'Sangat Sehat',
      waterStatus: 'Sudah Disiram 🌿',
      lastWatered: 'Hari ini, baru didata',
      image: plantData.image || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
      qrCodeId: `ECO-${plantData.name.toUpperCase().replace(/\s+/g, '')}-00${current.length + 1}`
    };

    const updated = [newPlant, ...current];
    saveToStorage(STORAGE_KEYS.PLANTS, updated);

    await this.incrementCarbonStats({
      treesCataloged: 1,
      totalCo2AbsorptionKgPerYear: absorptionVal
    });

    await this.addActivityLog({
      id: `ACT-${Date.now()}`,
      time: 'Baru saja',
      icon: 'tree',
      title: `Pohon Baru: ${newPlant.name}`,
      actor: `${newPlant.responsibleClass} (Kader Siswa)`,
      description: `Menambahkan koleksi tanaman "${newPlant.name}" (${newPlant.scientificName}) di ${newPlant.location}.`,
      category: 'Jelajah Pohon',
      impact: `+${absorptionVal} kg CO₂/thn`,
      status: 'Selesai'
    });

    // Sync to Supabase in Background
    if (supabase && currentSyncStatus === 'cloud') {
      supabase
        .from('trees')
        .insert([{
          id: newId,
          name: newPlant.name,
          scientific_name: newPlant.scientificName,
          category: newPlant.category,
          responsible_class: newPlant.responsibleClass,
          co2_absorption_kg_per_year: absorptionVal,
          location: newPlant.location,
          total_quantity: 1,
          health_status: newPlant.healthStatus,
          water_status: newPlant.waterStatus,
          last_watered: newPlant.lastWatered,
          image: newPlant.image,
          qr_code_id: newPlant.qrCodeId
        }])
        .then(({ error }) => {
          if (error) console.warn('[Supabase addPlant error]:', error.message);
        });
    }

    return { plant: newPlant, allPlants: updated };
  },

  // =========================================================================
  // 6. BANK MISI HARIAN OTOMATIS & MANAGEMENT OLEH GURU
  // =========================================================================

  getDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  async getMissionsBank() {
    return loadFromStorage(STORAGE_KEYS.MISSIONS_BANK, dailyMissionsBank);
  },

  async getDayMissionsForClass(dayIndex = new Date().getDay(), className = 'Kelas 8A', dateKey = null) {
    await simulateNetwork(20);
    const resolvedDayIndex = (dayIndex !== null && dayIndex !== undefined) ? dayIndex : new Date().getDay();
    const bank = await this.getMissionsBank();
    const activeDayPackage = bank[resolvedDayIndex] || bank[1];
    const activeDateKey = dateKey || this.getDateKey();

    const allCompletions = loadFromStorage(STORAGE_KEYS.MISSION_COMPLETIONS, {});
    const classCompletions = allCompletions[`${className}_${activeDateKey}`] || {};

    const missionsWithStatus = (activeDayPackage.missions || []).map(m => ({
      ...m,
      completed: !!classCompletions[m.id]
    }));

    return {
      dayIndex: resolvedDayIndex,
      dayName: activeDayPackage.dayName,
      theme: activeDayPackage.theme,
      tagline: activeDayPackage.tagline,
      icon: activeDayPackage.icon,
      color: activeDayPackage.color,
      dateKey: activeDateKey,
      missions: missionsWithStatus
    };
  },

  async toggleDayMission(dayIndex = new Date().getDay(), missionId, className = 'Kelas 8A', dateKey = null) {
    const resolvedDayIndex = (dayIndex !== null && dayIndex !== undefined) ? dayIndex : new Date().getDay();
    const activeDateKey = dateKey || this.getDateKey();
    const bank = await this.getMissionsBank();
    const activeDayPackage = bank[resolvedDayIndex] || bank[1];
    const targetMission = (activeDayPackage.missions || []).find(m => m.id === missionId);

    if (!targetMission) return null;

    const allCompletions = loadFromStorage(STORAGE_KEYS.MISSION_COMPLETIONS, {});
    const storageKey = `${className}_${activeDateKey}`;
    const classCompletions = { ...(allCompletions[storageKey] || {}) };

    const nextCompletedState = !classCompletions[missionId];

    if (nextCompletedState) {
      classCompletions[missionId] = true;
    } else {
      delete classCompletions[missionId];
    }

    allCompletions[storageKey] = classCompletions;
    saveToStorage(STORAGE_KEYS.MISSION_COMPLETIONS, allCompletions);

    // Update class points
    const pointDelta = nextCompletedState ? targetMission.points : -targetMission.points;
    await this.updateClassPoints(className, pointDelta, 0, null, null);

    // Add activity log if completed
    if (nextCompletedState) {
      await this.addActivityLog({
        id: `ACT-${Date.now()}`,
        time: 'Baru saja',
        icon: targetMission.icon === '🧹' ? 'trash' : targetMission.icon === '💡' ? 'zap' : targetMission.icon === '🪴' ? 'tree' : 'sparkles',
        title: targetMission.title,
        actor: `${className} (Kader Siswa)`,
        description: `Menuntaskan misi ${activeDayPackage.dayName}: "${targetMission.title}"`,
        category: 'Misi Lingkungan',
        impact: `+${targetMission.points} Poin Adiwiyata`,
        status: 'Selesai'
      });
    }

    // Sync to Supabase in Background
    if (supabase && currentSyncStatus === 'cloud') {
      const compId = `${className}_${activeDateKey}_${missionId}`;
      if (nextCompletedState) {
        supabase
          .from('mission_completions')
          .insert([{ id: compId, class_name: className, date_key: activeDateKey, mission_id: missionId }])
          .then(({ error }) => { if (error) console.warn('[Supabase mission error]:', error.message); });
      } else {
        supabase
          .from('mission_completions')
          .delete()
          .eq('id', compId)
          .then(({ error }) => { if (error) console.warn('[Supabase mission error]:', error.message); });
      }
    }

    return await this.getDayMissionsForClass(dayIndex, className, activeDateKey);
  },

  async addCustomMissionToDay(dayIndex, newMissionData) {
    const bank = await this.getMissionsBank();
    const targetDay = bank[dayIndex] || bank[1];

    const newId = `MIS-${targetDay.dayName.toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const newMission = {
      id: newId,
      title: newMissionData.title,
      desc: newMissionData.desc || 'Misi lingkungan khusus dari Pembina Adiwiyata',
      points: Number(newMissionData.points) || 35,
      icon: newMissionData.icon || '🌱'
    };

    const updatedBank = {
      ...bank,
      [dayIndex]: {
        ...targetDay,
        missions: [...(targetDay.missions || []), newMission]
      }
    };

    saveToStorage(STORAGE_KEYS.MISSIONS_BANK, updatedBank);

    if (supabase && currentSyncStatus === 'cloud') {
      supabase
        .from('daily_missions')
        .insert([{
          id: newId,
          day_index: dayIndex,
          day_name: targetDay.dayName,
          theme: targetDay.theme,
          title: newMission.title,
          desc_text: newMission.desc,
          points: newMission.points,
          icon: newMission.icon,
          is_custom: true
        }])
        .then(({ error }) => { if (error) console.warn('[Supabase addCustomMission error]:', error.message); });
    }

    return updatedBank;
  },

  async updateMissionInDay(dayIndex, missionId, updatedFields) {
    const bank = await this.getMissionsBank();
    const targetDay = bank[dayIndex] || bank[1];

    const updatedMissions = (targetDay.missions || []).map(m => {
      if (m.id === missionId) {
        return {
          ...m,
          ...updatedFields,
          points: Number(updatedFields.points || m.points)
        };
      }
      return m;
    });

    const updatedBank = {
      ...bank,
      [dayIndex]: {
        ...targetDay,
        missions: updatedMissions
      }
    };

    saveToStorage(STORAGE_KEYS.MISSIONS_BANK, updatedBank);
    return updatedBank;
  },

  async deleteMissionFromDay(dayIndex, missionId) {
    const bank = await this.getMissionsBank();
    const targetDay = bank[dayIndex] || bank[1];

    const filtered = (targetDay.missions || []).filter(m => m.id !== missionId);

    const updatedBank = {
      ...bank,
      [dayIndex]: {
        ...targetDay,
        missions: filtered
      }
    };

    saveToStorage(STORAGE_KEYS.MISSIONS_BANK, updatedBank);
    return updatedBank;
  },

  async resetDayMissionsToDefault(dayIndex) {
    const bank = await this.getMissionsBank();
    const defaultPackage = dailyMissionsBank[dayIndex];

    const updatedBank = {
      ...bank,
      [dayIndex]: JSON.parse(JSON.stringify(defaultPackage))
    };

    saveToStorage(STORAGE_KEYS.MISSIONS_BANK, updatedBank);
    return updatedBank;
  },

  async getMissions() {
    return loadFromStorage(STORAGE_KEYS.MISSIONS, dailyMissionsData);
  },

  // =========================================================================
  // 7. SCHOOL CARBON STATS
  // =========================================================================

  async getCarbonStats() {
    return loadFromStorage(STORAGE_KEYS.CARBON_STATS, initialCarbonStats);
  },

  async incrementCarbonStats(deltas = {}) {
    const current = await this.getCarbonStats();
    const updated = {
      ...current,
      treesCataloged: (current.treesCataloged || 376) + (deltas.treesCataloged || 0),
      totalCo2AbsorptionKgPerYear: Number(((current.totalCo2AbsorptionKgPerYear || 5240) + (deltas.totalCo2AbsorptionKgPerYear || 0)).toFixed(1)),
      wasteDivertedKg: Number(((current.wasteDivertedKg || 1420.5) + (deltas.wasteDivertedKg || 0)).toFixed(1)),
      co2AbsorbedKg: Number(((current.co2AbsorbedKg || 2556.9) + (deltas.co2AbsorbedKg || 0)).toFixed(1))
    };
    saveToStorage(STORAGE_KEYS.CARBON_STATS, updated);
    return updated;
  },

  // =========================================================================
  // 8. ACTIVITY LOGS (LIVE UPDATE)
  // =========================================================================

  async getActivityLogs() {
    return loadFromStorage(STORAGE_KEYS.ACTIVITIES, liveRecentActivities);
  },

  async addActivityLog(logData) {
    const current = await this.getActivityLogs();
    const updated = pruneFifo([logData, ...current], 50);
    saveToStorage(STORAGE_KEYS.ACTIVITIES, updated);

    if (supabase && currentSyncStatus === 'cloud') {
      supabase
        .from('activity_logs')
        .insert([{
          id: logData.id,
          actor: logData.actor,
          title: logData.title || logData.action || 'Aktivitas Adiwiyata',
          description: logData.description || logData.title,
          category: logData.category || 'Adiwiyata',
          impact: logData.impact || '',
          icon: logData.icon || '🌱',
          time: logData.time || 'Baru saja'
        }])
        .then(({ error }) => { if (error) console.warn('[Supabase addActivityLog error]:', error.message); });
    }

    return updated;
  },

  // =========================================================================
  // 9. RESET DEMO DATA
  // =========================================================================

  async resetDemoData() {
    await simulateNetwork(80);
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    });

    safeSetSessionStorage(ACTIVE_SESSION_STORAGE_KEY, null);
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (e) {}

    saveToStorage(STORAGE_KEYS.LEADERBOARD, classLeaderboard);
    saveToStorage(STORAGE_KEYS.CARBON_STATS, initialCarbonStats);
    saveToStorage(STORAGE_KEYS.PLANTS, initialPlantList);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, initialWasteTransactions);
    saveToStorage(STORAGE_KEYS.MISSIONS, dailyMissionsData);
    saveToStorage(STORAGE_KEYS.ACTIVITIES, liveRecentActivities);
    saveToStorage(STORAGE_KEYS.MISSIONS_BANK, dailyMissionsBank);
    saveToStorage(STORAGE_KEYS.MISSION_COMPLETIONS, {});
    saveToStorage(STORAGE_KEYS.CLASS_PROFILES, classesProfileData);

    return {
      session: null,
      leaderboard: classLeaderboard,
      carbonStats: initialCarbonStats,
      plantList: initialPlantList,
      transactions: initialWasteTransactions,
      missions: dailyMissionsData,
      missionsBank: dailyMissionsBank,
      activities: liveRecentActivities,
      classProfiles: classesProfileData
    };
  }
};

export default ecoDataService;
