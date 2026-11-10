# ScamAware AI — Smart & Fun Anti-Scam Platform

Aplikasi edukasi dan analisis ancaman penipuan digital interaktif berbasis Multi-Provider AI untuk masyarakat Indonesia.

---

## 🚀 Fitur Utama

1. **AI Scam Scanner:**
   - **Teks:** Dianalisis secara instan menggunakan **Groq Cloud** (kecepatan tinggi ~1.5 - 2s).
   - **Gambar / Screenshot:** Dianalisis multimodal visual oleh **Google Gemini** (ekstraksi OCR teks gambar + deteksi visual).
   - **Multi-Provider Failover:** Jika provider utama gangguan/limit, sistem otomatis berpindah ke **OpenRouter** lalu **Heuristic Rule Engine**.
2. **Chat Simulator:** Simulasi interaktif 6 skenario penipuan nyata (Kurir APK, Phishing Bank, Pinjol Ilegal, Love Scam, Rekber Tiruan, Undian Palsu).
3. **Interactive Quiz:** 14 studi kasus nyata dengan 3 tingkat kesulitan dan skor gamifikasi XP.
4. **Education Encyclopedia:** Ensiklopedia modus kejahatan siber lengkap dengan tips pencegahan.
5. **First Aid Protocol:** Panduan darurat langkah demi langkah jika terlanjur menjadi korban penipuan.
6. **URL Inspector:** Pemeriksa reputasi link dan domain mencurigakan berbasis heuristik.

---

## 🛠️ Arsitektur Multi-Provider AI (Task 06)

| Jenis Input | Provider Utama | Provider Cadangan | Fallback Terakhir |
|---|---|---|---|
| **Teks saja** | **Groq Cloud** | **OpenRouter** | **Heuristic Engine** |
| **Gambar + Teks** | **Google Gemini** | **Groq (Degraded)** | **Heuristic Engine** |
| **Gambar saja** | **Google Gemini** | Inconclusive Response | Tidak memanggil Text AI |

---

## 💻 Cara Menjalankan

### 1. Prasyarat
- Node.js 20+
- Salin berkas konfigurasi:
  ```bash
  cp .env.example .env
  ```
- Masukkan API key di `.env` (minimal salah satu: Gemini, Groq, atau OpenRouter).

### 2. Instalasi & Menjalankan Dev Server
```bash
npm install
npm run dev
```
Akses di browser: `http://localhost:3000`

### 3. Pengujian Otomatis
```bash
# Jalankan suite 15 unit test multi-provider
npx tsx tests/unit/providerFailover.test.ts

# Jalankan benchmark provider tertentu
$env:BENCHMARK_MODE="provider-only"; $env:BENCHMARK_PROVIDER="groq"; npx tsx tests/benchmark/runner.ts
$env:BENCHMARK_MODE="provider-only"; $env:BENCHMARK_PROVIDER="gemini-image"; npx tsx tests/benchmark/runner.ts
```
