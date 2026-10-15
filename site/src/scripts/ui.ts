import { boundedStep, transitionMotion, type MotionState } from '../lib/motion';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const preference = document.querySelector<HTMLSelectElement>('#motion-preference');
let selectedMotion = 'full';
try {
  const stored = JSON.parse(localStorage.getItem('seven-steps-motion') ?? 'null');
  if (stored && stored.expires > Date.now() && ['full', 'still'].includes(stored.value)) selectedMotion = stored.value;
} catch { /* The setting also works without browser storage. */ }
function applyMotion() {
  document.documentElement.dataset.motion = reduced.matches ? 'still' : selectedMotion;
  if (preference) preference.value = selectedMotion;
  const note = document.querySelector('[data-motion-note]');
  if (note) note.textContent = reduced.matches ? 'Your device requests reduced motion. Movement is off.' : selectedMotion === 'still' ? 'Movement is off.' : 'Motion controls are available. Galleries start paused.';
  document.dispatchEvent(new Event('motion-preference-change'));
}
document.querySelector<HTMLElement>('[data-motion-preference]')?.removeAttribute('hidden');
preference?.addEventListener('change', () => {
  selectedMotion = preference.value;
  try { localStorage.setItem('seven-steps-motion', JSON.stringify({ value: selectedMotion, expires: Date.now() + 30 * 86400000 })); } catch { /* Keep the in-memory choice. */ }
  applyMotion();
});
reduced.addEventListener('change', applyMotion);
applyMotion();
const isStill = () => document.documentElement.dataset.motion === 'still';

const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('#mobile-menu');
if (menuButton && menu) {
  const compact = window.matchMedia('(max-width: 720px)');
  document.documentElement.classList.add('js-menu');
  const close = (restore = false) => {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    if (restore) menuButton.focus();
  };
  const resize = () => {
    const active = document.activeElement;
    const desktop = document.querySelector('.desktop-nav');
    const disappearingMobile = !compact.matches && (active === menuButton || menu.contains(active));
    const disappearingDesktop = compact.matches && desktop?.contains(active);
    const href = active instanceof HTMLAnchorElement ? active.getAttribute('href') : null;
    menuButton.hidden = !compact.matches;
    close();
    if (disappearingDesktop) menuButton.focus();
    if (disappearingMobile) {
      const equivalent = Array.from(desktop?.querySelectorAll<HTMLAnchorElement>('a') ?? []).find(a => a.getAttribute('href') === href);
      (equivalent ?? desktop?.querySelector<HTMLAnchorElement>('a'))?.focus();
    }
  };
  resize();
  compact.addEventListener('change', resize);
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', event => { if ((event.target as Element).closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) close(true); });
  document.addEventListener('click', event => { if (!menu.hidden && !menu.contains(event.target as Node) && !menuButton.contains(event.target as Node)) close(); });
  document.addEventListener('focusin', event => { if (!menu.hidden && !menu.contains(event.target as Node) && !menuButton.contains(event.target as Node)) close(); });
}

// Review forms have no endpoint, field names or persistent state.
document.querySelector<HTMLFormElement>('[data-enquiry-form]')?.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('[data-form-message]')?.removeAttribute('hidden');
});

