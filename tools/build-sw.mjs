// Writes the app-shell file list into sw.js between the PRECACHE markers (`npm run sw`).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const walk = (dir, ext) => readdirSync(ROOT + dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(`${dir}/${e.name}`, ext) : e.name.endsWith(ext) ? [`${dir}/${e.name}`] : []);

export const shellFiles = () => ['./', 'index.html', 'manifest.webmanifest', 'icon.svg',
  ...walk('css', '.css'), ...walk('js', '.js'), ...walk('data', '.json')].sort();

export const START = '// PRECACHE-START', END = '// PRECACHE-END';
export const listIn = src => JSON.parse(src.slice(src.indexOf(START) + START.length, src.indexOf(END)).trim().replace(/^const PRECACHE = |;$/g, ''));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = ROOT + 'sw.js', src = readFileSync(file, 'utf8');
  const body = `const PRECACHE = ${JSON.stringify(shellFiles(), null, 2)};`;
  writeFileSync(file, src.slice(0, src.indexOf(START) + START.length) + '\n' + body + '\n' + src.slice(src.indexOf(END)));
  console.log(`sw.js: ${shellFiles().length} files`);
}
