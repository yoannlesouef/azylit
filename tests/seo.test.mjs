import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pages, faq, updated } from '../content/parents.mjs';
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
  const html = files.get('questions/index.html');
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

test('la page enseignants est indexable, distingue le prévu du livré et préserve le parcours enfant', async()=>{
 const html=files.get('enseignants/index.html');assert.ok(html);
 assert.ok(html.includes('POUR LES ENSEIGNANTS'));
 assert.ok(html.includes('pas encore disponibles'));
 assert.ok(html.includes('Un seul profil est actuellement stocké par navigateur'));
 assert.ok(html.includes('sans compte enseignant'));
 assert.ok(html.includes('sans attendre une validation adulte'));
 assert.ok(files.get('sitemap.xml').includes('https://www.azyl.it/enseignants/'));
 for(const page of pages) assert.ok(files.get(page.path.slice(1)+'index.html').includes('href="/enseignants/"'));
 const graph=schema(html)['@graph'];
 const crumbs=graph.find(item=>item['@type']==='BreadcrumbList').itemListElement;
 assert.deepEqual(crumbs.map(item=>item.item),['https://www.azyl.it/','https://www.azyl.it/enseignants/']);
 const questions=graph.find(item=>item['@type']==='FAQPage').mainEntity;
 assert.equal(questions.length,3);
 for(const item of questions){assert.ok(html.includes(item.name));assert.ok(html.includes(item.acceptedAnswer.text));}
 const app=await readFile(new URL('../app/app.js',import.meta.url),'utf8');
 assert.ok(files.get('index.html').includes('href="/enseignants/"'));
 assert.ok(files.get('index.html').includes('class="adult-header-links"'));
 assert.ok(app.includes('const adultLinks = isHome ?'));
});

test('navigation adulte ordonnée et URLs canoniques communes à la racine',()=>{
 assert.deepEqual(pages.map(page=>page.path),['/parents/','/enseignants/','/ulis/','/aesh/','/demarche/','/accessibilite/','/donnees/','/questions/']);
 const html=files.get('parents/index.html');
 const navigation=html.match(/<nav class="parent-nav"[^>]*>([^]*?)<\/nav>/)[1];
 assert.ok(navigation.indexOf('/parents/')<navigation.indexOf('/enseignants/'));
 assert.ok(navigation.indexOf('/enseignants/')<navigation.indexOf('/demarche/'));
 for(const name of ['demarche','accessibilite','donnees','questions']){
  const page=files.get(name+'/index.html');
  assert.ok(page.includes(`rel="canonical" href="https://www.azyl.it/${name}/"`));
  assert.ok(!files.get('sitemap.xml').includes('/parents/'+name));
  assert.ok(files.get('_redirects').includes(`/parents/${name}/ /${name}/ 301`));
  const crumbs=schema(page)['@graph'].find(item=>item['@type']==='BreadcrumbList').itemListElement;
  assert.deepEqual(crumbs.map(item=>item.item),['https://www.azyl.it/','https://www.azyl.it/'+name+'/']);
 }
});

test('chaque page publie une image de partage réelle et une date cohérente',async()=>{
 const png=await readFile(new URL('../app/social-card.png',import.meta.url));
 assert.equal(png.subarray(1,4).toString(),'PNG');
 assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
 for(const [path,html] of files){
  if(!path.endsWith('.html') || path==='404.html')continue;
  assert.ok(html.includes('property="og:image" content="https://www.azyl.it/social-card.png"'));
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  assert.ok(html.includes('property="og:image:alt"'));
  const page=schema(html)['@graph'].find(item=>['WebPage','FAQPage'].includes(item['@type']));
  assert.equal(page.dateModified,updated);
 }
 assert.equal((files.get('sitemap.xml').match(new RegExp('<lastmod>'+updated+'<\\/lastmod>','g'))||[]).length,pages.length+1);
});

test('prévisualisations Cloudflare : noindex automatique, en-tête et sitemap cohérents',()=>{
 const config=publicConfig({CF_PAGES_BRANCH:'preview-seo',INDEXABLE:'true'});
 assert.equal(config.indexable,false);
 const preview=publicFiles(template,config);
 assert.ok(preview.get('_headers').includes('X-Robots-Tag: noindex, follow'));
 assert.ok(!preview.get('sitemap.xml').includes('<loc>'));
 assert.ok(!preview.get('robots.txt').includes('Sitemap:'));
 assert.ok(preview.get('robots.txt').includes('Allow: /'));
 assert.equal(publicConfig({CF_PAGES_BRANCH:'main'}).indexable,true);
 assert.equal(publicConfig({CF_PAGES_BRANCH:'release',PRODUCTION_BRANCH:'release'}).indexable,true);
 assert.ok(!files.get('_headers').includes('noindex'));
});

test('sommaires et questions structurées ciblent des sections visibles et sourcées',()=>{
 for(const page of pages){
  const html=files.get(page.path.slice(1)+'index.html');
  assert.match(html,/class="parent-contents"/);
  const targets=[...html.matchAll(/href="#([^"]+)"/g)].map(match=>match[1]);
  for(const id of targets)assert.ok(html.includes(`id="${id}"`),id);
  const entity=schema(html)['@graph'].find(item=>item['@type']==='FAQPage');
  if(entity)for(const question of entity.mainEntity){
   const id=question['@id'].split('#')[1];assert.ok(html.includes(`id="${id}"`));
  }
  assert.match(html,/Code source et historique du projet/);
 }
 assert.ok(files.get('demarche/index.html').includes('https://www.csen.education.gouv.fr/'));
 const app=schema(files.get('index.html'))['@graph'].find(item=>item['@type']==='WebApplication');
 assert.equal(app.applicationCategory,'EducationalApplication');
 assert.equal(app.aggregateRating,undefined);assert.equal(app.offers,undefined);
});

test('les pages ULIS et AESH sont distinctes, sourcées et ne créent pas de parcours enfant supplémentaire',async()=>{
 for(const path of ['/ulis/','/aesh/']){
  const html=files.get(path.slice(1)+'index.html');assert.ok(html);
  assert.ok(html.includes(`rel="canonical" href="https://www.azyl.it${path}"`));
  assert.ok(files.get('sitemap.xml').includes('https://www.azyl.it'+path));
  assert.ok(html.includes('https://www.education.gouv.fr/'));
  assert.ok(html.includes('ne constitue') || html.includes('ne modifie pas'));
  assert.ok(html.includes('Un seul profil') || html.includes('un seul profil'));
  assert.ok(html.includes('sans compte') || html.includes('Aucun compte'));
  const entity=schema(html)['@graph'].find(item=>item['@type']==='FAQPage');assert.equal(entity.mainEntity.length,3);
  for(const item of entity.mainEntity){assert.ok(html.includes(item.name));assert.ok(html.includes(item.acceptedAnswer.text));}
 }
 for(const page of pages){const html=files.get(page.path.slice(1)+'index.html');assert.ok(html.includes('href="/ulis/"'));assert.ok(html.includes('href="/aesh/"'));assert.ok(!html.includes('undefined'));}
 assert.ok(files.get('ulis/index.html').includes('dispositifs d’appui'));
 const app=await readFile(new URL('../app/app.js',import.meta.url),'utf8');
 assert.ok(!app.includes('href="/ulis/"'));assert.ok(!app.includes('href="/aesh/"'));
});
