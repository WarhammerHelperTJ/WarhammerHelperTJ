// Writes the version stamp and the app-shell file list into sw.js between the PRECACHE markers (`npm run sw`).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const walk = (dir, ext) => readdirSync(ROOT + dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(`${dir}/${e.name}`, ext) : e.name.endsWith(ext) ? [`${dir}/${e.name}`] : []);

export const shellFiles = () => ['./', 'index.html', 'manifest.webmanifest', 'icon.svg',
  ...walk('css', '.css'), ...walk('js', '.js'), ...walk('data', '.json')].sort();

/** Changes whenever any shell file changes, so every deploy changes sw.js and phones pick up the new version. */
export const version = () => {
  const h = createHash('sha256');
  // line endings normalised: a Windows checkout has CRLF, the deployed files LF
  for (const f of shellFiles().filter(f => f !== './')) h.update(f).update(readFileSync(ROOT + f, 'utf8').replace(/\r\n/g, '\n'));
  return h.digest('hex').slice(0, 12);
};

export const START = '// PRECACHE-START', END = '// PRECACHE-END';
const block = src => src.slice(src.indexOf(START) + START.length, src.indexOf(END));
export const listIn = src => JSON.parse(block(src).match(/const PRECACHE = (\[[\s\S]*?\]);/)[1]);
export const versionIn = src => block(src).match(/const VERSION = '(\w+)'/)?.[1];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = ROOT + 'sw.js', src = readFileSync(file, 'utf8');
  const body = `const VERSION = '${version()}';\nconst PRECACHE = ${JSON.stringify(shellFiles(), null, 2)};`;
  writeFileSync(file, src.slice(0, src.indexOf(START) + START.length) + '\n' + body + '\n' + src.slice(src.indexOf(END)));
  console.log(`sw.js: ${shellFiles().length} files, version ${version()}`);
}
