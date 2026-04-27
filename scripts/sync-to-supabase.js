#!/usr/bin/env node
/**
 * Supabase Storage'ga avtomatik sinxronlash skripti
 *
 * Ishlash:
 * 1. git diff orqali oxirgi commit'da o'zgargan fayllarni topadi
 * 2. Har birini Supabase Storage bucket'iga yuklaydi (upsert: true)
 * 3. O'chirilgan fayllarni Supabase'dan ham o'chiradi
 *
 * Env variables (GitHub Secrets):
 *   - SUPABASE_URL    (default: https://nywnogjogqlmhthsgkvz.supabase.co)
 *   - SUPABASE_KEY    (Service Role yoki anon — yozish ruxsati bilan)
 *   - SUPABASE_BUCKET (default: MB-dashboard)
 *   - FULL_SYNC       (true bo'lsa — barcha fayllarni qayta yuklaydi)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nywnogjogqlmhthsgkvz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const BUCKET       = process.env.SUPABASE_BUCKET || 'MB-dashboard';
const FULL_SYNC    = process.env.FULL_SYNC === 'true';

if (!SUPABASE_KEY) {
  console.error('❌ SUPABASE_KEY env yo\'q! GitHub Settings → Secrets → Actions ga qo\'shing.');
  process.exit(1);
}

// MIME turlari (kengaytmaga qarab)
const MIME = {
  '.html':'text/html; charset=utf-8',
  '.htm':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.mjs':'application/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.md':'text/markdown; charset=utf-8',
  '.txt':'text/plain; charset=utf-8',
  '.csv':'text/csv; charset=utf-8',
  '.xml':'application/xml; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.gif':'image/gif',
  '.webp':'image/webp',
  '.ico':'image/x-icon',
  '.pdf':'application/pdf',
  '.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls':'application/vnd.ms-excel',
  '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.zip':'application/zip',
};
function mimeFor(filePath){
  const ext = path.extname(filePath).toLowerCase();
  return MIME[ext] || 'application/octet-stream';
}

// E'tiborga olinmaydigan fayllar/papkalar
const IGNORE_PATTERNS = [
  /^\.git\//,
  /^\.github\//,
  /^node_modules\//,
  /^scripts\/sync-to-supabase\.js$/,  // o'zini o'zi yuklamasin
  /^push_to_github\.bat$/,
  /^push_log\.txt$/,
  /\.env$/,
  /\.env\.local$/,
  /^\.vercel\//,
  /^\.DS_Store$/,
  /Thumbs\.db$/,
  /^~\$/,    // Excel/Word vaqtinchalik fayllar (~$file.xlsx)
  /\.tmp$/,
  /\.bak$/,
  /\.swp$/,
];
function isIgnored(file){
  return IGNORE_PATTERNS.some(re => re.test(file));
}

/**
 * O'zgargan fayllarni topish (oxirgi commit vs HEAD~1)
 */
function getChangedFiles(){
  if (FULL_SYNC) {
    // To'liq sync — barcha fayllar
    console.log('📦 FULL_SYNC rejimi — barcha fayllar yuklanadi');
    const all = execSync('git ls-files', {encoding:'utf-8'}).trim().split('\n').filter(Boolean);
    return { added: all.filter(f => !isIgnored(f)), modified: [], deleted: [] };
  }
  try {
    // Oxirgi commit'dagi o'zgarishlar
    const diff = execSync('git diff --name-status HEAD~1 HEAD', {encoding:'utf-8'}).trim();
    if (!diff) return { added:[], modified:[], deleted:[] };

    const added = [], modified = [], deleted = [];
    diff.split('\n').forEach(line => {
      const parts = line.split(/\s+/);
      const status = parts[0];
      const file = parts.slice(1).join(' ');
      if (isIgnored(file)) return;
      if (status === 'A' || status === 'C') added.push(file);
      else if (status === 'M') modified.push(file);
      else if (status === 'D') deleted.push(file);
      else if (status.startsWith('R')) {
        // R{score} oldName newName
        deleted.push(parts[1]);
        added.push(parts.slice(2).join(' '));
      }
    });
    return { added, modified, deleted };
  } catch(e) {
    console.warn('⚠ git diff xato (yangi repo bo\'lishi mumkin) — to\'liq sync qilamiz');
    const all = execSync('git ls-files', {encoding:'utf-8'}).trim().split('\n').filter(Boolean);
    return { added: all.filter(f => !isIgnored(f)), modified: [], deleted: [] };
  }
}

/**
 * Bitta faylni Supabase'ga yuklash (upsert)
 */
async function uploadFile(filePath){
  if (!fs.existsSync(filePath)) return { ok:false, error:'fayl yo\'q' };
  const buffer = fs.readFileSync(filePath);
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURI(filePath)}`;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': mimeFor(filePath),
        'x-upsert': 'true',
        'cache-control': 'max-age=300'
      },
      body: buffer
    });
    if (!r.ok) {
      const err = await r.text();
      return { ok:false, error: r.status + ' ' + err.slice(0,200) };
    }
    return { ok:true };
  } catch(e) {
    return { ok:false, error: e.message };
  }
}

/**
 * Bitta faylni Supabase'dan o'chirish
 */
async function deleteFile(filePath){
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURI(filePath)}`;
  try {
    const r = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    return { ok: r.ok || r.status === 404, status: r.status };
  } catch(e) {
    return { ok:false, error: e.message };
  }
}

/**
 * Asosiy logika
 */
async function main(){
  console.log('🔄 Supabase Storage sync boshlandi');
  console.log('  URL:    ' + SUPABASE_URL);
  console.log('  Bucket: ' + BUCKET);
  console.log('  Mode:   ' + (FULL_SYNC ? 'FULL' : 'INCREMENTAL'));
  console.log('');

  const changes = getChangedFiles();
  const toUpload = [...new Set([...changes.added, ...changes.modified])];

  console.log(`📤 Yuklash: ${toUpload.length} fayl`);
  console.log(`🗑️  O'chirish: ${changes.deleted.length} fayl`);
  console.log('');

  let okCount = 0, failCount = 0;

  // Yuklash (parallel — 5 ta bir vaqtda, server'ni overload qilmaslik uchun)
  const CHUNK = 5;
  for (let i = 0; i < toUpload.length; i += CHUNK) {
    const chunk = toUpload.slice(i, i + CHUNK);
    const results = await Promise.all(chunk.map(async f => {
      const r = await uploadFile(f);
      if (r.ok) {
        console.log(`  ✅ ${f}`);
      } else {
        console.log(`  ❌ ${f} — ${r.error}`);
      }
      return r;
    }));
    okCount += results.filter(r => r.ok).length;
    failCount += results.filter(r => !r.ok).length;
  }

  // O'chirish
  for (const f of changes.deleted) {
    const r = await deleteFile(f);
    if (r.ok) {
      console.log(`  🗑️  ${f}`);
    } else {
      console.log(`  ⚠ ${f} — o\'chirilmadi (${r.status || r.error})`);
    }
  }

  console.log('');
  console.log(`📊 Yakun: ${okCount} muvaffaqiyatli, ${failCount} xato`);

  if (failCount > 0 && okCount === 0) {
    console.error('❌ Hech bir fayl yuklanmadi — SUPABASE_KEY yoki bucket nomini tekshiring');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('💥 Fatal xato:', err);
  process.exit(1);
});
