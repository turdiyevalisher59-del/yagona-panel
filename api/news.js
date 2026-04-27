module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const src = req.query.src || 'bankers';
  
  const urls = {
    bankers: [
      'https://bankers.uz/rss',
      'https://bankers.uz/feed',
      'https://bankers.uz/'
    ],
    kun: [
      'https://kun.uz/news/rss',
      'https://kun.uz/uz/rss',
      'https://kun.uz/'
    ]
  };

  const sourceUrls = urls[src] || urls.bankers;
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
    'Accept-Language': 'uz,ru;q=0.9,en;q=0.8'
  };

  for (const url of sourceUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (response.ok) {
        const text = await response.text();
        if (text && text.length > 100) {
          const isRss = text.includes('<item') || text.includes('<entry') || text.includes('<rss');
          res.setHeader('Content-Type', isRss ? 'application/xml' : 'text/html');
          return res.status(200).send(text);
        }
      }
    } catch (err) {
      console.log(`Failed to fetch ${url}:`, err.message);
      continue;
    }
  }

  return res.status(502).json({ error: 'All sources failed' });
};
