import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { shellFiles, listIn } from '../tools/build-sw.mjs';

test('sw.js precache list matches files on disk (run `npm run sw`)', () => {
  const src = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.deepEqual(listIn(src), shellFiles());
});

test('sw.js is network-first, so a reload always shows edited files (cache-first never noticed them)', () => {
  const src = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(src, /respondWith\(fetch\(/, 'fetch the network first');
  assert.match(src, /\.catch\(\(\) => caches\.match\(/, 'the cache only answers when the network fails');
  assert.doesNotMatch(src, /dicehelper-v1'/, 'v1 caches (cache-first) must be dropped on activate');
});
