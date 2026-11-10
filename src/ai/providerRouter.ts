import { AIProvider, AnalysisInput, NormalizedAnalysisResult, ProviderId, RouterOptions } from './providers/types.js';
import { GeminiProvider } from './providers/geminiProvider.js';
import { GroqProvider } from './providers/groqProvider.js';
import { OpenRouterProvider } from './providers/openRouterProvider.js';
import { fallbackAnalyze } from './heuristicFallback.js';
import { classifyError } from './errorClassifier.js';
import { globalCooldownManager } from './cooldownManager.js';

export class ProviderRouter {
  private providers: Map<ProviderId, AIProvider> = new Map();

  constructor(customProviders?: AIProvider[]) {
    if (customProviders && customProviders.length > 0) {
      customProviders.forEach((p) => this.providers.set(p.id, p));
    } else {
      this.providers.set('gemini', new GeminiProvider());
      this.providers.set('groq', new GroqProvider());
      this.providers.set('openrouter', new OpenRouterProvider());
    }
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: ProviderId): AIProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Task 06 Constraint: Gemini MUST NOT be used for text-only inputs.
   * Text provider order is strictly Groq -> OpenRouter.
   */
  public getTextProviderOrder(): ProviderId[] {
    const raw = process.env.AI_TEXT_PROVIDER_ORDER || 'groq,openrouter';
    return raw
      .split(',')
      .map((s) => s.trim().toLowerCase() as ProviderId)
      .filter((id) => id !== 'gemini' && this.providers.has(id));
  }

  /**
   * Multimodal/Image order: Gemini is the sole visual provider.
   */
  public getImageProviderOrder(): ProviderId[] {
    const raw = process.env.AI_IMAGE_PROVIDER_ORDER || 'gemini';
    return raw
      .split(',')
      .map((s) => s.trim().toLowerCase() as ProviderId)
      .filter((id) => this.providers.has(id) && this.providers.get(id)?.supportsImages);
  }

