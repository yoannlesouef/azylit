import { pages, faq, updated } from '../content/parents.mjs';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const serialize = value => JSON.stringify(value).replace(/</g, '\\u003c');
export function publicConfig(env = process.env) {
  const origin = new URL(env.SITE_URL || 'https://www.azyl.it');
  if (!['http:', 'https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('SITE_URL doit être une origine HTTP(S), sans chemin ni identifiants.');
  return { origin: origin.origin, indexable: env.INDEXABLE !== 'false' };
}
export function metadata({ title, description, path = '/', heading, faq: questions }, config) {
  const url = config.origin + path;
  const website = { '@type':'WebSite', '@id': config.origin + '/#website', name:'Azyl.it', url:config.origin + '/', inLanguage:'fr-FR', description:'Jeux de lecture en français, à son rythme, avec un compagnon illustré.' };
  const page = { '@type': questions ? 'FAQPage' : 'WebPage', '@id': url + '#page', url, name: heading || title, description, inLanguage:'fr-FR', isPartOf:{ '@id': website['@id'] } };
  if (questions) page.mainEntity = questions.map(item => ({ '@type':'Question', name:item.question, acceptedAnswer:{ '@type':'Answer', text:item.answer } }));
  const graph = [website, page];
  if (path !== '/') {
    const trail = [{ '@type':'ListItem', position:1, name:'Accueil', item:config.origin + '/' }, { '@type':'ListItem', position:2, name:'Pour les parents', item:config.origin + '/parents/' }];
    if (!path.startsWith('/parents/')) trail.splice(1,1);
    if (path !== '/parents/') trail.push({ '@type':'ListItem', position:trail.length+1, name:heading, item:url });
    graph.push({ '@type':'BreadcrumbList', '@id':url + '#breadcrumb', itemListElement:trail });
    page.breadcrumb = { '@id': url + '#breadcrumb' };
  }
  return `<title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  <meta name="robots" content="${config.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow'}">
  <link rel="canonical" href="${escape(url)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Azyl.it">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${escape(url)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escape(title)}">
  <meta name="twitter:description" content="${escape(description)}">
  <script type="application/ld+json">${serialize({ '@context':'https://schema.org', '@graph':graph })}</script>`;
}
const labels = ['Pour les parents','Notre démarche','Accessibilité','Données','Questions','Enseignants'];
function parentHTML(page, config) {
  const navigation = pages.map((item, i) => `<a href="${item.path}" ${item.path === page.path ? 'aria-current="page"' : ''}>${labels[i]}</a>`).join('');
  const sections = page.sections.map((section, index) => `<section id="section-${index + 1}" aria-labelledby="heading-${index + 1}"><h2 id="heading-${index + 1}">${escape(section.heading)}</h2>${(section.paragraphs || []).map(p => `<p>${escape(p)}</p>`).join('')}${section.list ? `<ul>${section.list.map(item => `<li>${escape(item)}</li>`).join('')}</ul>` : ''}${section.links ? `<ul>${section.links.map(link=>`<li><a href="${escape(link.href)}">${escape(link.label)}</a></li>`).join('')}</ul>` : ''}</section>`).join('\n');
  const answers = page.faq ? `<div class="parent-answers">${page.faq.map((item, index) => `<section id="question-${index + 1}"><h2>${escape(item.question)}</h2><p>${escape(item.answer)}</p></section>`).join('')}</div>` : '';
  return `<!doctype html>
<html lang="fr-FR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#17685b">
${metadata(page, config)}
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/parents.css"></head>
<body><a class="skip" href="#main">Aller au contenu</a><header class="parent-header"><a class="parent-brand" href="/" aria-label="Azyl.it, retourner au jeu">azyl<span>.it</span></a><a class="parent-play" href="/">Retour au jeu <span aria-hidden="true">▶</span></a></header><nav class="parent-nav" aria-label="Informations pour les parents">${navigation}</nav>
<main id="main"><div class="parent-eyebrow">${escape(page.audience || 'POUR LES PARENTS')}</div><h1>${escape(page.heading)}</h1><p class="parent-lead">${escape(page.intro)}</p><p class="parent-updated">Projet Azyl.it · Mise à jour le <time datetime="${updated}">17 novembre 2026</time></p>${sections}${answers}<aside class="parent-more" aria-label="À lire aussi"><h2>Pour aller plus loin</h2><div>${pages.filter(item => item.path !== page.path).map(item => `<a href="${item.path}">${labels[pages.indexOf(item)]}<span aria-hidden="true">↗</span></a>`).join('')}</div></aside></main><footer class="parent-footer"><a href="/">Ouvrir les jeux de lecture</a><span>Azyl.it · Apprendre à lire, chacun à son rythme.</span></footer></body></html>`;
}
export function publicFiles(homeTemplate, config = publicConfig()) {
  const files = new Map();
  const home = { title:'Apprendre à lire : lettres, syllabes et jeux | Azyl.it', description:'Des jeux de lecture en français : lettres, sons et syllabes, compagnons illustrés et petites missions. Découvrez aussi la démarche dans l’espace parents.', path:'/' };
  files.set('index.html', homeTemplate.replace(/<!-- public-meta:start -->[\s\S]*?<!-- public-meta:end -->/, `<!-- public-meta:start -->\n${metadata(home,config)}\n<!-- public-meta:end -->`));
  for (const page of pages) files.set(page.path.slice(1) + 'index.html', parentHTML(page,config));
  files.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...pages.map(p => p.path)].map(path => `<url><loc>${escape(config.origin + path)}</loc></url>`).join('')}</urlset>\n`);
  files.set('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${config.origin}/sitemap.xml\n`);
  files.set('404.html', '<!doctype html><html lang="fr-FR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Page introuvable | Azyl.it</title><link rel="stylesheet" href="/parents.css"></head><body><main><h1>Cette page est introuvable.</h1><p><a href="/">Retour au jeu</a> · <a href="/parents/">Pour les parents</a></p></main></body></html>');
  return files;
}
