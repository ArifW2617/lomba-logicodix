export interface UrlScanResult {
  url: string;
  hostname: string;
  protocol: string;
  isHttps: boolean;
  riskScore: number; // 0 - 100
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  impersonationTarget?: string;
  isOfficialDomain: boolean;
  warnings: string[];
  safePoints: string[];
  verdict: string;
}

const OFFICIAL_DOMAINS: Record<string, string[]> = {
  BCA: ['bca.co.id', 'klikbca.com', 'mybca.bca.co.id', 'prioritas.bca.co.id'],
  BRI: ['bri.co.id', 'ib.bri.co.id', 'brimo.bri.co.id'],
  Mandiri: ['bankmandiri.co.id', 'livin.bankmandiri.co.id', 'mandirikartukredit.com'],
  BNI: ['bni.co.id', 'bniexperience.bni.co.id'],
  DANA: ['dana.id'],
  GoPay: ['gopay.co.id', 'gojek.com'],
  OVO: ['ovo.id'],
  Shopee: ['shopee.co.id'],
  Tokopedia: ['tokopedia.com'],
  'J&T Express': ['jet.co.id'],
  JNE: ['jne.co.id'],
  SiCepat: ['sicepat.com'],
  Polri: ['polri.go.id', 'patrolisiber.id'],
  Kominfo: ['kominfo.go.id', 'cekrekening.id', 'aduankonten.id'],
};

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.site', '.fun', '.cfd', '.buzz', '.club', '.work', '.click', '.link', '.gq', '.tk', '.ml', '.ga', '.rest'];

const HIGH_RISK_KEYWORDS = [
  'bca', 'bri', 'mandiri', 'bni', 'dana', 'gopay', 'ovo', 'shopee', 'tokopedia',
  'hadiah', 'gebyar', 'klaim', 'undian', 'pemenang', 'tarif', 'pembatalan', 'etle',
  'tilang', 'kurir', 'paket', 'undangan', 'pernikahan', 'verifikasi', 'login', 'secure'
];

export function inspectUrl(inputUrl: string): UrlScanResult {
  let cleaned = inputUrl.trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }

  let parsed: URL;
  try {
    parsed = new URL(cleaned);
  } catch {
    return {
      url: inputUrl,
      hostname: 'Format URL Tidak Valid',
      protocol: '',
      isHttps: false,
      riskScore: 75,
      riskLevel: 'high',
      isOfficialDomain: false,
      warnings: ['Format URL tidak valid atau mengandung karakter berbahaya.'],
      safePoints: [],
      verdict: 'Format tautan rusak atau sengaja disamarkan. Jangan dibuka!',
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol;
  const isHttps = protocol === 'https:';
  const pathname = parsed.pathname.toLowerCase();

  const warnings: string[] = [];
  const safePoints: string[] = [];
  let riskScore = 10;
  let impersonationTarget: string | undefined;
  let isOfficialDomain = false;

  // Check if official
  for (const [brand, domains] of Object.entries(OFFICIAL_DOMAINS)) {
    if (domains.some(d => hostname === d || hostname.endsWith('.' + d))) {
      isOfficialDomain = true;
      safePoints.push(`Domain resmi terverifikasi untuk ${brand}.`);
      break;
    }
  }

  // Check HTTPS
  if (!isHttps) {
    warnings.push('Tidak menggunakan enkripsi aman HTTPS (Protokol HTTP biasa).');
    riskScore += 25;
  } else {
    safePoints.push('Menggunakan enkripsi SSL/HTTPS.');
  }

  // Check if IP address instead of domain
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isIpAddress) {
    warnings.push('Tautan menggunakan alamat IP mentah alih-alih nama domain. Sering digunakan server phishing & malware.');
    riskScore += 45;
  }

  // Check suspicious TLD
  const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));
  if (hasSuspiciousTld) {
    warnings.push(`Menggunakan domain berbiaya murah yang sangat sering disalahgunakan untuk penipuan (${SUSPICIOUS_TLDS.find(t => hostname.endsWith(t))}).`);
    riskScore += 35;
  }

  // Check APK or executable in pathname
  if (pathname.endsWith('.apk') || pathname.includes('.apk?') || pathname.includes('apk/')) {
    warnings.push('Tautan langsung mengunduh file instalasi Android (.APK) yang berpotensi membawa trojan penyadap SMS/OTP!');
    riskScore += 60;
  }

  // Check keywords for impersonation if not official
  if (!isOfficialDomain) {
    for (const [brand, domains] of Object.entries(OFFICIAL_DOMAINS)) {
      const brandKey = brand.toLowerCase().replace(/[^a-z]/g, '');
      if (hostname.includes(brandKey) && !domains.some(d => hostname.endsWith(d))) {
        impersonationTarget = brand;
        warnings.push(`Tautan mencurigakan: Menggunakan nama "${brand}" di alamat URL padahal BUKAN domain resmi dari ${brand}!`);
        riskScore += 45;
        break;
      }
    }

    // Check scam keywords in hostname
    const foundKeywords = HIGH_RISK_KEYWORDS.filter(k => hostname.includes(k) || pathname.includes(k));
    if (foundKeywords.length > 0 && !isOfficialDomain) {
      warnings.push(`Mengandung kata kunci pemicu penipuan: "${foundKeywords.slice(0, 3).join(', ')}".`);
      riskScore += 20;
    }

    // Subdomain deception (e.g. bca.com.xyz-login.com)
    const dotParts = hostname.split('.');
    if (dotParts.length > 3) {
      warnings.push('Struktur subdomain berlapis (terindikasi teknik kamuflase domain agar menyerupai situs resmi).');
      riskScore += 15;
    }
  }

  if (isOfficialDomain) {
    riskScore = Math.min(riskScore, 10);
  } else {
    riskScore = Math.min(Math.max(riskScore, 15), 100);
  }

  let riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (riskScore >= 80) riskLevel = 'critical';
  else if (riskScore >= 60) riskLevel = 'high';
  else if (riskScore >= 35) riskLevel = 'medium';
  else if (riskScore > 15) riskLevel = 'low';
  else riskLevel = 'safe';

  let verdict = '';
  if (isOfficialDomain) {
    verdict = 'Domain Resmi & Aman. Tautan ini terdaftar sebagai alamat resmi yang sah.';
  } else if (riskLevel === 'critical' || riskLevel === 'high') {
    verdict = 'BERBAHAYA! Terindikasi kuat sebagai situs tiruan (phishing) atau penyebaran malware. Jangan dibuka!';
  } else if (riskLevel === 'medium') {
    verdict = 'Mencurigakan. Hindari memasukkan data sensitif, nomor HP, atau informasi perbankan apapun.';
  } else {
    verdict = 'Risiko Rendah, namun tetap berhati-hati sebelum membagikan informasi pribadi.';
  }

  return {
    url: inputUrl,
    hostname,
    protocol,
    isHttps,
    riskScore,
    riskLevel,
    impersonationTarget,
    isOfficialDomain,
    warnings,
    safePoints,
    verdict,
  };
}
