import {pages,legacyRedirects} from '../content/parents.mjs';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

export function createRequestHandler(rootDirectory, generated = new Map()) {
  const root = resolve(rootDirectory);
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png':'image/png', '.mp3':'audio/mpeg', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
  return async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Adresse invalide'); return; }
  if (Object.hasOwn(legacyRedirects,pathname)) {
    const query = new URL(req.url,'http://localhost').search;
    res.writeHead(301,{Location:legacyRedirects[pathname]+query}).end(); return;
  }
  if (pages.some(page=>page.path === pathname + '/')) {
    res.writeHead(308, { Location: pathname + '/' }).end(); return;
  }
  try {
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '') + (pathname.endsWith('/') ? 'index.html' : '');
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const body = generated.has(relative) ? generated.get(relative) : await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Language': 'fr-FR', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    const body = generated.get('404.html') || await readFile(resolve(root, '404.html')).catch(() => 'Page introuvable');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : body);
  }
  };
}
