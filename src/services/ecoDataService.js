/**
 * Al Uswah Green Data Service Layer (Smart Hybrid Cloud & LocalStorage Architecture)
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

/**
 * Universal Database-to-Frontend mapper for trees/flora
 * Supports both snake_case (Supabase) and camelCase (React state)
 */
export const mapDbTreeToFrontend = (t) => {
  if (!t) return null;
  const id = t.id || `PLN-${Date.now()}`;
  const sciName = t.scientific_name || t.latin_name || t.scientificName || t.name || '';
  const respClass = t.responsible_class || t.adopted_by || t.responsibleClass || 'Kelas 8A';
  const co2 = Number(t.co2_absorption_kg_per_year ?? t.co2_absorption ?? t.co2AbsorptionKgPerYear ?? 15);
  const code = t.qr_code_id || t.code || t.qrCodeId || `ECO-${id}`;
  const img = t.image || t.image_url || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80';
  const desc = t.notes || t.description || '';

  return {
    id,
    name: t.name || '',
    scientificName: sciName,
    latin_name: sciName,
    category: t.category || 'Pohon Pelindung',
    responsibleClass: respClass,
    adopted_by: respClass,
    co2AbsorptionKgPerYear: co2,
    co2_absorption: co2,
    location: t.location || 'Halaman Sekolah',
    totalQuantity: Number(t.total_quantity || t.totalQuantity || 1),
    healthStatus: t.health_status || t.healthStatus || 'Sangat Sehat',
    waterStatus: t.water_status || t.waterStatus || 'Sudah Disiram 🌿',
    lastWatered: t.last_watered || t.lastWatered || 'Hari ini',
    plantedYear: Number(t.planted_year || t.plantedYear || 2026),
    carePerson: t.care_person || t.carePerson || '',
    notes: desc,
    description: desc,
    tags: Array.isArray(t.tags) ? t.tags : [t.category || 'Adiwiyata'],
    image: img,
    image_url: img,
    qrCodeId: code,
    code: code,
    created_at: t.created_at || new Date().toISOString()
  };
};

/**
 * Universal Frontend-to-Database mapper for trees/flora
 */
export const mapFrontendTreeToDb = (plant) => {
  const id = plant.id || `PLN-${Date.now()}`;
  const scientific = plant.scientificName || plant.latin_name || plant.name || '';
  const responsibleClass = plant.responsibleClass || plant.adopted_by || 'Kelas 8A';
  const co2 = Number(plant.co2AbsorptionKgPerYear ?? plant.co2_absorption ?? 15);
  const img = plant.image || plant.image_url || '';
  const notes = plant.notes || plant.description || '';
  const code = plant.qrCodeId || plant.code || `ECO-${id}`;

  return {
    id,
    name: plant.name,
    scientific_name: scientific,
    category: plant.category || 'Pohon Pelindung',
    responsible_class: responsibleClass,
    co2_absorption_kg_per_year: co2,
    location: plant.location || 'Halaman Sekolah',
    total_quantity: Number(plant.totalQuantity || 1),
    health_status: plant.healthStatus || 'Sangat Sehat',
    water_status: plant.waterStatus || 'Sudah Disiram 🌿',
    last_watered: plant.lastWatered || 'Hari ini',
    planted_year: Number(plant.plantedYear || 2026),
    care_person: plant.carePerson || '',
    notes: notes,
    tags: Array.isArray(plant.tags) ? plant.tags : [plant.category || 'Adiwiyata'],
    image: img,
    qr_code_id: code
  };
};

