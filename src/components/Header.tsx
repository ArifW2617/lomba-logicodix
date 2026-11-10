import React from 'react';
import { Shield, ShieldAlert, AlertTriangle, BookOpen, MessageSquareCode, CheckCircle2, PhoneCall, Sparkles } from 'lucide-react';

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
  quizScore,
}) => {
  const tabs = [
    { id: 'assistant' as TabType, label: 'AI Scam Assistant', icon: Sparkles, badge: 'AI Powered' },
    { id: 'simulation' as TabType, label: 'Simulasi Kasus', icon: MessageSquareCode, badge: 'Interaktif' },
    { id: 'quiz' as TabType, label: 'Kuis Edukasi', icon: CheckCircle2, badge: `${quizScore} Poin` },
    { id: 'education' as TabType, label: 'Ensiklopedia Modus', icon: BookOpen, badge: null },
    { id: 'url-scanner' as TabType, label: 'Detektor Link & Domain', icon: ShieldAlert, badge: null },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('assistant')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-indigo-900/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Cek <span className="text-cyan-400">Dulu</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  Anti-Scam Lab
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Platform Edukasi Anti-Penipuan Digital Berbasis AI
              </p>
            </div>
          </div>

          {/* Quick Emergency Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/40 hover:bg-rose-500/25 transition-all shadow-sm group"
              title="Hotline & Panduan Darurat Jika Tertipu"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400 group-hover:animate-bounce" />
              <span className="hidden md:inline">Hotline & Darurat Penipuan</span>
              <span className="md:hidden">Darurat</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-3 pt-1 scrollbar-none text-xs sm:text-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-indigo-800 text-cyan-200'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
