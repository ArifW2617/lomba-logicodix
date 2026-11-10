/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, TabType } from './components/Header';
import { AiScannerTab } from './components/AiScannerTab';
import { SimulationTab } from './components/SimulationTab';
import { QuizTab } from './components/QuizTab';
import { EducationTab } from './components/EducationTab';
import { UrlInspectorTab } from './components/UrlInspectorTab';
import { EmergencyModal } from './components/EmergencyModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('assistant');
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [quizScore, setQuizScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cekdulu_xp') || localStorage.getItem('scamaware_xp');
      return saved ? parseInt(saved, 10) : 100;
    } catch {
      return 100;
    }
  });

  const handleAddScore = (points: number) => {
    setQuizScore((prev) => {
      const updated = prev + points;
      try {
        localStorage.setItem('cekdulu_xp', updated.toString());
      } catch {
        // ignore
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEmergency={() => setEmergencyOpen(true)}
        quizScore={quizScore}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'assistant' && (
          <AiScannerTab
            onGoToQuiz={() => setActiveTab('quiz')}
            onGoToSimulation={() => setActiveTab('simulation')}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationTab onAddScore={handleAddScore} />
        )}

        {activeTab === 'quiz' && (
          <QuizTab score={quizScore} onAddScore={handleAddScore} />
        )}

        {activeTab === 'education' && <EducationTab />}

        {activeTab === 'url-scanner' && <UrlInspectorTab />}
      </main>

      {/* Emergency Modal Pop-up */}
      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/95 py-8 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
              C
            </div>
            <span className="font-bold text-slate-200">Cek Dulu</span>
            <span className="text-slate-600">•</span>
            <span>Platform Edukasi Anti-Penipuan Berbasis AI</span>
          </div>

          <div className="text-center sm:text-right text-slate-500 text-[11px] max-w-md leading-relaxed">
            Edukasi publik siber untuk masyarakat Indonesia. Jangan pernah membagikan kode OTP, PIN m-banking, nomor kartu, atau menginstal berkas .APK dari sumber asing.
          </div>
        </div>
      </footer>
    </div>
  );
}
