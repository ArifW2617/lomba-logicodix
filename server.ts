import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { analyzeWithProvider, defaultRouter } from './src/ai/providerRouter.js';
import { fallbackAnalyze } from './src/ai/heuristicFallback.js';

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

// POST /api/analyze-scam endpoint (Multi-Provider AI with Heuristic Fallback)
app.post('/api/analyze-scam', async (req, res) => {
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
  } catch (error: any) {
    console.error('API Error in /api/analyze-scam:', error);
    res.status(500).json({ error: error.message || 'Gagal menganalisis pesan atau gambar. Silakan coba kembali.' });
  }
});

// GET /api/health
app.get('/api/health', (req, res) => {
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