  public async analyzeWithProvider(
    input: AnalysisInput,
    options?: RouterOptions
  ): Promise<NormalizedAnalysisResult> {
    const timeoutMs = options?.timeoutMs || parseInt(process.env.AI_PROVIDER_TIMEOUT_MS || '30000', 10);
    const maxRetries = parseInt(process.env.AI_PROVIDER_MAX_RETRIES || '1', 10);

    const hasMessage = Boolean(input.message && input.message.trim().length > 0);
    const hasImage = Boolean(input.image && input.image.data && input.image.mimeType);

    if (!hasMessage && !hasImage) {
      throw new Error('NON_RETRYABLE_INPUT: Silakan masukkan pesan teks atau unggah gambar screenshot.');
    }

    // ── Single Provider Override (e.g. for benchmark provider-only mode) ──
    if (options?.preferredProvider) {
      if (options.preferredProvider === 'gemini' && !hasImage) {
        throw new Error(
          'NON_RETRYABLE_INPUT: Provider Gemini hanya dapat digunakan untuk input yang memiliki gambar (Task 06 constraint). Gunakan Groq atau OpenRouter untuk analisis teks.'
        );
      }
      const p = this.providers.get(options.preferredProvider);
      if (!p) {
        throw new Error(`CONFIGURATION_ERROR: Provider "${options.preferredProvider}" tidak terdaftar.`);
      }
      if (hasImage && !p.supportsImages) {
        throw new Error(`NON_RETRYABLE_INPUT: Provider "${p.name}" tidak mendukung analisis gambar multimodal.`);
      }
      return this.executeWithRetry(p, input, timeoutMs, maxRetries);
    }

    // ── 1. Multimodal Route: Input with image ─────────────────────────────
    if (hasImage) {
      console.log('[AI ROUTER] Input type: MULTIMODAL');
      const imageProviders = this.getImageProviderOrder();

      for (const providerId of imageProviders) {
        const provider = this.providers.get(providerId);
        if (!provider || !provider.isConfigured()) {
          console.warn(`[AI ROUTER] Image provider ${providerId} is not configured.`);
          continue;
        }

        if (globalCooldownManager.isCoolingDown(providerId)) {
          console.warn(`[AI ROUTER] Image provider ${providerId} is currently cooling down.`);
          continue;
        }

        try {
          console.log(`[AI ROUTER] Selected provider: ${provider.name}`);
          const result = await this.executeWithRetry(provider, input, timeoutMs, maxRetries);
          console.log(`[AI ROUTER] Analysis completed successfully by ${provider.name} (Multimodal)`);
          return result;
        } catch (err: any) {
          const classified = classifyError(err);
          console.warn(`[AI ROUTER] ${provider.name} image analysis failed: ${classified.message}`);
          if (classified.category === 'NON_RETRYABLE_INPUT') {
            throw err;
          }
        }
      }

      // If Gemini image analysis failed:
      if (hasMessage) {
        console.warn('[AI ROUTER] Accompanying text detected. Falling back to degraded text-only analysis via Groq/OpenRouter...');
        const textProviders = this.getTextProviderOrder();
        for (let i = 0; i < textProviders.length; i++) {
          const providerId = textProviders[i];
          const provider = this.providers.get(providerId);
          if (!provider || !provider.isConfigured() || globalCooldownManager.isCoolingDown(providerId)) {
            continue;
          }

          try {
            console.log(`[AI ROUTER] Degraded text fallback selected provider: ${provider.name}`);
            const textOnlyInput: AnalysisInput = {
              message: input.message,
              context: input.context,
            };
            const result = await this.executeWithRetry(provider, textOnlyInput, timeoutMs, maxRetries);
            console.log(`[AI ROUTER] Degraded text analysis completed by ${provider.name}`);
            const warningMsg = 'Analisis gambar gagal dilakukan. Hasil saat ini hanya berdasarkan teks pendamping, bukan isi gambar.';
            return {
              ...result,
              analysisScope: 'text-only-degraded',
              imageAnalysisPerformed: false,
              warnings: [warningMsg],
              note: warningMsg,
            };
          } catch (err: any) {
            const nextProviderId = textProviders[i + 1];
            console.warn(`[AI ROUTER] Degraded text provider ${provider.name} failed:`, err.message);
            if (nextProviderId) {
              const nextProvider = this.providers.get(nextProviderId);
              console.warn(`[AI ROUTER] Switching to ${nextProvider?.name || nextProviderId}`);
            }
          }
        }
      } else {
        // Image-only and Gemini failed -> Inconclusive degraded response (Never call text providers)
        console.warn('[AI ROUTER] Image-only input and Gemini failed. No text available. Returning inconclusive degraded response.');
        return this.executeInconclusiveImageResponse();
      }

      // Final fallback for image + text if all AI failed:
      console.warn('[AI ROUTER] Switching to Heuristic Fallback for degraded text analysis');
      return this.executeDegradedHeuristic(input, hasMessage, hasImage);
    }

    // ── 2. Text-only Route: Gemini is strictly prohibited ─────────────────
    console.log('[AI ROUTER] Input type: TEXT');
    const textProviders = this.getTextProviderOrder();

    for (let i = 0; i < textProviders.length; i++) {
      const providerId = textProviders[i];
      const provider = this.providers.get(providerId);
      if (!provider || !provider.isConfigured()) {
        continue;
      }

      if (globalCooldownManager.isCoolingDown(providerId)) {
        continue;
      }

      try {
        console.log(`[AI ROUTER] Selected provider: ${provider.name}`);
        const result = await this.executeWithRetry(provider, input, timeoutMs, maxRetries);
        console.log(`[AI ROUTER] Analysis completed successfully by ${provider.name}`);
        return {
          ...result,
          analysisScope: 'text',
          imageAnalysisPerformed: false,
        };
      } catch (err: any) {
        const classified = classifyError(err);
        console.warn(`[AI ROUTER] ${provider.name} failed (${classified.category}): ${classified.message}`);

        if (classified.category === 'NON_RETRYABLE_INPUT') {
          throw err;
        }

        const nextProviderId = textProviders[i + 1];
        if (nextProviderId) {
          const nextProvider = this.providers.get(nextProviderId);
          console.warn(`[AI ROUTER] Switching to ${nextProvider?.name || nextProviderId}`);
        } else {
          console.warn('[AI ROUTER] Switching to Heuristic Fallback');
        }
      }
    }

    // ── 3. Final Fallback: Local Heuristic Engine ──────────────────────────
    console.warn('[AI ROUTER] All text AI providers exhausted or unavailable. Using Heuristic Fallback.');
    return this.executeDegradedHeuristic(input, hasMessage, false);
  }

