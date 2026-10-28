// Yerel önizleme sunucusu: dist/ klasörünü Vercel'deki gibi temiz adreslerle sunar.
//   node scripts/serve.mjs [port]   →  http://localhost:4173
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png',
  '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.svg': 'image/svg+xml', '.css': 'text/css' };

async function resolve(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidates = clean === '/' ? ['index.html'] : [clean, clean + '.html', join(clean, 'index.html')];
  for (const c of candidates) {
    const p = join(DIST, c);
    if (!p.startsWith(DIST)) continue;
    try { if ((await stat(p)).isFile()) return p; } catch {}
  }
  return null;
}

export function startServer(port = 4173) {
  const server = createServer(async (req, res) => {
    const file = await resolve(new URL(req.url, 'http://x').pathname);
    if (!file) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Bulunamadı'); }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(await readFile(file));
  });
  return new Promise((ok) => server.listen(port, () => ok(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2]) || 4173;
  await startServer(port);
  console.log(`NavigAItor önizleme: http://localhost:${port}`);
}
