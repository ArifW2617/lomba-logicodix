import { RiskLevel } from '../types.js';

const VALID_RISK_LEVELS: Set<string> = new Set(['safe', 'low', 'medium', 'high', 'critical']);
const VALID_SEVERITIES: Set<string> = new Set(['high', 'medium', 'low']);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: any;
}

export function validateAnalysisOutput(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Output is not a valid JSON object'] };
  }

  // 1. riskLevel validation
  let riskLevel = String(data.riskLevel || '').toLowerCase().trim();
  // Map common Indonesian equivalents if returned
  if (riskLevel === 'kritis') riskLevel = 'critical';
  if (riskLevel === 'tinggi') riskLevel = 'high';
  if (riskLevel === 'sedang') riskLevel = 'medium';
  if (riskLevel === 'rendah') riskLevel = 'low';
  if (riskLevel === 'aman') riskLevel = 'safe';

  if (!VALID_RISK_LEVELS.has(riskLevel)) {
    errors.push(`Invalid riskLevel: "${data.riskLevel}". Must be one of: safe, low, medium, high, critical.`);
  }

  // 2. riskScore validation
  let riskScore = typeof data.riskScore === 'number' ? data.riskScore : parseInt(String(data.riskScore), 10);
  if (isNaN(riskScore) || riskScore < 0 || riskScore > 100) {
    errors.push(`Invalid riskScore: "${data.riskScore}". Must be an integer between 0 and 100.`);
  } else {
    riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
  }

  // 3. category validation
  const category = typeof data.category === 'string' ? data.category.trim() : '';
  if (!category) {
    errors.push('Field "category" is required and cannot be empty.');
  }

  // 4. summary validation
  const summary = typeof data.summary === 'string' ? data.summary.trim() : '';
  if (!summary) {
    errors.push('Field "summary" is required and cannot be empty.');
  }

  // 5. redFlags validation
  const rawRedFlags = Array.isArray(data.redFlags) ? data.redFlags : [];
  const sanitizedRedFlags = rawRedFlags.map((rf: any) => {
    let severity = String(rf.severity || 'medium').toLowerCase();
    if (!VALID_SEVERITIES.has(severity)) severity = 'medium';
    return {
      title: String(rf.title || 'Indikator Mencurigakan').trim(),
      explanation: String(rf.explanation || '').trim(),
      severity: severity as 'high' | 'medium' | 'low',
    };
  });

  // 6. actionRecommendations
  const rawRecs = Array.isArray(data.actionRecommendations) ? data.actionRecommendations : [];
  const sanitizedRecs = rawRecs.map((r: any) => String(r).trim()).filter(Boolean);

  // 7. scammerIntent & psychologicalTriggers
  const scammerIntent = typeof data.scammerIntent === 'string' ? data.scammerIntent.trim() : '';
  const psychologicalTriggers = Array.isArray(data.psychologicalTriggers)
    ? data.psychologicalTriggers.map((t: any) => String(t).trim()).filter(Boolean)
    : [];

  // 8. quickQuizQuestion
  let quickQuizQuestion = undefined;
  if (data.quickQuizQuestion && typeof data.quickQuizQuestion === 'object') {
    const q = data.quickQuizQuestion;
    if (q.question && Array.isArray(q.options) && typeof q.correctIndex === 'number') {
      quickQuizQuestion = {
        question: String(q.question).trim(),
        options: q.options.map((o: any) => String(o).trim()),
        correctIndex: Math.max(0, Math.min(q.options.length - 1, q.correctIndex)),
        explanation: String(q.explanation || '').trim(),
      };
    }
  }

  // 9. visual & extracted fields
  const extractedText = typeof data.extractedText === 'string' ? data.extractedText.trim() : '';
  const visualClues = Array.isArray(data.visualClues)
    ? data.visualClues.map((v: any) => String(v).trim()).filter(Boolean)
    : [];

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    sanitized: {
      riskLevel: riskLevel as RiskLevel,
      riskScore,
      category,
      summary,
      redFlags: sanitizedRedFlags,
      scammerIntent,
      psychologicalTriggers,
      actionRecommendations: sanitizedRecs,
      quickQuizQuestion,
      extractedText,
      visualClues,
    },
  };
}

