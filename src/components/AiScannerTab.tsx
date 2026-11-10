import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult } from '../types';

// Reference sample texts
const REFERENCE_SAMPLES = [
  {
    label: 'Hadiah undian 50 juta',
    text: 'Selamat! Anda memenangkan hadiah undian Rp50.000.000. Klik tautan berikut untuk klaim hadiah sekarang sebelum hangus: https://hadiah-gelegar-bumn.xyz/klaim',
    isGood: false,
  },
  {
    label: 'Kurir paket .apk',
    text: 'Halo kak, ini foto paket Anda. Silakan unduh dan buka Foto_Paket.apk untuk melihat resi pengiriman.',
    isGood: false,
  },
  {
    label: 'Undangan pernikahan .apk',
    text: 'Assalamualaikum, kami mengundang Anda ke pernikahan kami. Undangan digital: Undangan_Pernikahan.apk',
    isGood: false,
  },
  {
    label: 'CS bank tarif naik',
    text: 'Yth. nasabah, mulai bulan ini tarif transaksi naik menjadi Rp150.000/bulan. Jika tidak setuju, isi formulir di https://bit.ly/form-bank dan kirim PIN m-banking Anda.',
    isGood: false,
  },
  {
    label: 'Freelance like video',
    text: 'Dibutuhkan freelance like video Youtube, komisi Rp500rb per hari. Daftar sekarang lewat wa.me/628123456789 dan transfer deposit awal.',
    isGood: false,
  },
  {
    label: 'Surat tilang ETLE .apk',
    text: 'Pemberitahuan: Anda terkena tilang elektronik ETLE. Segera unduh bukti pelanggaran Surat_Tilang.apk dan bayar dalam 24 jam agar tidak diblokir.',
    isGood: false,
  },
  {
    label: 'Pesan OTP resmi (aman)',
    text: 'Kode OTP Anda 483921. Jangan berikan kode ini kepada siapa pun, termasuk pihak bank. Berlaku 5 menit.',
    isGood: true,
  },
];

