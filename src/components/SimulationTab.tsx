import React, { useState, useEffect, useRef } from 'react';

export interface SimulationTabProps {
  onAddScore: (points: number) => void;
}

interface ChoiceItem {
  text: string;
  kind: 'good' | 'ok' | 'bad';
  reply: string;
  explanation: string;
  loss?: number;
}

interface ScenarioItem {
  t: string;
  lv: 'Mudah' | 'Sedang' | 'Sulit';
  who: string;
  no: string;
  file?: string;
  m: string[];
  c: ChoiceItem[];
  s: string[];
}

const START_BALANCE = 10000000;

const formatRp = (n: number) => 'Rp' + n.toLocaleString('id-ID');

const SCENARIOS: ScenarioItem[] = [
  {
    t: 'Kurir kirim “foto paket”',
    lv: 'Mudah',
    who: 'Kurir J&T Budi',
    no: '+62 821-9981-0231',
    file: 'FOTO_PAKET_INT_08819.apk',
    m: [
      'Siang kak, saya kurir pengiriman. Paketnya alamatnya pudar kehujanan. Tolong cek foto paket ini, apakah benar punya kakak?',
    ],
    c: [
      {
        text: 'Langsung unduh dan pasang file itu untuk melihat fotonya.',
        kind: 'bad',
        reply: 'Sip kak, tunggu sebentar ya…',
        explanation:
          'File .apk adalah aplikasi, bukan foto. Begitu terpasang, ia bisa membaca SMS OTP dan mengambil alih m-banking.',
        loss: 3500000,
      },
      {
        text: 'Tolak mengunduh, lalu minta nomor resi untuk dicek di aplikasi resmi.',
        kind: 'good',
        reply: 'Resinya lupa kak. Pokoknya unduh saja dulu.',
        explanation:
          'Tepat. Kurir asli punya nomor resi dan tidak mengirim aplikasi lewat chat.',
      },
      {
        text: 'Tanya: “Ini kiriman dari toko online mana, Pak?”',
        kind: 'ok',
        reply: 'Dari toko… sudah, unduh saja fotonya kak.',
        explanation:
          'Cukup aman, tetapi tidak perlu melayani. Penipu mencari orang yang mau menjawab.',
      },
    ],
    s: [
      'Berkas berakhiran .apk',
      'Tidak menyebut toko atau nomor resi',
      'Meminta Anda membuka sendiri lewat chat',
    ],
  },
  {
    t: 'Bank bilang tarif transfer naik',
    lv: 'Sedang',
    who: 'Layanan Nasabah Bank',
    no: '+62 812-5550-1180',
    m: [
      'Yth. nasabah, mulai bulan ini tarif transfer naik menjadi Rp150.000/bulan.',
      'Jika tidak setuju, isi formulir di bit.ly/form-bank dan masukkan PIN m-banking Anda.',
    ],
    c: [
      {
        text: 'Isi formulir itu agar tarifnya tidak naik.',
        kind: 'bad',
        reply: 'Terima kasih. Data Anda sudah kami terima.',
        explanation:
          'Bank asli tidak meminta PIN lewat tautan. Penipu memakainya untuk menguras rekening.',
        loss: 4000000,
      },
      {
        text: 'Telepon nomor resmi di belakang kartu ATM untuk menanyakannya.',
        kind: 'good',
        reply: '(Tidak ada balasan. Penipu menghilang.)',
        explanation: 'Tepat. Selalu hubungi bank lewat nomor yang tertera di kartu.',
      },
      {
        text: 'Balas: “Saya tidak setuju dengan kenaikan ini.”',
        kind: 'ok',
        reply: 'Silakan isi formulir tadi kak, paling lambat hari ini.',
        explanation:
          'Aman, tetapi Anda memberi tahu bahwa nomor ini aktif. Lebih baik abaikan dan blokir.',
      },
    ],
    s: [
      'Tautan bit.ly, bukan situs bank',
      'Meminta PIN',
      'Mengatasnamakan bank tanpa nama pegawai',
    ],
  },
  {
    t: 'Tawaran kerja “like video”',
    lv: 'Sedang',
    who: 'Admin Lowongan Online',
    no: '+62 857-7712-4400',
    m: [
      'Halo kak! Dibutuhkan freelance like video YouTube, komisi Rp500 ribu per hari. Tugas pertama gratis dan langsung cair.',
    ],
    c: [
      {
        text: 'Ikuti tugas pertama, lumayan untuk tambahan.',
        kind: 'bad',
        reply:
          'Hebat! Tugas berikutnya butuh deposit Rp2.000.000, nanti kembali berikut komisi.',
        explanation:
          'Tugas pertama hanya umpan. Setelah itu Anda diminta deposit yang tidak akan kembali.',
        loss: 2000000,
      },
      {
        text: 'Abaikan dan blokir nomornya.',
        kind: 'good',
        reply: '(Pesan tidak terkirim lagi.)',
        explanation: 'Tepat. Kerja ringan dengan bayaran besar hampir pasti penipuan.',
      },
      {
        text: 'Tanyakan ke teman apakah pernah dapat tawaran serupa.',
        kind: 'ok',
        reply: 'Kak, jangan kelamaan, kuotanya tinggal sedikit.',
        explanation:
          'Langkah bagus. Perhatikan juga tekanan “kuota tinggal sedikit”, itu ciri penipuan.',
      },
    ],
    s: [
      'Bayaran besar untuk kerja mudah',
      'Tugas pertama dibayar untuk memancing',
      'Ujung-ujungnya minta deposit',
    ],
  },
  {
    t: 'QRIS kotak donasi palsu',
    lv: 'Sedang',
    who: 'Pengurus Masjid Al-Ikhlas',
    no: '+62 878-3321-9090',
    m: [
      'Bapak/Ibu, infak pembangunan bisa lewat QRIS baru kami. Silakan scan stiker di kotak donasi dan bayar dari ponsel.',
    ],
    c: [
      {
        text: 'Scan stikernya dan langsung bayar.',
        kind: 'bad',
        reply: '(Dana masuk ke rekening perorangan yang menempel stiker palsu.)',
        explanation:
          'Stiker QRIS bisa ditempel sembarang orang. Dana masuk ke penipu, bukan masjid.',
        loss: 500000,
      },
      {
        text: 'Cek nama penerima di layar sebelum bayar, dan tanyakan langsung ke pengurus.',
        kind: 'good',
        reply: 'Iya, benar itu rekening resmi kami.',
        explanation:
          'Tepat. Nama merchant harus sama dengan lembaganya sebelum Anda menekan bayar.',
      },
      {
        text: 'Bayar Rp10.000 dulu untuk mencoba.',
        kind: 'bad',
        reply: '(Rp10.000 hilang, rekening penerima tetap tidak diketahui.)',
        explanation: 'Walau kecil, uang tetap ke tujuan yang tidak diverifikasi.',
        loss: 10000,
      },
    ],
    s: [
      'Stiker QRIS ditempel di atas yang asli',
      'Nama penerima tidak dicek',
      'Pembayaran tanpa konfirmasi pengurus',
    ],
  },
  {
    t: 'Suara anak minta tolong',
    lv: 'Sulit',
    who: 'Nomor tidak dikenal',
    no: '+62 896-0002-4417',
    m: [
      '(Telepon masuk) “Ma… Ma, tolong aku! Aku ditangkap polisi!”',
      'Lalu seorang pria: “Ibu, anak Ibu terlibat kecelakaan. Transfer Rp15 juta untuk jaminan sekarang atau ditahan.”',
    ],
    c: [
      {
        text: 'Panik dan langsung transfer agar anak segera dilepas.',
        kind: 'bad',
        reply: 'Cepat Bu, polisi menunggu.',
        explanation:
          'Suara anak ditiru dengan AI dari video yang pernah diunggah. Mereka sengaja membuat Anda panik.',
        loss: 5000000,
      },
      {
        text: 'Tutup telepon, lalu hubungi anak langsung lewat nomornya yang biasa.',
        kind: 'good',
        reply: '(Panggilan terputus.)',
        explanation: 'Tepat. Cek langsung ke orang yang bersangkutan sebelum mengirim uang.',
      },
      {
        text: 'Tanya: “Boleh saya bicara dengan komandan atau lihat surat penahanannya?”',
        kind: 'ok',
        reply: 'Tidak ada waktu, Bu! Transfer sekarang!',
        explanation:
          'Pertanyaan bagus, dan penipu menghindar. Tutup telepon dan cek anak Anda.',
      },
    ],
    s: [
      'Telepon dari nomor asing',
      'Memaksa transfer saat itu juga',
      'Suara terdengar panik tetapi tidak bisa dihubungi balik',
    ],
  },
  {
    t: 'Pinjol ilegal mengancam',
    lv: 'Sulit',
    who: 'Penagih Kredit Cepat',
    no: '+62 822-0909-3344',
    m: [
      'Pinjaman Anda jatuh tempo besok. Total yang harus dibayar Rp4.000.000.',
      'Jika tidak lunas, foto KTP dan data Anda kami sebar ke semua kontak.',
    ],
    c: [
      {
        text: 'Transfer ke rekening yang mereka berikan agar data tidak tersebar.',
        kind: 'bad',
        reply: 'Bagus. Masih ada tagihan administrasi Rp2.500.000 lagi ya.',
        explanation:
          'Pembayaran tidak menghentikan teror. Mereka akan terus menambah tagihan.',
        loss: 2500000,
      },
      {
        text: 'Simpan bukti pesan, tidak membayar ke rekening pribadi, dan lapor ke OJK di 157.',
        kind: 'good',
        reply: '(Ancaman berlanjut, tetapi Anda sudah memegang bukti.)',
        explanation: 'Tepat. Pinjol ilegal tidak berhak menagih. Kumpulkan bukti dan laporkan.',
      },
      {
        text: 'Pinjam dari aplikasi lain untuk menutup tagihan ini.',
        kind: 'bad',
        reply: 'Ditunggu pembayarannya.',
        explanation:
          'Menutup utang dengan utang baru membuat Anda terjerat lebih dalam.',
        loss: 1000000,
      },
    ],
    s: [
      'Bunga dan denda tidak masuk akal',
      'Mengancam menyebar data',
      'Rekening penerima atas nama perorangan',
    ],
  },
];

