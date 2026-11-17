// Browser history stores navigation only; saved learning results are never rewound.
export function createNavigationHistory(browser, restore) {
  if (!browser.history?.pushState || !browser.addEventListener) return {sync(){},back(){return false;}};
  let current = null, restoring = false;
  const session = String(Date.now()) + Math.random();
  browser.addEventListener('popstate', event => {
    const entry = event.state?.azylNavigation;
    if (!entry || entry.session !== session) return;
    current = entry;
    restoring = true;
    try { restore(structuredClone(entry.snapshot)); } finally { restoring = false; }
  });
  return {
    sync(key,snapshot) {
      const same = current?.key === key;
      const entry = {session,key,snapshot:structuredClone(snapshot),depth:current ? current.depth + (same || restoring ? 0 : 1) : 0};
      if (!current || same || restoring) browser.history.replaceState({azylNavigation:entry},'');
      else browser.history.pushState({azylNavigation:entry},'');
      current=entry;
    },
    back() { if (!current?.depth) return false; browser.history.back(); return true; }
  };
}
