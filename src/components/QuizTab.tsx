import React, { useState } from 'react';

export interface QuizTabProps {
  score: number;
  onAddScore: (points: number) => void;
}

interface QuestionItem {
  l: 'Pemula' | 'Menengah' | 'Mahir';
  q: string;
  e?: [string, string];
  o: string[];
  a: number;
  x: string;
}

const QUESTIONS: QuestionItem[] = [
  {
    l: 'Pemula',
    q: 'Anda menerima pesan WhatsApp dari nomor asing: “Paket tertahan, mohon verifikasi foto resi.” Apa arti ekstensi .apk pada berkas ini?',
    e: ['Foto_Paket_JNE_2026.apk', '4,5 MB · dikirim dari nomor tidak dikenal'],
    o: [
      'Foto resmi berkualitas tinggi dari kurir',
      'Aplikasi Android yang bisa berisi program pencuri SMS dan data ponsel',
      'Dokumen teks berisi rincian ongkos kirim',
      'Sertifikat tanda tangan elektronik dari kurir',
    ],
    a: 1,
    x: 'Berkas .apk adalah aplikasi. Foto asli berakhiran .jpg atau .png. Aplikasi dari chat bisa membaca OTP dan mengambil alih m-banking.',
  },
  {
    l: 'Pemula',
    q: 'Seseorang yang mengaku dari bank menelepon dan meminta kode OTP agar “akun Anda aman”. Apa yang sebaiknya Anda lakukan?',
    o: [
      'Memberikan kode karena ia dari bank',
      'Menutup telepon, lalu menghubungi nomor resmi di belakang kartu',
      'Memberikan setengah kode saja',
      'Meminta ia menyebut saldo Anda dulu',
    ],
    a: 1,
    x: 'Bank asli tidak pernah meminta OTP. Penelepon bisa saja sudah tahu nama dan saldo Anda dari data bocor, jadi itu bukan bukti.',
  },
  {
    l: 'Pemula',
    q: 'Anda tiba-tiba “memenangkan” undian Rp50 juta, padahal tidak pernah ikut undian apa pun. Apa kemungkinan terbesarnya?',
    o: [
      'Rezeki yang memang harus diklaim cepat',
      'Penipuan untuk mencuri data atau uang Anda',
      'Kesalahan kirim dari penyelenggara',
      'Hadiah dari bank tempat Anda menabung',
    ],
    a: 1,
    x: 'Undian yang tidak pernah Anda ikuti pasti palsu. Penipu memakai hadiah besar agar Anda lupa berpikir.',
  },
  {
    l: 'Menengah',
    q: 'Mana tautan yang paling mungkin merupakan situs asli Bank BRI?',
    o: [
      'bri-co-id.xyz/login',
      'brii-online.com',
      'bri.co.id',
      'bri.promo-hadiah.top',
    ],
    a: 2,
    x: 'Periksa nama domain utama, yaitu bagian tepat sebelum akhiran seperti .co.id. Tiga pilihan lain meniru nama BRI tetapi milik pihak lain.',
  },
  {
    l: 'Menengah',
    q: 'Sebuah pinjol ilegal mengancam akan menyebar foto KTP Anda ke semua kontak. Apa langkah pertama yang tepat?',
    o: [
      'Segera transfer agar data tidak tersebar',
      'Pinjam dari aplikasi lain untuk melunasi',
      'Simpan bukti pesan, jangan bayar ke rekening pribadi, dan lapor OJK di 157',
      'Hapus semua kontak di ponsel',
    ],
    a: 2,
    x: 'Pembayaran tidak menghentikan teror, tagihan malah bertambah. Bukti pesan penting untuk laporan.',
  },
  {
    l: 'Menengah',
    q: 'Anda hendak membayar infak lewat QRIS stiker di kotak donasi. Apa yang perlu dicek sebelum menekan bayar?',
    o: [
      'Warna stiker QRIS-nya',
      'Nama penerima di layar sama dengan nama lembaganya',
      'Jumlah orang yang ada di sekitar',
      'Tidak perlu, QRIS pasti aman',
    ],
    a: 1,
    x: 'Stiker QRIS bisa ditempel di atas yang asli. Nama penerima yang muncul di aplikasi adalah satu-satunya petunjuk.',
  },
  {
    l: 'Mahir',
    q: 'Ibu menerima telepon bersuara persis seperti anaknya, menangis dan meminta transfer darurat. Cara terbaik memastikan kebenarannya?',
    o: [
      'Percaya, karena suaranya sama persis',
      'Menanyakan ia ada di mana sekarang',
      'Menutup telepon dan menghubungi anak lewat nomor yang biasa, atau menanyakan kata sandi keluarga',
      'Mentransfer sedikit dulu sebagai tanda bantuan',
    ],
    a: 2,
    x: 'Suara kini bisa ditiru AI dari video yang diunggah ke media sosial. Sepakati kata sandi keluarga yang hanya diketahui anggota keluarga.',
  },
  {
    l: 'Mahir',
    q: 'Setelah tiga tugas “like video” dibayar, admin meminta deposit untuk “tugas premium” dengan komisi lebih besar. Ini pola apa?',
    o: [
      'Kenaikan jenjang karier yang wajar',
      'Penipuan umpan: dibayar kecil dulu, lalu diminta deposit besar',
      'Promosi resmi platform video',
      'Sistem pajak penghasilan',
    ],
    a: 1,
    x: 'Bayaran awal hanya untuk membangun kepercayaan. Pekerjaan sungguhan tidak meminta Anda menyetor uang lebih dulu.',
  },
];

