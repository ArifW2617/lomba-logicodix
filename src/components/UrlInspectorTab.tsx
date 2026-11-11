import React, { useState, useRef } from 'react';

const SAMPLES = [
  { label: 'Tiruan BCA (.xyz)', url: 'klikbca-promo-gebyar.xyz/klaim' },
  { label: 'Link unduh APK kurir', url: 'https://cek-resi-jnt.top/Foto_Paket.apk' },
  { label: 'Situs resmi BCA', url: 'https://www.klikbca.com' },
  { label: 'Situs resmi Komdigi', url: 'https://www.komdigi.go.id' },
  { label: 'Tanpa enkripsi (HTTP)', url: 'http://promo-belanja.com/login' },
];

const BRANDS: Record<string, string[]> = {
  bca: ['bca.co.id', 'klikbca.com'],
  bri: ['bri.co.id'],
  bni: ['bni.co.id'],
  mandiri: ['bankmandiri.co.id'],
  jne: ['jne.co.id'],
  jnt: ['jet.co.id', 'jtexpress.co.id'],
  shopee: ['shopee.co.id', 'shopee.com'],
  tokopedia: ['tokopedia.com'],
  dana: ['dana.id'],
  ojk: ['ojk.go.id'],
  komdigi: ['komdigi.go.id'],
  kominfo: ['kominfo.go.id'],
  bpjs: ['bpjs-kesehatan.go.id', 'bpjsketenagakerjaan.go.id'],
  polri: ['polri.go.id'],
};

const OFFICIAL = new Set(
  Object.values(BRANDS).flat().concat(['cekrekening.id', 'google.com', 'tokopedia.com'])
);

const BAD_TLD = /\.(xyz|top|click|icu|site|buzz|cc|live|vip|work|rest|monster)$/;
const SHORT_URL = /^(bit\.ly|tinyurl\.com|s\.id|cutt\.ly|t\.co|rb\.gy|shorturl\.at|wa\.me)$/;
const SECOND_LEVEL_DOMAINS = new Set([
  'co.id',
  'go.id',
  'or.id',
  'ac.id',
  'web.id',
  'sch.id',
  'my.id',
]);

interface AnalysisItem {
  type: 'ok' | 'bad' | 'warn';
  text: string;
}

interface AnalysisResult {
  u: URL;
  host: string;
  reg: string;
  sub: string;
  items: AnalysisItem[];
  level: 'bad' | 'warn' | 'ok';
  score: number;
}

function analyze(raw: string): AnalysisResult | null {
  let s = raw.trim();
  if (!s) return null;
  const had = /^[a-z]+:\/\//i.test(s);
  if (!had) s = 'https://' + s;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  const labels = host.split('.');
  if (labels.length < 2) return null;

  const n = SECOND_LEVEL_DOMAINS.has(labels.slice(-2).join('.')) ? 3 : 2;
  const reg = labels.slice(-n).join('.');
  const sub = labels.slice(0, -n).join('.');
  const items: AnalysisItem[] = [];
  let score = 0;

  const add = (type: 'ok' | 'bad' | 'warn', text: string, weight?: number) => {
    items.push({ type, text });
    score += weight || 0;
  };

  const isOff = OFFICIAL.has(reg);

  if (u.protocol === 'https:') {
    add('ok', 'Memakai HTTPS (tetapi HTTPS saja tidak menjamin situs asli).');
  } else {
    add('bad', 'Tidak memakai HTTPS. Data yang Anda ketik bisa disadap.', 25);
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    add('bad', 'Memakai angka IP, bukan nama situs. Instansi resmi tidak begitu.', 40);
  }

  if (SHORT_URL.test(reg)) {
    add('warn', 'Tautan dipendekkan, jadi tujuan aslinya tersembunyi.', 25);
  }

  if (BAD_TLD.test(reg)) {
    add('bad', `Akhiran “.${labels.at(-1) || ''}” murah dan sering dipakai situs tiruan.`, 30);
  }

  if (/\.apk(\?|$)/i.test(u.pathname)) {
    add('bad', 'Mengarah ke berkas .apk. Ini aplikasi, bukan foto atau dokumen.', 50);
  }

  const toks = host.split(/[.\-]/);
  for (const [b, ds] of Object.entries(BRANDS)) {
    if (toks.some((t) => t === b || t === 'klik' + b || t === 'ib' + b || t === b + 'online') && !ds.includes(reg)) {
      add('bad', `Memakai nama “${b.toUpperCase()}”, tetapi domain resminya adalah ${ds[0]}.`, 45);
      break;
    }
  }

  if (reg.split('.')[0].split('-').length > 2) {
    add('warn', 'Nama domain penuh tanda hubung. Domain asli jarang begitu.', 15);
  }

  if (/promo|hadiah|klaim|gratis|bonus|verifikasi|login|undian/i.test(host + u.pathname)) {
    add('warn', 'Mengandung kata pancingan seperti promo, klaim, atau login.', 15);
  }

  if (sub.split('.').filter(Boolean).length >= 3 || s.includes('@')) {
    add('warn', 'Alamatnya berbelit-belit untuk menyamarkan tujuan.', 15);
  }

  if (isOff && u.protocol === 'https:' && score === 0) {
    add('ok', `Domain ${reg} termasuk situs resmi yang kami kenal.`);
  }

  const level: 'bad' | 'warn' | 'ok' = isOff && score <= 0 ? 'ok' : score >= 45 ? 'bad' : score >= 20 ? 'warn' : 'ok';
  return { u, host, reg, sub, items, level, score: isOff && score <= 0 ? 0 : score };
}

