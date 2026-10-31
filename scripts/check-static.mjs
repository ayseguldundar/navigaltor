import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const jsRoots = ['public/app', 'scripts', 'tests'];
const edgeRoot = 'supabase/functions';
const jsFiles = [];
const edgeFiles = [];

async function collect(dir, out, pattern) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collect(path, out, pattern);
    else if (pattern.test(entry.name)) out.push(path);
  }
}

for (const root of jsRoots) await collect(root, jsFiles, /\.(?:m?js)$/);
await collect(edgeRoot, edgeFiles, /\.ts$/);
jsFiles.sort();
edgeFiles.sort();

function check(file, args) {
  const result = spawnSync(process.execPath, [...args, '--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || `Syntax error: ${file}\n`);
    process.exit(result.status || 1);
  }
}

for (const file of jsFiles) check(file, []);
// Node's built-in TypeScript stripping parses syntax only; it is not a Deno/API type check.
for (const file of edgeFiles) check(file, ['--experimental-strip-types']);
console.log(`Static syntax checks passed (${jsFiles.length} JS files, ${edgeFiles.length} Edge Function TypeScript files).`);
