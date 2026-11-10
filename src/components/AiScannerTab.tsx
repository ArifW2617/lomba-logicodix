import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Info,
  Flame,
  BrainCircuit,
  Lock,
  Camera,
  FileText,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Eye,
  FileSearch,
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { SAMPLE_SCAMS } from '../data/scamData';

// Helper to create high-fidelity sample screenshot SVGs as Data URIs for instant testing
function createMockScreenshotDataUri(type: 'apk' | 'bank' | 'prize'): string {
  let svgContent = '';
  if (type === 'apk') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <rect width="600" height="420" fill="#0b141a"/>
      <!-- Header WA -->
      <rect width="600" height="60" fill="#202c33"/>
      <circle cx="35" cy="30" r="18" fill="#536471"/>
      <text x="35" y="36" fill="#ffffff" font-size="16" text-anchor="middle" font-family="sans-serif">📦</text>
      <text x="65" y="28" fill="#e9edef" font-size="15" font-weight="bold" font-family="sans-serif">Kurir J&amp;T Paket Budi</text>
      <text x="65" y="46" fill="#8696a0" font-size="12" font-family="sans-serif">+62 821-9981-0231 • Online</text>
      
      <!-- Bubble Chat -->
      <g transform="translate(40, 90)">
        <path d="M 0 10 Q 0 0 10 0 L 460 0 Q 470 0 470 10 L 470 170 Q 470 180 460 180 L 20 180 Q 0 180 0 160 Z" fill="#202c33"/>
        <text x="18" y="30" fill="#e9edef" font-size="14" font-family="sans-serif">Selamat siang kak, saya kurir ekspedisi.</text>
        <text x="18" y="52" fill="#e9edef" font-size="14" font-family="sans-serif">Paket atas nama Anda alamatnya buram kena hujan.</text>
        <text x="18" y="74" fill="#e9edef" font-size="14" font-family="sans-serif">Mohon cek foto paket di bawah ini apakah benar punya Anda:</text>
        
        <!-- Attachment Box (.apk) -->
        <rect x="18" y="90" width="434" height="65" rx="8" fill="#111b21" stroke="#ef4444" stroke-width="1.5"/>
        <rect x="30" y="100" width="44" height="45" rx="6" fill="#ef4444" fill-opacity="0.2"/>
        <text x="52" y="128" fill="#ef4444" font-size="18" text-anchor="middle" font-weight="bold" font-family="sans-serif">APK</text>
        <text x="86" y="116" fill="#e9edef" font-size="13" font-weight="bold" font-family="sans-serif">LIHAT_FOTO_PAKET_JNT.apk</text>
        <text x="86" y="135" fill="#8696a0" font-size="11" font-family="sans-serif">5.8 MB • File Paket Aplikasi Android</text>
        <text x="440" y="172" fill="#8696a0" font-size="10" font-family="sans-serif" text-anchor="end">13:42</text>
      </g>
      
      <!-- Alert watermark -->
      <rect x="120" y="320" width="360" height="34" rx="17" fill="#ef4444" fill-opacity="0.15" stroke="#ef4444" stroke-width="1"/>
      <text x="300" y="342" fill="#fca5a5" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">⚠️ MODUS BAHAYA: FOTO MENYAMARKAN FILE .APK</text>
    </svg>`;
  } else if (type === 'bank') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <rect width="600" height="420" fill="#0b141a"/>
      <!-- Header WA -->
      <rect width="600" height="60" fill="#202c33"/>
      <circle cx="35" cy="30" r="18" fill="#0066ae"/>
      <text x="35" y="36" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">CS</text>
      <text x="65" y="28" fill="#e9edef" font-size="15" font-weight="bold" font-family="sans-serif">Customer Service Bank Resmi</text>
      <text x="65" y="46" fill="#ef4444" font-size="12" font-family="sans-serif">+62 858-1029-3849 (Tanpa Centang Hijau)</text>
      
      <!-- Bubble Chat -->
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
      
      <rect x="110" y="325" width="380" height="34" rx="17" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="1"/>
      <text x="300" y="347" fill="#fde68a" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">⚠️ PHISHING LINK: MENCATUT NAMA BANK VIA DOMAIN PALSU</text>
    </svg>`;
  } else {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <rect width="600" height="420" fill="#0b141a"/>
      <!-- Header SMS -->
      <rect width="600" height="60" fill="#1e293b"/>
      <text x="300" y="35" fill="#f8fafc" font-size="15" font-weight="bold" text-anchor="middle" font-family="sans-serif">SMS DARI: +62 838-2910-4491</text>
      
      <!-- Bubble Chat SMS -->
      <g transform="translate(45, 95)">
        <rect width="510" height="175" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1"/>
        <text x="20" y="32" fill="#38bdf8" font-size="14" font-weight="bold" font-family="sans-serif">🎁 GEBYAR PROMO AKHIR TAHUN NASIONAL 2026</text>
        <text x="20" y="60" fill="#f8fafc" font-size="13" font-family="sans-serif">Selamat! Nomor Anda resmi terpilih sebagai pemenang hadiah</text>
        <text x="20" y="80" fill="#4ade80" font-size="14" font-weight="bold" font-family="sans-serif">Uang Tunai Rp 50.000.000 (Lima Puluh Juta Rupiah).</text>
        <text x="20" y="108" fill="#f8fafc" font-size="13" font-family="sans-serif">Klaim PIN hadiah Anda (ID: #99281) sebelum hangus 1x24 jam:</text>
        <text x="20" y="132" fill="#f43f5e" font-size="13" font-weight="bold" font-family="sans-serif">http://hadiah-gelegar-bumn.xyz/klaim?id=99281</text>
        <text x="20" y="156" fill="#94a3b8" font-size="11" font-family="sans-serif">Pajak 25% telah ditanggung penyelenggara. Tanpa dipungut biaya.</text>
      </g>
      
      <rect x="130" y="320" width="340" height="34" rx="17" fill="#f43f5e" fill-opacity="0.15" stroke="#f43f5e" stroke-width="1"/>
      <text x="300" y="342" fill="#fca5a5" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">⚠️ MODUS UNDIAN PALSU &amp; TAUTAN SHORTLINK</text>
    </svg>`;
  }

  const encoded = encodeURIComponent(svgContent.trim());
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

const SAMPLE_SCREENSHOTS = [
  {
    id: 'sample-ss-apk',
    title: '📦 Modus WhatsApp Kurir Paket (.APK)',
    subtitle: 'Ekstensi file foto_paket.apk menyamar jadi resi',
    type: 'apk' as const,
    context: 'Diterima dari nomor WhatsApp kurir tidak dikenal.',
  },
  {
    id: 'sample-ss-bank',
    title: '🏦 Modus Surat Bank "Tarif Naik 150rb"',
    subtitle: 'Mengarahkan ke link phishing pembatalan tarif',
    type: 'bank' as const,
    context: 'Nomor WhatsApp bisnis tanpa lencana centang hijau resmi.',
  },
  {
    id: 'sample-ss-prize',
    title: '🎁 Modus SMS Pemenang Undian 50 Juta',
    subtitle: 'Umpan hadiah fantastis dan tautan .xyz',
    type: 'prize' as const,
    context: 'SMS acak mengatasnamakan undian BUMN nasional.',
  },
];

interface AiScannerTabProps {
  onGoToQuiz: () => void;
  onGoToSimulation: () => void;
}

export const AiScannerTab: React.FC<AiScannerTabProps> = ({ onGoToSimulation }) => {
  // Input mode: 'text' or 'screenshot'
  const [inputMode, setInputMode] = useState<'text' | 'screenshot'>('text');

  // Text inputs
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');

  // Screenshot image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ data: string; mimeType: string } | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Analysis result & UI states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(true);

  // Quick mini-quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle global clipboard paste (Ctrl+V) so users can paste screenshots directly anywhere
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            setInputMode('screenshot');
            setError(null);
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
      setError('Mohon unggah berkas gambar (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Ukuran gambar maksimal adalah 8 MB.');
      return;
    }

    setImageFileName(file.name);
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

  const handleSelectSampleText = (sample: (typeof SAMPLE_SCAMS)[0]) => {
    setMessage(sample.text);
    setContext(sample.context);
    setResult(null);
    setError(null);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
  };

  const handleSelectSampleScreenshot = (sample: (typeof SAMPLE_SCREENSHOTS)[0]) => {
    const dataUri = createMockScreenshotDataUri(sample.type);
    setImagePreview(dataUri);
    setImageFileName(`${sample.title.slice(0, 20)}.png`);
    setContext(sample.context);

    // Convert SVG data URI to base64 for Gemini vision API
    const base64Data = btoa(decodeURIComponent(dataUri.replace('data:image/svg+xml;charset=utf-8,', '')));
    setImageData({
      data: base64Data,
      mimeType: 'image/svg+xml',
    });

    setResult(null);
    setError(null);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setImageData(null);
    setImageFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const hasTextMessage = message.trim().length > 0;
    const hasImagePayload = Boolean(imageData?.data);

    if (inputMode === 'text' && !hasTextMessage) {
      setError('Silakan masukkan teks pesan atau tautan yang ingin Anda periksa.');
      return;
    }

    if (inputMode === 'screenshot' && !hasImagePayload && !hasTextMessage) {
      setError('Silakan unggah tangkapan layar (screenshot) atau gunakan salah satu contoh screenshot.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);

    try {
      const payload: any = {
        context: context.trim(),
      };

      if (hasTextMessage) {
        payload.message = message.trim();
      }

      if (hasImagePayload && inputMode === 'screenshot') {
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
    } catch (err: any) {
      console.error(err);
      setError('Terjadi kendala saat menganalisis. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!result) return;
    const textToCopy = `[Analisis ScamAware AI]\nKategori: ${result.category}\nTingkat Risiko: ${result.riskLevel.toUpperCase()} (Skor: ${result.riskScore}/100)\n\nRingkasan: ${result.summary}\n\nTujuan Pelaku: ${result.scammerIntent}\n\nRekomendasi:\n${result.actionRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
      case 'kritis':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          badgeBg: 'bg-rose-500',
          badgeText: 'text-white',
          label: 'Bahaya Kritis (Scam)',
          meter: 'from-orange-500 to-rose-600',
        };
      case 'high':
      case 'tinggi':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          badgeBg: 'bg-rose-600',
          badgeText: 'text-white',
          label: 'Berisiko Tinggi',
          meter: 'from-amber-500 to-rose-500',
        };
      case 'medium':
      case 'sedang':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          badgeBg: 'bg-amber-500',
          badgeText: 'text-slate-950',
          label: 'Mencurigakan / Waspada',
          meter: 'from-yellow-400 to-amber-500',
        };
      case 'low':
      case 'rendah':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          badgeBg: 'bg-blue-600',
          badgeText: 'text-white',
          label: 'Risiko Rendah',
          meter: 'from-cyan-400 to-blue-500',
        };
      default:
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          badgeBg: 'bg-emerald-600',
          badgeText: 'text-white',
          label: 'Aman / Sah',
          meter: 'from-emerald-400 to-teal-500',
        };
    }
  };

  const riskStyle = result ? getRiskColor(result.riskLevel) : null;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-8 border border-indigo-500/20 overflow-hidden shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-48 h-48 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Asisten Analisis Penipuan Cerdas • Gemini Multimodal AI
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Periksa Pesan &amp; Screenshot Mencurigakan Sebelum Terlambat
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Dapatkan deteksi instan terhadap modus APK kurir, phishing perbankan, tilang ETLE palsu, dan undian fiktif.
            Tempel teks pesan atau <strong>unggah tangkapan layar (screenshot WhatsApp/SMS)</strong> langsung ke ScamAware AI.
          </p>
        </div>
      </div>

      {/* Input Mode Selector (Text vs Screenshot) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => {
            setInputMode('text');
            setError(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
            inputMode === 'text'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Teks Pesan / Tautan</span>
        </button>

        <button
          onClick={() => {
            setInputMode('screenshot');
            setError(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition relative ${
            inputMode === 'screenshot'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Camera className="w-4 h-4 text-cyan-400" />
          <span>Screenshot Chat / Gambar (AI Vision)</span>
          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 uppercase tracking-wider animate-pulse">
            Baru
          </span>
        </button>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-lg">
            {/* Mode 1: Text Input */}
            {inputMode === 'text' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor="scam-message" className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Teks Pesan / Link yang Anda Terima:
                  </label>
                  {message && (
                    <button
                      onClick={() => {
                        setMessage('');
                        setContext('');
                        setResult(null);
                      }}
                      className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Bersihkan
                    </button>
                  )}
                </div>

                <textarea
                  id="scam-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Contoh: 'Selamat! Anda mendapatkan hadiah Rp50.000.000. Klik tautan berikut untuk klaim hadiah sekarang: https://hadiah-gelegar-bumn.xyz/klaim'"
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono transition"
                />
              </div>
            )}

            {/* Mode 2: Screenshot / Image Input */}
            {inputMode === 'screenshot' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    Unggah Tangkapan Layar (Screenshot WA / SMS):
                  </label>
                  {imagePreview && (
                    <button
                      onClick={handleClearImage}
                      className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus Gambar
                    </button>
                  )}
                </div>

                {/* Dropzone & Preview */}
                {!imagePreview ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) {
                        processImageFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                      isDragging
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-slate-700 hover:border-indigo-500 bg-slate-950/50 hover:bg-slate-950/80'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) processImageFile(e.target.files[0]);
                      }}
                    />
                    <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-cyan-400 mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-200">
                      Klik untuk memilih berkas atau seret gambar ke sini
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Mendukung format PNG, JPG, JPEG, WEBP (Maksimal 8 MB)
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Tips Praktis: Tekan <strong>Ctrl + V</strong> untuk langsung tempel screenshot dari clipboard!</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl border border-slate-700 bg-slate-950 p-3 overflow-hidden">
                    <div className="max-h-64 overflow-hidden rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800">
                      <img
                        src={imagePreview}
                        alt="Screenshot Preview"
                        className="object-contain max-h-64 w-full"
                      />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 px-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span className="truncate text-slate-200 font-medium">
                          {imageFileName || 'Screenshot Terlampir'}
                        </span>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Ganti Gambar
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) processImageFile(e.target.files[0]);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Optional Context */}
            <div className="mt-3">
              <label htmlFor="scam-context" className="text-xs text-slate-400 flex items-center gap-1 mb-1 font-medium">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Informasi Pengirim Tambahan (Opsional):
              </label>
              <input
                id="scam-context"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Contoh: Pesan WhatsApp dari nomor +62 838..., tidak ada centang hijau resmi."
                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {inputMode === 'text' ? `${message.length} karakter` : imagePreview ? '1 gambar siap dianalisis' : 'Pilih atau tempel gambar'}
              </span>
              <button
                onClick={() => handleAnalyze()}
                disabled={loading || (inputMode === 'text' && !message.trim()) || (inputMode === 'screenshot' && !imageData && !message.trim())}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menganalisis {inputMode === 'screenshot' ? 'Visual & OCR' : 'Pola Scam'}...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    <span>Analisis dengan ScamAware AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Presets Section */}
          <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {inputMode === 'text' ? 'Uji Coba Cepat dengan Contoh Kasus Teks:' : 'Uji Coba Cepat dengan Contoh Screenshot (Klik untuk Muat):'}
            </div>

            {inputMode === 'text' ? (
              <div className="flex flex-wrap gap-2">
                {SAMPLE_SCAMS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSampleText(sample)}
                    className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/50 hover:border-indigo-500/50 transition flex items-center gap-1.5"
                  >
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_SCREENSHOTS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSampleScreenshot(sample)}
                    className="text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 hover:border-cyan-400/60 transition group"
                  >
                    <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                      {sample.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                      {sample.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informative Guidance Side Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 rounded-xl border border-slate-800 p-5 text-sm space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Ciri Umum Modus Penipuan Digital
            </h2>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 flex-shrink-0" />
                <span>
                  <strong>Iming-iming Tidak Masuk Akal:</strong> Hadiah uang puluhan juta tanpa pernah mendaftar undian apapun.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 flex-shrink-0" />
                <span>
                  <strong>Tekanan Waktu (Urgensi):</strong> "Klaim sekarang sebelum hangus", "Rekening diblokir dalam 1 jam".
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 flex-shrink-0" />
                <span>
                  <strong>Berkas Ekstensi .APK:</strong> Menyamar sebagai foto kurir, surat tilang ETLE, atau undangan nikah.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 flex-shrink-0" />
                <span>
                  <strong>Permintaan Data Sakral:</strong> Meminta kode OTP, PIN m-banking, atau 3 angka CVV di belakang kartu ATM.
                </span>
              </li>
            </ul>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Ingin melatih insting Anda?</span>
              <button
                onClick={onGoToSimulation}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group"
              >
                Coba Simulasi Chat
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && riskStyle && (
        <div className="space-y-6 pt-2">
          {/* Main Risk Card */}
          <div className={`rounded-2xl border ${riskStyle.border} ${riskStyle.bg} p-6 sm:p-8 backdrop-blur-sm shadow-xl`}>
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`p-3 rounded-xl ${riskStyle.bg} border ${riskStyle.border}`}>
                  {result.riskLevel === 'critical' || result.riskLevel === 'high' ? (
                    <ShieldAlert className={`w-8 h-8 ${riskStyle.text}`} />
                  ) : result.riskLevel === 'medium' ? (
                    <AlertTriangle className={`w-8 h-8 ${riskStyle.text}`} />
                  ) : (
                    <ShieldCheck className={`w-8 h-8 ${riskStyle.text}`} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${riskStyle.badgeBg} ${riskStyle.badgeText}`}>
                      {riskStyle.label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Kategori: <strong className="text-slate-200">{result.category}</strong>
                    </span>
                    {/* Provider & Model Transparency Badge (Task 06) */}
                    {result.provider ? (
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1 border ${
                          result.provider === 'gemini'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : result.provider === 'groq'
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                            : result.provider === 'openrouter'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <BrainCircuit className="w-3 h-3 flex-shrink-0" />
                        <span>
                          {result.provider === 'gemini'
                            ? `Gemini · ${result.model || 'Vision'}`
                            : result.provider === 'groq'
                            ? `Groq · ${result.model || 'Qwen/Llama'}`
                            : result.provider === 'openrouter'
                            ? `OpenRouter · ${result.model}`
                            : 'Heuristic Fallback'}
                        </span>
                        {result.analysisScope === 'text-only-degraded' && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded ml-1 border border-amber-500/40">
                            Degraded Teks
                          </span>
                        )}
                        {result.latencyMs !== undefined && (
                          <span className="text-[10px] opacity-75 ml-0.5">({result.latencyMs}ms)</span>
                        )}
                      </span>
                    ) : result.source ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-cyan-300 border border-indigo-500/30">
                        Model: {result.source}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                    Skor Risiko Penipuan: {result.riskScore}/100
                  </h2>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={handleCopyAnalysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  title="Salin hasil analisis"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Hasil'}</span>
                </button>
              </div>
            </div>

            {/* Visual Limitation Alert Banner (Task 06 Spec) */}
            {(result.analysisScope === 'text-only-degraded' || (result.imageAnalysisPerformed === false && inputMode === 'screenshot')) && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="text-amber-300 font-bold block">
                    Peringatan: Analisis Gambar Gagal Dilakukan
                  </strong>
                  <p className="text-amber-200/90 leading-relaxed">
                    {result.warnings?.[0] || result.note || 'Analisis gambar gagal dilakukan. Hasil saat ini hanya berdasarkan teks pendamping, bukan isi gambar.'}
                  </p>
                </div>
              </div>
            )}

            {/* Risk Gauge Bar */}
            <div className="py-5">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-emerald-400">0 (Aman)</span>
                <span className="text-amber-400">50 (Mencurigakan)</span>
                <span className="text-rose-400">100 (Sangat Berbahaya)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950/80 overflow-hidden border border-slate-800">
                <div
                  className={`h-full bg-gradient-to-r ${riskStyle.meter} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.max(5, Math.min(100, result.riskScore))}%` }}
                />
              </div>
            </div>

            {/* OCR Extracted Text Section (Only when image analysis returned text) */}
            {result.extractedText && (
              <div className="rounded-xl bg-slate-950/80 border border-cyan-500/30 p-4 mt-2 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <FileSearch className="w-4 h-4 text-cyan-400" /> Teks yang Terbaca dari Tangkapan Layar (Gemini Vision OCR):
                  </div>
                  <button
                    onClick={() => setShowExtractedText(!showExtractedText)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showExtractedText ? 'Sembunyikan' : 'Tampilkan'}</span>
                  </button>
                </div>
                {showExtractedText && (
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {result.extractedText}
                  </div>
                )}
              </div>
            )}

            {/* Visual Clues Detected Section */}
            {result.visualClues && result.visualClues.length > 0 && (
              <div className="rounded-xl bg-slate-950/60 border border-indigo-500/30 p-4 mb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  Ciri Visual Mencurigakan yang Terdeteksi pada Gambar:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {result.visualClues.map((clue, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                      <span>{clue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Executive Summary */}
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 sm:p-5 mt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" /> Ringkasan Analisis AI
              </div>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Two Column Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              {/* Scammer's Intent */}
              <div className="rounded-xl bg-slate-950/50 border border-slate-800/80 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" /> Apa Tujuan Sebenarnya Pelaku?
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {result.scammerIntent}
                </p>
              </div>

              {/* Psychological Triggers */}
              <div className="rounded-xl bg-slate-950/50 border border-slate-800/80 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4" /> Trik Manipulasi Psikologis (Social Engineering):
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {result.psychologicalTriggers && result.psychologicalTriggers.length > 0 ? (
                    result.psychologicalTriggers.map((trick, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium"
                      >
                        {trick}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Tidak ada taktik manipulasi menonjol</span>
                  )}
                </div>
              </div>
            </div>

            {/* Red Flags Section */}
            {result.redFlags && result.redFlags.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Indikator Mencurigakan (Red Flags):
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {result.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-slate-950/60 border border-slate-800 p-3.5 flex items-start gap-3"
                    >
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded mt-0.5 ${
                          flag.severity === 'high'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : flag.severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        }`}
                      >
                        {flag.severity}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-100">{flag.title}</div>
                        <div className="text-xs text-slate-300 mt-1 leading-relaxed">{flag.explanation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Recommendations */}
            {result.actionRecommendations && result.actionRecommendations.length > 0 && (
              <div className="mt-6 rounded-xl bg-gradient-to-r from-emerald-950/30 to-slate-950 border border-emerald-500/30 p-5">
                <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Rekomendasi Langkah Aman yang Harus Anda Ambil:
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                  {result.actionRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tailored Mini Quiz Card */}
            {result.quickQuizQuestion && (
              <div className="mt-6 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-500/40 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" /> Kuis Cepat Terkait Pesan Ini:
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Uji Pemahaman Anda</span>
                </div>

                <div className="text-sm sm:text-base font-semibold text-white mb-4">
                  {result.quickQuizQuestion.question}
                </div>

                <div className="space-y-2">
                  {result.quickQuizQuestion.options.map((option, idx) => {
                    const isSelected = selectedQuizAnswer === idx;
                    const isCorrect = idx === result.quickQuizQuestion?.correctIndex;
                    let btnStyle = 'bg-slate-900 border-slate-700 hover:border-indigo-400 text-slate-200';

                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                      } else {
                        btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-500';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-indigo-600/30 border-indigo-400 text-white';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!quizSubmitted) setSelectedQuizAnswer(idx);
                        }}
                        disabled={quizSubmitted}
                        className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button
                    onClick={() => {
                      if (selectedQuizAnswer !== null) setQuizSubmitted(true);
                    }}
                    disabled={selectedQuizAnswer === null}
                    className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition"
                  >
                    Periksa Jawaban
                  </button>
                ) : (
                  <div className="mt-4 p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                      {selectedQuizAnswer === result.quickQuizQuestion.correctIndex ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Jawaban Anda Tepat Sekali!
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" /> Jawaban Kurang Tepat
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {result.quickQuizQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