const STEPS = {
  bad: [
    'Jangan klik dan jangan isi data apa pun di tautan ini.',
    'Hapus pesan, lalu blokir pengirimnya.',
    'Jika sudah terlanjur klik atau mengisi data, buka “Kena tipu?” di atas.',
  ],
  warn: [
    'Buka situs resmi dengan mengetik alamatnya sendiri di peramban.',
    'Tanyakan ke pihak terkait lewat kontak resmi.',
    'Jangan masukkan OTP, PIN, atau kata sandi.',
  ],
  ok: [
    'Pastikan alamat sama persis dengan situs yang Anda maksud.',
    'Jangan pernah memasukkan OTP atau PIN di situs mana pun yang dikirim lewat pesan.',
  ],
};

export const UrlInspectorTab: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const runAnalysis = (text: string = urlInput) => {
    const r = analyze(text);
    setHasScanned(true);
    if (!r) {
      setIsInvalid(true);
      setResult(null);
    } else {
      setIsInvalid(false);
      setResult(r);
    }
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleSampleClick = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
    runAnalysis(sampleUrl);
  };

  return (
    <>
      {/* Top Header */}
      <div className="url-top">
        <h1>Tautan ini aman atau tidak?</h1>
        <p className="lead">
          Salin tautan dari pesan yang Anda terima, tempel di sini, dan kami tunjukkan siapa pemilik sebenarnya. Jangan klik tautannya dulu.
        </p>
      </div>

      {/* Main Container */}
      <div className="url-main">
        <div className="card">
          <label htmlFor="url-input">Tempel tautan yang ingin diperiksa</label>
          <div className="url-input-row">
            <input
              id="url-input"
              type="text"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              className="url-input"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && urlInput.trim().length >= 3) {
                  runAnalysis();
                }
              }}
              placeholder="Contoh: klikbca-promo-gebyar.xyz/klaim"
            />
            <button
              className="cta"
              disabled={urlInput.trim().length < 3}
              onClick={() => runAnalysis()}
            >
              Periksa tautan
            </button>
          </div>
          <p className="hint">Cukup salin dan tempel. Tautan tidak akan dibuka.</p>

          {/* Sample Chips */}
          <div className="samples">
            <p>Atau coba contoh:</p>
            <div className="chips">
              {SAMPLES.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="chip"
                  onClick={() => handleSampleClick(s.url)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result Panel */}
          {hasScanned && (
            <div ref={resultRef} className="res mt-5" aria-live="polite">
              {isInvalid && (
                <div className="verdict v-warn">
                  <h2>Alamat tidak terbaca</h2>
                  <p>Pastikan yang ditempel berupa tautan, misalnya bca.co.id.</p>
                </div>
              )}

              {result && (
                <div>
                  {/* Verdict Banner */}
                  <div className={`verdict v-${result.level}`}>
                    <h2>
                      {result.level === 'bad'
                        ? 'Jangan dibuka, kemungkinan besar tiruan'
                        : result.level === 'warn'
                        ? 'Hati-hati, ada yang janggal'
                        : result.score === 0 && OFFICIAL.has(result.reg)
                        ? 'Tampaknya situs resmi'
                        : 'Belum ada tanda bahaya yang jelas'}
                    </h2>
                    <p>
                      {result.level === 'bad'
                        ? 'Tautan ini punya beberapa tanda penipuan.'
                        : result.level === 'warn'
                        ? 'Jangan masukkan data apa pun sebelum memastikan.'
                        : 'Kami hanya membaca bentuk alamatnya, jadi tetap waspada.'}
                    </p>
                  </div>

                  {/* Who owns this */}
                  <h3 className="url-res-header">Siapa pemilik sebenarnya?</h3>
                  <div className="url-display">
                    <span>{result.u.protocol}//</span>
                    {result.sub ? <span>{result.sub}.</span> : null}
                    <mark>{result.reg}</mark>
                    <span>
                      {(result.u.pathname === '/' ? '' : result.u.pathname) + result.u.search}
                    </span>
                  </div>
                  <p className="url-cap">
                    Pemilik tautan adalah bagian yang disorot, yaitu nama tepat sebelum akhiran (.com, .co.id, .xyz). Apa pun di depannya hanya hiasan.
                  </p>

                  {/* Check list */}
                  <h3 className="url-res-header">Hasil pemeriksaan</h3>
                  <ul className="chk">
                    {result.items.map((item, idx) => (
                      <li key={idx} className={`i-${item.type}`}>
                        <b aria-hidden="true">
                          {item.type === 'ok' ? '✓' : item.type === 'bad' ? '✕' : '!'}
                        </b>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* What you should do */}
                  <h3 className="url-res-header">Yang sebaiknya Anda lakukan</h3>
                  <ol className="url-steps">
                    {STEPS[result.level].map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>

                  {/* Note */}
                  <p className="url-note">
                    Pemeriksaan ini membaca bentuk alamat saja dan tidak membuka situsnya. Alamat yang tampak wajar belum tentu aman.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
