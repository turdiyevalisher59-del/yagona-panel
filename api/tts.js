/* UzbekVoice TTS proxy — async pattern (non-blocking + polling)
 *
 * Foydalanish:
 *   GET  /api/tts?text=Salom&model=lola
 *   POST /api/tts        body: { "text": "Salom", "model": "lola" }
 *
 * Mavjud modellar: lola, shoira,
 *   jahongir-angry, jahongir-neutral, fotima-angry, fotima-neutral,
 *   dilfuza-sad, dilfuza-angry, dilfuza-happy, dilfuza-neutral,
 *   davron-angry, davron-happy, davron-neutral
 *
 * Vercel env: UZBEKVOICE_API_KEY
 *
 * Algoritm:
 * 1. POST /api/v1/tts (blocking=false) → { id, state }
 * 2. Pollingda: GET /api/v1/task/{id} har 1.5s
 * 3. state === 'completed' bo'lganda result.audio_url'dan audio olamiz
 * 4. Audio'ni client'ga qaytaramiz
 */

const UPSTREAM_TTS = 'https://uzbekvoice.ai/api/v1/tts';
const POLLING_BASE = 'https://uzbekvoice.ai/api/v1';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function pollTask(taskId, apiKey, maxWaitMs = 45000) {
  const start = Date.now();
  /* taskId odatda "tts/uuid1/uuid2" formatida — base + id qo'shsak: /api/v1/tts/uuid1/uuid2 */
  const candidates = [
    `${POLLING_BASE}/${taskId}`,                     // /api/v1/tts/uuid/uuid (eng ehtimoliy)
    `${POLLING_BASE}/task?id=${encodeURIComponent(taskId)}`,
    `${POLLING_BASE}/tasks?id=${encodeURIComponent(taskId)}`,
    `${POLLING_BASE}/poll?id=${encodeURIComponent(taskId)}`,
    `${POLLING_BASE}/task/${encodeURIComponent(taskId)}`,
    `${POLLING_BASE}/tasks/${encodeURIComponent(taskId)}`
  ];
  let workingUrl = null;
  let firstResponseSnapshot = null;

  // Topish: birinchi 200 qaytaradigan endpoint
  for (const url of candidates) {
    try {
      const r = await fetch(url, { headers: { 'Authorization': apiKey } });
      if (r.ok || r.status === 202) {
        workingUrl = url;
        firstResponseSnapshot = await r.json().catch(() => null);
        break;
      }
    } catch (e) {}
  }
  if (!workingUrl) {
    return { ok: false, error: 'no polling endpoint found', taskId, triedUrls: candidates };
  }

  // Birinchi javob darhol completed bo'lishi mumkin
  if (firstResponseSnapshot) {
    const status = String(firstResponseSnapshot.status || firstResponseSnapshot.state || '').toUpperCase();
    if (['SUCCESS','COMPLETED','DONE','FINISHED','OK'].indexOf(status) >= 0) {
      return { ok: true, data: firstResponseSnapshot, url: workingUrl };
    }
    if (['FAILED','ERROR'].indexOf(status) >= 0) {
      return { ok: false, error: 'task failed', data: firstResponseSnapshot };
    }
  }

  while (Date.now() - start < maxWaitMs) {
    await sleep(1200);
    try {
      const r = await fetch(workingUrl, { headers: { 'Authorization': apiKey } });
      if (r.ok) {
        const data = await r.json().catch(() => null);
        if (data) {
          const status = String(data.status || data.state || '').toUpperCase();
          if (['SUCCESS','COMPLETED','DONE','FINISHED','OK'].indexOf(status) >= 0) {
            return { ok: true, data, url: workingUrl };
          }
          if (['FAILED','ERROR'].indexOf(status) >= 0) {
            return { ok: false, error: 'task failed', data, url: workingUrl };
          }
        }
      }
    } catch (e) {}
  }
  return { ok: false, error: 'timeout', taskId, url: workingUrl };
}

function extractAudioUrl(data) {
  if (!data) return null;
  return data.audio_url
      || data.url
      || data.download_url
      || data.audioUrl
      || (data.result && (data.result.audio_url || data.result.url || data.result.download_url || data.result.audioUrl))
      || null;
}

