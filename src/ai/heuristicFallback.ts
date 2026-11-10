// Shared high-fidelity heuristic fallback engine for instant offline/keyless reliability

export function fallbackAnalyze(message: string, context?: string) {
  const lower = (message + ' ' + (context || '')).toLowerCase();

  const isApk =
    lower.includes('.apk') ||
    lower.includes('undangan') ||
    lower.includes('surat tilang') ||
    lower.includes('paket j&t') ||
    lower.includes('foto paket');
  const isPrize =
    lower.includes('hadiah') ||
    lower.includes('menang') ||
    lower.includes('50.000.000') ||
    lower.includes('50 juta') ||
    lower.includes('selamat! anda') ||
    lower.includes('klaim');
  const isBank =
    lower.includes('tarif transfer') ||
    lower.includes('kenaikan biaya') ||
    lower.includes('150.000') ||
    lower.includes('150rb') ||
    lower.includes('rekening anda diblokir') ||
    lower.includes('otp');
  const isJob =
    lower.includes('like video') ||
    lower.includes('subscribe') ||
    lower.includes('kerja paruh waktu') ||
    lower.includes('komisi harian') ||
    lower.includes('gaji 500rb');
  const isLinkUrgent =
    lower.includes('bit.ly') ||
    lower.includes('tinyurl') ||
    lower.includes('http://') ||
    lower.includes('segera') ||
    lower.includes('dalam 1x24 jam') ||
    lower.includes('hangus');

  let riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical' = 'low';
  let riskScore = 15;
  let category = 'Informasi Umum / Perlu Waspada';
  const redFlags: any[] = [];
  const psychologicalTriggers: string[] = [];

  if (isApk) {
    riskLevel = 'critical';
    riskScore = 98;
    category = 'Modus Penipuan File APK Jahat (Sniffing SMS / Pencuri OTP)';
    redFlags.push({
      title: 'Pengiriman Berkas APK Berbahaya',
      explanation:
        'Pesan menyamarkan berkas aplikasi berbahaya (.apk) sebagai foto kurir, surat tilang, atau undangan pernikahan. Memasang APK ini akan membajak SMS/OTP perbankan.',
      severity: 'high',
    });
    redFlags.push({
      title: 'Rekayasa Sosial Berkedok Otoritas / Urgensi',
      explanation:
        'Pelaku memanfaatkan rasa penasaran atau kepanikan korban agar langsung mengklik dan menginstal berkas tanpa curiga.',
      severity: 'high',
    });
    psychologicalTriggers.push('Rasa Penasaran & Kepanikan', 'Manipulasi Dokumen Palsu');
  } else if (isPrize) {
    riskLevel = 'high';
    riskScore = 92;
    category = 'Penipuan Undian Berhadiah / Phishing Hadiah Palsu';
    redFlags.push({
      title: 'Tawaran Hadiah Tanpa Mengikuti Undian',
      explanation: 'Menjanjikan uang tunai atau hadiah fantastis yang tidak pernah Anda ikuti atau daftarkan sebelumnya.',
      severity: 'high',
    });
    redFlags.push({
      title: 'Tautan Tidak Terverifikasi (Phishing)',
      explanation:
        'Tautan mengarahkan ke situs tiruan untuk menjebak data pribadi, nomor rekening, atau meminta biaya administrasi di awal.',
      severity: 'high',
    });
    redFlags.push({
      title: 'Tekanan Waktu Berlebihan (FOMO)',
      explanation:
        'Menggunakan kalimat "klaim sekarang juga" atau "segera" agar korban tidak sempat berpikir logis atau mengecek sumber resmi.',
      severity: 'medium',
    });
    psychologicalTriggers.push('Keserakahan (Greed)', 'Urgensi Waktu (FOMO)', 'Tautan Phishing');
  } else if (isBank) {
    riskLevel = 'critical';
    riskScore = 95;
    category = 'Phishing Perbankan & Pencurian Kredensial (Social Engineering)';
    redFlags.push({
      title: 'Meniru Institusi Perbankan Resmi',
      explanation: 'Mengatasnamakan bank besar untuk memberitahu kenaikan biaya atau pemblokiran akun secara mendadak.',
      severity: 'high',
    });
    redFlags.push({
      title: 'Pengalihan ke Tautan / Chat Tidak Resmi',
      explanation:
        'Bank resmi tidak pernah meminta konfirmasi tarif atau pembaruan data melalui link formulir gratisan atau chat WhatsApp non-centang hijau.',
      severity: 'high',
    });
    psychologicalTriggers.push('Rasa Takut Rugi Finansial', 'Peniruan Otoritas Bank Resmi');
  } else if (isJob) {
    riskLevel = 'high';
    riskScore = 88;
    category = 'Modus Lowongan Kerja Freelance Palsu (Skema Ponzi Tugas)';
    redFlags.push({
      title: 'Janji Pendapatan Tidak Masuk Akal',
      explanation: 'Hanya dengan menekan Like YouTube atau Follow toko dijanjikan ratusan ribu rupiah dalam hitungan menit.',
      severity: 'high',
    });
    redFlags.push({
      title: 'Tuntutan Deposit Uang di Tahap Berikutnya',
      explanation:
        'Setelah tugas awal diberi sedikit komisi, korban akan dipaksa menyetor uang besar (skema deposit bertingkat) yang tidak bisa ditarik kembali.',
      severity: 'high',
    });
    psychologicalTriggers.push('Iming-iming Uang Cepat Tanpa Keahlian', 'Teknik Bait-and-Switch');
  } else if (isLinkUrgent) {
    riskLevel = 'medium';
    riskScore = 65;
    category = 'Pesan Mencurigakan dengan Tautan Dipendekkan';
    redFlags.push({
      title: 'Penggunaan Shortlink Mencurigakan',
      explanation: 'Tautan yang disingkat (bit.ly/tinyurl) menyembunyikan domain tujuan yang sebenarnya.',
      severity: 'medium',
    });
    redFlags.push({
      title: 'Desakan Waktu Cepat',
      explanation: 'Meminta tindakan segera untuk membatasi waktu verifikasi korban.',
      severity: 'medium',
    });
    psychologicalTriggers.push('Tekanan Urgensi');
  } else {
    riskLevel = 'low';
    riskScore = 20;
    category = 'Pesan Umum / Risiko Rendah';
    redFlags.push({
      title: 'Tidak Ditemukan Indikator Penipuan Kritis',
      explanation:
        'Pesan tidak memuat permintaan OTP, link mencurigakan, atau iming-iming hadiah abnormal. Namun tetap jaga kewaspadaan.',
      severity: 'low',
    });
    psychologicalTriggers.push('Komunikasi Standar');
  }

  return {
    source: 'heuristic-fallback',
    riskLevel,
    riskScore,
    category,
    summary: isApk
      ? 'Pesan ini adalah modus penyebaran malware APK berbahaya. Jangan pernah mendownload atau menginstal berkas tersebut karena dapat menguras m-banking Anda!'
      : isPrize
      ? 'Pesan ini terindikasi kuat sebagai penipuan undian berhadiah palsu dengan modus phishing link untuk mencuri data pribadi atau meminta uang transfer muka.'
      : isBank
      ? 'Pesan ini adalah rekayasa sosial perbankan palsu yang bertujuan mencuri data login m-banking dan kode OTP Anda.'
      : isJob
      ? 'Pesan ini adalah penipuan freelance tugas daring (skema deposit bertingkat) yang menjanjikan keuntungan mudah.'
      : 'Pesan memiliki indikator yang perlu dicermati, hindari membagikan data rahasia seperti nomor kartu dan OTP.',
    redFlags,
    scammerIntent: isApk
      ? 'Membobol izin SMS smartphone untuk menyadap kode OTP perbankan dan menguras rekening korban.'
      : isPrize
      ? 'Memancing korban mengisi data sensitif di web phishing atau meminta transfer uang pajak hadiah fiktif.'
      : isBank
      ? 'Mencuri kredensial m-banking, nomor kartu ATM, CVV, dan kode OTP korban.'
      : 'Memperoleh keuntungan finansial ilegal dan mencuri data identitas pribadi.',
    psychologicalTriggers,
    actionRecommendations: [
      'Jangan pernah klik tautan atau mendownload berkas yang dilampirkan.',
      'Jangan pernah bagikan kode OTP, PIN, password, atau nomor CVV kepada siapapun.',
      'Blokir nomor pengirim dan laporkan pesan sebagai spam di WhatsApp/SMS.',
      'Cek keabsahan nomor atau rekening pelaku di situs resmi CekRekening.id (Kominfo).',
      'Jika ragu, hubungi kontak layanan nasabah resmi instansi terkait melalui aplikasi resmi mereka.',
    ],
    quickQuizQuestion: {
      question: isApk
        ? 'Jika menerima file berekstensi .APK dari kurir atau nomor tidak dikenal di WhatsApp, apa yang harus Anda lakukan?'
        : 'Apa tanda paling mencolok dari pesan penipuan hadiah Rp50.000.000 di atas?',
      options: isApk
        ? [
            'Segera hapus pesan, jangan buka file, dan blokir pengirim',
            'Download file untuk melihat foto resi paketnya dulu',
            'Kirim file tersebut ke grup keluarga untuk minta pendapat',
          ]
        : [
            'Menawarkan hadiah fantastis tanpa pernah mendaftar undian dan mendesak klik tautan',
            'Pesan dikirim menggunakan bahasa Indonesia yang sopan',
            'Jumlah hadiah yang diberikan terlalu sedikit',
          ],
      correctIndex: 0,
      explanation: isApk
        ? 'File APK yang dikirim via chat bukan gambar asli melainkan aplikasi pencuri SMS/OTP. Mengunduhnya berisiko membobol saldo m-banking Anda.'
        : 'Penipu selalu mengandalkan iming-iming uang besar yang tidak masuk akal disertai tautan mencurigakan dan desakan waktu agar korban gegabah.',
    },
  };
}

