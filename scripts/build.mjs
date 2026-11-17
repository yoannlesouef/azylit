import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { publicFiles } from './public-pages.mjs';
await mkdir('dist', { recursive: true });
for (const file of await readdir('app')) await cp(`app/${file}`, `dist/${file}`, { recursive: true });
const generated = publicFiles(await readFile('app/index.html', 'utf8'));
for (const [path, contents] of generated) {
  await mkdir(dirname(`dist/${path}`), { recursive: true });
  await writeFile(`dist/${path}`, contents);
}
console.log(`Application et ${generated.size - 4} pages parents construites dans dist/.`);
