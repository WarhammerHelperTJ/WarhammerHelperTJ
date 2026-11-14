import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { shellFiles, listIn } from '../tools/build-sw.mjs';

test('sw.js precache list matches files on disk (run `npm run sw`)', () => {
  const src = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.deepEqual(listIn(src), shellFiles());
});
