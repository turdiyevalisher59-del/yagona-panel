const SUPABASE_URL = 'https://rgpxdrvzvomtgvgcdell.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJncHhkcnZ6dm9tdGd2Z2NkZWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjUxODIsImV4cCI6MjA4NTk0MTE4Mn0.Dt6MxXupWJ_FRD1FL0T5tMt4rHNL4gXe4Wpp6avjrjo';
const BUCKET = 'MB-dashboard';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET - download file
    if (req.method === 'GET') {
      const path = req.query.path;
      if (!path) return res.status(400).json({ error: 'Path required' });
      
      const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
      const r = await fetch(url);
      
      if (!r.ok) return res.status(404).json({ error: 'File not found' });
      
      const contentType = r.headers.get('content-type') || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      const buffer = await r.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    // POST - upload file
    if (req.method === 'POST') {
      const { path, data, contentType } = req.body;
      if (!path || !data) return res.status(400).json({ error: 'Path and data required' });

      // Convert base64 to buffer
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
        console.error('Supabase error:', err);
        return res.status(500).json({ error: err });
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
      return res.status(200).json({ success: true, url: publicUrl, path: path });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Storage error:', err);
    return res.status(500).json({ error: err.message });
  }
};
