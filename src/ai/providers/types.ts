import { AnalysisResult, RiskLevel } from '../../types.js';

export interface AnalysisInput {
  message?: string;
  context?: string;
  image?: {
    mimeType: string;
    data: string; // base64 string or data uri
  };
}

export type ProviderId = 'gemini' | 'groq' | 'openrouter' | 'heuristic';

export interface ProviderMetadata {
  provider: ProviderId;
  model: string;
  source: 'ai-provider' | 'heuristic-fallback';
  latencyMs: number;
  analysisScope: 'text' | 'multimodal' | 'text-only-degraded';
  imageAnalysisPerformed: boolean;
  degradedMode?: boolean;
  warnings?: string[];
}

export interface NormalizedAnalysisResult extends AnalysisResult {
  provider: ProviderId;
  model: string;
  source: string; // retains original model name or fallback tag for backward compatibility
  latencyMs: number;
  analysisScope: 'text' | 'multimodal' | 'text-only-degraded';
  imageAnalysisPerformed: boolean;
  warnings?: string[];
  note?: string;
}

export interface AIProvider {
  id: ProviderId;
  name: string;
  supportsText: boolean;
  supportsImages: boolean;

  isConfigured(): boolean;
  analyze(input: AnalysisInput, options?: { signal?: AbortSignal }): Promise<NormalizedAnalysisResult>;
}

export interface RouterOptions {
  preferredProvider?: ProviderId;
  allowFallback?: boolean;
  timeoutMs?: number;
}

