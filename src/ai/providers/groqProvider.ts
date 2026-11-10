import { AIProvider, AnalysisInput, NormalizedAnalysisResult } from './types.js';
import { normalizeProviderResponse } from '../responseNormalizer.js';
import { classifyError } from '../errorClassifier.js';
import { globalCooldownManager } from '../cooldownManager.js';

export class GroqProvider implements AIProvider {
  public readonly id = 'groq';
  public readonly name = 'Groq Cloud';
  public readonly supportsText = true;
  public readonly supportsImages = false;

  private endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  public isConfigured(): boolean {
    return Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  }

  public getModels(): string[] {
    const envModels = process.env.GROQ_MODELS
      ? process.env.GROQ_MODELS.split(',').map((m) => m.trim()).filter(Boolean)
      : process.env.GROQ_TEXT_MODEL
      ? [process.env.GROQ_TEXT_MODEL.trim()]
      : [];

    // Model cascade low-latency default (prioritaskan model cepat & teruji)
    const defaultCascade = [
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-20b',
    ];

    return [...envModels, ...defaultCascade].filter((v, i, a) => a.indexOf(v) === i);
  }

  public getModel(): string {
    return this.getModels()[0] || 'qwen/qwen3.8-27b';
  }

  public async analyze(
    input: AnalysisInput,
    options?: { signal?: AbortSignal }
  ): Promise<NormalizedAnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error('CONFIGURATION_ERROR: GROQ_API_KEY belum dikonfigurasi.');
    }

    const modelsToTry = this.getModels();
    let lastError: any = null;
    const cleanMessage = input.message?.trim() || '';

    const systemInstruction = `Anda adalah mesin analisis penipuan siber (Cek Dulu) untuk masyarakat Indonesia.
Tugas Anda adalah menganalisis pesan teks, SMS, WhatsApp, atau penawaran digital untuk mendeteksi penipuan online (seperti kurir APK, phising bank, kerja paruh waktu like video, pinjol ilegal, undian palsu).

Anda WAJIB menghasilkan format JSON valid dan terstruktur tanpa teks pembuka/penutup lain.
Skema JSON yang harus Anda ikuti:
{
  "riskLevel": "safe" | "low" | "medium" | "high" | "critical",
  "riskScore": integer (0 hingga 100),
  "category": string (nama modus penipuan),
  "summary": string (ringkasan edukatif 1-2 kalimat),
  "redFlags": [
    {
      "title": string,
      "explanation": string,
      "severity": "high" | "medium" | "low"
    }
  ],
  "scammerIntent": string,
  "psychologicalTriggers": [string],
  "actionRecommendations": [string],
  "quickQuizQuestion": {
    "question": string,
    "options": [string],
    "correctIndex": integer,
    "explanation": string
  }
}`;

    let userPrompt = `Analisis pesan berikut secara objektif dan mendalam:
PESAN:
"""
${cleanMessage}
"""
`;

    if (input.context) {
      userPrompt += `
KONTEKS PENGIRIM:
"""
${input.context.trim()}
"""
`;
    }

    userPrompt += '\nKeluarkan respons dalam format JSON sesuai skema Cek Dulu.';

    for (const model of modelsToTry) {
      if (options?.signal?.aborted) {
        throw options.signal.reason || new Error(`Request Timeout: Analisis Groq dibatalkan.`);
      }

      if (globalCooldownManager.isCoolingDown(this.id, model)) {
        continue;
      }

      const startTime = Date.now();
      const payload = {
        model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      };

      try {
        const res = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: options?.signal,
        });

        const latencyMs = Date.now() - startTime;

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          let parsedErr: any = {};
          try {
            parsedErr = JSON.parse(errText);
          } catch {}

          const classified = classifyError({
            status: res.status,
            message: parsedErr.error?.message || errText,
            retryAfter: res.headers.get('retry-after'),
          });

          const cooldown = classified.retryAfterSeconds
            ? classified.retryAfterSeconds * 1000
            : classified.category === 'CONFIGURATION_ERROR'
            ? 300000 // 5 minutes for config error
            : 60000;

          globalCooldownManager.setCooldown(this.id, model, cooldown, classified.message);
          lastError = new Error(`[${classified.category}] Groq Error (${model}, HTTP ${res.status}): ${classified.message}`);
          continue;
        }

        const data: any = await res.json();
        const content = data.choices?.[0]?.message?.content || '{}';
        const hadImage = Boolean(input.image && input.image.data);

        return normalizeProviderResponse(content, input, {
          provider: this.id,
          model,
          source: `groq/${model}`,
          latencyMs,
          analysisScope: 'text',
          imageAnalysisPerformed: false,
          note: hadImage
            ? 'Analisis gambar belum berhasil dilakukan oleh Groq (text-only). Hasil saat ini hanya berdasarkan teks pesan.'
            : undefined,
        });
      } catch (netErr: any) {
        const isAbort = netErr.name === 'AbortError' || String(netErr.message || '').toLowerCase().includes('aborted');
        if (isAbort) {
          const timeoutErr = new Error(`Request Timeout (> 30s): Model ${model} melebihi batas waktu respon Groq.`);
          const classified = classifyError(timeoutErr);
          globalCooldownManager.setCooldown(this.id, model, 30000, classified.message);
          lastError = timeoutErr;
          continue;
        }
        const classified = classifyError(netErr);
        globalCooldownManager.setCooldown(this.id, model, 30000, classified.message);
        lastError = netErr;
      }
    }

    throw lastError || new Error('Tidak ada model Groq yang tersedia atau seluruh model sedang cooldown.');
  }
}

