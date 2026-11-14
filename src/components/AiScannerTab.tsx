import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnalysisResult } from '../types';
import { speakText } from './A11yPanel';

// ─── 1. Fallback rules (basic analysis when AI is unavailable) ─────────────
const FALLBACK_RULES: [RegExp, number, string, string][] = [
  [/\.apk\b|\bapk\b/i, 60, 'Berkas .APK', 'Aplikasi dari luar toko resmi adalah cara paling umum untuk mencuri OTP dan menguras rekening.'],
  [/\b(pin|cvv|kata sandi|password)\b|(kirim|berikan|sebutkan|bagikan|masukkan|input|minta|konfirmasi)\w*[^.\n]{0,50}\b(otp|kode verifikasi|kode)\b/i, 30, 'Meminta data rahasia', 'Bank dan instansi resmi tidak pernah meminta OTP, PIN, CVV, atau kata sandi lewat pesan.'],
  [/hadiah|undian|menang|memenangkan|rp\s?\d{1,3}(\.\d{3}){2,}|\d+\s?juta/i, 30, 'Janji hadiah atau uang besar', 'Hadiah dari undian yang tidak pernah Anda ikuti hampir pasti jebakan.'],
  [/segera|hangus|diblokir|blokir|dalam\s*\d+\s*(jam|menit)|batas waktu|sekarang juga|detik ini/i, 20, 'Tekanan waktu', 'Penipu menekan agar Anda panik dan tidak sempat berpikir.'],
  [/https?:\/\/\S+|\b(bit\.ly|wa\.me|tinyurl\.com|s\.id|cutt\.ly)\S*|\b[a-z0-9-]+\.(xyz|top|click|icu|site|buzz|vip)\b/i, 30, 'Tautan tidak jelas', 'Tautan resmi memakai domain asli instansi. Periksa dulu di tab Cek tautan.'],
  [/tarif|komisi|deposit|freelance|like video|follow akun|biaya admin/i, 20, 'Menyinggung uang di muka atau komisi', 'Pola umum penipuan tugas online dan perubahan biaya palsu.'],
  [/(komisi|gaji|bayaran|penghasilan)[^.\n]{0,40}(per hari|perhari|sehari)|kerja (mudah|santai)|langsung cair/i, 20, 'Bayaran besar untuk kerja mudah', 'Tawaran kerja yang terlalu enak biasanya berujung permintaan deposit.'],
  [/tilang|etle|kurir|paket|resi|undangan|nasabah|polisi|kejaksaan/i, 12, 'Mengatasnamakan pihak tepercaya', 'Kurir, bank, atau polisi dicatut agar pesan tampak meyakinkan.'],
  [/ditangkap|kecelakaan|jaminan|anak anda|anak ibu|anak bapak|transfer[^.\n]{0,30}sekarang/i, 40, 'Kabar darurat palsu', 'Penipu memakai kabar mengejutkan tentang keluarga agar Anda segera mentransfer.'],
  [/jatuh tempo|tagihan|pinjaman|utang/i, 15, 'Menagih utang', 'Penagih palsu atau pinjol ilegal sering menekan lewat tagihan yang membengkak.'],
  [/sebar|ancam|penagih|data pribadi|semua kontak|foto ktp/i, 45, 'Ancaman menyebar data', 'Pinjol ilegal dan pemeras memakai ancaman agar Anda membayar.'],
];

function runFallback(message: string, context: string): AnalysisResult {
  const hits: { title: string; explanation: string }[] = [];
  let score = 0;
  for (const [re, w, title, explanation] of FALLBACK_RULES) {
    if (re.test(message)) {
      hits.push({ title, explanation });
      score += w;
    }
  }
  if (/tanpa centang|nomor asing|tidak dikenal|nomor baru|\+62\s?8/i.test(context)) {
    hits.push({ title: 'Pengirim tidak terverifikasi', explanation: 'Nomor pribadi atau asing tanpa tanda resmi tidak layak dipercaya untuk urusan uang.' });
    score += 10;
  }
  const isOfficialOtp = /jangan\s+(berikan|bagikan|beritahukan|kasih)[^.]*siapa\s?pun/i.test(message) && !/\bapk\b|https?:\/\//i.test(message);
  if (isOfficialOtp) {
    score = 8;
    hits.splice(0, hits.length, { title: 'Tampak pesan OTP resmi', explanation: 'Isinya memperingatkan agar kode tidak dibagikan, dan tidak ada tautan atau berkas yang diminta.' });
  }
  score = Math.min(100, score);
  const riskLevel = score >= 60 ? 'tinggi' : score >= 25 ? 'sedang' : 'rendah';
  return {
    riskScore: score,
    riskLevel,
    redFlags: hits,
    actionRecommendations: [],
    summary: score < 25 ? 'Analisis dasar tidak menemukan pola penipuan umum pada pesan ini.' : 'Pesan ini memiliki ciri penipuan umum.',
    provider: 'Analisis dasar',
    model: 'tanpa AI',
    fallback: true,
  };
}

