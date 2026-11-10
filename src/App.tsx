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
    <div className="min-h-screen flex flex-col">
      <div className="wrap flex-1 flex flex-col w-full">
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenEmergency={() => setEmergencyOpen(true)}
          quizScore={quizScore}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full">
          {activeTab === 'assistant' && (
            <AiScannerTab
              onGoToQuiz={() => setActiveTab('quiz')}
              onGoToSimulation={() => setActiveTab('simulation')}
            />
          )}

          {activeTab === 'simulation' && (
            <div className="py-7">
              <SimulationTab onAddScore={handleAddScore} />
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="py-7">
              <QuizTab score={quizScore} onAddScore={handleAddScore} />
            </div>
          )}

          {activeTab === 'education' && (
            <div className="py-7">
              <EducationTab />
            </div>
          )}

          {activeTab === 'url-scanner' && (
            <div className="py-7">
              <UrlInspectorTab />
            </div>
          )}
        </main>
      </div>

      {/* Emergency Modal Pop-up */}
      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="wrap">
          <span>
            <b>Cek Dulu</b> · Edukasi anti-penipuan digital untuk masyarakat Indonesia
          </span>
          <span>
            Jangan pernah membagikan OTP, PIN, nomor kartu, atau memasang .APK dari sumber asing.
          </span>
        </div>
      </footer>
    </div>
  );
}
