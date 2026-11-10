import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ArrowRight,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/scamData';
import { QuizQuestion } from '../types';

interface QuizTabProps {
  score: number;
  onAddScore: (points: number) => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({ score, onAddScore }) => {
  const [activeCategory, setActiveCategory] = useState<'Semua' | 'Pemula' | 'Menengah' | 'Mahir'>('Semua');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const filteredQuestions: QuizQuestion[] = activeCategory === 'Semua'
    ? QUIZ_QUESTIONS
    : QUIZ_QUESTIONS.filter((q) => q.category === activeCategory);

  const currentQuestion = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitted) return;
    setIsSubmitted(true);

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) {
      setStreak((prev) => prev + 1);
      setCorrectAnswersCount((prev) => prev + 1);
      onAddScore(20 + streak * 5);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = (category: 'Semua' | 'Pemula' | 'Menengah' | 'Mahir' = activeCategory) => {
    setActiveCategory(category);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setCorrectAnswersCount(0);
    setStreak(0);
    setIsFinished(false);
  };

  const getBadgeRank = () => {
    const accuracy = filteredQuestions.length > 0 ? (correctAnswersCount / filteredQuestions.length) * 100 : 0;
    if (accuracy >= 85) return { title: 'Master Anti-Scam Siber', color: 'var(--brand)', desc: 'Luar biasa! Naluri keamanan digital Anda setara analis keamanan siber.' };
    if (accuracy >= 60) return { title: 'Penjaga Privasi Waspada', color: 'var(--ok)', desc: 'Bagus! Anda memahami sebagian besar taktik penipuan digital terkini.' };
    return { title: 'Detektif Pemula', color: 'var(--warn)', desc: 'Perbanyak latihan dan pelajari ensiklopedia modus agar tidak mudah terperdaya.' };
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Quiz Top Header */}
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
            <CheckCircle2 className="w-3.5 h-3.5" />
            Kuis Pemahaman Anti-Penipuan Digital
          </div>
          <h1 className="hero-h1" style={{ fontSize: '28px', margin: '0 0 6px' }}>
            Uji Pengetahuan & Deteksi Celah Penipuan
          </h1>
          <p className="lead" style={{ margin: 0 }}>
            Jawab pertanyaan studi kasus nyata mengenai modus APK, domain tiruan, rekayasa sosial, dan perlindungan data pribadi.
          </p>
        </div>

        {/* Stats Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame className="w-4 h-4" style={{ color: 'var(--warn)' }} />
            <div style={{ fontSize: '13px' }}>
              <span style={{ color: 'var(--muted)' }}>Streak:</span>{' '}
              <strong style={{ color: 'var(--warn)' }}>{streak}x</strong>
            </div>
          </div>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--brand-soft)', borderColor: 'var(--brand)' }}>
            <Award className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            <div style={{ fontSize: '13px' }}>
              <span style={{ color: 'var(--muted)' }}>Poin:</span>{' '}
              <strong style={{ color: 'var(--brand)' }}>{score} XP</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="chips" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
        {(['Semua', 'Pemula', 'Menengah', 'Mahir'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleRestart(cat)}
            className="chip"
            style={{
              background: activeCategory === cat ? 'var(--brand)' : 'var(--surface)',
              color: activeCategory === cat ? 'var(--brand-ink)' : 'var(--ink)',
              borderColor: activeCategory === cat ? 'var(--brand)' : 'var(--line)',
            }}
          >
            {cat} {cat === 'Semua' ? `(${QUIZ_QUESTIONS.length})` : ''}
          </button>
        ))}
      </div>

      {!isFinished && currentQuestion ? (
        <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%', display: 'grid', gap: '18px' }}>
          {/* Progress bar */}
          <div style={{ display: 'grid', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>
              <span>
                Pertanyaan {currentIndex + 1} dari {filteredQuestions.length}
              </span>
              <span style={{ color: 'var(--brand)' }}>Tingkat: {currentQuestion.category}</span>
            </div>
            <div className="meter" style={{ margin: 0 }}>
              <i style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`, background: 'var(--brand)' }} />
            </div>
          </div>

          <div className="card" style={{ display: 'grid', gap: '18px', padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: 0, lineHeight: 1.5 }}>
              {currentQuestion.question}
            </h2>

            {/* Optional Scenario Snippet */}
            {currentQuestion.scenarioSnippet && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--warn-soft)', border: '1px solid var(--warn)', color: 'var(--warn)', fontFamily: 'monospace', fontSize: '13px' }}>
                🔍 {currentQuestion.scenarioSnippet}
              </div>
            )}

            {/* Options List */}
            <div style={{ display: 'grid', gap: '10px' }}>
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctAnswer;

                let bg = 'var(--surface)';
                let border = 'var(--line)';
                let color = 'var(--ink)';

                if (isSubmitted) {
                  if (isCorrect) {
                    bg = 'var(--ok-soft)';
                    border = 'var(--ok)';
                    color = 'var(--ok)';
                  } else if (isSelected) {
                    bg = 'var(--danger-soft)';
                    border = 'var(--danger)';
                    color = 'var(--danger)';
                  } else {
                    bg = 'var(--bg)';
                    color = 'var(--muted)';
                  }
                } else if (isSelected) {
                  bg = 'var(--brand-soft)';
                  border = 'var(--brand)';
                  color = 'var(--brand)';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    disabled={isSubmitted}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: `1.5px solid ${border}`,
                      background: bg,
                      color: color,
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '26px', height: '26px', borderRadius: '999px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                    {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Submit or Next Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              {!isSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className="cta"
                >
                  Kunci Jawaban
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="cta"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>
                    {currentIndex + 1 === filteredQuestions.length ? 'Lihat Hasil Akhir' : 'Pertanyaan Berikutnya'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Explanation Box */}
            {isSubmitted && (
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--line)', fontSize: '14px', color: 'var(--ink)', display: 'grid', gap: '8px' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedOption === currentQuestion.correctAnswer ? (
                    <span style={{ color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 className="w-4 h-4" /> Jawaban Benar (+20 XP)
                    </span>
                  ) : (
                    <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <XCircle className="w-4 h-4" /> Jawaban Salah
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.5 }}>{currentQuestion.explanation}</p>
                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--line)', color: 'var(--warn)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lightbulb className="w-4 h-4 flex-shrink-0" />
                  <span>
                    <b>Tips Ahli:</b> {currentQuestion.proTip}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Victory Card */
        <div className="card" style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center', padding: '36px', display: 'grid', gap: '20px', width: '100%' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '999px', background: 'var(--brand-soft)', border: '1px solid var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--brand)' }}>
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--brand)', fontWeight: 800 }}>
              Kuis Selesai
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', margin: '4px 0 8px' }}>
              Hasil Evaluasi Kuis Anti-Scam
            </h2>
            <div style={{ fontSize: '18px', fontWeight: 700, color: getBadgeRank().color }}>
              Gelar: {getBadgeRank().title}
            </div>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '4px 0 0' }}>{getBadgeRank().desc}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '16px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Skor Akurasi</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ok)', marginTop: '4px' }}>
                {correctAnswersCount} / {filteredQuestions.length}
              </div>
            </div>
            <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Total XP Akumulasi</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand)', marginTop: '4px' }}>
                {score} XP
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => handleRestart('Semua')}
              className="cta"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <RotateCcw className="w-4 h-4" /> Ulangi Kuis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
