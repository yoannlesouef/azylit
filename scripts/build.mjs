import { cp, mkdir, readdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of await readdir('app')) await cp(`app/${file}`, `dist/${file}`, { recursive: true });
console.log('Application construite dans dist/.');
