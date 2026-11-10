import { GoogleGenAI, Type } from '@google/genai';
import { AIProvider, AnalysisInput, NormalizedAnalysisResult } from './types.js';
import { normalizeProviderResponse } from '../responseNormalizer.js';
import { classifyError } from '../errorClassifier.js';
import { globalCooldownManager } from '../cooldownManager.js';

export class GeminiProvider implements AIProvider {
  public readonly id = 'gemini';
  public readonly name = 'Google Gemini';
  public readonly supportsText = true;
  public readonly supportsImages = true;

  private client: GoogleGenAI | null = null;
  private apiKey: string = '';

  private getClient(): GoogleGenAI {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    if (!key) {
      throw new Error('CONFIGURATION_ERROR: GEMINI_API_KEY belum dikonfigurasi.');
    }
    if (!this.client || this.apiKey !== key) {
      this.apiKey = key;
      this.client = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.client;
  }

  public isConfigured(): boolean {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    return Boolean(key && key.length > 0);
  }

  public getModels(): string[] {
    const envModels = process.env.GEMINI_IMAGE_MODEL
      ? [process.env.GEMINI_IMAGE_MODEL.trim()]
      : process.env.GEMINI_MODELS
      ? process.env.GEMINI_MODELS.split(',').map((m) => m.trim()).filter(Boolean)
      : process.env.GEMINI_MODEL
      ? [process.env.GEMINI_MODEL.trim()]
      : [];

    const defaultCascade = [
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3-flash-preview',
    ];

    return [...envModels, ...defaultCascade].filter((v, i, a) => a.indexOf(v) === i);
  }

  public async analyze(
    input: AnalysisInput,
    options?: { signal?: AbortSignal }
  ): Promise<NormalizedAnalysisResult> {
    const hasImage = Boolean(input.image && input.image.data && input.image.mimeType);

    if (!hasImage) {
      throw new Error(
        'NON_RETRYABLE_INPUT: Google Gemini hanya digunakan untuk analisis yang mengandung gambar (Task 06 rule). Gunakan Groq atau OpenRouter untuk input teks saja.'
      );
    }

    const client = this.getClient();

    const startTime = Date.now();
    const hasMessage = Boolean(input.message && input.message.trim().length > 0);
    const cleanMessage = hasMessage ? input.message!.trim() : '';

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

    if (input.context) {
      prompt += `
INFORMASI TAMBAHAN PENGIRIM/KONTEKS:
"""${input.context.trim()}"""
`;
    }

    prompt += `
Lakukan analisis mendalam dan hasilkan respons dalam format JSON sesuai skema yang telah ditentukan. Gunakan Bahasa Indonesia yang jelas, edukatif, dan ramah pengguna awam.`;

    const parts: any[] = [];
    if (hasImage && input.image) {
      const base64Data = input.image.data.includes(';base64,')
        ? input.image.data.split(';base64,')[1]
        : input.image.data;

      parts.push({
        inlineData: {
          mimeType: input.image.mimeType,
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
          description: 'Nama modus penipuan atau kategori pesan',
        },
        summary: {
          type: Type.STRING,
          description: 'Ringkasan singkat 1-2 kalimat hasil analisis risiko.',
        },
        extractedText: {
          type: Type.STRING,
          description: 'Seluruh teks yang berhasil diekstrak/dibaca dari gambar screenshot (OCR).',
        },
        visualClues: {
          type: Type.ARRAY,
          description: 'Daftar indikator atau ciri visual mencurigakan yang terlihat.',
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
          description: 'Tujuan utama penipu',
        },
        psychologicalTriggers: {
          type: Type.ARRAY,
          description: 'Trik psikologis yang dimanfaatkan',
          items: { type: Type.STRING },
        },
        actionRecommendations: {
          type: Type.ARRAY,
          description: 'Langkah pencegahan dan tindakan aman.',
          items: { type: Type.STRING },
        },
        quickQuizQuestion: {
          type: Type.OBJECT,
          description: 'Kuis mini interaktif',
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

    const modelsToTry = this.getModels();
    let response: any = null;
    let usedModel = modelsToTry[0];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      if (globalCooldownManager.isCoolingDown(this.id, modelName)) {
        continue;
      }

      try {
        response = await client.models.generateContent({
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
      } catch (err: any) {
        lastError = err;
        const classified = classifyError(err);
        const cooldownMs = classified.retryAfterSeconds
          ? classified.retryAfterSeconds * 1000
          : classified.isDailyQuotaExhausted
          ? 3600000 // 1 hour for daily quota exhausted
          : 60000;

        globalCooldownManager.setCooldown(this.id, modelName, cooldownMs, classified.message);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('Tidak ada respons dari model Gemini');
    }

    const latencyMs = Date.now() - startTime;
    return normalizeProviderResponse(response.text, input, {
      provider: this.id,
      model: usedModel,
      source: usedModel,
      latencyMs,
      analysisScope: hasImage ? 'multimodal' : 'text',
      imageAnalysisPerformed: hasImage,
    });
  }
}

