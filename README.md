# MB Dashboard — Yagona Panel

Toshkent viloyati Bosh boshqarmasi uchun yagona dashboard tizimi.

**Live:** https://yagona-panel.vercel.app

## Tarkib

- **4 yo'nalish, 11 bo'lim, 16+ dashboard**
- J.X.Fayzullaxo'jayev — Scoring, Sirli mijoz, Angren xarita, Murojatlar, Korrupsiya
- B.F.Nuraliyev — Eksport-Import, Valyuta XPU, VASH, NPL Risk Rating, NPL Dashboard v3
- Sh.R.Irgashev — Parkentsoy Voice, Tadbirkorlik, Banklar, Mahallalar tahlili
- A.A.Jurayev — Naqd pullar, Buxgalteriya Tahlili

## Texnologiyalar

- HTML5, CSS3, JavaScript ES6+
- Chart.js, SheetJS, Leaflet, MediaPipe
- Web Speech API + Azure Speech SDK
- Supabase Storage (avtomatik sync)
- Vercel (deploy + serverless API)

## Yangi xususiyatlar (v42)

- 5 ta sinxron KPI kartochkasi (NPL Dashboard v3 dan)
- Risk Profili paneli (Risk darajasi + Zahira qoplami + Huquqiy chora)
- **MB Yordamchi** — yagona aqlli chat-bot:
  - 14+ savol kategoriyasi (lokal bilim bazasi)
  - Real-time NPL ma'lumoti integratsiya
  - AI fallback (Claude/Gemini)
  - 🎙 Ovozli savol (Web Speech API)
  - 🔊 Ovozli javob (TTS)
- GitHub → Supabase avtomatik sync (har push'da)

## Sozlash yo'riqnomasi

### 1. Vercel environment variables

`https://vercel.com/turdiyevalisher59-9959s-projects/yagona-panel/settings/environment-variables`

Quyidagilarni qo'shing:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://nywnogjogqlmhthsgkvz.supabase.co` |
| `SUPABASE_KEY` | Anon yoki service_role kalit (Storage uchun yozish ruxsati) |
| `SUPABASE_BUCKET` | `MB-dashboard` (yoki o'zingiz tanlagan bucket) |
| `ANTHROPIC_API_KEY` (ixtiyoriy) | Claude AI uchun |
| `GEMINI_API_KEY` (ixtiyoriy) | Gemini AI uchun |

### 2. GitHub Secrets (Supabase auto-sync uchun)

`https://github.com/turdiyevalisher59-del/yagona-panel/settings/secrets/actions`

Quyidagi 3 ta secret qo'shing:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://nywnogjogqlmhthsgkvz.supabase.co` |
| `SUPABASE_KEY` | **Service Role kalit** (Storage'ga yozish uchun majburiy) |
| `SUPABASE_BUCKET` | `MB-dashboard` |

> ⚠ **Diqqat:** GitHub Action uchun **Service Role** kalit kerak (anon emas), chunki yozish ruxsati kerak. Supabase dashboard → Settings → API → `service_role` (secret).

### 3. Supabase bucket yaratish

1. https://supabase.com/dashboard/project/nywnogjogqlmhthsgkvz/storage/buckets
2. **New bucket** → nomi: `MB-dashboard` → **Public bucket** belgisini **YONIQ** qiling
3. Yaratish

### 4. Avtomatik sync qanday ishlaydi

Har gal `main` branch'ga push qilganingizda:

1. GitHub Actions ishga tushadi (`.github/workflows/sync-supabase.yml`)
2. `git diff` orqali oxirgi commit'da o'zgargan fayllar topiladi
3. Har biri Supabase bucket'iga yuklanadi (upsert)
4. O'chirilgan fayllar Supabase'dan ham o'chiriladi
5. Logs: GitHub repo → Actions tab

**To'liq qayta sync** (barcha fayllarni qayta yuklash):
- GitHub repo → Actions → "Sync to Supabase Storage" → "Run workflow"

## Lokal ishga tushirish

```bash
python -m http.server 8000
# Brauzer: http://localhost:8000
```

Yoki to'g'ridan-to'g'ri `index.html` ni Chrome'da oching.

## Push (lokal o'zgarishni GitHub'ga yuborish)

`Desktop\Новая папка\push_to_github.bat` ni double-click qiling — avtomatik:
- Git repo init
- GitHub'ga force push
- Vercel auto-deploy boshlanadi
- GitHub Action Supabase sync ishga tushadi
