import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Globe,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Zap,
} from 'lucide-react';
import { inspectUrl, UrlScanResult } from '../utils/urlScanner';

const SAMPLE_URLS = [
  { label: '🏦 Tiruan BCA Phishing (.xyz)', url: 'https://klikbca-promo-gebyar.xyz/klaim-hadiah' },
  { label: '📦 Link Download APK Kurir', url: 'http://103.24.12.88/unduh/resi_paket_jnt.apk' },
  { label: '✅ Domain Resmi BCA (Aman)', url: 'https://www.klikbca.com' },
  { label: '✅ Domain Resmi Kominfo (Aman)', url: 'https://cekrekening.id' },
  { label: '⚠️ Link HTTP Tanpa Enkripsi', url: 'http://update-layanan-perbankan.site' },
];

export const UrlInspectorTab: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [scanResult, setScanResult] = useState<UrlScanResult | null>(null);

  const handleScan = (urlToScan: string = inputUrl) => {
    if (!urlToScan.trim()) return;
    const res = inspectUrl(urlToScan.trim());
    setScanResult(res);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setInputUrl(sampleUrl);
    handleScan(sampleUrl);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-2 border border-cyan-500/20">
            <Globe className="w-3.5 h-3.5" />
            Pemeriksa Keaslian Tautan & Domain
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Detektor Situs Web Tiruan (Phishing) & Tautan Berbahaya
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cek apakah tautan yang Anda terima adalah situs resmi bank, web phishing dengan domain tiruan, atau link download malware otomatis.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <label htmlFor="url-input" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Masukkan Alamat Tautan (URL) yang Ingin Diperiksa:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                id="url-input"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Contoh: https://klikbca-promo-gebyar.xyz/klaim"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleScan();
                }}
              />
            </div>
            <button
              onClick={() => handleScan()}
              disabled={!inputUrl.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm transition shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Periksa Tautan</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Coba Contoh Tautan Kasus Nyata:
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_URLS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(s.url)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scan Results Card */}
        {scanResult && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high'
                        ? 'bg-rose-500 text-white'
                        : scanResult.riskLevel === 'medium'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high'
                      ? 'Berbahaya (Phishing)'
                      : scanResult.riskLevel === 'medium'
                      ? 'Waspada'
                      : 'Terverifikasi Aman'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Skor Bahaya: <strong>{scanResult.riskScore}/100</strong>
                  </span>
                </div>
                <div className="font-mono text-sm sm:text-base font-bold text-white mt-1 break-all">
                  {scanResult.hostname}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {scanResult.isHttps ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <Lock className="w-3.5 h-3.5" /> HTTPS Enkripsi
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                    <Unlock className="w-3.5 h-3.5" /> Tidak Aman (HTTP)
                  </span>
                )}
              </div>
            </div>

            {/* Verdict */}
            <div
              className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : scanResult.riskLevel === 'medium'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <div className="font-bold mb-1 flex items-center gap-2">
                {scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span>Keputusan Sistem Keamanan:</span>
              </div>
              <p>{scanResult.verdict}</p>
            </div>

            {/* Warnings list */}
            {scanResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Indikator Ancaman Ditemukan:
                </h4>
                <div className="space-y-1.5">
                  {scanResult.warnings.map((w, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-rose-300 flex items-start gap-2"
                    >
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safe points */}
            {scanResult.safePoints.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Indikator Keamanan Positif:
                </h4>
                <div className="space-y-1.5">
                  {scanResult.safePoints.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-emerald-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
