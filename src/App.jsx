import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import PwaInstallModal from './components/PwaInstallModal';

// Simplified Views for Middle Schoolers
import HomeView from './views/HomeView';
import AksiHarianView from './views/AksiHarianView';
import JelajahPohonView from './views/JelajahPohonView';
import PapanJuaraView from './views/PapanJuaraView';
import LoginModal from './components/LoginModal';
import ClassProfileModal from './components/ClassProfileModal';

// Data Service Layer
import ecoDataService, { recalculateLeaderboardRanks, STORAGE_KEYS, ACTIVE_SESSION_STORAGE_KEY } from './services/ecoDataService';
import { 
  initialSchoolInfo, 
  initialCarbonStats, 
  initialPlantList, 
  initialWasteTransactions, 
  classLeaderboard, 
  dailyMissionsData,
  liveRecentActivities,
  classesProfileData
} from './data/mockData';

import { safeGetItem, safeSetItem, pruneFifo, safeGetSessionStorage } from './utils/safeStorage';
import { validateSessionIntegrity, DEFAULT_SAFE_SESSION } from './utils/security';
import { isStandaloneMode, isMobileDevice, shareAppInvite } from './utils/pwaHelper';

const sanitizeTransactions = (txList) => {
  if (!Array.isArray(txList)) return [];
  const VALID_CLASSES = ['Kelas 7A', 'Kelas 7B', 'Kelas 8A', 'Kelas 8B', 'Kelas 8C', 'Kelas 9A', 'Kelas 9B'];
  return txList.map(tx => {
    let c = tx.className;
    if (!VALID_CLASSES.includes(c)) {
      if (c?.includes('7')) c = 'Kelas 7A';
      else if (c?.includes('8')) c = 'Kelas 8A';
      else c = 'Kelas 9B';
    }
    return { ...tx, className: c };
  });
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('beranda');
  const [aksiSubTab, setAksiSubTab] = useState('setor'); // 'setor' | 'audit'
  const [pwaModalOpen, setPwaModalOpen] = useState(false);

  // Core Data States with safe localStorage persistence and FIFO limits
  const [schoolInfo] = useState(initialSchoolInfo);
  const [carbonStats, setCarbonStats] = useState(() => safeGetItem(STORAGE_KEYS.CARBON, initialCarbonStats));
  const [plantList, setPlantList] = useState(() => safeGetItem(STORAGE_KEYS.PLANTS, initialPlantList));
  const [transactions, setTransactions] = useState(() => pruneFifo(sanitizeTransactions(safeGetItem(STORAGE_KEYS.TRANSACTIONS, initialWasteTransactions)), 50));
  const [leaderboard, setLeaderboard] = useState(() => recalculateLeaderboardRanks(safeGetItem(STORAGE_KEYS.LEADERBOARD, classLeaderboard)));
  const [missions, setMissions] = useState(() => safeGetItem(STORAGE_KEYS.MISSIONS, dailyMissionsData));
  const [recentActivities, setRecentActivities] = useState(() => pruneFifo(safeGetItem(STORAGE_KEYS.ACTIVITIES, liveRecentActivities), 50));
  const [classProfiles, setClassProfiles] = useState(() => safeGetItem(STORAGE_KEYS.CLASS_PROFILES, classesProfileData));

  // Smart Hybrid Sync Status State ('cloud' | 'local')
  const [syncStatus, setSyncStatus] = useState(() => ecoDataService.getSyncStatus());

  // Subscribe to EcoDataService hybrid cloud/local sync status, init cloud sync & realtime trees
  useEffect(() => {
    const unsubscribeStatus = ecoDataService.subscribeSyncStatus((status) => {
      setSyncStatus(status);
    });

    // Realtime Supabase subscription for cross-device tree sync
    const unsubscribeTrees = ecoDataService.subscribeTrees((payload, freshTrees) => {
      if (freshTrees) {
        setPlantList(freshTrees);
      }
    });

    // Auto-initialize hybrid cloud sync on app mount
    ecoDataService.initHybrid().then((cloudData) => {
      if (cloudData) {
        if (cloudData.leaderboard) setLeaderboard(cloudData.leaderboard);
        if (cloudData.classProfiles) setClassProfiles(cloudData.classProfiles);
        if (cloudData.plants) setPlantList(cloudData.plants);
        if (cloudData.transactions) setTransactions(cloudData.transactions);
        if (cloudData.activities) setRecentActivities(cloudData.activities);
      }
    });

    return () => {
      if (unsubscribeStatus) unsubscribeStatus();
      if (unsubscribeTrees) unsubscribeTrees();
    };
  }, []);

  // User Authentication & Session State loaded from sessionStorage (null if not authenticated)
  const [session, setSession] = useState(() => {
    const rawSession = safeGetSessionStorage(ACTIVE_SESSION_STORAGE_KEY, null);
    const { session: validated } = validateSessionIntegrity(rawSession);
    return validated;
  });

  const myClass = session?.className || 'Kelas 8A';
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [classProfileModalOpen, setClassProfileModalOpen] = useState(false);
  const [profileModalClass, setProfileModalClass] = useState(() => session?.className || 'Kelas 8A');

  // Sinkronkan target Profil Kelas otomatis saat pengguna login/berganti akun
  useEffect(() => {
    if (session?.className) {
      setProfileModalClass(session.className);
    }
  }, [session?.className]);

  // Auto-sync core states to LocalStorage via safeSetItem (QuotaExceededError handled)
  // NOTE: Sesi login aktif disimpan di sessionStorage ('ecoschola_active_session')
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.LEADERBOARD, leaderboard);
    safeSetItem(STORAGE_KEYS.CARBON, carbonStats);
    safeSetItem(STORAGE_KEYS.PLANTS, plantList);
    safeSetItem(STORAGE_KEYS.TRANSACTIONS, pruneFifo(transactions, 50));
    safeSetItem(STORAGE_KEYS.MISSIONS, missions);
    safeSetItem(STORAGE_KEYS.ACTIVITIES, pruneFifo(recentActivities, 50));
    safeSetItem(STORAGE_KEYS.CLASS_PROFILES, classProfiles);
  }, [leaderboard, carbonStats, plantList, transactions, missions, recentActivities, classProfiles]);

  // Open profile modal for any class (eksplisit mengutamakan targetClass yang dikirim)
  const handleOpenClassProfile = useCallback((targetClass) => {
    const finalTarget = targetClass || session?.className || myClass;
    setProfileModalClass(finalTarget);
    setClassProfileModalOpen(true);
  }, [session?.className, myClass]);

  // Save class profile handler with real-time state synchronization
  const handleSaveClassProfile = async (targetClass, updatedData) => {
    const result = await ecoDataService.updateClassProfile(targetClass, updatedData);
    setClassProfiles(result.allProfiles);
    setLeaderboard(result.leaderboard);
    if (result.activity) {
      setRecentActivities(prev => [result.activity, ...prev]);
    }
    return result;
  };

  // Navigation Helper memoized
  const handleNavigate = useCallback((tab, subTab = 'setor') => {
    setCurrentTab(tab);
    if (subTab) setAksiSubTab(subTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Real-time synchronization for "Aksi Hijau Teman-Teman Hari Ini" with FIFO max 50 limit
  const handleAddRecentActivity = useCallback((newAct) => {
    setRecentActivities(prev => pruneFifo([newAct, ...prev], 50));
  }, []);

  // Session Handlers (Login / Logout / Switch Class)
  const handleLoginSuccess = async (loginPayload) => {
    const role = typeof loginPayload === 'object' ? loginPayload.role : 'siswa';
    const targetClass = typeof loginPayload === 'object' ? loginPayload.className : loginPayload;
    const guruRole = typeof loginPayload === 'object' ? loginPayload.guruRole : null;
    const username = typeof loginPayload === 'object' ? (loginPayload.username || loginPayload.guruId) : null;
    const teacherName = typeof loginPayload === 'object' ? loginPayload.teacherName : null;
    const userName = typeof loginPayload === 'object' ? loginPayload.userName : null;
    const isSuperadmin = typeof loginPayload === 'object' ? loginPayload.isSuperadmin : false;

    const newSession = await ecoDataService.login({
      role,
      className: targetClass,
      guruRole,
      username,
      teacherName,
      userName,
      isSuperadmin
    });

    const { session: validated } = validateSessionIntegrity(newSession);
    setSession(validated);
    setLoginModalOpen(false);
  };

  const handleLogout = async () => {
    await ecoDataService.logout();
    setSession(null);
    setLoginModalOpen(false);
    setClassProfileModalOpen(false);
  };

  const handleSwitchClass = async (newClass) => {
    const updated = await ecoDataService.switchClass(newClass);
    setSession(updated);
  };


  // PWA Install & Auto-Prompt Event Management
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(() => isStandaloneMode());
  const [pwaModalTab, setPwaModalTab] = useState('install');

  useEffect(() => {
    if (isStandaloneMode()) {
      setIsPwaInstalled(true);
    }

    // Auto-open modal if URL contains ?install=true and not already in standalone mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('install') === 'true' && !isStandaloneMode()) {
      setPwaModalTab('install');
      setPwaModalOpen(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // If user came via ?install=true on mobile Android, automatically prompt
      if (new URLSearchParams(window.location.search).get('install') === 'true') {
        e.prompt().catch(() => {});
      }
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
      setPwaModalOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleTriggerNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPwaInstalled(true);
        setPwaModalOpen(false);
      }
      setDeferredPrompt(null);
    } else {
      setPwaModalTab('install');
      setPwaModalOpen(true);
    }
  };

  // =========================================================================
  // AUTH GUARD: Gerbang Utama Login Layar Penuh (Conditional Rendering)
  // Jika belum login (!session || !session.isLoggedIn), render HANYA LoginModal
  // Jangan me-render Navbar, Beranda/Dashboard, maupun konten di belakangnya.
  // =========================================================================
  if (!session || !session.isLoggedIn) {
    return (
      <>
        <LoginModal
          isOpen={true}
          isGate={true}
          onClose={() => {}}
          currentClass={myClass}
          onLoginSuccess={handleLoginSuccess}
          onOpenInstall={() => {
            if (deferredPrompt) {
              handleTriggerNativeInstall();
            } else {
              setPwaModalTab('install');
              setPwaModalOpen(true);
            }
          }}
          onOpenShare={() => {
            setPwaModalTab('share');
            setPwaModalOpen(true);
          }}
          isPwaInstalled={isPwaInstalled}
          canInstallNative={!!deferredPrompt}
        />

        {/* PWA Smart Install & Share Modal for Login Gate */}
        <PwaInstallModal
          isOpen={pwaModalOpen}
          onClose={() => setPwaModalOpen(false)}
          onInstallNative={handleTriggerNativeInstall}
          canInstallNative={!!deferredPrompt}
          isInstalled={isPwaInstalled}
          defaultTab={pwaModalTab}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-sans transition-colors">
      

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        canInstallPwa={!!deferredPrompt}
        onInstallPwa={() => {
          if (deferredPrompt) {
            handleTriggerNativeInstall();
          } else {
            setPwaModalTab('install');
            setPwaModalOpen(true);
          }
        }}
        onShareApp={() => {
          setPwaModalTab('share');
          setPwaModalOpen(true);
        }}
        isPwaInstalled={isPwaInstalled}
        schoolInfo={schoolInfo}
        myClass={myClass}
        userSession={session}
        syncStatus={syncStatus}
        onOpenClassProfile={handleOpenClassProfile}
        onOpenLogin={() => setLoginModalOpen(true)}
        onSelectClass={handleSwitchClass}
        onLogout={handleLogout}
      />

      {/* Main Content Container (Mobile-First Max Width) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 pb-16">
        
        {/* Tab 1: Beranda */}
        {currentTab === 'beranda' && (
          <HomeView
            schoolInfo={schoolInfo}
            carbonStats={carbonStats}
            plantList={plantList}
            myClass={myClass}
            leaderboard={leaderboard}
            setLeaderboard={setLeaderboard}
            missions={missions}
            setMissions={setMissions}
            onNavigate={handleNavigate}
            recentActivities={recentActivities}
            onOpenClassProfile={handleOpenClassProfile}
            onOpenLogin={() => setLoginModalOpen(true)}
            onAddRecentActivity={handleAddRecentActivity}
            userSession={session}
          />
        )}

        {/* Tab 2: Aksi Harian (Setor & Audit) */}
        {currentTab === 'aksi' && (
          <AksiHarianView
            initialSubTab={aksiSubTab}
            transactions={transactions}
            setTransactions={setTransactions}
            leaderboard={leaderboard}
            setLeaderboard={setLeaderboard}
            carbonStats={carbonStats}
            setCarbonStats={setCarbonStats}
            onAddRecentActivity={handleAddRecentActivity}
            onNavigate={handleNavigate}
            userSession={session}
            myClass={myClass}
          />
        )}

        {/* Tab 3: Jelajah Pohon (Katalog QR) */}
        {currentTab === 'pohon' && (
          <JelajahPohonView
            plantList={plantList}
            setPlantList={setPlantList}
            setCarbonStats={setCarbonStats}
            onAddRecentActivity={handleAddRecentActivity}
            userSession={session}
            myClass={myClass}
            setLeaderboard={setLeaderboard}
          />
        )}

        {/* Tab 4: Papan Juara (Leaderboard) */}
        {currentTab === 'juara' && (
          <PapanJuaraView
            leaderboard={leaderboard}
            schoolInfo={schoolInfo}
            onOpenClassProfile={handleOpenClassProfile}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Feature 1: Login / Masuk Akun Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        currentClass={myClass}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Feature 2: Class Profile Modal (Wali Kelas, Ketua Kelas, Piket, Kader) */}
      <ClassProfileModal
        isOpen={classProfileModalOpen}
        onClose={() => setClassProfileModalOpen(false)}
        currentClass={profileModalClass || myClass}
        leaderboard={leaderboard}
        userSession={session}
        classProfiles={classProfiles}
        onSaveProfile={handleSaveClassProfile}
        onSwitchAccount={() => {
          setClassProfileModalOpen(false);
          handleLogout();
        }}
        onOpenLogin={() => {
          setClassProfileModalOpen(false);
          handleLogout();
        }}
        onLogout={handleLogout}
      />

      {/* PWA Install & Share Modal Prompt */}
      <PwaInstallModal
        isOpen={pwaModalOpen}
        onClose={() => setPwaModalOpen(false)}
        onInstallNative={handleTriggerNativeInstall}
        canInstallNative={!!deferredPrompt}
        isInstalled={isPwaInstalled}
        defaultTab={pwaModalTab}
      />

      {/* Elegant Hybrid Sync Status Floating Badge */}
      <aside aria-label="Status Sinkronisasi Backend" className="fixed bottom-20 sm:bottom-4 right-4 z-30 pointer-events-none">
        <div
          id="sync-status-badge"
          className={`px-3 py-1.5 rounded-full text-[11px] font-black shadow-lg border backdrop-blur-md flex items-center gap-1.5 transition-all duration-300 pointer-events-auto cursor-help select-none ${
            syncStatus === 'cloud'
              ? 'bg-emerald-50/95 text-emerald-800 border-emerald-300 shadow-emerald-500/10'
              : 'bg-amber-50/95 text-amber-900 border-amber-300 shadow-amber-500/10'
          }`}
          title={
            syncStatus === 'cloud'
              ? 'Terhubung ke Supabase PostgreSQL Cloud (Sinkronisasi Otomatis Aktif)'
              : 'Berjalan di LocalStorage Mode (Offline Resilient & Cepat)'
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              syncStatus === 'cloud' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>{syncStatus === 'cloud' ? '☁️ Cloud Synced' : '⚡ Local Mode'}</span>
        </div>
      </aside>

      {/* Extra bottom padding helper for mobile phones */}
      <div className="h-16 sm:hidden" />
    </div>
  );
}
