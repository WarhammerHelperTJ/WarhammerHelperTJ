// Boot + hash router: #/<view> lazy-imports js/ui/<view>.js and calls render(root).
const VIEWS = ['army', 'game', 'attack'];
const root = document.getElementById('view');

async function route() {
  const name = location.hash.slice(2).split('/')[0];
  if (name === 'strats') { location.replace('#/game'); return; } // stratagems moved into the Game view
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

addEventListener('hashchange', route);
route();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
