import assert from 'node:assert/strict';
import { readBoundedJson } from '../supabase/functions/_shared/request-validation.mjs';

const accepted = await readBoundedJson(new Request('https://example.test', {
  method: 'POST', body: JSON.stringify({ course: 'MAT' }),
}), 64);
assert.deepEqual(accepted, { ok: true, value: { course: 'MAT' } });

const rejectedWithoutLength = await readBoundedJson(new Request('https://example.test', {
  method: 'POST', body: '12345',
}), 4);
assert.deepEqual(rejectedWithoutLength, { ok: false, status: 413 });

const rejectedMalformed = await readBoundedJson(new Request('https://example.test', {
  method: 'POST', body: '{not json',
}), 64);
assert.deepEqual(rejectedMalformed, { ok: false, status: 400 });

const acceptedAtLimit = await readBoundedJson(new Request('https://example.test', {
  method: 'POST', body: 'null',
}), 4);
assert.deepEqual(acceptedAtLimit, { ok: true, value: null });

console.log('AI bounded request body tests passed.');
