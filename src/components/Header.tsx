import React from 'react';

export type TabType = 'assistant' | 'simulation' | 'quiz' | 'education' | 'url-scanner';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenEmergency: () => void;
  quizScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenEmergency,
}) => {
  const tabs = [
    { id: 'assistant' as TabType, label: 'Periksa pesan' },
    { id: 'simulation' as TabType, label: 'Simulasi kasus' },
    { id: 'quiz' as TabType, label: 'Kuis edukasi' },
    { id: 'education' as TabType, label: 'Ensiklopedia modus' },
    { id: 'url-scanner' as TabType, label: 'Cek tautan' },
  ];

  return (
    <>
      <header className="app-header">
        <div className="logo" onClick={() => setActiveTab('assistant')}>
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <path
              d="M18 3 31 8v9c0 8-5.5 13.5-13 16C10.500 30.500 5 25 5 17V8z"
              fill="var(--brand)"
            />
            <path
              d="m12 18 4.500 4.500L25 13.500"
              fill="none"
              stroke="var(--brand-ink)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Cek Dulu
        </div>
        <button className="btn-help" onClick={onOpenEmergency}>
          Kena tipu? <span>Lihat langkah darurat</span>
        </button>
      </header>

      <nav className="app-nav" aria-label="Menu utama">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </>
  );
};
