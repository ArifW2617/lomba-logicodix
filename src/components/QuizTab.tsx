import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Flame,
  Check,
  Shield,
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
      onAddScore(20 + streak * 5); // Base points + streak bonus!
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
    if (accuracy >= 85) return { title: 'Master Anti-Scam Siber', color: 'text-cyan-400', desc: 'Luar biasa! Naluri keamanan digital Anda setara analis keamanan siber.' };
    if (accuracy >= 60) return { title: 'Penjaga Privasi Waspada', color: 'text-emerald-400', desc: 'Bagus! Anda memahami sebagian besar taktik penipuan digital terkini.' };
    return { title: 'Detektif Pemula', color: 'text-amber-400', desc: 'Perbanyak latihan dan pelajari ensiklopedia modus agar tidak mudah terperdaya.' };
  };

  return (
    <div className="space-y-8">
      {/* Quiz Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Kuis Pemahaman Anti-Penipuan Digital
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Uji Pengetahuan & Deteksi Celah Penipuan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Jawab pertanyaan studi kasus nyata mengenai modus APK, domain tiruan, rekayasa sosial, dan perlindungan data pribadi.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <Flame className="w-4 h-4 text-amber-400" />
            <div className="text-xs">
              <span className="text-slate-400">Streak:</span>{' '}
              <strong className="text-amber-300 font-extrabold">{streak}x</strong>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40">
            <Award className="w-4 h-4 text-cyan-400" />
            <div className="text-xs">
              <span className="text-slate-400">Poin:</span>{' '}
              <strong className="text-white font-extrabold">{score} XP</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        {(['Semua', 'Pemula', 'Menengah', 'Mahir'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => handleRestart(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeCategory === cat
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat} {cat === 'Semua' ? `(${QUIZ_QUESTIONS.length})` : ''}
          </button>
        ))}
      </div>

      {!isFinished && currentQuestion ? (
        /* Question Card */
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>
                Pertanyaan {currentIndex + 1} dari {filteredQuestions.length}
              </span>
              <span className="text-cyan-400">Tingkat: {currentQuestion.category}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* Optional Scenario Snippet */}
            {currentQuestion.scenarioSnippet && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300">
                🔍 {currentQuestion.scenarioSnippet}
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctAnswer;

                let cardStyle = 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200';
                if (isSubmitted) {
                  if (isCorrect) {
                    cardStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                  } else if (isSelected) {
                    cardStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                  } else {
                    cardStyle = 'bg-slate-950/40 border-slate-900 text-slate-500';
                  }
                } else if (isSelected) {
                  cardStyle = 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between gap-3 ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submit or Next Button */}
            <div className="pt-4 flex justify-end">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/20"
                >
                  Kunci Jawaban
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
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
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-2 animate-in fade-in duration-200">
                <div className="font-bold flex items-center gap-2">
                  {selectedOption === currentQuestion.correctAnswer ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Jawaban Benar (+20 XP)
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Jawaban Salah
                    </span>
                  )}
                </div>
                <p className="leading-relaxed text-slate-300">{currentQuestion.explanation}</p>
                <div className="pt-2 border-t border-slate-800/80 text-amber-300 text-xs flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>Tips Ahli:</strong> {currentQuestion.proTip}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Victory / Finish Card */
        <div className="max-w-xl mx-auto bg-gradient-to-br from-slate-900 to-indigo-950/80 rounded-2xl border border-indigo-500/40 p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-cyan-400">
            <Award className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-extrabold">
              Kuis Selesai
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Hasil Evaluasi Kuis Anti-Scam
            </h2>
            <div className={`text-lg font-bold mt-2 ${getBadgeRank().color}`}>
              Gelar: {getBadgeRank().title}
            </div>
            <p className="text-xs text-slate-300 mt-1">{getBadgeRank().desc}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Skor Akurasi</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {correctAnswersCount} / {filteredQuestions.length}
              </div>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Total XP Akumulasi</div>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {score} XP
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleRestart('Semua')}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <RotateCcw className="w-4 h-4" /> Ulangi Kuis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
