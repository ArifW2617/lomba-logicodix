import React, { useState } from 'react';
import {
  MessageSquareCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Send,
  FileCode,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Info,
  ChevronRight,
  Award,
} from 'lucide-react';
import { SIMULATION_SCENARIOS } from '../data/scamData';
import { SimulationScenario, SimulationChoice } from '../types';

interface SimulationTabProps {
  onAddScore: (points: number) => void;
}

export const SimulationTab: React.FC<SimulationTabProps> = ({ onAddScore }) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const scenario = SIMULATION_SCENARIOS[selectedScenarioIndex];

  const [currentStepId, setCurrentStepId] = useState<string>(scenario.initialStepId);
  const [chatHistory, setChatHistory] = useState<
    Array<{
      sender: 'scammer' | 'user';
      text: string;
      time: string;
      attachment?: any;
    }>
  >([
    {
      sender: 'scammer',
      text: scenario.steps[scenario.initialStepId].senderMessage,
      time: scenario.steps[scenario.initialStepId].timestamp,
      attachment: scenario.steps[scenario.initialStepId].hasAttachment,
    },
  ]);

  const [cyberHealth, setCyberHealth] = useState(100);
  const [lastFeedback, setLastFeedback] = useState<{
    text: string;
    isSafe: boolean;
    change: number;
  } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const resetScenario = (index: number = selectedScenarioIndex) => {
    setSelectedScenarioIndex(index);
    const sc = SIMULATION_SCENARIOS[index];
    setCurrentStepId(sc.initialStepId);
    setChatHistory([
      {
        sender: 'scammer',
        text: sc.steps[sc.initialStepId].senderMessage,
        time: sc.steps[sc.initialStepId].timestamp,
        attachment: sc.steps[sc.initialStepId].hasAttachment,
      },
    ]);
    setCyberHealth(100);
    setLastFeedback(null);
    setIsFinished(false);
  };

  const handleChoice = (choice: SimulationChoice) => {
    // 1. Add user message
    const newChat = [
      ...chatHistory,
      {
        sender: 'user' as const,
        text: choice.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    // 2. Calculate score impact
    const newHealth = Math.max(0, Math.min(100, cyberHealth + choice.scoreChange));
    setCyberHealth(newHealth);
    setLastFeedback({
      text: choice.feedback,
      isSafe: choice.isSafe,
      change: choice.scoreChange,
    });

    if (choice.isSafe) {
      onAddScore(25);
    }

    // 3. Move to next step or finish
    if (!choice.nextStepId || !scenario.steps[choice.nextStepId]) {
      setChatHistory(newChat);
      setIsFinished(true);
    } else {
      const nextStep = scenario.steps[choice.nextStepId];
      setCurrentStepId(choice.nextStepId);
      // Scammer reply after brief delay effect
      setTimeout(() => {
        setChatHistory([
          ...newChat,
          {
            sender: 'scammer' as const,
            text: nextStep.senderMessage,
            time: nextStep.timestamp,
            attachment: nextStep.hasAttachment,
          },
        ]);
      }, 300);
    }
  };

  const currentStep = scenario.steps[currentStepId];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-2 border border-cyan-500/20">
            <Smartphone className="w-3.5 h-3.5" />
            Simulator Percakapan Scam Interaktif
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Uji Ketahanan Anda Melawan Rekayasa Sosial
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Hadapi skenario penipuan nyata dalam simulasi chat smartphone. Setiap keputusan menentukan nasib keamanan data dan saldo rekening Anda.
          </p>
        </div>

        {/* Cyber Health / Defense meter */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 self-start md:self-auto">
          <div className="p-2 rounded-lg bg-slate-800">
            {cyberHealth > 70 ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : cyberHealth > 40 ? (
              <Shield className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Integritas Pertahanan
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 sm:w-32 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    cyberHealth > 70
                      ? 'bg-emerald-500'
                      : cyberHealth > 40
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${cyberHealth}%` }}
                />
              </div>
              <span className="text-xs font-extrabold text-white">{cyberHealth}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SIMULATION_SCENARIOS.map((sc, idx) => {
          const isSelected = selectedScenarioIndex === idx;
          return (
            <button
              key={sc.id}
              onClick={() => resetScenario(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition border flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{sc.title}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  sc.difficulty === 'Mudah'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : sc.difficulty === 'Sedang'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {sc.difficulty}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Simulation Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Smartphone Simulator */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-md bg-slate-950 rounded-[2.5rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[650px] relative">
            {/* Phone Top Notch / Speaker bar */}
            <div className="h-6 bg-slate-900 flex items-center justify-between px-6 text-[11px] text-slate-400 font-medium select-none">
              <span>13:42</span>
              <div className="w-16 h-3 bg-slate-950 rounded-full" />
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <span className="w-4 h-2 bg-slate-400 rounded-sm inline-block" />
              </div>
            </div>

            {/* Chat App Header */}
            <div className="bg-slate-900/95 border-b border-slate-800 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={scenario.senderAvatar}
                  alt={scenario.senderName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <div className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                    <span>{scenario.senderName}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    {scenario.senderSubtitle}
                  </div>
                </div>
              </div>
              <button
                onClick={() => resetScenario()}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Mulai Ulang Kasus Ini"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Bubble Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950">
              <div className="text-center my-1">
                <span className="px-3 py-1 rounded-full bg-slate-900/90 text-slate-400 text-[10px] font-medium border border-slate-800">
                  Pesan Terenkripsi End-to-End
                </span>
              </div>

              {chatHistory.map((chat, idx) => {
                const isScammer = chat.sender === 'scammer';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isScammer ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-md leading-relaxed ${
                        isScammer
                          ? 'bg-slate-900 text-slate-100 rounded-tl-sm border border-slate-800'
                          : 'bg-indigo-600 text-white rounded-tr-sm'
                      }`}
                    >
                      <p className="whitespace-pre-line">{chat.text}</p>

                      {/* Fake APK Attachment Warning Box */}
                      {chat.attachment && chat.attachment.type === 'apk' && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/40 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                            <FileCode className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-rose-300 truncate">
                              {chat.attachment.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {chat.attachment.size} • Berkas Aplikasi Android (.APK)
                            </div>
                          </div>
                        </div>
                      )}

                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isScammer ? 'text-slate-500' : 'text-indigo-200'
                        }`}
                      >
                        {chat.time}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isFinished && (
                <div className="text-center my-4">
                  <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                    --- Simulasi Selesai ---
                  </span>
                </div>
              )}
            </div>

            {/* Phone Bottom Footer / Fake Input Bar */}
            <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex items-center gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-4 py-2 text-xs text-slate-500 select-none">
                {isFinished ? 'Kasus berakhir' : 'Pilih respon Anda di panel samping 👉'}
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center opacity-70">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Decision Panel */}
        <div className="lg:col-span-5 space-y-5">
          {/* Recent Choice Feedback Banner */}
          {lastFeedback && (
            <div
              className={`p-4 rounded-xl border ${
                lastFeedback.isSafe
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              } transition-all`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                {lastFeedback.isSafe ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Langkah Aman Terpuji ({lastFeedback.change > 0 ? `+${lastFeedback.change}` : lastFeedback.change}%)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Keputusan Sangat Berisiko ({lastFeedback.change}%)</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">{lastFeedback.text}</p>
            </div>
          )}

          {/* Current Choices */}
          {!isFinished ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Giliran Anda: Pilih Respon Terbaik
                </span>
                <span className="text-xs text-slate-400">
                  {currentStep?.choices?.length || 0} Pilihan
                </span>
              </div>

              <div className="space-y-2.5">
                {currentStep?.choices?.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice)}
                    className="w-full text-left p-4 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/70 text-slate-200 text-xs sm:text-sm font-medium transition flex items-start justify-between gap-3 group"
                  >
                    <span>{choice.text}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Debrief Result Card */
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950/60 rounded-2xl border border-indigo-500/30 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-600/20 text-cyan-400">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Evaluasi Hasil Simulasi</h3>
                  <p className="text-xs text-slate-300">
                    Skor Pertahanan Akhir: <strong>{cyberHealth}/100</strong>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
                <div className="font-bold text-white text-sm">Kesimpulan Pembelajaran:</div>
                <p>{scenario.educationalDebrief.summary}</p>
                <div className="pt-2 border-t border-slate-800 text-emerald-300 font-semibold">
                  💡 Kunci Utama: {scenario.educationalDebrief.keyTakeaway}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => resetScenario()}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Mainkan Kasus Ini Lagi
                </button>
                <button
                  onClick={() => resetScenario((selectedScenarioIndex + 1) % SIMULATION_SCENARIOS.length)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <span>Coba Kasus Berikutnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Context Info */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Tentang Skenario Ini:
            </div>
            <p>{scenario.description}</p>
            <p className="text-[11px] text-slate-500 pt-1">
              Data kasus nyata: {scenario.educationalDebrief.realWorldPrevalence}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
