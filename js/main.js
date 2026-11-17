// Boot + hash router: #/<view> lazy-imports js/ui/<view>.js and calls render(root).
const VIEWS = ['army', 'game', 'attack'];
const root = document.getElementById('view');

async function route() {
  const name = location.hash.slice(2).split('/')[0];
  if (name === 'strats') { location.replace('#/game'); return; } // stratagems moved into the Game view
  if (name === 'import') { await importRoster(location.hash.slice('#/import/'.length)); return; }
  if (!VIEWS.includes(name)) { location.replace('#/army'); return; }
  for (const a of document.querySelectorAll('.tabbar a')) {
    if (a.getAttribute('href') === '#/' + name) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  root.replaceChildren();
  try {
    (await import(`./ui/${name}.js`)).render(root);
  } catch (e) {
    // a failed lazy import used to leave the old view on screen, so the tab looked dead
    root.textContent = `Couldn't load this screen. Check that the app is still being served, then reload. (${e.message})`;
  }
}

// "#/import/<code>" (a shared roster link): add the roster as a copy, then open it in Army.
async function importRoster(code) {
  try {
    const [{ decodeRoster }, D, R, S] = await Promise.all([import('./share.js'), import('./data.js'), import('./roster.js'), import('./store.js')]);
    const r = await decodeRoster(code);
    if (!(await D.loadFactions()).some((f) => f.id === r.faction)) throw new Error(`unknown faction "${r.faction}"`);
    const fac = await D.loadFaction(r.faction);
    r.units = r.units.filter((u) => fac.datasheets.some((d) => d.id === u.datasheetId));
    r.detachments = r.detachments.filter((id) => fac.detachments.some((d) => d.id === id));
    S.update((s) => { s.rosters.push({ ...r, id: R.uid(), name: `${r.name} (shared)` }); s.activeRosterId = s.rosters.at(-1).id; });
  } catch (e) {
    alert(`Could not open this roster link: ${e.message}`);
  }
  location.replace('#/army');
}

addEventListener('hashchange', route);
route();
if ('serviceWorker' in navigator) {
  // A new version took over (a deploy): reload once so the page shows it. Not on the very first install.
  const hadWorker = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadWorker) location.reload(); });
  navigator.serviceWorker.register('sw.js').then((reg) => {
    // a home-screen app reopened from the background does not reload by itself: look for a new version then
    addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
  }).catch(() => {});
}
