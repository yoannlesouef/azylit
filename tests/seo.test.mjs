import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pages, faq } from '../content/parents.mjs';
import { publicConfig, publicFiles } from '../scripts/public-pages.mjs';
const template = await readFile(new URL('../app/index.html', import.meta.url), 'utf8');
const config = publicConfig({});
const files = publicFiles(template, config);
const schema = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

test('chaque page parents est complète et explorable sans exécuter JavaScript', () => {
  const titles = new Set();
  for (const page of pages) {
    const html = files.get(page.path.slice(1) + 'index.html');
    assert.ok(html.includes(page.heading));
    assert.ok(html.includes(page.intro));
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
    assert.ok(!/<script[^>]+src=/.test(html));
    assert.ok(!html.includes('src="/app.js"'));
    assert.ok(html.includes(`<link rel="canonical" href="https://www.azyl.it${page.path}">`));
    assert.ok(html.includes('content="index,follow,max-image-preview:large"'));
    assert.ok(html.includes('href="/"'));
    titles.add(html.match(/<title>(.*?)<\/title>/)[1]);
    const graph = schema(html)['@graph'];
    assert.ok(graph.some(item => item['@type'] === 'BreadcrumbList'));
    for (const section of page.sections) for (const paragraph of section.paragraphs || []) assert.ok(html.includes(paragraph.replaceAll('&', '&amp;')));
  }
  assert.equal(titles.size, pages.length);
});

test('les questions structurées correspondent exactement aux réponses visibles', () => {
  const html = files.get('parents/questions/index.html');
  const graph = schema(html)['@graph'];
  const entity = graph.find(item => item['@type'] === 'FAQPage');
  assert.equal(entity.mainEntity.length, faq.length);
  for (const [index, item] of faq.entries()) {
    assert.equal(entity.mainEntity[index].name, item.question);
    assert.equal(entity.mainEntity[index].acceptedAnswer.text, item.answer);
    assert.ok(html.includes(`<h2>${item.question}</h2>`));
    assert.ok(html.includes(`<p>${item.answer}</p>`));
  }
});

test('le sitemap et les liens internes pointent vers des pages existantes', () => {
  const locations = [...files.get('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(locations.length, pages.length + 1);
  const available = new Set(['/', ...pages.map(page => page.path)]);
  for (const url of locations) assert.ok(available.has(new URL(url).pathname));
  for (const page of pages) {
    const html = files.get(page.path.slice(1) + 'index.html');
    const links = [...html.matchAll(/href="(\/[^"#]*\/)"/g)].map(match => match[1]);
    for (const link of links) assert.ok(available.has(link), `Lien manquant : ${link}`);
  }
  assert.ok(files.get('robots.txt').includes('Sitemap: https://www.azyl.it/sitemap.xml'));
  assert.ok(!files.get('sitemap.xml').includes('404.html'));
});

test('l’aperçu peut être désindexé sans modifier les contenus de production', () => {
  const preview = publicFiles(template, publicConfig({ SITE_URL:'https://preview.example.org', INDEXABLE:'false' }));
  for (const [path, html] of preview) {
    if (path.endsWith('.html')) assert.ok(html.includes('noindex,follow'));
    if (path.endsWith('.html') && path !== '404.html') assert.ok(!html.includes('https://www.azyl.it'));
  }
  assert.throws(() => publicConfig({ SITE_URL:'https://example.org/un-chemin' }));
  assert.throws(() => publicConfig({ SITE_URL:'javascript:alert(1)' }));
});

test('l’accueil expose un vrai lien parents sans placer leurs contenus dans le jeu', () => {
  const html = files.get('index.html');
  assert.ok(html.includes('href="/parents/"'));
  assert.ok(html.includes('class="parents-top-link"'));
  assert.ok(!html.includes('class="parents-entry"'));
  assert.ok(!html.includes('Pourquoi les exercices se ressemblent-ils ?'));
  assert.equal(schema(html)['@graph'][0]['@type'], 'WebSite');
});