const dialog = document.querySelector<HTMLDialogElement>('[data-viewer]');
const triggers = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-viewer-trigger]'));
if (dialog && typeof dialog.showModal === 'function' && triggers.length) {
  const previous = dialog.querySelector<HTMLButtonElement>('[data-viewer-prev]')!;
  const next = dialog.querySelector<HTMLButtonElement>('[data-viewer-next]')!;
  const stage = dialog.querySelector<HTMLElement>('[data-viewer-stage]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-viewer-caption]')!;
  const position = dialog.querySelector<HTMLElement>('[data-viewer-position]')!;
  let index = 0;
  let opener: HTMLElement | null = null;
  function display(value: number) {
    index = Math.max(0, Math.min(triggers.length - 1, value));
    const source = triggers[index];
    const frame = source.querySelector('.photo-space')!.cloneNode(true);
    stage.replaceChildren(frame);
    caption.textContent = source.dataset.frameLabel ?? `Photograph ${index + 1}`;
    position.textContent = `${index + 1} / ${triggers.length}`;
    previous.disabled = index === 0;
    next.disabled = index === triggers.length - 1;
  }
  triggers.forEach((trigger, number) => trigger.addEventListener('click', event => {
    // Keep modified clicks as ordinary links.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = trigger;
    display(number);
    document.dispatchEvent(new Event('viewer-open'));
    dialog.showModal();
    document.body.classList.add('modal-open');
    dialog.querySelector<HTMLButtonElement>('[data-viewer-close]')?.focus();
  }));
  dialog.querySelector('[data-viewer-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    opener?.focus({ preventScroll: true });
  });
  previous.addEventListener('click', () => display(index - 1));
  next.addEventListener('click', () => display(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), [tabindex="0"]'));
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      display(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let start: { x: number; y: number } | null = null;
  stage.addEventListener('touchstart', event => { start = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }, { passive: true });
  stage.addEventListener('touchmove', event => { if (event.touches.length !== 1) start = null; }, { passive: true });
  stage.addEventListener('touchcancel', () => { start = null; }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!start || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    start = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) display(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
}

document.querySelectorAll<HTMLElement>('[data-motion-demo]').forEach(demo => {
  demo.closest('[data-enhanced-only]')?.removeAttribute('hidden');
  const viewport = demo.querySelector<HTMLElement>('[data-motion-window]')!;
  const track = demo.querySelector<HTMLElement>('[data-motion-track]')!;
  const play = demo.querySelector<HTMLButtonElement>('[data-motion-play]')!;
  const reset = demo.querySelector<HTMLButtonElement>('[data-motion-reset]')!;
  const axis = demo.querySelector<HTMLSelectElement>('[data-motion-axis]')!;
  const direction = demo.querySelector<HTMLSelectElement>('[data-motion-direction]')!;
  const speed = demo.querySelector<HTMLSelectElement>('[data-motion-speed]')!;
  const status = demo.querySelector<HTMLElement>('[data-motion-status]')!;
  let state: MotionState = { playing: false, position: 0 };
  let frame = 0;
  let lastTime = 0;
  let limit = 0;
  let inView = false;
  function viewportVisible() {
    const box = viewport.getBoundingClientRect();
    const width = Math.max(0, Math.min(box.right, innerWidth) - Math.max(box.left, 0));
    const height = Math.max(0, Math.min(box.bottom, innerHeight) - Math.max(box.top, 0));
    return box.width > 0 && box.height > 0 && width * height / (box.width * box.height) >= .15;
  }
  function draw() { track.style.transform = `translate${axis.value === 'horizontal' ? 'X' : 'Y'}(${-state.position}px)`; }
  function stop(message = 'Paused. Choose Play to continue.') {
    state = transitionMotion(state, 'pause');
    cancelAnimationFrame(frame);
    play.textContent = 'Play';
    play.setAttribute('aria-pressed', 'false');
    status.textContent = message;
    track.style.willChange = 'auto';
  }
  function measure() {
    limit = Math.max(0, axis.value === 'horizontal' ? track.scrollWidth - viewport.clientWidth : track.scrollHeight - viewport.clientHeight);
    state.position = boundedStep(state.position, 0, limit);
    draw();
  }
  function tick(time: number) {
    if (!state.playing) return;
    const elapsed = Math.min(100, time - lastTime) / 1000;
    lastTime = time;
    const pace = (axis.value === 'horizontal' ? 16 : 10) * (speed.value === 'slow' ? .5 : 1);
    state.position = boundedStep(state.position, elapsed * pace * (direction.value === 'forward' ? 1 : -1), limit);
    draw();
    if ((direction.value === 'forward' && state.position >= limit) || (direction.value === 'backward' && state.position <= 0)) stop('Pass complete. Choose Play to start another pass.');
    else frame = requestAnimationFrame(tick);
  }
  play.addEventListener('click', () => {
    if (state.playing) { stop(); return; }
    // A keyboard action may arrive before the observer delivers a scroll update.
    inView = viewportVisible();
    const allowed = !isStill() && !document.hidden && inView && !dialog?.open;
    state = transitionMotion(state, 'play', allowed);
    if (!state.playing) { stop(!inView ? 'Bring the gallery into view to play.' : 'Movement is off. Choose Full motion or check your device setting.'); return; }
    measure();
    if (direction.value === 'forward' && state.position >= limit) state.position = 0;
    if (direction.value === 'backward' && state.position <= 0) state.position = limit;
    draw();
    play.textContent = 'Pause';
    play.setAttribute('aria-pressed', 'true');
    status.textContent = 'Playing one pass. Pause whenever you like.';
    track.style.willChange = 'transform';
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  });
  reset.addEventListener('click', () => { stop('Stopped at the first frame.'); state = transitionMotion(state, 'reset'); draw(); });
  axis.addEventListener('change', () => { stop('Layout changed. Choose Play when you are ready.'); demo.dataset.axis = axis.value; state.position = 0; measure(); });
  direction.addEventListener('change', () => stop('Direction changed. Choose Play to continue.'));
  speed.addEventListener('change', () => stop('Speed changed. Choose Play to continue.'));
  viewport.addEventListener('pointerenter', () => { if (state.playing) stop(); });
  viewport.addEventListener('pointerdown', () => { if (state.playing) stop(); });
  demo.addEventListener('focusin', event => { if (event.target !== play && state.playing) stop(); });
  demo.querySelectorAll('button, select').forEach(control => control.addEventListener('pointerenter', () => { if (control !== play && state.playing) stop(); }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', () => stop());
  document.addEventListener('viewer-open', () => stop());
  document.addEventListener('motion-preference-change', () => {
    if (isStill()) stop('Still mode. The gallery stays in place.');
    play.disabled = isStill();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(() => { inView = viewportVisible(); if (!inView) stop(); }, { threshold: .15 }).observe(viewport);
  } else inView = true;
  new ResizeObserver(() => { stop('Layout updated. Choose Play when you are ready.'); measure(); }).observe(viewport);
  play.disabled = isStill();
  if (isStill()) stop('Still mode. The gallery stays in place.');
  measure();
});

const search = document.querySelector<HTMLInputElement>('#slot-search');
const section = document.querySelector<HTMLSelectElement>('#slot-section');
if (search && section) {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-slot-item]'));
  const count = document.querySelector<HTMLElement>('[data-checklist-count]')!;
  document.querySelector('[data-checklist-controls]')?.removeAttribute('hidden');
  function filter() {
    const query = search!.value.trim().toLocaleLowerCase();
    let visible = 0;
    items.forEach(item => {
      item.hidden = !(item.textContent?.toLocaleLowerCase().includes(query) && (section!.value === 'all' || item.dataset.slotSection === section!.value));
      if (!item.hidden) visible++;
    });
    count.textContent = `Showing ${visible} of ${items.length} content groups.`;
    document.querySelector<HTMLElement>('[data-checklist-empty]')!.hidden = visible !== 0;
  }
  search.addEventListener('input', filter);
  section.addEventListener('change', filter);
  const clear = () => { search.value = ''; section.value = 'all'; filter(); };
  document.querySelector('[data-checklist-reset]')?.addEventListener('click', () => { clear(); search.focus(); });
  window.addEventListener('hashchange', () => {
    clear();
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    target?.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
}

function revealContentNote() {
  let id = '';
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  if (!id.startsWith('content-')) return;
  const note = document.getElementById(id);
  const disclosure = note?.closest('details');
  if (disclosure) disclosure.open = true;
  note?.scrollIntoView({ behavior: 'auto', block: 'center' });
}
revealContentNote();
window.addEventListener('hashchange', revealContentNote);
