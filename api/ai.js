/**
 * AI + Web Search proxy.
 * Strategiya:
 *   1. AI (Claude yoki Gemini) — kalit mavjud bo'lsa
 *   2. DuckDuckGo Instant Answer API — bepul, kalitsiz
 *   3. Wikipedia REST API — bepul, kalitsiz
 *   4. Yo'naltirish havolalari (Google, claude.ai)
 *
 * ENV (Vercel'da o'rnatish — barcha foydalanuvchilar uchun bepul javob):
 *   ANTHROPIC_API_KEY  — Claude kalit
 *   GEMINI_API_KEY     — Gemini kalit (Google AI Studio'dan bepul)
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { prompt, context, apiKey, provider } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt majburiy' });

    const systemText =
      "Sen O'zbekiston Markaziy banki Toshkent viloyati Bosh boshqarmasi panelining aqlli yordamchisisan. " +
      "QOIDALAR: 1) Har qanday savolga javob ber — bank, iqtisod, dasturlash, umumiy bilim — hammasi mumkin. " +
      "2) O'zbek tilida javob ber (lotin yoki kirill — savol qaysi alifboda bo'lsa). " +
      "3) To'liq, foydali javob ber. Qisqartirma. 4) Agar bilmasang, ochiq aytma. " +
      "5) Markdown ishlatma — oddiy matn yoki HTML. \n\n" +
      "TIZIM KONTEKSTI:\n" + (context || '(yo\'q)');

    const usedProvider = provider || 'claude';

    /* ════════════ 1. CLAUDE API ════════════ */
    if (usedProvider === 'claude') {
      const claudeKey = apiKey || process.env.ANTHROPIC_API_KEY;
      if (claudeKey) {
        try {
          const cResp = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': claudeKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 1024,
              system: systemText,
              messages: [{ role: 'user', content: prompt }]
            })
          });
          if (cResp.ok) {
            const cData = await cResp.json();
            const text = cData.content && cData.content[0] ? cData.content[0].text : '';
            if (text) return res.status(200).json({ text, source: 'claude' });
          }
          /* Agar 401/429 — fallback'ga o'tish */
        } catch (e) { /* fallback */ }
      }
    }

    /* ════════════ 2. GEMINI API ════════════ */
    const geminiKey = (usedProvider === 'gemini' ? apiKey : null) || process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const gResp = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + geminiKey,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemText }] },
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
            })
          }
        );
        if (gResp.ok) {
          const gData = await gResp.json();
          const text = gData.candidates && gData.candidates[0] && gData.candidates[0].content
            ? gData.candidates[0].content.parts[0].text
            : '';
          if (text) return res.status(200).json({ text, source: 'gemini' });
        }
      } catch (e) { /* fallback */ }
    }

    /* ════════════ 3. WIKIPEDIA + DuckDuckGo ════════════ */
    const webResult = await searchWeb(prompt);
    if (webResult) return res.status(200).json({ text: webResult, source: 'web' });

    /* ════════════ 4. Yo'naltirish havolalari ════════════ */
    const enc = encodeURIComponent(prompt);
    const fallbackText =
      "Bu savol uchun aniq javob topa olmadim. Tashqi manbalardan qidirib ko'ring:\n\n" +
      `🔍 <a href="https://www.google.com/search?q=${enc}" target="_blank" rel="noopener">Google'da qidirish</a>\n` +
      `🤖 <a href="https://claude.ai/new?q=${enc}" target="_blank" rel="noopener">Claude AI'da so'rash</a>\n` +
      `📚 <a href="https://uz.wikipedia.org/wiki/Special:Search?search=${enc}" target="_blank" rel="noopener">Wikipedia (uz)</a>\n\n` +
      "Yoki <b>Sozlamalar</b>'da AI kalit qo'shing — to'liq javoblar uchun.";
    return res.status(200).json({ text: fallbackText, source: 'fallback' });

  } catch (err) {
    return res.status(500).json({ error: 'Server xatosi: ' + err.message });
  }
};

/**
 * Wikipedia + DuckDuckGo Instant Answer'dan ma'lumot yig'ish.
 * Bepul, kalit kerak emas.
 */
async function searchWeb(query) {
  let result = '';

  /* DuckDuckGo Instant Answer */
  try {
    const ddg = await fetch(
      'https://api.duckduckgo.com/?q=' + encodeURIComponent(query) + '&format=json&no_html=1&skip_disambig=1',
      { headers: { 'User-Agent': 'MB-Dashboard/1.0' } }
    );
    if (ddg.ok) {
      const data = await ddg.json();
      if (data.AbstractText) {
        result += '📚 <b>' + (data.Heading || query) + '</b>\n' + data.AbstractText + '\n';
        if (data.AbstractURL) result += '<a href="' + data.AbstractURL + '" target="_blank">Manba</a>\n';
      } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        result += '📚 <b>' + query + '</b> bo\'yicha topilgan:\n';
        for (let i = 0; i < Math.min(3, data.RelatedTopics.length); i++) {
          const t = data.RelatedTopics[i];
          if (t.Text) result += '• ' + t.Text + '\n';
        }
      }
    }
  } catch (e) {}

  /* Wikipedia (o'zbek + ingliz) */
  if (!result) {
    for (const lang of ['uz', 'ru', 'en']) {
      try {
        const wiki = await fetch(
          'https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(query),
          { headers: { 'User-Agent': 'MB-Dashboard/1.0' } }
        );
        if (wiki.ok) {
          const data = await wiki.json();
          if (data.extract) {
            result = '📖 <b>' + (data.title || query) + '</b> (Wikipedia ' + lang + ')\n' + data.extract;
            if (data.content_urls && data.content_urls.desktop) {
              result += '\n<a href="' + data.content_urls.desktop.page + '" target="_blank">To\'liq o\'qish</a>';
            }
            break;
          }
        }
      } catch (e) {}
    }
  }

  return result || null;
}
