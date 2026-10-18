import React from 'react';

export default function BottomNav({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'beranda', label: 'Beranda', icon: '🏠' },
    { id: 'aksi', label: 'Setor & Audit', icon: '⚡' },
    { id: 'pohon', label: 'Pohon', icon: '🌿' },
    { id: 'juara', label: 'Juara', icon: '🏆' },
  ];

  return (
    <nav 
      id="bottom-nav" 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-[#B2DFDB]/60 px-2 py-2 flex items-center justify-around sm:hidden shadow-lg transition-all"
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              isActive 
                ? 'text-[#2E7D32] font-black scale-105' 
                : 'text-slate-400 font-semibold hover:text-slate-600'
            }`}
          >
            <span className={`text-xl transition-transform ${isActive ? 'scale-110 drop-shadow-xs' : 'grayscale-30 opacity-70'}`}>
              {tab.icon}
            </span>
            <span className={`text-xs mt-0.5 tracking-tight ${isActive ? 'text-[#2E7D32] font-black' : 'text-slate-500 font-medium'}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800] mt-0.5 shadow-xs" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
