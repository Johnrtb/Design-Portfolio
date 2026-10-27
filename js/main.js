(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Mobile menu */
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  const closeMenu = () => { nav.removeAttribute('data-open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', String(nav.toggleAttribute('data-open')));
  });
  $$('.nav__links a').forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* Nav border once scrolled, and highlight the section in view */
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = new Map($$('.nav__links a[href^="#"]').map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.removeAttribute('aria-current'));
      const a = links.get(e.target.id);
      if (a) a.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

  /* Scroll reveal */
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => reveal.observe(el));

  /* Galleries + lightbox.
     Every <a href> inside [data-gallery] is part of the viewer, in DOM order.
     Anchors with the `hidden` attribute are not shown on the page, only in the viewer. */
  const dlg = $('#lightbox');
  const img = $('.lb__img', dlg);
  const cap = $('.lb__cap', dlg);
  const count = $('.lb__count', dlg);
  let set = [];
  let idx = 0;

  function show(i) {
    idx = (i + set.length) % set.length;
    const a = set[idx];
    img.src = a.href;
    img.alt = a.dataset.caption || '';
    cap.textContent = a.dataset.caption || '';
    count.textContent = `${idx + 1} / ${set.length}`;
    new Image().src = set[(idx + 1) % set.length].href;
  }
  function open(items, i) { set = items; show(i); dlg.showModal(); }

  $$('[data-gallery]').forEach(g => {
    const items = $$('a[href]', g);
    const extra = items.filter(a => a.hidden).length;
    const thumbs = $$('.g-thumbs a', g);
    if (extra) {
      if (thumbs.length) {
        const last = thumbs[thumbs.length - 1];
        last.classList.add('g-more');
        last.dataset.more = `+${extra}`;
      } else {
        const badge = document.createElement('span');
        badge.className = 'g-badge';
        badge.textContent = `+${extra} more`;
        $('.g-main', g).append(badge);
      }
    }
    items.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); open(items, i); }));
  });

  $('.lb__prev', dlg).addEventListener('click', () => show(idx - 1));
  $('.lb__next', dlg).addEventListener('click', () => show(idx + 1));
  $('.lb__close', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.classList.contains('lb__stage')) dlg.close(); });
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  dlg.addEventListener('close', () => img.removeAttribute('src'));

  let touchX = null;
  dlg.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  });
})();
