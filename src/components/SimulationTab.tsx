import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
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
import { SimulationChoice } from '../types';

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
    const newChatHistory = [
      ...chatHistory,
      {
        sender: 'user' as const,
        text: choice.text,
        time: '13:43',
      },
    ];

    const newHealth = Math.max(0, Math.min(100, cyberHealth + choice.scoreChange));
    setCyberHealth(newHealth);

    setLastFeedback({
      text: choice.feedback,
      isSafe: choice.isSafe,
      change: choice.scoreChange,
    });

    if (choice.scoreChange > 0) {
      onAddScore(choice.scoreChange * 2);
    }

    if (choice.nextStepId && scenario.steps[choice.nextStepId]) {
      const nextStep = scenario.steps[choice.nextStepId];
      setCurrentStepId(choice.nextStepId);

      setTimeout(() => {
        setChatHistory([
          ...newChatHistory,
          {
            sender: 'scammer' as const,
            text: nextStep.senderMessage,
            time: nextStep.timestamp,
            attachment: nextStep.hasAttachment,
          },
        ]);
      }, 500);
    } else {
      setChatHistory(newChatHistory);
      setIsFinished(true);
    }
  };

  const currentStep = scenario.steps[currentStepId];

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '20px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'var(--brand-soft)',
              color: 'var(--brand)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Simulator Percakapan Scam Interaktif
          </div>
          <h1 className="hero-h1" style={{ fontSize: '28px', margin: '0 0 6px' }}>
            Uji Ketahanan Anda Melawan Rekayasa Sosial
          </h1>
          <p className="lead" style={{ margin: 0 }}>
            Hadapi skenario penipuan nyata dalam simulasi chat smartphone. Setiap keputusan menentukan nasib keamanan data dan saldo rekening Anda.
          </p>
        </div>

        {/* Cyber Health / Defense meter */}
        <div className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--bg)' }}>
            {cyberHealth > 70 ? (
              <ShieldCheck className="w-5 h-5" style={{ color: 'var(--ok)' }} />
            ) : cyberHealth > 40 ? (
              <Shield className="w-5 h-5" style={{ color: 'var(--warn)' }} />
            ) : (
              <ShieldAlert className="w-5 h-5" style={{ color: 'var(--danger)' }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Integritas Pertahanan
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <div className="meter" style={{ width: '100px', margin: 0, height: '8px' }}>
                <i
                  style={{
                    width: `${cyberHealth}%`,
                    background: cyberHealth > 70 ? 'var(--ok)' : cyberHealth > 40 ? 'var(--warn)' : 'var(--danger)',
                  }}
                />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink)' }}>{cyberHealth}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="chips">
        {SIMULATION_SCENARIOS.map((sc, idx) => {
          const isSelected = selectedScenarioIndex === idx;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => resetScenario(idx)}
              className="chip"
              style={{
                background: isSelected ? 'var(--brand)' : 'var(--surface)',
                color: isSelected ? 'var(--brand-ink)' : 'var(--ink)',
                borderColor: isSelected ? 'var(--brand)' : 'var(--line)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{sc.title}</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--bg)',
                  color: isSelected ? '#fff' : 'var(--muted)',
                }}
              >
                {sc.difficulty}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Simulation Viewport */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'start' }}>
        {/* Smartphone Simulator */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              background: '#0b141a',
              borderRadius: '2.2rem',
              border: '6px solid #202c33',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '620px',
              position: 'relative',
              color: '#fff',
            }}
          >
            {/* Phone Top Notch */}
            <div style={{ height: '24px', background: '#111b21', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', fontSize: '11px', color: '#8696a0', userSelect: 'none' }}>
              <span>13:42</span>
              <div style={{ width: '60px', height: '12px', background: '#000', borderRadius: '999px' }} />
              <span>5G</span>
            </div>

            {/* Chat App Header */}
            <div style={{ background: '#202c33', borderBottom: '1px solid #2a3942', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={scenario.senderAvatar}
                  alt={scenario.senderName}
                  style={{ width: '38px', height: '38px', borderRadius: '999px', objectFit: 'cover', border: '1px solid #2a3942' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                    {scenario.senderName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#25d366', fontWeight: 500 }}>
                    {scenario.senderSubtitle}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => resetScenario()}
                style={{ background: 'none', border: 'none', color: '#8696a0', padding: '6px', cursor: 'pointer' }}
                title="Mulai Ulang"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Bubble Scroll Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#0b141a' }}>
              <div style={{ textAlign: 'center', margin: '4px 0' }}>
                <span style={{ padding: '4px 12px', borderRadius: '999px', background: '#182229', color: '#8696a0', fontSize: '10px', border: '1px solid #222e35' }}>
                  Pesan Terenkripsi End-to-End
                </span>
              </div>

              {chatHistory.map((chat, idx) => {
                const isScammer = chat.sender === 'scammer';
                return (
                  <div
                    key={idx}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: isScammer ? 'flex-start' : 'flex-end' }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        borderRadius: '14px',
                        padding: '12px 14px',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        background: isScammer ? '#202c33' : '#005c4b',
                        color: isScammer ? '#e9edef' : '#fff',
                        borderTopLeftRadius: isScammer ? '2px' : '14px',
                        borderTopRightRadius: isScammer ? '14px' : '2px',
                        border: isScammer ? '1px solid #2a3942' : 'none',
                      }}
                    >
                      <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{chat.text}</p>

                      {chat.attachment && chat.attachment.type === 'apk' && (
                        <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: '8px', background: '#111b21', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileCode className="w-4 h-4" />
                          </div>
                          <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fca5a5', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                              {chat.attachment.name}
                            </div>
                            <div style={{ fontSize: '10px', color: '#8696a0' }}>
                              {chat.attachment.size} • Berkas APK
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ fontSize: '9px', marginTop: '4px', textAlign: 'right', color: isScammer ? '#8696a0' : '#86efac' }}>
                        {chat.time}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isFinished && (
                <div style={{ textAlign: 'center', margin: '14px 0' }}>
                  <span style={{ padding: '6px 14px', borderRadius: '999px', background: '#182229', color: '#e9edef', fontSize: '12px', fontWeight: 600 }}>
                    --- Simulasi Selesai ---
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div style={{ padding: '10px', background: '#202c33', borderTop: '1px solid #2a3942', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, background: '#111b21', border: '1px solid #2a3942', borderRadius: '999px', padding: '8px 14px', fontSize: '12px', color: '#8696a0', userSelect: 'none' }}>
                {isFinished ? 'Kasus berakhir' : 'Pilih respon Anda di panel samping 👉'}
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '999px', background: '#00a884', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Decision Panel */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {lastFeedback && (
            <div
              className={`verdict ${lastFeedback.isSafe ? 'v-ok' : 'v-bad'}`}
              style={{ margin: 0, padding: '14px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                {lastFeedback.isSafe ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Langkah Aman ({lastFeedback.change > 0 ? `+${lastFeedback.change}` : lastFeedback.change}%)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Keputusan Berisiko ({lastFeedback.change}%)</span>
                  </>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '13px' }}>{lastFeedback.text}</p>
            </div>
          )}

          {!isFinished ? (
            <div className="card" style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand)' }}>
                  Giliran Anda: Pilih Respon Terbaik
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {currentStep?.choices?.length || 0} Pilihan
                </span>
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                {currentStep?.choices?.map((choice, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChoice(choice)}
                    className="card"
                    style={{
                      padding: '14px',
                      textAlign: 'left',
                      fontSize: '14px',
                      color: 'var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      background: 'var(--bg)',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{choice.text}</span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted)' }} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                    Evaluasi Hasil Simulasi
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '2px 0 0' }}>
                    Skor Pertahanan Akhir: <b style={{ color: 'var(--brand)' }}>{cyberHealth}/100</b>
                  </p>
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg)', border: '1px solid var(--line)', fontSize: '14px', color: 'var(--ink)', display: 'grid', gap: '6px' }}>
                <div style={{ fontWeight: 700 }}>Kesimpulan Pembelajaran:</div>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.5 }}>{scenario.educationalDebrief.summary}</p>
                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--line)', color: 'var(--ok)', fontWeight: 600, fontSize: '13px' }}>
                  💡 Kunci Utama: {scenario.educationalDebrief.keyTakeaway}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => resetScenario()}
                  className="cta"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '14px' }}
                >
                  <RotateCcw className="w-4 h-4" /> Mainkan Lagi
                </button>
                <button
                  type="button"
                  onClick={() => resetScenario((selectedScenarioIndex + 1) % SIMULATION_SCENARIOS.length)}
                  className="chip"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '14px', fontWeight: 700 }}
                >
                  <span>Coba Kasus Berikutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: '14px', fontSize: '13px', color: 'var(--muted)', display: 'grid', gap: '4px' }}>
            <div style={{ fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
              Tentang Skenario Ini:
            </div>
            <p style={{ margin: 0 }}>{scenario.description}</p>
            <p style={{ margin: 0, fontSize: '11px', paddingTop: '4px' }}>
              Data kasus nyata: {scenario.educationalDebrief.realWorldPrevalence}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
