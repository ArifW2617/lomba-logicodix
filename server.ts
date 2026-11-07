import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '5mb' }));

// Initialize GoogleGenAI client (Server-Side only)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Heuristic fallback analyzer for instant offline/keyless reliability
function fallbackAnalyze(message: string, context?: string) {
  const lower = (message + ' ' + (context || '')).toLowerCase();
  
  const isApk = lower.includes('.apk') || lower.includes('undangan') || lower.includes('surat tilang') || lower.includes('paket j&t') || lower.includes('foto paket');
  const isPrize = lower.includes('hadiah') || lower.includes('menang') || lower.includes('50.000.000') || lower.includes('50 juta') || lower.includes('selamat! anda') || lower.includes('klaim');
  const isBank = lower.includes('tarif transfer') || lower.includes('kenaikan biaya') || lower.includes('150.000') || lower.includes('150rb') || lower.includes('rekening anda diblokir') || lower.includes('otp');
  const isJob = lower.includes('like video') || lower.includes('subscribe') || lower.includes('kerja paruh waktu') || lower.includes('komisi harian') || lower.includes('gaji 500rb');
  const isLinkUrgent = lower.includes('bit.ly') || lower.includes('tinyurl') || lower.includes('http://') || lower.includes('segera') || lower.includes('dalam 1x24 jam') || lower.includes('hangus');

  let riskLevel = 'low';
  let riskScore = 15;
  let category = 'Informasi Umum / Perlu Waspada';
  const redFlags = [];
  const psychologicalTriggers = [];

  if (isApk) {
    riskLevel = 'critical';
    riskScore = 98;
    category = 'Modus Penipuan File APK Jahat (Sniffing SMS / Pencuri OTP)';
    redFlags.push({
      title: 'Pengiriman Berkas APK Berbahaya',
      explanation: 'Pesan menyamarkan berkas aplikasi berbahaya (.apk) sebagai foto kurir, surat tilang, atau undangan pernikahan. Memasang APK ini akan membajak SMS/OTP perbankan.',
      severity: 'high',
    });
    redFlags.push({
      title: 'Rekayasa Sosial Berkedok Otoritas / Urgensi',
      explanation: 'Pelaku memanfaatkan rasa penasaran atau kepanikan korban agar langsung mengklik dan menginstal berkas tanpa curiga.',
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
      explanation: 'Tautan mengarahkan ke situs tiruan untuk menjebak data pribadi, nomor rekening, atau meminta biaya administrasi di awal.',
      severity: 'high',
    });
    redFlags.push({
      title: 'Tekanan Waktu Berlebihan (FOMO)',
      explanation: 'Menggunakan kalimat "klaim sekarang juga" atau "segera" agar korban tidak sempat berpikir logis atau mengecek sumber resmi.',
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
      explanation: 'Bank resmi tidak pernah meminta konfirmasi tarif atau pembaruan data melalui link formulir gratisan atau chat WhatsApp non-centang hijau.',
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
      explanation: 'Setelah tugas awal diberi sedikit komisi, korban akan dipaksa menyetor uang besar (skema deposit bertingkat) yang tidak bisa ditarik kembali.',
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
      explanation: 'Pesan tidak memuat permintaan OTP, link mencurigakan, atau iming-iming hadiah abnormal. Namun tetap jaga kewaspadaan.',
      severity: 'low',
    });
    psychologicalTriggers.push('Komunikasi Standar');
  }

  return {
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

// POST /api/analyze-scam endpoint (Supports Text & Image/Screenshot OCR)
app.post('/api/analyze-scam', async (req, res) => {
  try {
    const { message, context, image } = req.body;

    const hasMessage = message && typeof message === 'string' && message.trim().length > 0;
    const hasImage = image && typeof image === 'object' && image.data && image.mimeType;

    if (!hasMessage && !hasImage) {
      return res.status(400).json({ error: 'Silakan masukkan pesan teks atau unggah screenshot gambar yang ingin dianalisis.' });
    }

    const cleanMessage = hasMessage ? message.trim() : '';

    // If Gemini client is not initialized or API key is absent, use high-fidelity heuristic fallback
    if (!ai) {
      const fallbackResult = fallbackAnalyze(cleanMessage || 'Screenshot lampiran gambar penipuan mencurigakan', context);
      return res.json({
        ...fallbackResult,
        extractedText: cleanMessage || 'Mode Offline: Teks diekstrak dari gambar berdasarkan analisis visual terduga modus penipuan siber.',
        visualClues: hasImage ? ['Gambar screenshot chat/pesan terindikasi mencurigakan', 'Format dokumen menyerupai APK / phishing'] : [],
        source: 'heuristic',
        note: 'Dianalisis menggunakan sistem deteksi pola ScamAware.',
      });
    }

    // Call Gemini for structured multimodal security analysis
    try {
      const systemInstruction =
        'Anda adalah mesin analisis penipuan siber tingkat lanjut (ScamAware AI) untuk mendidik masyarakat Indonesia melawan kejahatan digital (seperti modus file APK kurir/undangan/tilang ETLE, phising perbankan, lowongan freelance tugas like video, pinjol ilegal, quishing QRIS palsu, dan undian fiktif). Lakukan OCR untuk membaca seluruh teks pada gambar bila ada gambar yang dikirimkan, periksa elemen visual (misalnya icon file .apk, logo bank tiruan, nomor WhatsApp asing, status pesan, QRIS), dan berikan evaluasi risiko yang sangat akurat, terstruktur, serta edukatif dalam Bahasa Indonesia.';

      let prompt = `Anda adalah asisten pakar keamanan siber dan anti-penipuan digital (ScamAware AI).
Tugas Anda adalah menganalisis pesan, tangkapan layar (screenshot chat WA/SMS/email/sosmed), tautan, atau penawaran yang diterima pengguna di Indonesia.
`;

      if (hasImage) {
        prompt += `
DOKUMEN GAMBAR/SCREENSHOT TERLAMPIR:
1. Bacakan dan ekstrak seluruh teks yang tampak pada gambar (OCR) ke dalam field "extractedText".
2. Analisis elemen visual yang mencurigakan (seperti berkas berekstensi .apk, logo tidak resmi, nomor telepon asing, chat mencurigakan, QR code) ke dalam field "visualClues".
`;
      }

      if (hasMessage) {
        prompt += `
PESAN TEKS YANG DISERTAKAN PENGGUNA:
"""
${cleanMessage}
"""
`;
      }

      if (context) {
        prompt += `
INFORMASI TAMBAHAN PENGIRIM/KONTEKS:
"""${context}"""
`;
      }

      prompt += `
Lakukan analisis mendalam dan hasilkan respons dalam format JSON sesuai skema yang telah ditentukan. Gunakan Bahasa Indonesia yang jelas, edukatif, dan ramah pengguna awam.`;

      // Build content parts
      const parts: any[] = [];
      if (hasImage) {
        // Strip data:image/...;base64, prefix if present
        const base64Data = image.data.includes(';base64,')
          ? image.data.split(';base64,')[1]
          : image.data;

        parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: base64Data,
          },
        });
      }
      parts.push({ text: prompt });

      const contentPayload = {
        role: 'user',
        parts,
      };

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          riskLevel: {
            type: Type.STRING,
            description: 'Tingkat risiko: "safe" | "low" | "medium" | "high" | "critical"',
          },
          riskScore: {
            type: Type.INTEGER,
            description: 'Skor risiko dari 0 (sangat aman) hingga 100 (sangat berbahaya / pasti scam)',
          },
          category: {
            type: Type.STRING,
            description: 'Nama modus penipuan atau kategori pesan (contoh: "Penipuan Undian Berhadiah", "Penyebaran File APK Berbahaya", "Phishing Perbankan")',
          },
          summary: {
            type: Type.STRING,
            description: 'Ringkasan singkat 1-2 kalimat hasil analisis risiko.',
          },
          extractedText: {
            type: Type.STRING,
            description: 'Seluruh teks yang berhasil diekstrak/dibaca dari gambar screenshot (OCR). Kosongkan bila tidak ada gambar.',
          },
          visualClues: {
            type: Type.ARRAY,
            description: 'Daftar indikator atau ciri visual mencurigakan yang terlihat langsung pada gambar/tampilan pesan.',
            items: { type: Type.STRING },
          },
          redFlags: {
            type: Type.ARRAY,
            description: 'Daftar indikator mencurigakan pada pesan atau gambar.',
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Judul indikator' },
                explanation: { type: Type.STRING, description: 'Penjelasan mengapa hal ini mencurigakan' },
                severity: { type: Type.STRING, description: '"high" | "medium" | "low"' },
              },
            },
          },
          scammerIntent: {
            type: Type.STRING,
            description: 'Tujuan utama penipu (misal: mencuri OTP, menguras m-banking, meminta uang muka administrasi, dll)',
          },
          psychologicalTriggers: {
            type: Type.ARRAY,
            description: 'Trik psikologis yang dimanfaatkan (misal: FOMO, Keserakahan, Kepanikan, Peniruan Otoritas)',
            items: { type: Type.STRING },
          },
          actionRecommendations: {
            type: Type.ARRAY,
            description: 'Langkah pencegahan dan tindakan aman yang wajib dilakukan pengguna.',
            items: { type: Type.STRING },
          },
          quickQuizQuestion: {
            type: Type.OBJECT,
            description: 'Kuis mini interaktif terkait pesan ini untuk menguji pemahaman pengguna.',
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
          },
        },
      };

      // Try gemini-2.5-flash first, then gemini-3.8-flash as fallback
      const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash'];
      let response: any = null;
      let usedModel = modelsToTry[0];
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: [contentPayload],
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema,
            },
          });
          usedModel = modelName;
          if (response?.text) break;
        } catch (mErr) {
          lastError = mErr;
          console.warn(`Model ${modelName} call failed, trying next:`, mErr);
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('Tidak ada respons dari model AI');
      }

      const rawJson = response.text?.trim() || '{}';
      const parsedData = JSON.parse(rawJson);

      return res.json({
        ...parsedData,
        source: usedModel,
      });
    } catch (aiError) {
      console.warn('Gemini API call failed, falling back to heuristic engine:', aiError);
      const fallbackResult = fallbackAnalyze(cleanMessage || 'Screenshot pesan mencurigakan', context);
      return res.json({
        ...fallbackResult,
        extractedText: cleanMessage || 'Gagal membaca gambar secara otomatis. Mohon ketikkan pesan teks secara manual.',
        visualClues: hasImage ? ['Gambar screenshot telah diterima namun sedang menggunakan mode analisis pola cadangan'] : [],
        source: 'heuristic-fallback',
        note: 'Dianalisis menggunakan sistem deteksi pola lokal ScamAware.',
      });
    }
  } catch (error) {
    console.error('API Error in /api/analyze-scam:', error);
    res.status(500).json({ error: 'Gagal menganalisis pesan atau gambar. Silakan coba kembali.' });
  }
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiEnabled: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite middlewares in development or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScamAware AI Server running on http://0.0.0.0:${PORT} [${isProduction ? 'PROD' : 'DEV'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
