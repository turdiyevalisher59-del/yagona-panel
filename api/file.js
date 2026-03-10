const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var fp = req.query.p || '';
  if (!fp) return res.status(400).json({ error: 'p kerak' });
  fp = decodeURIComponent(fp);
  if (fp.includes('..')) return res.status(403).json({ error: 'no' });

  var dirs = [process.cwd(), path.resolve(__dirname, '..'), '/var/task'];
  var found = null;
  for (var i = 0; i < dirs.length; i++) {
    var full = path.join(dirs[i], fp);
    if (fs.existsSync(full)) { found = full; break; }
  }
  if (!found) return res.status(404).json({ error: 'Topilmadi: ' + fp.substring(0,80) });

  var ext = path.extname(fp).toLowerCase();
  var m = {'.json':'application/json','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','.xls':'application/vnd.ms-excel','.html':'text/html','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.pdf':'application/pdf'};
  res.setHeader('Content-Type', m[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(fs.readFileSync(found));
};