  private async executeWithRetry(
    provider: AIProvider,
    input: AnalysisInput,
    timeoutMs: number,
    maxRetries: number
  ): Promise<NormalizedAnalysisResult> {
    let attempt = 0;
    let lastError: any = null;

    while (attempt <= maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const result = await provider.analyze(input, { signal: controller.signal });
        clearTimeout(timeoutId);
        return result;
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;
        const classified = classifyError(err);

        if (classified.category === 'NON_RETRYABLE_INPUT' || classified.category === 'CONFIGURATION_ERROR') {
          throw err;
        }

        attempt++;
        if (attempt <= maxRetries) {
          const backoff = classified.retryAfterSeconds ? classified.retryAfterSeconds * 1000 : attempt * 1500;
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
    }

    throw lastError || new Error(`Provider ${provider.name} failed after retries.`);
  }

  private executeInconclusiveImageResponse(): NormalizedAnalysisResult {
    const warningMsg = 'Analisis gambar gagal dilakukan. Tidak ada teks pendamping untuk dianalisis.';
    return {
      riskLevel: 'medium',
      riskScore: 50,
      category: 'Analisis Visual Tertunda',
      summary: 'Tangkapan layar belum berhasil dianalisis oleh AI. Harap ketikkan teks pesan secara manual untuk verifikasi akurat.',
      redFlags: [],
      scammerIntent: 'Belum dapat dipastikan dari gambar saja',
      psychologicalTriggers: [],
      actionRecommendations: [
        'Ketikkan isi teks pesan secara manual ke ScamAware AI',
        'Jangan mengklik tautan atau menginstal berkas sebelum diverifikasi',
        'Pastikan gambar memiliki resolusi jelas dan format standar (PNG/JPEG)',
      ],
      extractedText: '',
      visualClues: ['Analisis visual AI tidak tersedia saat ini.'],
      provider: 'heuristic',
      model: 'heuristic-inconclusive',
      source: 'heuristic-fallback',
      latencyMs: 0,
      analysisScope: 'text-only-degraded',
      imageAnalysisPerformed: false,
      warnings: [warningMsg],
      note: warningMsg,
    };
  }

  private executeDegradedHeuristic(
    input: AnalysisInput,
    hasMessage: boolean,
    hasImage: boolean
  ): NormalizedAnalysisResult {
    const startTime = Date.now();
    const cleanMessage = hasMessage ? input.message!.trim() : '';

    const fallbackResult = fallbackAnalyze(
      cleanMessage || 'Screenshot lampiran gambar penipuan mencurigakan',
      input.context
    );

    let summary = fallbackResult.summary;
    let riskLevel = fallbackResult.riskLevel;
    let riskScore = fallbackResult.riskScore;
    let note = 'Dianalisis menggunakan sistem deteksi pola lokal ScamAware.';
    let warnings: string[] | undefined = undefined;

    if (hasImage) {
      note = 'Analisis gambar gagal dilakukan. Hasil saat ini hanya berdasarkan deteksi pola teks darurat.';
      warnings = [note];
      if (!hasMessage) {
        summary = 'Tangkapan layar belum berhasil diekstrak oleh AI. Harap ketikkan teks pesan secara manual untuk verifikasi akurat.';
        riskLevel = 'medium';
        riskScore = 50;
      }
    }

    return {
      ...fallbackResult,
      riskLevel,
      riskScore,
      summary,
      provider: 'heuristic',
      model: 'heuristic-rule-engine',
      source: 'heuristic-fallback',
      latencyMs: Date.now() - startTime,
      analysisScope: hasImage ? 'text-only-degraded' : 'text',
      imageAnalysisPerformed: false,
      extractedText: cleanMessage || (hasImage ? 'Gagal membaca gambar secara otomatis. Mohon ketikkan teks pesan.' : ''),
      visualClues: hasImage ? ['Gambar screenshot diterima namun analisis visual AI belum tersedia'] : [],
      warnings,
      note,
    };
  }
}

export const defaultRouter = new ProviderRouter();
export async function analyzeWithProvider(
  input: AnalysisInput,
  options?: RouterOptions
): Promise<NormalizedAnalysisResult> {
  return defaultRouter.analyzeWithProvider(input, options);
}