type MessageBubble =
  | { id: string; role: 'them'; text: string; file?: string }
  | { id: string; role: 'me'; text: string }
  | { id: string; role: 'dots' }
  | {
      id: string;
      role: 'fb';
      kind: 'good' | 'ok' | 'bad';
      title: string;
      explanation: string;
      loss?: number;
      clues: string[];
    };

const LVL_META: Record<'good' | 'ok' | 'bad', { label: string; cls: string }> = {
  good: { label: 'Tepat', cls: 'good' },
  ok: { label: 'Cukup aman', cls: 'ok' },
  bad: { label: 'Berbahaya', cls: 'bad' },
};

export const SimulationTab: React.FC<SimulationTabProps> = ({ onAddScore }) => {
  const [cur, setCur] = useState(0);
  const [res, setRes] = useState<Record<number, { k: 'good' | 'ok' | 'bad'; loss: number }>>({});
  const [messages, setMessages] = useState<MessageBubble[]>([]);
  const [status, setStatus] = useState<'choosing' | 'typing' | 'answered'>('choosing');

  const msgsContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate remaining balance
  const currentLoss = Object.values(res).reduce((acc, r) => acc + (r.loss || 0), 0);
  const balance = Math.max(0, START_BALANCE - currentLoss);
  const balanceRatio = Math.max(0, balance / START_BALANCE);

  // Auto-scroll messages
  const scrollToBottom = () => {
    if (msgsContainerRef.current) {
      msgsContainerRef.current.scrollTop = msgsContainerRef.current.scrollHeight + 1000;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load a scenario
  const startScenario = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCur(index);
    setStatus('choosing');

    const s = SCENARIOS[index];
    const initialMsgs: MessageBubble[] = s.m.map((text, j) => ({
      id: `init-${index}-${j}`,
      role: 'them',
      text,
      file: j === 0 && s.file ? s.file : undefined,
    }));

    setMessages(initialMsgs);
  };

  // Start initial scenario on mount
  useEffect(() => {
    startScenario(0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Pick an option
  const handlePick = (choiceIndex: number) => {
    const s = SCENARIOS[cur];
    const c = s.c[choiceIndex];

    setStatus('typing');

    // Add user bubble and typing dots
    setMessages((prev) => [
      ...prev,
      { id: `me-${Date.now()}`, role: 'me', text: c.text },
      { id: `dots-${Date.now()}`, role: 'dots' },
    ]);

    timerRef.current = setTimeout(() => {
      // Record result
      const lossAmount = c.loss || 0;
      setRes((prev) => ({
        ...prev,
        [cur]: { k: c.kind, loss: lossAmount },
      }));

      // Award XP
      if (c.kind === 'good') {
        onAddScore(50);
      } else if (c.kind === 'ok') {
        onAddScore(20);
      }

      // Remove dots, add scammer reply
      setMessages((prev) => {
        const withoutDots = prev.filter((m) => m.role !== 'dots');
        return [
          ...withoutDots,
          { id: `them-${Date.now()}`, role: 'them', text: c.reply },
        ];
      });

      // Show feedback card after 700ms
      timerRef.current = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `fb-${Date.now()}`,
            role: 'fb',
            kind: c.kind,
            title: LVL_META[c.kind].label,
            explanation: c.explanation,
            loss: c.loss,
            clues: s.s,
          },
        ]);
        setStatus('answered');
      }, 700);
    }, 900);
  };

  const currentScenario = SCENARIOS[cur];
  const finishedCount = Object.keys(res).length;
  const nextUnfinishedIndex = SCENARIOS.findIndex((_, i) => !res[i]);

  const restartCurrentCase = () => {
    setRes((prev) => {
      const copy = { ...prev };
      delete copy[cur];
      return copy;
    });
    startScenario(cur);
  };

  return (
    <>
      {/* Top Section: Header & Bank Balance */}
      <div className="sim-top">
        <div>
          <h1 className="hero-h1">Latihan menghadapi penipuan</h1>
          <p className="lead">
            Baca pesan di ponsel, lalu pilih jawaban Anda. Uangnya hanya latihan, tidak ada yang
            hilang sungguhan.
          </p>
        </div>
        <div className="bank" aria-live="polite">
          <small>Tabungan latihan Anda</small>
          <b>{formatRp(balance)}</b>
          <div className="bar">
            <i style={{ width: `${balanceRatio * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Cases List, Right Phone Simulator */}
      <div className="sim-grid">
        {/* Left Section: Case Picker */}
        <section aria-labelledby="lh">
          <h2 id="lh" style={{ fontSize: '19px', margin: '0 0 4px', fontWeight: 800 }}>
            Pilih kasus
          </h2>
          <p className="sub" id="prog">
            {finishedCount > 0
              ? `${finishedCount} dari ${SCENARIOS.length} kasus selesai`
              : 'Belum ada yang diselesaikan'}
          </p>
          <div className="sim-list">
            {SCENARIOS.map((s, i) => {
              const r = res[i];
              const isSelected = i === cur;
              return (
                <button
                  key={i}
                  type="button"
                  className="case"
                  aria-current={isSelected}
                  onClick={() => startScenario(i)}
                >
                  <div className="t">
                    {s.t}
                    <span>{s.lv}</span>
                  </div>
                  {r && (
                    <span className={`tag ${LVL_META[r.k].cls}`}>
                      {LVL_META[r.k].label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Section: Phone Simulator */}
        <section className="phone" aria-label="Simulasi percakapan">
          {/* Phone Header */}
          <div className="ph">
            <div className="av">{currentScenario.who.charAt(0)}</div>
            <div>
              <b>{currentScenario.who}</b>
              <small>{currentScenario.no}</small>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="msgs" ref={msgsContainerRef} aria-live="polite">
            {messages.map((m) => {
              if (m.role === 'them') {
                return (
                  <div key={m.id} className="b them">
                    {m.text}
                    {m.file && <div className="file">📎 {m.file}</div>}
                  </div>
                );
              }
              if (m.role === 'me') {
                return (
                  <div key={m.id} className="b me">
                    {m.text}
                  </div>
                );
              }
              if (m.role === 'dots') {
                return (
                  <div key={m.id} className="dots">
                    <i />
                    <i />
                    <i />
                  </div>
                );
              }
              if (m.role === 'fb') {
                return (
                  <div key={m.id} className={`fb ${LVL_META[m.kind].cls}`}>
                    <h3>{m.title}</h3>
                    <p>{m.explanation}</p>
                    {m.loss ? (
                      <p className="loss">
                        Tabungan latihan berkurang {formatRp(m.loss)}.
                      </p>
                    ) : null}
                    <b>Tanda yang bisa dikenali:</b>
                    <ul>
                      {m.clues.map((clue, idx) => (
                        <li key={idx}>{clue}</li>
                      ))}
                    </ul>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Action Decision Area */}
          <div className="act">
            {status === 'choosing' && (
              <>
                <p>Apa yang Anda lakukan?</p>
                {currentScenario.c.map((choice, k) => (
                  <button
                    key={k}
                    type="button"
                    className="opt"
                    onClick={() => handlePick(k)}
                  >
                    {choice.text}
                  </button>
                ))}
              </>
            )}

            {status === 'typing' && (
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                Menunggu respon pengirim…
              </p>
            )}

            {status === 'answered' && (
              <>
                {nextUnfinishedIndex > -1 ? (
                  <>
                    <button
                      type="button"
                      className="cta"
                      onClick={() => startScenario(nextUnfinishedIndex)}
                    >
                      Kasus berikutnya
                    </button>
                    <button
                      type="button"
                      className="ghost"
                      onClick={restartCurrentCase}
                    >
                      Ulangi kasus ini
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 700, color: 'var(--ink)' }}>
                      Semua kasus selesai. Tabungan akhir Anda {formatRp(balance)}.
                    </p>
                    <button
                      type="button"
                      className="ghost"
                      onClick={restartCurrentCase}
                    >
                      Ulangi kasus ini
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};
