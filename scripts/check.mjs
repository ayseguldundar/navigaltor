import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const fail = [];
const required = [
  'package-lock.json',
  '.github/workflows/ci.yml',
  'supabase/migrations/20261030000008_ai_kota_atomik.sql',
];
for (const file of required) if (!existsSync(join(root, file))) fail.push(`eksik dosya: ${file}`);

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const p = join(dir, entry.name);
  return entry.isDirectory() ? walk(p) : [p];
});
const textFiles = walk(root).filter((p) => /\.(mjs|ts|js|sql|yml|yaml|json|md)$/.test(p));
for (const file of textFiles) {
  const text = readFileSync(file, 'utf8');
  const rel = file.slice(root.length);
  if (/sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC )?PRIVATE KEY-----/.test(text)) {
    fail.push(`olası sır: ${rel}`);
  }
  if (/return error \? true : data === true/.test(text)) {
    fail.push(`rate-limit fail-open: ${rel}`);
  }
}
const migrationNames = readdirSync(join(root, 'supabase/migrations')).filter((f) => f.endsWith('.sql'));
if (migrationNames.length < 8) fail.push('pilot migration sayısı 8’den az');
if (fail.length) {
  console.error(fail.map((x) => `✗ ${x}`).join('\n'));
  process.exit(1);
}
console.log(`✓ statik güvenlik kontrolleri geçti (${textFiles.length} dosya, ${migrationNames.length} migration)`);
