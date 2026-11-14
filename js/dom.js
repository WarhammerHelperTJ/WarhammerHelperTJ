// h(tag, props, ...children): props keys "class", "on<event>" (function), "style" (object) or attributes/properties.
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k in el && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : String(c));
  }
  return el;
}

// Bottom sheet with verbatim rules text. Returns close().
export function openSheet(title, text) {
  const prev = document.activeElement;
  const close = () => {
    removeEventListener('keydown', onKey);
    backdrop.remove();
    prev?.focus?.();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const closeBtn = h('button', { class: 'btn', type: 'button', 'aria-label': 'Close', onclick: close }, '✕');
  const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sheet-title' },
    h('header', null, h('h2', { id: 'sheet-title' }, title), closeBtn),
    h('p', { class: 'sheet-text' }, text));
  const backdrop = h('div', { class: 'sheet-backdrop', onclick: (e) => { if (e.target === backdrop) close(); } }, sheet);
  addEventListener('keydown', onKey);
  document.body.append(backdrop);
  closeBtn.focus();
  return close;
}
