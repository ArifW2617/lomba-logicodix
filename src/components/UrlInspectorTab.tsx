import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Globe,
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
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '20px' }}>
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
          <Globe className="w-3.5 h-3.5" />
          Pemeriksa Keaslian Tautan & Domain
        </div>
        <h1 className="hero-h1" style={{ fontSize: '28px', margin: '0 0 6px' }}>
          Detektor Situs Web Tiruan (Phishing) & Tautan Berbahaya
        </h1>
        <p className="lead" style={{ margin: 0, maxWidth: '100%' }}>
          Cek apakah tautan yang Anda terima adalah situs resmi bank, web phishing dengan domain tiruan, atau link download malware otomatis.
        </p>
      </div>

      {/* Input Form */}
      <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%', display: 'grid', gap: '16px' }}>
        <div className="card" style={{ display: 'grid', gap: '12px' }}>
          <label htmlFor="url-input" className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            Masukkan Alamat Tautan (URL) yang Ingin Diperiksa:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <input
              id="url-input"
              type="text"
              className="input-field"
              style={{ flex: '1 1 280px', fontFamily: 'monospace' }}
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Contoh: https://klikbca-promo-gebyar.xyz/klaim"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleScan();
              }}
            />
            <button
              onClick={() => handleScan()}
              disabled={!inputUrl.trim()}
              className="cta"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px' }}
            >
              <Search className="w-4 h-4" />
              <span>Periksa Tautan</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div style={{ paddingTop: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: 'var(--warn)' }} />
              Coba Contoh Tautan Kasus Nyata:
            </div>
            <div className="chips">
              {SAMPLE_URLS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(s.url)}
                  className="chip"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scan Results Card */}
        {scanResult && (
          <div className="card" style={{ display: 'grid', gap: '16px' }}>
            {/* Header info */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background:
                        scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high'
                          ? 'var(--danger-soft)'
                          : scanResult.riskLevel === 'medium'
                          ? 'var(--warn-soft)'
                          : 'var(--ok-soft)',
                      color:
                        scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high'
                          ? 'var(--danger)'
                          : scanResult.riskLevel === 'medium'
                          ? 'var(--warn)'
                          : 'var(--ok)',
                    }}
                  >
                    {scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high'
                      ? 'Berbahaya (Phishing)'
                      : scanResult.riskLevel === 'medium'
                      ? 'Waspada'
                      : 'Terverifikasi Aman'}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    Skor Bahaya: <b style={{ color: 'var(--ink)' }}>{scanResult.riskScore}/100</b>
                  </span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px', wordBreak: 'break-all' }}>
                  {scanResult.hostname}
                </div>
              </div>

              <div>
                {scanResult.isHttps ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--ok)', background: 'var(--ok-soft)', padding: '6px 10px', borderRadius: '8px' }}>
                    <Lock className="w-3.5 h-3.5" /> HTTPS Terenkripsi
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--danger)', background: 'var(--danger-soft)', padding: '6px 10px', borderRadius: '8px' }}>
                    <Unlock className="w-3.5 h-3.5" /> Tidak Aman (HTTP)
                  </span>
                )}
              </div>
            </div>

            {/* Verdict */}
            <div
              className={`verdict ${
                scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high'
                  ? 'v-bad'
                  : scanResult.riskLevel === 'medium'
                  ? 'v-warn'
                  : 'v-ok'
              }`}
              style={{ margin: 0 }}
            >
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {scanResult.riskLevel === 'critical' || scanResult.riskLevel === 'high' ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Keputusan Sistem Keamanan:</span>
              </div>
              <p style={{ margin: 0 }}>{scanResult.verdict}</p>
            </div>

            {/* Warnings list */}
            {scanResult.warnings.length > 0 && (
              <div style={{ display: 'grid', gap: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Indikator Ancaman Ditemukan:
                </h4>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {scanResult.warnings.map((w, idx) => (
                    <div
                      key={idx}
                      style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                    >
                      <XCircle className="w-4 h-4 flex-shrink-0" style={{ marginTop: '2px' }} />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safe points */}
            {scanResult.safePoints.length > 0 && (
              <div style={{ display: 'grid', gap: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Indikator Keamanan Positif:
                </h4>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {scanResult.safePoints.map((s, idx) => (
                    <div
                      key={idx}
                      style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--ok-soft)', color: 'var(--ok)', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ marginTop: '2px' }} />
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