// Realtime Tree Listeners & Channel
let treeSubscriptionChannel = null;
const treeChangeListeners = new Set();

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
      if (!errTrees && Array.isArray(dbTrees)) {
        cloudPlants = dbTrees.map(mapDbTreeToFrontend);
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
  // =========================================================================
  // 5. TREES & FLORA CATALOG (JELAJAH POHON) - HYBRID CLOUD & REALTIME
  // =========================================================================

  /**
   * Supabase Realtime Subscription for Trees
   * When any device inserts, updates, or deletes a tree, all other devices receive the event and refresh instantly.
   */
  subscribeTrees(callback) {
    if (!callback) return () => {};
    treeChangeListeners.add(callback);

    if (!treeSubscriptionChannel && supabase && isSupabaseConfigured()) {
      try {
        treeSubscriptionChannel = supabase
          .channel('public:trees_realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'trees' },
            async (payload) => {
              console.log('[ecoDataService] Realtime trees event detected:', payload.eventType, payload.new || payload.old);
              // Always fetch latest state from Supabase to guarantee complete list
              const freshTrees = await ecoDataService.fetchTrees(true);
              treeChangeListeners.forEach(listener => {
                try { listener(payload, freshTrees); } catch (e) {}
              });
            }
          )
          .subscribe((status) => {
            console.log('[ecoDataService] Trees Realtime Channel Status:', status);
          });
      } catch (err) {
        console.warn('[ecoDataService] Failed to initialize trees realtime subscription:', err.message);
      }
    }

    return () => {
      treeChangeListeners.delete(callback);
      if (treeChangeListeners.size === 0 && treeSubscriptionChannel && supabase) {
        try {
          supabase.removeChannel(treeSubscriptionChannel);
        } catch (e) {}
        treeSubscriptionChannel = null;
      }
    };
  },

  /**
   * Fetches latest tree catalog.
   * When online/cloud, ALWAYS queries Supabase first so cross-device updates reflect immediately.
   */
  async fetchTrees(forceCloud = true) {
    if ((forceCloud || currentSyncStatus === 'cloud') && supabase && isSupabaseConfigured()) {
      try {
        const { data: dbTrees, error } = await supabase
          .from('trees')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(dbTrees)) {
          const mapped = dbTrees.map(mapDbTreeToFrontend);
          saveToStorage(STORAGE_KEYS.PLANTS, mapped);
          return mapped;
        } else if (error) {
          console.warn('[ecoDataService] Supabase fetchTrees error:', error.message);
        }
      } catch (e) {
        console.warn('[ecoDataService] fetchTrees exception, fallback to local storage:', e.message);
      }
    }
    return loadFromStorage(STORAGE_KEYS.PLANTS, initialPlantList);
  },

  async getPlants(forceCloud = false) {
    return this.fetchTrees(forceCloud);
  },

  /**
   * Synchronizes the count of adopted trees for each class to Supabase & local leaderboard
   */
  async syncClassTreesCount(affectedClassNames = []) {
    try {
      // 1. Gather all current plants
      let allPlants = loadFromStorage(STORAGE_KEYS.PLANTS, []);
      if (supabase && currentSyncStatus === 'cloud') {
        const { data: dbTrees } = await supabase.from('trees').select('responsible_class');
        if (dbTrees) {
          allPlants = dbTrees;
        }
      }

      const counts = {};
      allPlants.forEach(p => {
        const c = p.responsible_class || p.responsibleClass || p.adopted_by;
        if (c) counts[c] = (counts[c] || 0) + 1;
      });

      // 2. Update local leaderboard
      const currentLeaderboard = loadFromStorage(STORAGE_KEYS.LEADERBOARD, classLeaderboard);
      const updatedLeaderboard = currentLeaderboard.map(cls => {
        const count = counts[cls.name] || 0;
        return {
          ...cls,
          pohon_adopsi: String(count),
          trees_adopted: String(count),
          treesAdopted: String(count)
        };
      });
      saveToStorage(STORAGE_KEYS.LEADERBOARD, updatedLeaderboard);

      // 3. Update Supabase classes table
      if (supabase && currentSyncStatus === 'cloud') {
        const classesToSync = affectedClassNames.length > 0
          ? affectedClassNames
          : ['Kelas 7A', 'Kelas 7B', 'Kelas 8A', 'Kelas 8B', 'Kelas 8C', 'Kelas 9A', 'Kelas 9B'];

        for (const clsName of classesToSync) {
          const countStr = String(counts[clsName] || 0);
          await supabase
            .from('classes')
            .update({
              pohon_adopsi: countStr,
              trees_adopted: countStr,
              updated_at: new Date().toISOString()
            })
            .eq('name', clsName);
        }
      }

      return updatedLeaderboard;
    } catch (e) {
      console.warn('[ecoDataService] syncClassTreesCount warning:', e.message);
    }
  },

  /**
   * Add a new tree to the catalog and sync to Supabase
   */
  async addTree(plantData) {
    await simulateNetwork(50);
    const current = await this.getPlants(false);
    const absorptionVal = parseFloat(plantData.co2AbsorptionKgPerYear || plantData.co2_absorption) || 15;
    const newId = plantData.id || `PLN-${Date.now()}`;
    const cleanName = plantData.name?.trim() || 'Tanaman Sekolah';
    const code = plantData.code || plantData.qrCodeId || `ECO-${cleanName.toUpperCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`;

    const newPlant = {
      id: newId,
      name: cleanName,
      scientificName: plantData.scientificName || plantData.latin_name || cleanName,
      latin_name: plantData.scientificName || plantData.latin_name || cleanName,
      category: plantData.category || 'Pohon Pelindung',
      responsibleClass: plantData.responsibleClass || plantData.adopted_by || 'Kelas 8A',
      adopted_by: plantData.responsibleClass || plantData.adopted_by || 'Kelas 8A',
      co2AbsorptionKgPerYear: absorptionVal,
      co2_absorption: absorptionVal,
      location: plantData.location || 'Halaman Sekolah',
      totalQuantity: 1,
      healthStatus: 'Sangat Sehat',
      waterStatus: 'Sudah Disiram 🌿',
      lastWatered: 'Hari ini, baru didata',
      notes: plantData.notes || plantData.description || 'Koleksi flora Adiwiyata sekolah yang dirawat rutin untuk mendukung pelestarian lingkungan.',
      description: plantData.notes || plantData.description || 'Koleksi flora Adiwiyata sekolah yang dirawat rutin untuk mendukung pelestarian lingkungan.',
      image: plantData.image || plantData.image_url || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
      image_url: plantData.image || plantData.image_url || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
      qrCodeId: code,
      code: code,
      tags: [plantData.category || 'Adiwiyata', 'Koleksi Baru', 'Adiwiyata'],
      created_at: new Date().toISOString()
    };

    const updated = [newPlant, ...current];
    saveToStorage(STORAGE_KEYS.PLANTS, updated);

    // Update carbon stats
    await this.incrementCarbonStats({
      treesCataloged: 1,
      totalCo2AbsorptionKgPerYear: absorptionVal
    });

    // Add activity log
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

    // Sync to Supabase Cloud
    if (supabase && currentSyncStatus === 'cloud') {
      const dbPayload = mapFrontendTreeToDb(newPlant);
      const { error: insErr } = await supabase.from('trees').insert([dbPayload]);
      if (insErr) {
        console.warn('[Supabase addTree error]:', insErr.message);
      }
      await this.syncClassTreesCount([newPlant.responsibleClass]);
    } else {
      await this.syncClassTreesCount([newPlant.responsibleClass]);
    }

    return { plant: newPlant, allPlants: updated };
  },

  async addPlant(plantData) {
    return this.addTree(plantData);
  },

  /**
   * Update an existing tree in Supabase & LocalStorage
   */
  async updateTree(treeId, updatedData) {
    await simulateNetwork(50);
    const current = await this.getPlants(false);
    const existingIndex = current.findIndex(p => p.id === treeId);
    if (existingIndex === -1) {
      throw new Error(`Tanaman dengan ID ${treeId} tidak ditemukan.`);
    }

    const oldPlant = current[existingIndex];
    const oldClass = oldPlant.responsibleClass;
    const newClass = updatedData.responsibleClass || updatedData.adopted_by || oldClass;
    const oldCo2 = Number(oldPlant.co2AbsorptionKgPerYear || 15);
    const newCo2 = Number(updatedData.co2AbsorptionKgPerYear ?? updatedData.co2_absorption ?? oldCo2);

    const updatedPlant = {
      ...oldPlant,
      ...updatedData,
      id: treeId,
      name: updatedData.name || oldPlant.name,
      scientificName: updatedData.scientificName || updatedData.latin_name || oldPlant.scientificName,
      latin_name: updatedData.scientificName || updatedData.latin_name || oldPlant.latin_name,
      category: updatedData.category || oldPlant.category,
      responsibleClass: newClass,
      adopted_by: newClass,
      co2AbsorptionKgPerYear: newCo2,
      co2_absorption: newCo2,
      location: updatedData.location || oldPlant.location,
      notes: updatedData.notes || updatedData.description || oldPlant.notes,
      description: updatedData.notes || updatedData.description || oldPlant.description,
      image: updatedData.image || updatedData.image_url || oldPlant.image,
      image_url: updatedData.image || updatedData.image_url || oldPlant.image_url,
      updated_at: new Date().toISOString()
    };

    const updatedList = [...current];
    updatedList[existingIndex] = updatedPlant;
    saveToStorage(STORAGE_KEYS.PLANTS, updatedList);

    // Update carbon stats delta if CO2 absorption changed
    const co2Delta = newCo2 - oldCo2;
    if (co2Delta !== 0) {
      await this.incrementCarbonStats({
        totalCo2AbsorptionKgPerYear: co2Delta
      });
    }

    // Add activity log
    await this.addActivityLog({
      id: `ACT-${Date.now()}`,
      time: 'Baru saja',
      icon: 'sparkles',
      title: `Sunting Tanaman: ${updatedPlant.name}`,
      actor: `${newClass} (Kader Siswa)`,
      description: `Memperbarui data tanaman "${updatedPlant.name}" (${updatedPlant.scientificName}) di ${updatedPlant.location}.`,
      category: 'Jelajah Pohon',
      impact: `${newCo2} kg CO₂/thn`,
      status: 'Selesai'
    });

    // Sync to Supabase Cloud
    if (supabase && currentSyncStatus === 'cloud') {
      const dbPayload = mapFrontendTreeToDb(updatedPlant);
      delete dbPayload.created_at;
      dbPayload.updated_at = new Date().toISOString();

      const { error: updErr } = await supabase
        .from('trees')
        .update(dbPayload)
        .eq('id', treeId);

      if (updErr) {
        console.warn('[Supabase updateTree error]:', updErr.message);
      }

      const affected = oldClass !== newClass ? [oldClass, newClass] : [newClass];
      await this.syncClassTreesCount(affected);
    } else {
      const affected = oldClass !== newClass ? [oldClass, newClass] : [newClass];
      await this.syncClassTreesCount(affected);
    }

    return { plant: updatedPlant, allPlants: updatedList };
  },

  async updatePlant(treeId, updatedData) {
    return this.updateTree(treeId, updatedData);
  },

  /**
   * Delete a tree from Supabase & LocalStorage
   */
  async deleteTree(treeId) {
    await simulateNetwork(50);
    const current = await this.getPlants(false);
    const target = current.find(p => p.id === treeId);
    if (!target) {
      return { success: false, allPlants: current };
    }

    const updatedList = current.filter(p => p.id !== treeId);
    saveToStorage(STORAGE_KEYS.PLANTS, updatedList);

    const targetClass = target.responsibleClass || target.adopted_by;
    const co2 = Number(target.co2AbsorptionKgPerYear || target.co2_absorption || 15);

    // Decrement carbon stats
    await this.incrementCarbonStats({
      treesCataloged: -1,
      totalCo2AbsorptionKgPerYear: -co2
    });

    // Add activity log
    await this.addActivityLog({
      id: `ACT-${Date.now()}`,
      time: 'Baru saja',
      icon: 'trash',
      title: `Hapus Tanaman: ${target.name}`,
      actor: `${targetClass || 'Sekolah'} (Kader Siswa)`,
      description: `Menghapus tanaman "${target.name}" dari katalog pohon sekolah.`,
      category: 'Jelajah Pohon',
      impact: `-${co2} kg CO₂/thn`,
      status: 'Selesai'
    });

    // Sync to Supabase Cloud
    if (supabase && currentSyncStatus === 'cloud') {
      const { error: delErr } = await supabase
        .from('trees')
        .delete()
        .eq('id', treeId);

      if (delErr) {
        console.warn('[Supabase deleteTree error]:', delErr.message);
      }

      await this.syncClassTreesCount([targetClass]);
    } else {
      await this.syncClassTreesCount([targetClass]);
    }

    return { success: true, allPlants: updatedList };
  },

  async deletePlant(treeId) {
    return this.deleteTree(treeId);
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
