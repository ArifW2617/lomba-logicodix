import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnalysisResult } from '../types';

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

// ─── 2. Share warning ────────────────────────────────────────────────────────
function truncate(s: string, n: number) {
  s = String(s).replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function shareWarning(level: string, reasons: string[], actions: string[]) {
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
  const text = lines.join('\n');
  if (navigator.share) {
    navigator.share({ title: 'Peringatan penipuan', text }).catch((e) => {
      if (e?.name !== 'AbortError') window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  } else {
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }
}

// ─── 4. Report copy ──────────────────────────────────────────────────────────
function copyReport(message: string, sender: string, verdict: string, reasons: string[]) {
  const msg = message.trim();
  const urls = (msg.match(/https?:\/\/\S+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\/\S*/gi) ?? []).slice(0, 5).map((x) => x.replace(/[.,;)]+$/, ''));
  const phones = (msg.match(/(?:\+62|62|0)8\d[\d\s-]{7,12}\d/g) ?? []).slice(0, 5);
  const safe = msg.replace(/\b(otp|kode)(\D{0,12})(\d{4,8})\b/gi, '$1$2••••');
  const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const lines = [
    'LAPORAN DUGAAN PENIPUAN',
    'Tanggal laporan: ' + tgl,
    'Dugaan awal: ' + verdict + ' (pemeriksaan awal Cek Dulu)',
    '',
    '1. Kronologi singkat',
    'Saya menerima pesan dari ' + (sender.trim() || '(isi nomor atau akun pengirim)') + ' pada (isi tanggal dan jam).',
    'Isi pesan:',
    safe ? '"' + safe + '"' : '(tempel isi pesan atau lampirkan tangkapan layar)',
    '',
    '2. Nomor atau tautan yang muncul dalam pesan',
  ];
  const seen = [...urls, ...phones];
  if (seen.length) seen.forEach((x) => lines.push('- ' + x));
  else lines.push('- (tidak ditemukan otomatis, isi bila ada)');
  lines.push('', '3. Tanda mencurigakan yang ditemukan');
  reasons.slice(0, 6).forEach((r) => lines.push('- ' + truncate(r, 200)));
  lines.push(
    '', '4. Kerugian (jika ada)', 'Nominal: Rp ...', 'Rekening tujuan: (bank, nomor, atas nama)',
    '', '5. Tindakan yang sudah saya lakukan', '(contoh: menghubungi bank, memblokir kartu, mengganti kata sandi)',
    '', '6. Bukti terlampir', 'Tangkapan layar percakapan dan bukti transfer (jika ada)',
    '', 'Kanal pelaporan: OJK 157 · cekrekening.id · patrolisiber.id'
  );
  return navigator.clipboard.writeText(lines.join('\n'));
}

// ─── 3. TTS speak ───────────────────────────────────────────────────────────
function speakText(text: string, onDone?: () => void) {
  if (!('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'id-ID';
  u.rate = 0.92;
  try {
    const v = speechSynthesis.getVoices().find((x) => /^id/i.test(x.lang));
    if (v) u.voice = v;
  } catch {}
  if (onDone) { u.onend = onDone; u.onerror = onDone; }
  speechSynthesis.speak(u);
}

// ─── Accessibility panel (mode lansia) ──────────────────────────────────────
const A11Y_KEY = 'cekdulu_a11y';

interface A11yState { z: number; hc: boolean }

function loadA11y(): A11yState {
  try { return { z: 1, hc: false, ...JSON.parse(localStorage.getItem(A11Y_KEY) || '{}') }; } catch { return { z: 1, hc: false }; }
}

function saveA11y(st: A11yState) {
  try { localStorage.setItem(A11Y_KEY, JSON.stringify(st)); } catch {}
}

function applyA11y(st: A11yState) {
  const h = document.documentElement;
  h.style.zoom = st.z === 1 ? '' : String(st.z);
  h.classList.toggle('cd-hc', !!st.hc);
  if (st.hc) h.setAttribute('data-theme', 'light');
  else if (h.getAttribute('data-theme') === 'light') h.removeAttribute('data-theme');
  saveA11y(st);
}

const A11yPanel: React.FC = () => {
  const [st, setSt] = useState<A11yState>(loadA11y);
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => { applyA11y(st); }, [st]);

  const setZoom = (z: number) => setSt((s) => ({ ...s, z }));
  const toggleHc = () => setSt((s) => ({ ...s, hc: !s.hc }));

  const readScreen = () => {
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
    const el = document.querySelector('.res') as HTMLElement | null
      ?? (Array.from(document.querySelectorAll('.fb')) as HTMLElement[]).at(-1);
    if (!el) return;
    setSpeaking(true);
    speakText(el.innerText.replace(/[✓✕]/g, ''), () => setSpeaking(false));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      {open && (
        <div
          id="cd-a11y"
          role="dialog"
          aria-label="Pengaturan tampilan dan suara"
        >
          <h2>Tampilan dan suara</h2>
          <p className="cd-l">Ukuran teks</p>
          <div className="cd-row">
            {([1, 1.15, 1.3] as const).map((z, i) => (
              <button
                key={z}
                type="button"
                aria-pressed={st.z === z}
                onClick={() => setZoom(z)}
              >
                {['Normal', 'Besar', 'Sangat besar'][i]}
              </button>
            ))}
          </div>
          <button
            type="button"
            id="cd-hc"
            role="switch"
            aria-checked={st.hc}
            className="cd-sw"
            onClick={toggleHc}
          >
            <span>Kontras tinggi</span>
            <i aria-hidden="true" />
          </button>
          <button type="button" className="cd-wide" onClick={readScreen}>
            {speaking ? '⏹ Berhenti membaca' : '🔊 Bacakan hasil di layar'}
          </button>
        </div>
      )}
      <button
        id="cd-a11y-btn"
        type="button"
        aria-expanded={open}
        aria-controls="cd-a11y"
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" style={{ fontWeight: 800 }}>Aa</span> Tampilan
      </button>
    </>
  );
};

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
        <text x="18" y="52" fill="#e9edef" font-size="14" font-family="sans-serif">Paket atas nama Anda alamatnya buram.</text>
        <text x="18" y="74" fill="#e9edef" font-size="14" font-family="sans-serif">Mohon cek foto paket di bawah ini:</text>
        <rect x="18" y="90" width="434" height="65" rx="8" fill="#111b21" stroke="#ef4444" stroke-width="1.5"/>
        <rect x="30" y="100" width="44" height="45" rx="6" fill="#ef4444" fill-opacity="0.2"/>
        <text x="52" y="128" fill="#ef4444" font-size="18" text-anchor="middle" font-weight="bold" font-family="sans-serif">APK</text>
        <text x="86" y="116" fill="#e9edef" font-size="13" font-weight="bold" font-family="sans-serif">LIHAT_FOTO_PAKET_JNT.apk</text>
        <text x="86" y="135" fill="#8696a0" font-size="11" font-family="sans-serif">5.8 MB • File Paket Aplikasi Android</text>
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
        <text x="18" y="28" fill="#f59e0b" font-size="13" font-weight="bold" font-family="sans-serif">PEMBERITAHUAN RESMI KENAIKAN TARIF</text>
        <text x="18" y="52" fill="#e9edef" font-size="13" font-family="sans-serif">Yth. Nasabah, terhitung mulai besok tarif transfer</text>
        <text x="18" y="72" fill="#e9edef" font-size="13" font-family="sans-serif">akan disesuaikan menjadi Rp150.000 per bulan.</text>
        <text x="18" y="100" fill="#e9edef" font-size="13" font-family="sans-serif">Jika Anda keberatan, segera batalkan:</text>
        <rect x="18" y="112" width="454" height="40" rx="6" fill="#111b21" stroke="#38bdf8" stroke-width="1"/>
        <text x="28" y="137" fill="#38bdf8" font-size="13" font-weight="bold" font-family="sans-serif">👉 https://bca-klik-tarifbatal.site/verifikasi</text>
      </g>
    </svg>`;
  } else {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <rect width="600" height="420" fill="#0b141a"/>
      <rect width="600" height="60" fill="#1e293b"/>
      <text x="300" y="35" fill="#f8fafc" font-size="15" font-weight="bold" text-anchor="middle" font-family="sans-serif">SMS DARI: +62 838-2910-4491</text>
      <g transform="translate(45, 95)">
        <rect width="510" height="175" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1"/>
        <text x="20" y="32" fill="#38bdf8" font-size="14" font-weight="bold" font-family="sans-serif">🎁 GEBYAR PROMO AKHIR TAHUN 2026</text>
        <text x="20" y="60" fill="#f8fafc" font-size="13" font-family="sans-serif">Selamat! Nomor Anda resmi terpilih sebagai pemenang</text>
        <text x="20" y="80" fill="#4ade80" font-size="14" font-weight="bold" font-family="sans-serif">Uang Tunai Rp 50.000.000.</text>
        <text x="20" y="108" fill="#f8fafc" font-size="13" font-family="sans-serif">Klaim sebelum hangus 1x24 jam:</text>
        <text x="20" y="132" fill="#f43f5e" font-size="13" font-weight="bold" font-family="sans-serif">http://hadiah-gelegar-bumn.xyz/klaim</text>
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
  const [reportCopied, setReportCopied] = useState(false);
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
  const handleSelectSampleScreenshot = (type: 'apk' | 'bank' | 'prize') => {
    setMode('img');
    const dataUri = createMockScreenshotDataUri(type);
    setImagePreview(dataUri);
    const base64Data = btoa(decodeURIComponent(dataUri.replace('data:image/svg+xml;charset=utf-8,', '')));
    setImageData({ data: base64Data, mimeType: 'image/svg+xml' });
    setResult(null); setError(null);
  };

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

  const handleCopyReport = async () => {
    if (!result || !verdictText) return;
    try {
      await copyReport(message, sender, verdictText[0], reasonsList);
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2200);
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

          <div className="samples">
            <p>{mode === 'text' ? 'Belum punya pesan? Coba salah satu contoh:' : 'Coba contoh screenshot:'}</p>
            <div className="chips">
              {mode === 'text'
                ? REFERENCE_SAMPLES.map((s, i) => (
                    <button key={i} type="button" className={`chip${s.isGood ? ' good' : ''}`} onClick={() => handleSelectSampleText(s.text)}>{s.label}</button>
                  ))
                : SAMPLE_SCREENSHOTS.map((s, i) => (
                    <button key={i} type="button" className="chip" onClick={() => handleSelectSampleScreenshot(s.type)}>{s.label}</button>
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
                  <ul>
                    {reasonsList.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>

                  <h3 className="section-h3">Yang sebaiknya Anda lakukan</h3>
                  <ol>
                    {stepsList.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>

                  {/* ── Action buttons ── */}
                  <div className="cd-actions">
                    {/* Bagikan peringatan */}
                    <button
                      type="button"
                      className="cd-btn cd-primary"
                      onClick={() => shareWarning(currentLevel, reasonsList, stepsList)}
                    >
                      📤 Bagikan peringatan
                    </button>

                    {/* Bacakan hasil */}
                    <button type="button" className="cd-btn" onClick={handleSpeak}>
                      {speaking ? '⏹ Berhenti membaca' : '🔊 Bacakan hasil'}
                    </button>

                    {/* Salin laporan – hanya muncul jika bad atau warn */}
                    {(currentLevel === 'bad' || currentLevel === 'warn') && (
                      <button type="button" className="cd-btn" onClick={handleCopyReport}>
                        {reportCopied ? '✓ Laporan tersalin' : '📋 Salin teks laporan'}
                      </button>
                    )}
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

      {/* Accessibility floating panel */}
      <A11yPanel />
    </>
  );
};
