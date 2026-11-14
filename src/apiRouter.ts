import express from 'express';
import { analyzeWithProvider, defaultRouter } from './ai/providerRouter.js';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '5mb' }));

apiRouter.post('/analyze-scam', async (req, res) => {
  try {
    const { message, context, image, preferredProvider } = req.body;

    const hasMessage = message && typeof message === 'string' && message.trim().length > 0;
    const hasImage = image && typeof image === 'object' && image.data && image.mimeType;

    if (!hasMessage && !hasImage) {
      return res.status(400).json({
        error: 'Silakan masukkan pesan teks atau unggah screenshot gambar yang ingin dianalisis.',
      });
    }

    const result = await analyzeWithProvider(
      { message, context, image },
      preferredProvider ? { preferredProvider } : undefined
    );

    return res.json(result);
  } catch (error: unknown) {
    console.error('API Error in /api/analyze-scam:', error);
    const message = error instanceof Error
      ? error.message
      : 'Gagal menganalisis pesan atau gambar. Silakan coba kembali.';
    res.status(500).json({ error: message });
  }
});

apiRouter.get('/health', (_req, res) => {
  const geminiActive = defaultRouter.getProvider('gemini')?.isConfigured() || false;
  const groqActive = defaultRouter.getProvider('groq')?.isConfigured() || false;
  const openrouterActive = defaultRouter.getProvider('openrouter')?.isConfigured() || false;

  res.json({
    status: 'ok',
    aiEnabled: geminiActive || groqActive || openrouterActive,
    providers: {
      gemini: geminiActive,
      groq: groqActive,
      openrouter: openrouterActive,
    },
    timestamp: new Date().toISOString(),
  });
});