function extractAudioBase64(data) {
  if (!data) return null;
  return data.audio
      || data.audio_base64
      || (data.result && (data.result.audio || data.result.audio_base64))
      || null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET' && req.query.health === '1') {
    return res.status(200).json({
      ok: true,
      service: 'UzbekVoice TTS proxy (async pattern)',
      hasKey: !!process.env.UZBEKVOICE_API_KEY,
      models: ['lola', 'shoira', 'jahongir-neutral', 'fotima-neutral', 'dilfuza-neutral', 'davron-neutral']
    });
  }

  const apiKey = process.env.UZBEKVOICE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'UZBEKVOICE_API_KEY env yo\'q' });
  }

  let text, model;
  if (req.method === 'GET') {
    text = req.query.text;
    model = req.query.model || 'lola';
  } else if (req.method === 'POST') {
    const body = req.body || {};
    text = body.text;
    model = body.model || 'lola';
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text parameter required' });
  }
  if (text.length > 2000) text = text.substring(0, 2000);

  const isDebug = (req.query && req.query.debug === '1');

  try {
    /* 1. ALWAYS non-blocking — tezda task_id olamiz, keyin polling.
       (blocking:true UzbekVoice'da ishonchsiz: ba'zan cheksiz to'sib qo'yadi.) */
    const startReq = Date.now();
    let upstream = await fetch(UPSTREAM_TTS, {
      method: 'POST',
      headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model, blocking: false }),
      signal: AbortSignal.timeout(15000)
    });

    const ct1 = upstream.headers.get('content-type') || '';
    console.log('[UV TTS] step1 status=' + upstream.status + ' ct=' + ct1 + ' ms=' + (Date.now()-startReq));

    /* Audio qaytarsa — darhol jo'natamiz */
    if (upstream.ok && (ct1.indexOf('audio') >= 0 || ct1.indexOf('mpeg') >= 0 || ct1.indexOf('octet-stream') >= 0 || ct1.indexOf('wav') >= 0)) {
      const buf = await upstream.arrayBuffer();
      if (isDebug) return res.status(200).json({ ok: true, format: 'binary-direct', bytes: buf.byteLength });
      res.setHeader('Content-Type', ct1 || 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(Buffer.from(buf));
    }

    /* JSON qaytarsa — audio yoki job_id bo'lishi mumkin */
    if (upstream.ok && ct1.indexOf('json') >= 0) {
      const data = await upstream.json().catch(() => null);
      console.log('[UV TTS] step1 json keys=', data ? Object.keys(data) : null, 'state=', data && data.state);

      /* Birdan audio URL keladi */
      const directUrl = extractAudioUrl(data);
      if (directUrl) {
        const aresp = await fetch(directUrl);
        if (aresp.ok) {
          const buf = await aresp.arrayBuffer();
          if (isDebug) return res.status(200).json({ ok: true, format: 'json-with-url', sourceUrl: directUrl, bytes: buf.byteLength });
          res.setHeader('Content-Type', aresp.headers.get('content-type') || 'audio/mpeg');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          return res.send(Buffer.from(buf));
        }
      }

      /* Birdan base64 keladi */
      const directB64 = extractAudioBase64(data);
      if (directB64 && typeof directB64 === 'string') {
        const buf = Buffer.from(directB64.includes(',') ? directB64.split(',')[1] : directB64, 'base64');
        if (isDebug) return res.status(200).json({ ok: true, format: 'json-with-base64', bytes: buf.length });
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.send(buf);
      }

      /* job_id bilan — pollingga o'tamiz */
      const taskId = data && (data.id || data.task_id || data.taskId);
      if (taskId) {
        console.log('[UV TTS] step1 returned task_id=' + taskId + ' — polling...');

        /* Debug=1 — pollingsiz darhol qaytarish */
        if (isDebug) {
          return res.status(200).json({
            ok: true,
            format: 'task-id-received',
            taskId,
            initialResponse: data,
            initialKeys: Object.keys(data),
            note: 'Set debug=2 to also poll'
          });
        }

        const poll = await pollTask(taskId, apiKey, 40000);
        console.log('[UV TTS] poll result ok=' + poll.ok + ' url=' + poll.url + ' err=' + poll.error);

        /* Debug=2 — polling natijasini qaytarish */
        if (req.query && req.query.debug === '2') {
          return res.status(200).json({
            ok: poll.ok,
            format: 'poll-debug',
            poll,
            taskId
          });
        }

        if (!poll.ok) {
          if (isDebug) return res.status(200).json({ ok: false, format: 'poll-fail', poll });
          return res.status(504).json({ error: 'Polling timeout', taskId, hint: 'UzbekVoice task did not complete in time' });
        }

        const audioUrl2 = extractAudioUrl(poll.data);
        if (audioUrl2) {
          const aresp = await fetch(audioUrl2);
          if (aresp.ok) {
            const buf = await aresp.arrayBuffer();
            if (isDebug) return res.status(200).json({ ok: true, format: 'polled-url', sourceUrl: audioUrl2, bytes: buf.byteLength });
            res.setHeader('Content-Type', aresp.headers.get('content-type') || 'audio/mpeg');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.send(Buffer.from(buf));
          }
        }

        const b642 = extractAudioBase64(poll.data);
        if (b642 && typeof b642 === 'string') {
          const buf = Buffer.from(b642.includes(',') ? b642.split(',')[1] : b642, 'base64');
          if (isDebug) return res.status(200).json({ ok: true, format: 'polled-base64', bytes: buf.length });
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          return res.send(buf);
        }

        /* Audio topilmadi — debug ma'lumotni qaytarish */
        if (isDebug) return res.status(200).json({ ok: false, format: 'polled-no-audio', poll, taskId });
        return res.status(502).json({ error: 'Polled but no audio', taskId, state: poll.data && poll.data.state });
      }

      /* Hech narsa topilmadi */
      if (isDebug) return res.status(200).json({ ok: false, format: 'json-no-audio', data });
      return res.status(502).json({ error: 'UzbekVoice JSON without audio', data });
    }

    /* Xato — yuqori javobni qaytarish */
    const errBody = await upstream.text().catch(() => '');
    if (isDebug) return res.status(200).json({ ok: false, format: 'error', upstream_status: upstream.status, ct: ct1, body: errBody.substring(0,500) });
    return res.status(upstream.status).json({ error: 'UzbekVoice error', status: upstream.status, details: errBody.substring(0,500) });

  } catch (err) {
    console.error('[UV TTS] proxy error:', err);
    if (isDebug) return res.status(200).json({ ok: false, format: 'exception', error: err.message });
    return res.status(500).json({ error: err.message });
  }
};
