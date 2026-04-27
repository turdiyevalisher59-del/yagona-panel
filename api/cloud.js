module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  var JSONBIN_URL = 'https://api.jsonbin.io/v3/b/69818100d0ea881f409cbc21';

  try {
    if (req.method === 'GET') {
      var r = await fetch(JSONBIN_URL + '/latest');
      var data = await r.json();
      // JSONBin returns {record: {...}, metadata: {...}}
      return res.status(200).json(data.record || data);
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      var r = await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      var data = await r.json();
      return res.status(200).json(data.record || data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