// Helper to create sample screenshot SVGs as Data URIs
function createMockScreenshotDataUri(type: 'apk' | 'bank' | 'prize'): string {
  let svgContent = '';
  if (type === 'apk') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <rect width="600" height="420" fill="#0b141a"/>
      <rect width="600" height="60" fill="#202c33"/>
      <circle cx="35" cy="30" r="18" fill="#536471"/>
      <text x="35" y="36" fill="#ffffff" font-size="16" text-anchor="middle" font-family="sans-serif">📦</text>
      <text x="65" y="28" fill="#e9edef" font-size="15" font-weight="bold" font-family="sans-serif">Kurir J&amp;T Paket Budi</text>
      <text x="65" y="46" fill="#8696a0" font-size="12" font-family="sans-serif">+62 821-9981-0231 • Online</text>
      <g transform="translate(40, 90)">
        <path d="M 0 10 Q 0 0 10 0 L 460 0 Q 470 0 470 10 L 470 170 Q 470 180 460 180 L 20 180 Q 0 180 0 160 Z" fill="#202c33"/>
        <text x="18" y="30" fill="#e9edef" font-size="14" font-family="sans-serif">Selamat siang kak, saya kurir ekspedisi.</text>
        <text x="18" y="52" fill="#e9edef" font-size="14" font-family="sans-serif">Paket atas nama Anda alamatnya buram kena hujan.</text>
        <text x="18" y="74" fill="#e9edef" font-size="14" font-family="sans-serif">Mohon cek foto paket di bawah ini apakah benar punya Anda:</text>
        <rect x="18" y="90" width="434" height="65" rx="8" fill="#111b21" stroke="#ef4444" stroke-width="1.5"/>
        <rect x="30" y="100" width="44" height="45" rx="6" fill="#ef4444" fill-opacity="0.2"/>
        <text x="52" y="128" fill="#ef4444" font-size="18" text-anchor="middle" font-weight="bold" font-family="sans-serif">APK</text>
        <text x="86" y="116" fill="#e9edef" font-size="13" font-weight="bold" font-family="sans-serif">LIHAT_FOTO_PAKET_JNT.apk</text>
        <text x="86" y="135" fill="#8696a0" font-size="11" font-family="sans-serif">5.8 MB • File Paket Aplikasi Android</text>
        <text x="440" y="172" fill="#8696a0" font-size="10" font-family="sans-serif" text-anchor="end">13:42</text>
      </g>
    </svg>`;
  } else if (type === 'bank') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <rect width="600" height="420" fill="#0b141a"/>
      <rect width="600" height="60" fill="#202c33"/>
      <circle cx="35" cy="30" r="18" fill="#0066ae"/>
      <text x="35" y="36" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">CS</text>
      <text x="65" y="28" fill="#e9edef" font-size="15" font-weight="bold" font-family="sans-serif">Customer Service Bank Resmi</text>
      <text x="65" y="46" fill="#ef4444" font-size="12" font-family="sans-serif">+62 858-1029-3849 (Tanpa Centang Hijau)</text>
      <g transform="translate(40, 85)">
        <path d="M 0 10 Q 0 0 10 0 L 480 0 Q 490 0 490 10 L 490 190 Q 490 200 480 200 L 20 200 Q 0 200 0 180 Z" fill="#202c33"/>
        <text x="18" y="28" fill="#f59e0b" font-size="13" font-weight="bold" font-family="sans-serif">PEMBERITAHUAN RESMI KENAIKAN TARIF TRANSFER</text>
        <text x="18" y="52" fill="#e9edef" font-size="13" font-family="sans-serif">Yth. Nasabah, terhitung mulai besok tarif transfer antar bank</text>
        <text x="18" y="72" fill="#e9edef" font-size="13" font-family="sans-serif">akan disesuaikan menjadi Rp150.000 per bulan autodebet.</text>
        <text x="18" y="100" fill="#e9edef" font-size="13" font-family="sans-serif">Jika Anda keberatan &amp; ingin mempertahankan tarif normal,</text>
        <text x="18" y="120" fill="#e9edef" font-size="13" font-family="sans-serif">segera batalkan melalui tautan resmi verifikasi berikut:</text>
        <rect x="18" y="132" width="454" height="40" rx="6" fill="#111b21" stroke="#38bdf8" stroke-width="1"/>
        <text x="28" y="157" fill="#38bdf8" font-size="13" font-weight="bold" font-family="sans-serif">👉 https://bca-klik-tarifbatal.site/verifikasi-tarif</text>
        <text x="470" y="192" fill="#8696a0" font-size="10" font-family="sans-serif" text-anchor="end">09:15</text>
      </g>
    </svg>`;
  } else {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <rect width="600" height="420" fill="#0b141a"/>
      <rect width="600" height="60" fill="#1e293b"/>
      <text x="300" y="35" fill="#f8fafc" font-size="15" font-weight="bold" text-anchor="middle" font-family="sans-serif">SMS DARI: +62 838-2910-4491</text>
      <g transform="translate(45, 95)">
        <rect width="510" height="175" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1"/>
        <text x="20" y="32" fill="#38bdf8" font-size="14" font-weight="bold" font-family="sans-serif">🎁 GEBYAR PROMO AKHIR TAHUN NASIONAL 2026</text>
        <text x="20" y="60" fill="#f8fafc" font-size="13" font-family="sans-serif">Selamat! Nomor Anda resmi terpilih sebagai pemenang hadiah</text>
        <text x="20" y="80" fill="#4ade80" font-size="14" font-weight="bold" font-family="sans-serif">Uang Tunai Rp 50.000.000 (Lima Puluh Juta Rupiah).</text>
        <text x="20" y="108" fill="#f8fafc" font-size="13" font-family="sans-serif">Klaim PIN hadiah Anda (ID: #99281) sebelum hangus 1x24 jam:</text>
        <text x="20" y="132" fill="#f43f5e" font-size="13" font-weight="bold" font-family="sans-serif">http://hadiah-gelegar-bumn.xyz/klaim?id=99281</text>
        <text x="20" y="156" fill="#94a3b8" font-size="11" font-family="sans-serif">Pajak 25% telah ditanggung penyelenggara. Tanpa dipungut biaya.</text>
      </g>
    </svg>`;
  }

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent.trim())}`;
}

const SAMPLE_SCREENSHOTS = [
  { label: 'Kurir paket .apk (gambar)', type: 'apk' as const },
  { label: 'CS bank tarif naik (gambar)', type: 'bank' as const },
  { label: 'SMS hadiah 50jt (gambar)', type: 'prize' as const },
];

interface AiScannerTabProps {
  onGoToQuiz: () => void;
  onGoToSimulation: () => void;
}

export const AiScannerTab: React.FC<AiScannerTabProps> = () => {
  const [mode, setMode] = useState<'text' | 'img'>('text');
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ data: string; mimeType: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  // Global paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            setMode('img');
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Mohon unggah berkas gambar (PNG atau JPG).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Ukuran gambar maksimal adalah 8 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setImagePreview(resultStr);

      const base64Content = resultStr.includes(';base64,')
        ? resultStr.split(';base64,')[1]
        : resultStr;

      setImageData({
        data: base64Content,
        mimeType: file.type || 'image/jpeg',
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleText = (text: string) => {
    setMode('text');
    setMessage(text);
    setResult(null);
    setError(null);
  };

  const handleSelectSampleScreenshot = (type: 'apk' | 'bank' | 'prize') => {
    setMode('img');
    const dataUri = createMockScreenshotDataUri(type);
    setImagePreview(dataUri);
    const base64Data = btoa(decodeURIComponent(dataUri.replace('data:image/svg+xml;charset=utf-8,', '')));
    setImageData({
      data: base64Data,
      mimeType: 'image/svg+xml',
    });
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    const hasText = message.trim().length > 0;
    const hasImg = Boolean(imageData?.data);

    if (mode === 'text' && !hasText) return;
    if (mode === 'img' && !hasImg && !hasText) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: any = {
        context: sender.trim(),
      };

      if (hasText) {
        payload.message = message.trim();
      }

      if (hasImg && mode === 'img') {
        payload.image = imageData;
        if (!payload.message) {
          payload.message = 'Harap periksa tangkapan layar ini secara menyeluruh untuk mendeteksi indikator penipuan/scam.';
        }
      }

      const response = await fetch('/api/analyze-scam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi asisten AI');
      }

      const data = await response.json();
      setResult(data);

      if (window.innerWidth < 860 && panelRef.current) {
        panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err: any) {
      console.error(err);
      setError('Terjadi kendala saat menganalisis. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  // Determine verdict visual level (bad, warn, ok)
  const getLevel = (res: AnalysisResult): 'bad' | 'warn' | 'ok' => {
    const lvl = res.riskLevel?.toLowerCase();
    if (lvl === 'critical' || lvl === 'kritis' || lvl === 'high' || lvl === 'tinggi' || res.riskScore >= 60) {
      return 'bad';
    }
    if (lvl === 'medium' || lvl === 'sedang' || res.riskScore >= 25) {
      return 'warn';
    }
    return 'ok';
  };

  const getVerdictText = (lvl: 'bad' | 'warn' | 'ok') => {
    switch (lvl) {
      case 'bad':
        return [
          'Kemungkinan besar penipuan',
          'Jangan klik, jangan balas, dan jangan pasang apa pun dari pesan ini.',
        ];
      case 'warn':
        return [
          'Waspada, ada tanda mencurigakan',
          'Verifikasi dulu lewat jalur resmi sebelum melakukan apa pun.',
        ];
      default:
        return [
          'Belum ditemukan tanda penipuan',
          'Tetap hati-hati. Hasil ini bukan jaminan pesan 100% aman.',
        ];
    }
  };

  const textCount = message.trim().length;
  const countText =
    mode === 'text'
      ? textCount ? `${textCount} karakter` : 'Belum ada teks'
      : imageData ? 'Gambar siap diperiksa' : 'Belum ada gambar';

  const isGoDisabled = mode === 'text' ? textCount < 5 : !imageData;

  const currentLevel = result ? getLevel(result) : null;
  const verdictText = currentLevel ? getVerdictText(currentLevel) : null;

  // Build reasons array from redFlags or summary
  const reasonsList = result
    ? (result.redFlags && result.redFlags.length > 0)
      ? result.redFlags.map((f) => `${f.title}${f.explanation ? ` — ${f.explanation}` : ''}`)
      : result.summary ? [result.summary] : ['Tidak ada pola penipuan menonjol yang terdeteksi.']
    : [];

  // Build steps array
  const stepsList = result
    ? (result.actionRecommendations && result.actionRecommendations.length > 0)
      ? result.actionRecommendations
      : currentLevel === 'bad'
      ? [
          'Jangan klik tautan atau membuka berkas apa pun.',
          'Blokir dan laporkan nomor pengirim di WhatsApp.',
          'Jika sudah terlanjur, buka "Kena tipu?" di bagian atas halaman.',
        ]
      : currentLevel === 'warn'
      ? [
          'Hubungi instansi lewat nomor resmi di situs atau kartu Anda.',
          'Tanyakan ke keluarga atau teman sebelum bertindak.',
          'Jangan berikan data pribadi lewat pesan.',
        ]
      : [
          'Tetap jangan bagikan kode OTP kepada siapa pun.',
          'Buka aplikasi resmi sendiri, bukan lewat tautan di pesan.',
        ]
    : [];

  return (
    <>
      <section className="hero">
        {/* Left Column: Form & Samples */}
        <div>
          <h1 className="hero-h1">Ragu dengan sebuah pesan? Periksa dulu sebelum diklik.</h1>
          <p className="lead">
            Tempel isi pesan atau unggah tangkapan layar WhatsApp dan SMS. Kami tunjukkan tanda
            penipuan yang ditemukan dan apa yang sebaiknya Anda lakukan.
          </p>

          <div className="card">
            <div className="seg" role="tablist" aria-label="Cara memeriksa">
              <button
                role="tab"
                aria-selected={mode === 'text'}
                onClick={() => { setMode('text'); setError(null); }}
              >
                Tempel teks
              </button>
              <button
                role="tab"
                aria-selected={mode === 'img'}
                onClick={() => { setMode('img'); setError(null); }}
              >
                Unggah tangkapan layar
              </button>
            </div>

            {mode === 'text' ? (
              <div>
                <label htmlFor="msg" className="input-label">
                  Pesan atau tautan yang Anda terima
                </label>
                <textarea
                  id="msg"
                  className="input-field"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={'Contoh: “Selamat! Anda mendapat hadiah Rp50.000.000. Klik tautan ini untuk klaim…”'}
                />
                <details className="sender-details">
                  <summary className="sender-summary">Tambah info pengirim (boleh dilewati)</summary>
                  <input
                    type="text"
                    className="input-field"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    aria-label="Info pengirim"
                    placeholder="Contoh: dari nomor +62 838…, tanpa centang hijau"
                  />
                </details>
              </div>
            ) : (
              <div>
                <label
                  className="drop"
                  htmlFor="file-drop"
                  onClick={(e) => {
                    // if clicking preview, re-open file selector
                    if (imagePreview) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {!imagePreview ? (
                    <span>
                      <strong>Pilih gambar</strong> atau seret ke sini
                      <br />
                      PNG atau JPG, tangkapan layar chat
                    </span>
                  ) : (
                    <img src={imagePreview} alt="Pratinjau tangkapan layar" />
                  )}
                </label>
                <input
                  id="file-drop"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) processImageFile(e.target.files[0]);
                  }}
                />
                {imagePreview && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageData(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Hapus gambar
                    </button>
                  </div>
                )}
                <details className="sender-details">
                  <summary className="sender-summary">Tambah info pengirim (boleh dilewati)</summary>
                  <input
                    type="text"
                    className="input-field"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    aria-label="Info pengirim"
                    placeholder="Contoh: dari nomor +62 838…, tanpa centang hijau"
                  />
                </details>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: 'var(--danger-soft)',
                  color: 'var(--danger)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginTop: '12px',
                }}
              >
                {error}
              </div>
            )}

            <div className="row">
              <span className="count">{countText}</span>
              <button
                className="cta"
                disabled={isGoDisabled || loading}
                onClick={handleAnalyze}
              >
                {loading ? 'Memeriksa…' : 'Periksa sekarang'}
              </button>
            </div>

            <p className="note">
              Jangan menempel kode OTP, PIN, atau nomor kartu asli. Hapus dulu sebelum memeriksa.
            </p>
          </div>

          <div className="samples">
            <p>
              {mode === 'text'
                ? 'Belum punya pesan? Coba salah satu contoh:'
                : 'Coba contoh screenshot:'}
            </p>
            <div className="chips">
              {mode === 'text'
                ? REFERENCE_SAMPLES.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`chip${s.isGood ? ' good' : ''}`}
                      onClick={() => handleSelectSampleText(s.text)}
                    >
                      {s.label}
                    </button>
                  ))
                : SAMPLE_SCREENSHOTS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className="chip"
                      onClick={() => handleSelectSampleScreenshot(s.type)}
                    >
                      {s.label}
                    </button>
                  ))}
            </div>
          </div>
        </div>

        {/* Right Column: Panel */}
        <aside className="panel card" aria-live="polite" ref={panelRef}>
          {!loading && !result && (
            <div className="empty">
              <h2>Hasil pemeriksaan muncul di sini</h2>
              <p>Yang paling sering kami temukan pada pesan penipuan:</p>
              <ul>
                <li>
                  <i className="dot" />
                  <span>
                    <b>Berkas .APK.</b> Menyamar jadi foto kurir, surat tilang, atau undangan nikah.
                  </span>
                </li>
                <li>
                  <i className="dot" />
                  <span>
                    <b>Permintaan data rahasia.</b> OTP, PIN m-banking, atau 3 angka CVV.
                  </span>
                </li>
                <li>
                  <i className="dot" />
                  <span>
                    <b>Tekanan waktu.</b> “Rekening diblokir dalam 1 jam.”
                  </span>
                </li>
                <li>
                  <i className="dot" />
                  <span>
                    <b>Hadiah tak masuk akal.</b> Uang puluhan juta tanpa ikut undian.
                  </span>
                </li>
              </ul>
            </div>
          )}

          {loading && (
            <div className="busy">
              <div className="spin" />
              Memeriksa pesan…
            </div>
          )}

          {result && currentLevel && verdictText && (
            <div className="res">
              <div className={`verdict v-${currentLevel}`}>
                <h2>{verdictText[0]}</h2>
                <p>{verdictText[1]}</p>
              </div>

              {/* Meter bar */}
              <div
                className={`meter v-${currentLevel}`}
                style={{ background: 'var(--line)' }}
                role="img"
                aria-label={`Tingkat risiko ${result.riskScore} dari 100`}
              >
                <i style={{ width: `${Math.max(result.riskScore, 4)}%` }} />
              </div>

              {/* Provider tag */}
              {result.provider && (
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '14px' }}>
                  Model: <b>{result.provider}</b> ({result.model || 'default'})
                  {result.latencyMs !== undefined && ` · ${result.latencyMs}ms`}
                  {result.analysisScope === 'text-only-degraded' && (
                    <span style={{ color: 'var(--warn)', marginLeft: 6, fontWeight: 700 }}>
                      [Degraded: teks saja]
                    </span>
                  )}
                </div>
              )}

              {/* OCR text preview if available from image */}
              {result.extractedText && (
                <div style={{ marginBottom: 14 }}>
                  <h3 className="section-h3">Teks yang terbaca pada gambar</h3>
                  <div
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: 10,
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      maxHeight: 120,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {result.extractedText}
                  </div>
                </div>
              )}

              <h3 className="section-h3">Mengapa begitu</h3>
              <ul>
                {reasonsList.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>

              <h3 className="section-h3">Yang sebaiknya Anda lakukan</h3>
              <ol>
                {stepsList.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}
        </aside>
      </section>

      {/* Tips Section */}
      <section className="tips" aria-labelledby="t">
        <h2 id="t">Tiga kebiasaan yang melindungi Anda</h2>
        <div className="tiplist">
          <div>
            <b>Berhenti sebentar</b>
            <span>Penipu ingin Anda panik. Tarik napas sebelum membalas atau mengklik.</span>
          </div>
          <div>
            <b>Hubungi lewat jalur resmi</b>
            <span>
              Telepon nomor di belakang kartu atau aplikasi resmi, bukan nomor dari pesan.
            </span>
          </div>
          <div>
            <b>Jangan pasang .APK</b>
            <span>Aplikasi resmi hanya dari Play Store atau App Store.</span>
          </div>
        </div>
      </section>
    </>
  );
};
