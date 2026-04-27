module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { prompt, context, apiKey, provider } = req.body;

    /* Qaysi AI provider ishlatiladi */
    const useGemini = provider === 'gemini';

    const systemText = "Sen Markaziy bank Toshkent viloyati boshqarmasi yordamchisisan. " +
      "QOIDALAR: 1) FAQAT savolga javob ber, o'zing haqingda gapirma. " +
      "2) 1-3 gap, 80 so'zdan kam. 3) Savol berma. 4) O'zbek tilida. " +
      "5) Ortiqcha gap qo'shma, javobni tugat. " +
      "KONTEKST: " + (context || '');

    if (useGemini) {
      /* ═══ GEMINI API ═══ */
      const geminiKey = process.env.GEMINI_API_KEY || apiKey;
      if (!geminiKey) return res.status(400).json({ error: 'Gemini API kalit topilmadi' });

      const gResp = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + geminiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemText }] },
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 200, temperature: 0.7 }
          })
        }
      );

      if (!gResp.ok) {
        const errText = await gResp.text();
        return res.status(gResp.status).json({ error: 'Gemini xato: ' + gResp.status });
      }

      const gData = await gResp.json();
      const text = gData.candidates && gData.candidates[0] && gData.candidates[0].content
        ? gData.candidates[0].content.parts[0].text
        : 'Javob olinmadi';
      return res.status(200).json({ text });

    } else {
      /* ═══ CLAUDE API ═══ */
      const claudeKey = process.env.ANTHROPIC_API_KEY || apiKey;
      if (!claudeKey) return res.status(400).json({ error: 'Claude API kalit topilmadi' });

      const cResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          system: systemText,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!cResp.ok) {
        return res.status(cResp.status).json({ error: 'Claude xato: ' + cResp.status });
      }

      const cData = await cResp.json();
      const text = cData.content && cData.content[0] ? cData.content[0].text : 'Javob olinmadi';
      return res.status(200).json({ text });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server xatosi: ' + err.message });
  }
};