// ─── 2. Warning copy ────────────────────────────────────────────────────────
function truncate(s: string, n: number) {
  s = String(s).replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function buildWarningText(level: string, reasons: string[], actions: string[]): string {
  const head: Record<string, string> = {
    bad: '⚠️ PERINGATAN: kemungkinan besar penipuan',
    warn: '⚠️ HATI-HATI: ada tanda mencurigakan',
    ok: '✅ Hasil pemeriksaan: belum ada tanda bahaya yang jelas',
  };
  const lines = [head[level] ?? 'Hasil pemeriksaan', '', 'Saya baru memeriksa sebuah pesan lewat Cek Dulu.'];
  if (reasons.length) {
    lines.push('', 'Alasannya:');
    reasons.slice(0, 4).forEach((r) => lines.push('• ' + truncate(r, 170)));
  }
  if (actions.length) {
    lines.push('', 'Yang sebaiknya dilakukan:');
    actions.slice(0, 3).forEach((r) => lines.push('• ' + truncate(r, 140)));
  }
  lines.push('', 'Periksa pesan atau tautan mencurigakan sebelum diklik di: ' + window.location.origin + window.location.pathname);
  return lines.join('\n');
}

function copyWarning(level: string, reasons: string[], actions: string[]) {
  const text = buildWarningText(level, reasons, actions);
  return navigator.clipboard.writeText(text);
}

// ─── Samples ────────────────────────────────────────────────────────────────
const REFERENCE_SAMPLES = [
  { label: 'Hadiah undian 50 juta', text: 'Selamat! Anda memenangkan hadiah undian Rp50.000.000. Klik tautan berikut untuk klaim hadiah sekarang sebelum hangus: https://hadiah-gelegar-bumn.xyz/klaim', isGood: false },
  { label: 'Kurir paket .apk', text: 'Halo kak, ini foto paket Anda. Silakan unduh dan buka Foto_Paket.apk untuk melihat resi pengiriman.', isGood: false },
  { label: 'Undangan pernikahan .apk', text: 'Assalamualaikum, kami mengundang Anda ke pernikahan kami. Undangan digital: Undangan_Pernikahan.apk', isGood: false },
  { label: 'CS bank tarif naik', text: 'Yth. nasabah, mulai bulan ini tarif transaksi naik menjadi Rp150.000/bulan. Jika tidak setuju, isi formulir di https://bit.ly/form-bank dan kirim PIN m-banking Anda.', isGood: false },
  { label: 'Freelance like video', text: 'Dibutuhkan freelance like video Youtube, komisi Rp500rb per hari. Daftar sekarang lewat wa.me/628123456789 dan transfer deposit awal.', isGood: false },
  { label: 'Surat tilang ETLE .apk', text: 'Pemberitahuan: Anda terkena tilang elektronik ETLE. Segera unduh bukti pelanggaran Surat_Tilang.apk dan bayar dalam 24 jam agar tidak diblokir.', isGood: false },
  { label: 'Pesan OTP resmi (aman)', text: 'Kode OTP Anda 483921. Jangan berikan kode ini kepada siapa pun, termasuk pihak bank. Berlaku 5 menit.', isGood: true },
];

// ─── Main component ──────────────────────────────────────────────────────────
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
  const [warningCopied, setWarningCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
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
          if (file) { processImageFile(file); setMode('img'); break; }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Mohon unggah berkas gambar (PNG atau JPG).'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Ukuran gambar maksimal adalah 8 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setImagePreview(resultStr);
      const base64Content = resultStr.includes(';base64,') ? resultStr.split(';base64,')[1] : resultStr;
      setImageData({ data: base64Content, mimeType: file.type || 'image/jpeg' });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleText = (text: string) => { setMode('text'); setMessage(text); setResult(null); setError(null); };
  const handleAnalyze = useCallback(async () => {
    const hasText = message.trim().length > 0;
    const hasImg = Boolean(imageData?.data);
    if (mode === 'text' && !hasText) return;
    if (mode === 'img' && !hasImg && !hasText) return;

    setLoading(true); setError(null); setResult(null);

    // 1. Timeout controller (25 s)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    try {
      const payload: Record<string, unknown> = { context: sender.trim() };
      if (hasText) payload.message = message.trim();
      if (hasImg && mode === 'img') {
        payload.image = imageData;
        if (!payload.message) payload.message = 'Harap periksa tangkapan layar ini secara menyeluruh untuk mendeteksi indikator penipuan/scam.';
      }

      const response = await fetch('/api/analyze-scam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) throw new Error('server-error');
      const data = await response.json();
      setResult(data);
    } catch (err: unknown) {
      clearTimeout(timer);
      // ── Fallback: gunakan analisis dasar ──
      if (mode === 'img' && !hasText) {
        // Gambar tanpa teks tidak bisa dianalisis tanpa AI
        setResult({
          riskScore: 0,
          riskLevel: 'tidak-diketahui',
          redFlags: [],
          actionRecommendations: [],
          summary: 'Layanan AI sedang tidak tersedia dan mode gambar tidak dapat dianalisis tanpa AI. Salin teks dari gambar dan tempel di mode "Tempel teks".',
          provider: 'Analisis dasar',
          model: 'tanpa AI',
          fallback: true,
          fallbackImageMode: true,
        } as AnalysisResult);
      } else if (hasText) {
        const fb = runFallback(message.trim(), sender.trim());
        setResult(fb);
      } else {
        setError('Terjadi kendala saat menganalisis. Silakan coba kembali.');
      }
    } finally {
      setLoading(false);
      if (window.innerWidth < 860 && panelRef.current) {
        panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [message, sender, imageData, mode]);

  // ── Verdict helpers ──────────────────────────────────────────────────────
  const getLevel = (res: AnalysisResult): 'bad' | 'warn' | 'ok' => {
    const lvl = res.riskLevel?.toLowerCase();
    if (lvl === 'critical' || lvl === 'kritis' || lvl === 'high' || lvl === 'tinggi' || res.riskScore >= 60) return 'bad';
    if (lvl === 'medium' || lvl === 'sedang' || res.riskScore >= 25) return 'warn';
    return 'ok';
  };

  const getVerdictText = (lvl: 'bad' | 'warn' | 'ok') => {
    switch (lvl) {
      case 'bad': return ['Kemungkinan besar penipuan', 'Jangan klik, jangan balas, dan jangan pasang apa pun dari pesan ini.'];
      case 'warn': return ['Waspada, ada tanda mencurigakan', 'Verifikasi dulu lewat jalur resmi sebelum melakukan apa pun.'];
      default: return ['Belum ditemukan tanda penipuan', 'Tetap hati-hati. Hasil ini bukan jaminan pesan 100% aman.'];
    }
  };

  const textCount = message.trim().length;
  const countText = mode === 'text' ? (textCount ? `${textCount} karakter` : 'Belum ada teks') : (imageData ? 'Gambar siap diperiksa' : 'Belum ada gambar');
  const isGoDisabled = mode === 'text' ? textCount < 5 : !imageData;

  const currentLevel = result && !(result as any).fallbackImageMode ? getLevel(result) : null;
  const verdictText = currentLevel ? getVerdictText(currentLevel) : null;

  const reasonsList = result
    ? (result.redFlags && result.redFlags.length > 0)
      ? result.redFlags.map((f) => `${f.title}${f.explanation ? ` — ${f.explanation}` : ''}`)
      : result.summary ? [result.summary] : ['Tidak ada pola penipuan menonjol yang terdeteksi.']
    : [];

  const stepsList = result
    ? (result.actionRecommendations && result.actionRecommendations.length > 0)
      ? result.actionRecommendations
      : currentLevel === 'bad'
      ? ['Jangan klik tautan atau membuka berkas apa pun.', 'Blokir dan laporkan nomor pengirim di WhatsApp.', 'Jika sudah terlanjur, buka "Kena tipu?" di bagian atas halaman.']
      : currentLevel === 'warn'
      ? ['Hubungi instansi lewat nomor resmi di situs atau kartu Anda.', 'Tanyakan ke keluarga atau teman sebelum bertindak.', 'Jangan berikan data pribadi lewat pesan.']
      : ['Tetap jangan bagikan kode OTP kepada siapa pun.', 'Buka aplikasi resmi sendiri, bukan lewat tautan di pesan.']
    : [];

  const handleSpeak = () => {
    if (!result || !verdictText) return;
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
    const text = [verdictText[0], verdictText[1], 'Alasannya.', ...reasonsList.slice(0, 4).map((r) => String(r).replace(' — ', '. ')), 'Yang sebaiknya Anda lakukan.', ...stepsList.slice(0, 3)].join(' ');
    setSpeaking(true);
    speakText(text, () => setSpeaking(false));
  };

  const handleCopyWarning = async () => {
    if (!result || !currentLevel) return;
    try {
      await copyWarning(currentLevel, reasonsList, stepsList);
      setWarningCopied(true);
      setTimeout(() => setWarningCopied(false), 2200);
    } catch { /* ignore */ }
  };

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
              <button role="tab" aria-selected={mode === 'text'} onClick={() => { setMode('text'); setError(null); }}>Tempel teks</button>
              <button role="tab" aria-selected={mode === 'img'} onClick={() => { setMode('img'); setError(null); }}>Unggah tangkapan layar</button>
            </div>

            {mode === 'text' ? (
              <div>
                <label htmlFor="msg" className="input-label">Pesan atau tautan yang Anda terima</label>
                <textarea
                  id="msg"
                  className="input-field"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={'Contoh: "Selamat! Anda mendapat hadiah Rp50.000.000. Klik tautan ini untuk klaim…"'}
                />
                <details className="sender-details">
                  <summary className="sender-summary">Tambah info pengirim (boleh dilewati)</summary>
                  <input type="text" className="input-field" value={sender} onChange={(e) => setSender(e.target.value)} aria-label="Info pengirim" placeholder="Contoh: dari nomor +62 838…, tanpa centang hijau" />
                </details>
              </div>
            ) : (
              <div>
                <label className="drop" htmlFor="file-drop" onClick={(e) => { if (imagePreview) { e.preventDefault(); fileInputRef.current?.click(); } }}>
                  {!imagePreview ? (
                    <span><strong>Pilih gambar</strong> atau seret ke sini<br />PNG atau JPG, tangkapan layar chat</span>
                  ) : (
                    <img src={imagePreview} alt="Pratinjau tangkapan layar" />
                  )}
                </label>
                <input id="file-drop" type="file" ref={fileInputRef} accept="image/*" hidden onChange={(e) => { if (e.target.files?.[0]) processImageFile(e.target.files[0]); }} />
                {imagePreview && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="button" onClick={() => { setImagePreview(null); setImageData(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      Hapus gambar
                    </button>
                  </div>
                )}
                <details className="sender-details">
                  <summary className="sender-summary">Tambah info pengirim (boleh dilewati)</summary>
                  <input type="text" className="input-field" value={sender} onChange={(e) => setSender(e.target.value)} aria-label="Info pengirim" placeholder="Contoh: dari nomor +62 838…, tanpa centang hijau" />
                </details>
              </div>
            )}

            {error && (
              <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginTop: '12px' }}>
                {error}
              </div>
            )}

            <div className="row">
              <span className="count">{countText}</span>
              <button className="cta" disabled={isGoDisabled || loading} onClick={handleAnalyze}>
                {loading ? 'Memeriksa…' : 'Periksa sekarang'}
              </button>
            </div>

            <p className="note">Jangan menempel kode OTP, PIN, atau nomor kartu asli. Hapus dulu sebelum memeriksa.</p>
          </div>

          {mode === 'text' && (
            <div className="samples">
              <p>Belum punya pesan? Coba salah satu contoh:</p>
              <div className="chips">
                {REFERENCE_SAMPLES.map((s, i) => (
                  <button key={i} type="button" className={`chip${s.isGood ? ' good' : ''}`} onClick={() => handleSelectSampleText(s.text)}>{s.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Panel */}
        <aside className="panel card" aria-live="polite" ref={panelRef}>
          {!loading && !result && (
            <div className="empty">
              <h2>Hasil pemeriksaan muncul di sini</h2>
              <p>Yang paling sering kami temukan pada pesan penipuan:</p>
              <ul>
                <li><i className="dot" /><span><b>Berkas .APK.</b> Menyamar jadi foto kurir, surat tilang, atau undangan nikah.</span></li>
                <li><i className="dot" /><span><b>Permintaan data rahasia.</b> OTP, PIN m-banking, atau 3 angka CVV.</span></li>
                <li><i className="dot" /><span><b>Tekanan waktu.</b> "Rekening diblokir dalam 1 jam."</span></li>
                <li><i className="dot" /><span><b>Hadiah tak masuk akal.</b> Uang puluhan juta tanpa ikut undian.</span></li>
              </ul>
            </div>
          )}

          {loading && (
            <div className="busy">
              <div className="spin" />
              Memeriksa pesan…
            </div>
          )}

          {result && (
            <div className="res">
              {/* ── Fallback image mode ── */}
              {(result as any).fallbackImageMode && (
                <div className="cd-fallback">
                  ⚠️ Layanan AI sedang tidak tersedia dan mode gambar tidak dapat dianalisis tanpa AI. Salin teks dari gambar, lalu tempel di mode "Tempel teks".
                </div>
              )}

              {/* ── Normal result ── */}
              {currentLevel && verdictText && (
                <>
                  {/* Fallback notice */}
                  {result.fallback && !( result as any).fallbackImageMode && (
                    <div className="cd-fallback">
                      ⚠️ Layanan AI sedang tidak tersedia. Hasil berikut berasal dari analisis dasar — akurasinya lebih terbatas.
                    </div>
                  )}

                  <div className={`verdict v-${currentLevel}`}>
                    <h2>{verdictText[0]}</h2>
                    <p>{verdictText[1]}</p>
                  </div>

                  <div className={`meter v-${currentLevel}`} style={{ background: 'var(--line)' }} role="img" aria-label={`Tingkat risiko ${result.riskScore} dari 100`}>
                    <i style={{ width: `${Math.max(result.riskScore, 4)}%` }} />
                  </div>

                  {result.provider && (
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '14px' }}>
                      Model: <b>{result.provider}</b> ({result.model || 'default'})
                      {result.latencyMs !== undefined && ` · ${result.latencyMs}ms`}
                      {result.analysisScope === 'text-only-degraded' && (
                        <span style={{ color: 'var(--warn)', marginLeft: 6, fontWeight: 700 }}>[Degraded: teks saja]</span>
                      )}
                    </div>
                  )}

                  {result.extractedText && (
                    <div style={{ marginBottom: 14 }}>
                      <h3 className="section-h3">Teks yang terbaca pada gambar</h3>
                      <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8, padding: 10, fontSize: '13px', fontFamily: 'monospace', maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {result.extractedText}
                      </div>
                    </div>
                  )}

                  <h3 className="section-h3">Mengapa begitu</h3>
                  <ol className="res-steps">
                    {reasonsList.map((r, i) => (
                      <li key={i}>
                        <span className={`res-num ${currentLevel || ''}`}>{i + 1}</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ol>

                  <h3 className="section-h3">Yang sebaiknya Anda lakukan</h3>
                  <ol className="res-steps">
                    {stepsList.map((s, i) => (
                      <li key={i}>
                        <span className="res-num">{i + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>

                  {/* ── Action buttons ── */}
                  <div className="cd-actions">
                    {/* Salin peringatan untuk keluarga */}
                    <button
                      type="button"
                      className="cd-btn cd-primary"
                      onClick={handleCopyWarning}
                    >
                      {warningCopied ? '✓ Peringatan tersalin' : '📋 Salin peringatan'}
                    </button>

                    {/* Bacakan hasil */}
                    <button type="button" className="cd-btn" onClick={handleSpeak}>
                      {speaking ? '⏹ Berhenti membaca' : '🔊 Bacakan hasil'}
                    </button>

                  </div>
                </>
              )}
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
            <span>Telepon nomor di belakang kartu atau aplikasi resmi, bukan nomor dari pesan.</span>
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
