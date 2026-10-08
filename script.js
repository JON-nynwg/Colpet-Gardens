/* Colpet Gardens — interactions. Links and numbers come from site-config.js */
(() => {
  const C = window.COLPET || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- wire up social + map links from site-config.js ---------- */
  $$('[data-social]').forEach(a => { a.href = (C.social || {})[a.dataset.social] || '#'; });
  $$('[data-map]').forEach(a => { a.href = (C.maps || {})[a.dataset.map] || '#'; });
  const frame = $('#mapFrame');
  if (frame && C.maps && C.maps.embed) frame.src = C.maps.embed;
  $('#year').textContent = new Date().getFullYear();

  /* ---------- intro curtain ---------- */
  const curtain = $('#curtain');
  document.body.classList.add('locked');
  const open = () => { curtain.classList.add('done'); document.body.classList.remove('locked'); setTimeout(() => $('.split')?.classList.add('in'), 200); };
  setTimeout(open, matchMedia('(prefers-reduced-motion:reduce)').matches ? 0 : 1700);

  /* ---------- split headline into animated words ---------- */
  $$('.split').forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t => {
            if (!t.trim()) { frag.append(t); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.textContent = t; s.style.setProperty('--i', i++);
            w.append(s); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el, i) => { el.style.setProperty('--d', (i % 4) * .08 + 's'); io.observe(el); });

  /* ---------- header, progress, parallax, active nav ---------- */
  const header = $('#header'), bar = $('#progress');
  const par = $$('[data-parallax]'), bgs = $$('[data-parallax-bg]');
  const links = $$('nav a[data-n]');
  const secs = links.map(a => $(a.getAttribute('href')));
  let ticking = false;
  const frameUpdate = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 60);
    bar.style.width = (y / h * 100) + '%';
    const vh = innerHeight;
    par.forEach(el => { const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; el.style.transform = `translateY(${(r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)}px)`; });
    bgs.forEach(el => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; el.style.transform = `translateY(${(r.top + r.height / 2 - vh / 2) * -.12}px)`; });
    let cur = -1; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < vh * .4) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frameUpdate); } }, { passive: true });
  addEventListener('resize', frameUpdate);
  frameUpdate();

  /* ---------- cursor glow ---------- */
  const glow = $('#glow');
  addEventListener('pointermove', e => { glow.style.opacity = 1; glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, { passive: true });

  /* ---------- mobile menu ---------- */
  const menu = $('#menu'), nav = $('#nav');
  const setMenu = o => { nav.classList.toggle('open', o); menu.setAttribute('aria-expanded', o); document.body.classList.toggle('locked', o); };
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- experience panels ---------- */
  const panels = $$('.panel');
  const activate = p => panels.forEach(x => x.classList.toggle('active', x === p));
  panels.forEach(p => {
    p.addEventListener('mouseenter', () => matchMedia('(hover:hover)').matches && activate(p));
    p.addEventListener('click', () => activate(p));
    p.addEventListener('focus', () => activate(p));
  });

  /* ---------- gallery ---------- */
  const photos = [
    { n: 2, c: 'pool', t: 'The resort from above', r: '1280/1033' },
    { n: 1, c: 'rooms', t: 'Where the day ends softly', r: '3/2' },
    { n: 22, c: 'pool', t: 'An afternoon, unhurried', r: '3/2' },
    { n: 15, c: 'dining', t: 'The dining room', r: '4/3' },
    { n: 10, c: 'pool', t: 'Fountains after dark', r: '1354/1020' },
    { n: 9, c: 'dining', t: 'The bar, aglow', r: '3/2' },
    { n: 12, c: 'rooms', t: 'A room made for rest', r: '4/3' },
    { n: 21, c: 'dining', t: 'Where the meal begins', r: '3/2' },
    { n: 11, c: 'pool', t: 'Blue hour', r: '3/2' },
    { n: 13, c: 'rooms', t: 'Light, linen, quiet', r: '1800/1296' },
    { n: 18, c: 'rooms', t: 'Every detail, considered', r: '3/2' },
    { n: 19, c: 'pool', t: 'The pool, lit for the night', r: '3/2' },
    { n: 20, c: 'dining', t: 'The faces of Colpet', r: '4/3' },
    { n: 23, c: 'rooms', t: 'A canopy of calm', r: '3/2' },
    { n: 3, c: 'pool', t: 'You have arrived', r: '16/9' }
  ];
  let filter = 'all', expanded = false, current = 0, list = photos;
  const grid = $('#photos'), more = $('#more'), box = $('#lightbox');
  const src = p => `assets/photo-${String(p.n).padStart(2, '0')}.webp`;

  function render() {
    list = photos.filter(p => filter === 'all' || p.c === filter);
    grid.replaceChildren();
    (expanded ? list : list.slice(0, 6)).forEach((p, i) => {
      const b = document.createElement('button');
      b.style.animationDelay = i * .06 + 's';
      b.innerHTML = `<img src="${src(p)}" alt="${p.t}" loading="lazy" style="--r:${p.r}"><span>${p.t}</span>`;
      b.setAttribute('aria-label', `Enlarge photo: ${p.t}`);
      b.addEventListener('click', () => { current = list.indexOf(p); show(); box.showModal(); });
      grid.append(b);
    });
    more.hidden = expanded || list.length <= 6;
  }
  function show() {
    const p = list[current];
    $('#full-photo').src = src(p); $('#full-photo').alt = p.t; $('#caption').textContent = p.t;
  }
  const step = d => { current = (current + d + list.length) % list.length; show(); };

  $$('[data-filter]').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.filter; expanded = false;
    $$('[data-filter]').forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b); });
    render();
  }));
  more.addEventListener('click', () => { expanded = true; render(); });
  $('#close').onclick = () => box.close();
  $('#prev').onclick = () => step(-1);
  $('#next').onclick = () => step(1);
  box.addEventListener('keydown', e => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  box.addEventListener('click', e => { if (e.target === box) box.close(); });
  render();

  /* ---------- "plan" links pre-select the reservation topic ---------- */
  const sel = $('#interest');
  $$('[data-interest]').forEach(a => a.addEventListener('click', () => {
    const v = a.dataset.interest;
    const opt = [...sel.options].find(o => o.text === v);
    if (opt) sel.value = opt.value;
  }));

  /* ---------- reservation form -> WhatsApp (no server needed) ---------- */
  $('#reserveForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, v = n => f.elements[n].value.trim();
    const nameField = f.elements.name;
    nameField.classList.toggle('bad', !v('name'));
    if (!v('name')) { nameField.focus(); return; }
    const when = v('date') ? new Date(v('date') + 'T12:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'flexible';
    const msg = [
      'Hello Colpet Gardens,',
      `My name is ${v('name')}.`,
      `I am planning: ${v('interest')}.`,
      `Preferred date: ${when}.`,
      v('guests') ? `Guests: ${v('guests')}.` : '',
      v('note') ? `Notes: ${v('note')}` : '',
      'Could you share availability and rates? Thank you.'
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${C.whatsapp || '254727748123'}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
  $('#reserveForm').elements.name.addEventListener('input', e => e.target.classList.remove('bad'));
  $('#reserveForm').elements.date.min = new Date().toISOString().slice(0, 10);
})();
