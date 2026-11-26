const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

export function audioBrowser(userAgent = '') {
  const embedded = /FBAN|FBAV|FB_IAB|Messenger|Instagram|TikTok|musical_ly|Bytedance|\bwv\b|; wv\)/i.test(userAgent);
  return {embedded,android:/Android/i.test(userAgent),ios:/iPhone|iPad|iPod/i.test(userAgent)};
}

export function audioPageUrl(href = '') {
  try { const url=new URL(href);return ['https:','http:'].includes(url.protocol)?url.href:''; }
  catch {return '';}
}

export function chromeIntent(href) {
  const safe=audioPageUrl(href);if(!safe)return '';
  const url=new URL(safe);url.hash='';
  const target=(url.host+url.pathname+url.search).replaceAll(';','%3B');
  return `intent://${target}#Intent;scheme=${url.protocol.slice(0,-1)};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url.href)};end`;
}

export async function copyAudioLink(clipboard,href) {
  const url=audioPageUrl(href);if(!url||!clipboard?.writeText)return false;
  try {await clipboard.writeText(url);return true;} catch {return false;}
}

export function renderAudioAccess({userAgent='',href='',canSpeak=true,failed=false}={}) {
  const browser=audioBrowser(userAgent);
  if(!browser.embedded&&canSpeak&&!failed)return '';
  const url=audioPageUrl(href);
  const openHelp=browser.embedded||!canSpeak;
  const message=browser.embedded?'Pour entendre les consignes, ouvrez le site dans votre navigateur.':!canSpeak?'Ce navigateur ne permet pas de lire les consignes à voix haute.':'Le son n’a pas démarré.';
  const instructions=openHelp?'Ouvrez le menu ••• ou ⋮ de l’application, généralement en haut à droite, puis choisissez « Ouvrir dans le navigateur ». Sinon, utilisez « Copier le lien » et collez-le dans votre navigateur.':'';
  return `<aside class="audio-access" aria-label="Aide pour activer le son"><p class="audio-access-title">${message}</p>${instructions?`<p>${instructions}</p>`:''}${failed&&!openHelp?'<p>Vérifiez le volume multimédia du téléphone. Si le son reste muet, vérifiez aussi qu’une voix française est disponible dans ses réglages de synthèse vocale.</p>':''}<div class="audio-access-actions">${canSpeak?'<button data-action="retry-page-audio">'+(failed?'Réessayer le son':'Tester le son')+'</button>':''}${browser.android&&url?`<a href="${escape(chromeIntent(url))}">Ouvrir dans Chrome</a>`:''}${url?'<button class="audio-access-copy" data-action="copy-site-link">Copier le lien</button>':''}</div>${browser.android&&url?'<p class="audio-access-hint">Si Chrome ne s’ouvre pas, utilisez le menu ci-dessus ou copiez le lien.</p>':''}<p id="audio-link-status" role="status"></p>${url?`<input id="audio-link-fallback" class="audio-link-fallback" type="text" readonly hidden aria-label="Lien du site à copier" value="${escape(url)}">`:''}</aside>`;
}
