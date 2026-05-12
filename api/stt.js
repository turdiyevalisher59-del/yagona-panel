/* UzbekVoice STT proxy
 * Audio faylni qabul qiladi, UzbekVoice STT'ga yuboradi, transkripsiyani qaytaradi.
 *
 * Foydalanish:
 *   POST /api/stt
 *     Headers: Content-Type: audio/webm (yoki audio/wav, audio/mpeg)
 *     Query:   ?language=uz&model=enhanced-stt
 *     Body:    audio binary
 *
 * Mavjud tillar: uz, ru, uz-ru
 * Mavjud modellar: general, enhanced-stt
 *
 * Vercel env: UZBEKVOICE_API_KEY
 */

const UPSTREAM = 'https://uzbekvoice.ai/api/v1/stt';

/* Vercel: raw body kerak — JSON parser'ni o'chirish */
module.exports.config = {
  api: {
    bodyParser: false
  }
};

function readRawBody(req){
  return new Promise(function(resolve, reject){
    var chunks = [];
    req.on('data', function(c){ chunks.push(c); });
    req.on('end', function(){ resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET' && req.query.health === '1') {
    return res.status(200).json({
      ok: true,
      service: 'UzbekVoice STT proxy',
      hasKey: !!process.env.UZBEKVOICE_API_KEY,
      languages: ['uz', 'ru', 'uz-ru'],
      models: ['general', 'enhanced-stt']
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST kerak (audio body bilan)' });
  }

  const apiKey = process.env.UZBEKVOICE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'UZBEKVOICE_API_KEY env yo\'q' });
  }

  const language = (req.query.language || req.query.lang || 'uz').toString();
  const model = (req.query.model || 'enhanced-stt').toString();
  const blocking = (req.query.blocking || 'true').toString();
  const contentType = req.headers['content-type'] || 'audio/webm';

  try {
    const audioBuf = await readRawBody(req);
    if (!audioBuf || audioBuf.length === 0) {
      return res.status(400).json({ error: 'Audio body bo\'sh' });
    }

    /* Multipart/form-data qurish */
    const boundary = '----CoworkBoundary' + Math.random().toString(16).slice(2);
    const ext = contentType.indexOf('webm') >= 0 ? 'webm'
              : contentType.indexOf('wav')  >= 0 ? 'wav'
              : contentType.indexOf('mpeg') >= 0 ? 'mp3'
              : contentType.indexOf('ogg')  >= 0 ? 'ogg' : 'audio';

    const parts = [];
    function addField(name, value){
      parts.push(Buffer.from('--' + boundary + '\r\n'));
      parts.push(Buffer.from('Content-Disposition: form-data; name="' + name + '"\r\n\r\n'));
      parts.push(Buffer.from(String(value) + '\r\n'));
    }
    parts.push(Buffer.from('--' + boundary + '\r\n'));
    parts.push(Buffer.from('Content-Disposition: form-data; name="file"; filename="rec.' + ext + '"\r\n'));
    parts.push(Buffer.from('Content-Type: ' + contentType + '\r\n\r\n'));
    parts.push(audioBuf);
    parts.push(Buffer.from('\r\n'));
    addField('language', language);
    addField('model', model);
    addField('blocking', blocking);
    addField('return_offsets', 'false');
    addField('run_diarization', 'false');
    parts.push(Buffer.from('--' + boundary + '--\r\n'));

    const body = Buffer.concat(parts);

    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': String(body.length)
      },
      body: body
    });

    const upstreamCT = upstream.headers.get('content-type') || '';

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => '');
      console.error('UzbekVoice STT error:', upstream.status, errBody);
      return res.status(upstream.status).json({
        error: 'UzbekVoice STT upstream error',
        status: upstream.status,
        details: errBody.substring(0, 500)
      });
    }

    if (upstreamCT.indexOf('json') >= 0) {
      const data = await upstream.json();
      /* { id, result: { text }, state } shaklida qaytadi */
      return res.status(200).json({
        ok: true,
        text: (data.result && data.result.text) || data.text || '',
        state: data.state,
        id: data.id,
        raw: data
      });
    }

    const text = await upstream.text();
    return res.status(200).json({ ok: true, text: text });

  } catch (err) {
    console.error('STT proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
};
