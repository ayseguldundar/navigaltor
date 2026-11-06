import assert from 'node:assert/strict';
import { normalizeVisualType, VIS_TYPES } from '../supabase/functions/_shared/visual-validation.mjs';

for (const type of VIS_TYPES) {
  assert.equal(normalizeVisualType(type), type, `izinli tür kabul edilmeli: ${type}`);
  assert.equal(normalizeVisualType(type.toUpperCase()), type, `büyük harfli tür kanonikleştirilmeli: ${type}`);
}

for (const invalid of ['', 'pizza etkinliği', 'recipe', 'flowchart', 'unknown', null, {}, 1]) {
  assert.equal(normalizeVisualType(invalid), '', `geçersiz değer reddedilmeli: ${String(invalid)}`);
}

console.log(`AI visual allowlist tests passed (${VIS_TYPES.length} allowed types).`);
