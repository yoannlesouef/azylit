import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequestHandler } from '../scripts/http-handler.mjs';
import { publicFiles, publicConfig } from '../scripts/public-pages.mjs';
import { pages } from '../content/parents.mjs';
const root = new URL('../app/', import.meta.url).pathname;
const generated = publicFiles(await readFile(new URL('../app/index.html', import.meta.url), 'utf8'), publicConfig({}));
const handler = createRequestHandler(root, generated);
async function request(url, method = 'GET') {
  const result = {};
  const response = {
    writeHead(status, headers = {}) { result.status = status; result.headers = headers; return this; },
    end(body) { result.body = body === undefined ? '' : body.toString(); return this; }
  };
  await handler({ url, method }, response);
  return result;
}
test('le serveur local sert toutes les pages parents générées avec un statut 200', async () => {
  for (const page of pages) {
    const response = await request(page.path);
    assert.equal(response.status, 200, page.path);
    assert.match(response.headers['Content-Type'], /text\/html/);
    assert.ok(response.body.includes(page.heading));
  }
});
test('les URL sans barre finale redirigent vers les pages parents', async () => {
  const response = await request('/parents');
  assert.equal(response.status, 308);
  assert.equal(response.headers.Location, '/parents/');
});
test('les ressources de référencement et le CSS parents sont servis', async () => {
  for (const path of ['/parents.css', '/robots.txt', '/sitemap.xml']) assert.equal((await request(path)).status, 200, path);
  assert.equal((await request('/parents/', 'HEAD')).body, '');
});
test('une page inconnue ne retourne pas la page de jeu avec un statut 200', async () => {
  const response = await request('/parents/page-inconnue/');
  assert.equal(response.status, 404);
  assert.ok(response.body.includes('noindex,follow'));
});