const KEYS = ['A', 'B', 'C', 'D'];

export const QuizTab: React.FC<QuizTabProps> = ({ score: externalScore, onAddScore }) => {
  const [level, setLevel] = useState<'Semua' | 'Pemula' | 'Menengah' | 'Mahir'>('Semua');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(externalScore || 0);
  const [missedQuestions, setMissedQuestions] = useState<QuestionItem[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const filteredQuestions =
    level === 'Semua' ? QUESTIONS : QUESTIONS.filter((q) => q.l === level);

  const currentQ = filteredQuestions[index] || filteredQuestions[0];

  const resetQuiz = (newLevel: 'Semua' | 'Pemula' | 'Menengah' | 'Mahir' = level) => {
    setLevel(newLevel);
    setIndex(0);
    setSelected(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setStreak(0);
    setMissedQuestions([]);
    setIsFinished(false);
  };

  const handleSelectOption = (optIndex: number) => {
    if (isAnswered) return;
    setSelected(optIndex);
  };

  const handleCheckAnswer = () => {
    if (selected === null || isAnswered) return;

    const isOk = selected === currentQ.a;
    setIsAnswered(true);

    if (isOk) {
      const earned = 10 + (streak >= 2 ? 5 : 0);
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setPoints((prev) => prev + earned);
      onAddScore(earned);
    } else {
      setStreak(0);
      setMissedQuestions((prev) => [...prev, currentQ]);
    }
  };

  const handleNextQuestion = () => {
    if (index + 1 < filteredQuestions.length) {
      setIndex((prev) => prev + 1);
      setSelected(null);
      setIsAnswered(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsFinished(true);
    }
  };

  const getEndMessage = () => {
    const ratio = correctCount / filteredQuestions.length;
    if (ratio >= 0.8) {
      return [
        'Sangat waspada',
        'Anda sulit dikelabui. Bagikan ilmu ini ke keluarga.',
      ];
    }
    if (ratio >= 0.5) {
      return [
        'Cukup waspada',
        'Sebagian besar sudah tepat. Pelajari lagi yang meleset di bawah.',
      ];
    }
    return [
      'Perlu lebih berhati-hati',
      'Tidak apa-apa, di sinilah tempat belajarnya. Coba ulangi kuisnya.',
    ];
  };

  const levelCounts: Record<'Semua' | 'Pemula' | 'Menengah' | 'Mahir', number> = {
    Semua: QUESTIONS.length,
    Pemula: QUESTIONS.filter((q) => q.l === 'Pemula').length,
    Menengah: QUESTIONS.filter((q) => q.l === 'Menengah').length,
    Mahir: QUESTIONS.filter((q) => q.l === 'Mahir').length,
  };

  return (
    <>
      {/* Top Header & Streak/Point Stats */}
      <div className="quiz-top">
        <div>
          <h1>Kuis: seberapa waspada Anda?</h1>
          <p className="lead">
            Jawab pertanyaan dari kasus penipuan yang benar-benar terjadi. Tiap jawaban
            dijelaskan, jadi Anda belajar sambil bermain.
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <small>Benar beruntun</small>
            <b>{streak}</b>
          </div>
          <div className="stat">
            <small>Poin</small>
            <b>{points}</b>
          </div>
        </div>
      </div>

      <main className="quiz-container">
        {/* Level Selector Pills */}
        <div className="seg" role="group" aria-label="Pilih tingkat">
          {(['Semua', 'Pemula', 'Menengah', 'Mahir'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              aria-pressed={level === lvl}
              onClick={() => resetQuiz(lvl)}
            >
              {lvl} ({levelCounts[lvl]})
            </button>
          ))}
        </div>

        {/* Question View or Result View */}
        {!isFinished && currentQ ? (
          <div>
            {/* Meta & Progress bar */}
            <div className="quiz-meta">
              <span>
                Pertanyaan {index + 1} dari {filteredQuestions.length}
              </span>
              <b>Tingkat: {currentQ.l}</b>
            </div>

            <div
              className="quiz-prog"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={filteredQuestions.length}
              aria-valuenow={index}
            >
              <i style={{ width: `${(index / filteredQuestions.length) * 100}%` }} />
            </div>

            {/* Question Card */}
            <div className="quiz-card">
              <h2>{currentQ.q}</h2>

              {/* Optional Attachment/Evidence box */}
              {currentQ.e && (
                <div className="ev">
                  <span aria-hidden="true">📎</span>
                  <div>
                    <b>{currentQ.e[0]}</b>
                    <small>{currentQ.e[1]}</small>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="quiz-opts">
                {currentQ.o.map((optText, k) => {
                  const isSelected = selected === k;
                  const isRight = k === currentQ.a;

                  let optClass = 'quiz-opt';
                  if (isAnswered) {
                    if (isRight) optClass += ' right';
                    else if (isSelected) optClass += ' wrong';
                  }

                  return (
                    <button
                      key={k}
                      type="button"
                      className={optClass}
                      aria-pressed={isSelected}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(k)}
                    >
                      <span className="k">{KEYS[k]}</span>
                      <span>{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback box */}
              {isAnswered && (
                <div
                  className={`fb ${selected === currentQ.a ? 'good' : 'bad'}`}
                  aria-live="polite"
                >
                  <h3>
                    {selected === currentQ.a
                      ? `Benar! ${
                          streak >= 3
                            ? '+15 poin, benar beruntun'
                            : '+10 poin'
                        }`
                      : 'Belum tepat'}
                  </h3>
                  <p>{currentQ.x}</p>
                </div>
              )}

              {/* Card Footer */}
              <div className="quiz-foot">
                <span className="quiz-hint">
                  {!isAnswered && selected === null ? 'Pilih satu jawaban' : ''}
                </span>

                {!isAnswered ? (
                  <button
                    type="button"
                    className="cta"
                    disabled={selected === null}
                    onClick={handleCheckAnswer}
                  >
                    Periksa jawaban
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cta"
                    onClick={handleNextQuestion}
                  >
                    {index + 1 < filteredQuestions.length
                      ? 'Pertanyaan berikutnya'
                      : 'Lihat hasil'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* End View */
          <div>
            <div className="quiz-prog">
              <i style={{ width: '100%' }} />
            </div>

            <div className="quiz-card quiz-end">
              <div className="quiz-big">
                {correctCount}/{filteredQuestions.length}
              </div>
              <h2>{getEndMessage()[0]}</h2>
              <p>{getEndMessage()[1]}</p>

              {/* Missed questions recap */}
              {missedQuestions.length > 0 && (
                <div className="quiz-miss">
                  <b>Yang perlu dipelajari lagi:</b>
                  {missedQuestions.map((m, idx) => (
                    <div key={idx}>
                      {m.q}
                      <small>Jawaban tepat: {m.o[m.a]}</small>
                    </div>
                  ))}
                </div>
              )}

              <div className="quiz-acts">
                <button
                  type="button"
                  className="cta"
                  onClick={() => resetQuiz()}
                >
                  Ulangi kuis
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() =>
                    resetQuiz(level === 'Semua' ? 'Mahir' : 'Semua')
                  }
                >
                  Coba tingkat lain
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};
