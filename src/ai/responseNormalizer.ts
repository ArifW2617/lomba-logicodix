import { AnalysisInput, NormalizedAnalysisResult, ProviderId } from './providers/types.js';
import { validateAnalysisOutput } from './responseValidator.js';

export function normalizeProviderResponse(
  rawInput: any,
  input: AnalysisInput,
  metadata: {
    provider: ProviderId;
    model: string;
    source?: string;
    latencyMs: number;
    analysisScope?: 'text' | 'multimodal';
    imageAnalysisPerformed?: boolean;
    note?: string;
  }
): NormalizedAnalysisResult {
  let parsedObject: any = rawInput;

  // 1. If string, extract JSON object (handling code blocks or prose)
  if (typeof rawInput === 'string') {
    let cleanStr = rawInput.trim();
    if (cleanStr.startsWith('```')) {
      const match = cleanStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) cleanStr = match[1].trim();
    }
    // Also try to find first { and last }
    const firstBrace = cleanStr.indexOf('{');
    const lastBrace = cleanStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanStr = cleanStr.substring(firstBrace, lastBrace + 1);
    }

    try {
      parsedObject = JSON.parse(cleanStr);
    } catch (parseErr: any) {
      throw new Error(`INVALID_OUTPUT: Gagal mem-parse JSON dari provider ${metadata.provider}: ${parseErr.message}`);
    }
  }

  // 2. Validate against ScamAware schema
  const validation = validateAnalysisOutput(parsedObject);
  if (!validation.valid) {
    throw new Error(`INVALID_OUTPUT: Validasi schema gagal untuk ${metadata.provider}: ${validation.errors.join('; ')}`);
  }

  const sanitized = validation.sanitized;
  const hadImage = Boolean(input.image && input.image.data);
  const imageAnalyzed = metadata.imageAnalysisPerformed ?? (hadImage && metadata.provider === 'gemini');

  // Determine analysisScope
  const scope: 'text' | 'multimodal' = hadImage && imageAnalyzed ? 'multimodal' : 'text';

  // Determine note: if user uploaded an image, but provider could not analyze visual elements
  let finalNote = metadata.note || sanitized.note || '';
  if (hadImage && !imageAnalyzed) {
    const degradedWarning = 'Analisis gambar belum berhasil dilakukan. Hasil saat ini hanya berdasarkan teks yang tersedia.';
    finalNote = finalNote ? `${finalNote}. ${degradedWarning}` : degradedWarning;
  }

  return {
    ...sanitized,
    provider: metadata.provider,
    model: metadata.model,
    source: metadata.source || metadata.model || metadata.provider,
    latencyMs: metadata.latencyMs,
    analysisScope: scope,
    imageAnalysisPerformed: imageAnalyzed,
    note: finalNote || undefined,
  };
}

