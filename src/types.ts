export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export interface RedFlag {
  title: string;
  explanation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface QuickQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AnalysisResult {
  riskLevel: RiskLevel;
  riskScore: number;
  category: string;
  summary: string;
  redFlags: RedFlag[];
  scammerIntent: string;
  psychologicalTriggers: string[];
  actionRecommendations: string[];
  quickQuizQuestion?: QuickQuiz;
  extractedText?: string;
  visualClues?: string[];
  source?: string;
  provider?: 'gemini' | 'groq' | 'openrouter' | 'heuristic' | string;
  model?: string;
  analysisScope?: 'text' | 'multimodal' | 'text-only-degraded';
  imageAnalysisPerformed?: boolean;
  latencyMs?: number;
  warnings?: string[];
  note?: string;
  fallback?: boolean;
  fallbackImageMode?: boolean;
}

export interface SimulationChoice {
  text: string;
  isSafe: boolean;
  scoreChange: number;
  feedback: string;
  nextStepId: string | null;
}

export interface SimulationStep {
  id: string;
  senderMessage: string;
  timestamp: string;
  hasAttachment?: {
    type: 'apk' | 'image' | 'link' | 'document';
    name: string;
    size?: string;
  };
  choices: SimulationChoice[];
}

export interface SimulationScenario {
  id: string;
  title: string;
  platform: 'WhatsApp' | 'SMS' | 'Telegram' | 'Instagram DM';
  senderName: string;
  senderAvatar: string;
  senderSubtitle: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  category: string;
  description: string;
  initialStepId: string;
  steps: Record<string, SimulationStep>;
  educationalDebrief: {
    summary: string;
    keyTakeaway: string;
    realWorldPrevalence: string;
  };
}

export interface QuizQuestion {
  id: string;
  category: 'Pemula' | 'Menengah' | 'Mahir';
  question: string;
  scenarioSnippet?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  proTip: string;
}

export interface ScamModus {
  id: string;
  title: string;
  tag: string;
  dangerLevel: 'Kritis' | 'Tinggi' | 'Sedang';
  icon: string;
  shortDesc: string;
  howItWorks: string[];
  psychologicalTricks: string[];
  realExamples: string[];
  preventionSteps: string[];
}

export interface EmergencyContact {
  name: string;
  category: 'Pemerintah & Regulator' | 'Perbankan' | 'E-Wallet';
  phone: string;
  website: string;
  description: string;
}
