/* Supabase Storage proxy
 * Vercel env variables (Settings → Environment Variables) orqali sozlanadi:
 *   - SUPABASE_URL    (default: yangi loyiha URL'i)
 *   - SUPABASE_KEY    (anon yoki service_role kalit)
 *   - SUPABASE_BUCKET (default: MB-dashboard)
 *
 * Eski env'lar bo'lmasa — pastdagi default qiymatlar ishlatiladi.
 * Yangi loyiha: https://nywnogjogqlmhthsgkvz.supabase.co
 */
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nywnogjogqlmhthsgkvz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const BUCKET       = process.env.SUPABASE_BUCKET || 'MB-dashboard';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Konfiguratsiya holatini tekshirish (yangi xizmat uchun debug)
  if (req.method === 'GET' && req.query.health === '1') {
    return res.status(200).json({
      ok: true,
      url: SUPABASE_URL,
      bucket: BUCKET,
      hasKey: !!SUPABASE_KEY
    });
  }

  try {
    // GET — fayl yuklab olish (public bucket)
    if (req.method === 'GET') {
      const path = req.query.path;
      if (!path) return res.status(400).json({ error: 'Path required' });

      const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
      const r = await fetch(url);
      if (!r.ok) return res.status(404).json({ error: 'File not found', status: r.status });

      const contentType = r.headers.get('content-type') || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=300');
      const buffer = await r.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    // POST — fayl yuklash
    if (req.method === 'POST') {
      if (!SUPABASE_KEY) {
        return res.status(500).json({
          error: 'SUPABASE_KEY env variable sozlanmagan. Vercel Settings → Environment Variables ga SUPABASE_KEY qo\'shing.'
        });
      }
      const { path, data, contentType } = req.body;
      if (!path || !data) return res.status(400).json({ error: 'Path and data required' });

      const base64Data = data.includes(',') ? data.split(',')[1] : data;
      const buffer = Buffer.from(base64Data, 'base64');

      const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': contentType || 'application/octet-stream',
          'x-upsert': 'true'
        },
        body: buffer
      });

      if (!r.ok) {
        const err = await r.text();
        console.error('Supabase POST error:', err);
        return res.status(500).json({ error: err });
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
      return res.status(200).json({ success: true, url: publicUrl, path: path });
    }

    // DELETE — fayl o'chirish (eski fayllarni tozalash uchun)
    if (req.method === 'DELETE') {
      if (!SUPABASE_KEY) {
        return res.status(500).json({ error: 'SUPABASE_KEY env variable sozlanmagan' });
      }
      const path = req.query.path;
      if (!path) return res.status(400).json({ error: 'Path required' });

      const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
      const r = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (!r.ok) {
        const err = await r.text();
        return res.status(500).json({ error: err });
      }
      return res.status(200).json({ success: true, deleted: path });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Storage error:', err);
    return res.status(500).json({ error: err.message });
  }
};
