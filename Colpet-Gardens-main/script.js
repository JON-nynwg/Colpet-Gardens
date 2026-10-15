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
  const open = () => { curtain.classList.add('done'); document.body.classList.remove('locked'); setTimeout(() => $('.split')?.classList.add('in'), 200); heroStart(); };
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

  /* ---------- hero slideshow ----------
     Slides are the <img class="hero-slide"> tags in #heroSlides (index.html).
     Seconds per slide come from heroSlideMs in site-config.js (default 4000). */
  const heroStart = (() => {
    const wrap = $('#heroSlides'), box = $('#heroDots'), hero = $('#home');
    const slides = wrap ? $$('.hero-slide', wrap) : [];
    if (slides.length < 2 || !box) { if (box) box.hidden = true; return () => {}; }

    const ms = Math.max(1500, Number(C.heroSlideMs) || 4000);
    hero.style.setProperty('--slide-ms', ms + 'ms');

    let cur = 0, timer = 0, started = false, inView = true;
    let userPaused = matchMedia('(prefers-reduced-motion:reduce)').matches; // no autoplay for reduced motion
    const running = () => started && !userPaused && inView && !document.hidden;

    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'hero-dot';
      b.setAttribute('aria-label', `Show photo ${i + 1} of ${slides.length}`);
      b.addEventListener('click', () => go(i));
      box.append(b); return b;
    });
    const pause = document.createElement('button');
    pause.type = 'button'; pause.className = 'hero-pause';
    const ICON = {
      pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.5v16H6zM13.500 4H18v16h-4.500z"/></svg>',
      play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>'
    };
    const paintPause = () => {
      pause.innerHTML = userPaused ? ICON.play : ICON.pause;
      pause.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
    };
    pause.addEventListener('click', () => { userPaused = !userPaused; paintPause(); sync(); });
    paintPause(); box.append(pause);

    // restart the progress bar and the countdown from zero
    function sync() {
      clearTimeout(timer);
      box.classList.toggle('paused', !running());
      dots.forEach((d, i) => { d.classList.remove('on'); i === cur ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'); });
      void box.offsetWidth;                       // let the bar animation restart
      dots[cur].classList.add('on');
      if (running()) timer = setTimeout(() => go((cur + 1) % slides.length), ms);
    }
    function go(n) {
      if (n === cur) return;
      slides.forEach(s => s.classList.remove('is-prev'));
      slides[cur].classList.replace('is-active', 'is-prev');
      slides[cur].setAttribute('aria-hidden', 'true');
      cur = n;
      slides[cur].classList.add('is-active');
      slides[cur].removeAttribute('aria-hidden');
      sync();
    }

    // don't burn battery while nobody can see it
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; sync(); }, { threshold: .15 }).observe(hero);

    sync();
    return () => { started = true; sync(); };
  })();

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

  /* ---------- four frames (gallery) ----------
     One photo at a time with tappable hotspots; the matching note opens on the right.
     Moves on by itself (seconds per frame: frameSlideMs in site-config.js) and stops
     when you hover, focus, pause, or scroll away. */
  (() => {
    const root = $('#frames');
    if (!root) return;
    const figs = $$('.frame', root), items = $$('.fl', root);
    const hud = $('#hud'), count = $('#framesCount'), pause = $('#framesPause');
    const ms = Math.max(3000, Number(C.frameSlideMs) || 8000);
    root.style.setProperty('--frame-ms', ms + 'ms');

    let cur = -1, timer = 0, inView = false, hold = false;
    let userPaused = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const running = () => !userPaused && inView && !hold && !document.hidden;

    // hotspot -> info panel
    function pick(pin) {
      $$('.pin', pin.parentElement).forEach(p => p.classList.toggle('on', p === pin));
      $('b', hud).textContent = pin.dataset.t;
      $('p', hud).textContent = pin.dataset.d;
      hud.classList.remove('swap'); void hud.offsetWidth; hud.classList.add('swap');
    }
    $$('.pin', root).forEach(pin => {
      pin.addEventListener('click', () => pick(pin));
      pin.addEventListener('focus', () => pick(pin));
      pin.addEventListener('mouseenter', () => matchMedia('(hover:hover)').matches && pick(pin));
    });

    // restart the progress line and the countdown from zero
    function sync() {
      clearTimeout(timer);
      root.classList.toggle('paused', !running());
      items.forEach(it => it.classList.remove('run'));
      void root.offsetWidth;
      if (cur >= 0) items[cur].classList.add('run');
      if (running()) timer = setTimeout(() => select((cur + 1) % figs.length), ms);
    }
    function select(i) {
      if (i === cur) return;
      cur = i;
      figs.forEach((f, k) => { f.classList.toggle('is-active', k === i); f.toggleAttribute('inert', k !== i); });
      items.forEach((it, k) => { it.classList.toggle('is-active', k === i); $('.fl-head', it).setAttribute('aria-expanded', k === i); });
      count.textContent = `0${i + 1} / 0${figs.length}`;
      pick($('.pin', figs[i]));
      sync();
    }
    items.forEach((it, k) => $('.fl-head', it).addEventListener('click', () => select(k)));

    // pause control (also keeps the page friendly to people who dislike moving content)
    const ICON = {
      pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.500v16H6zM13.500 4H18v16h-4.500z"/></svg>',
      play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>'
    };
    const paint = () => {
      pause.innerHTML = userPaused ? ICON.play : ICON.pause;
      pause.setAttribute('aria-label', userPaused ? 'Play the frames' : 'Pause the frames');
    };
    pause.addEventListener('click', () => { userPaused = !userPaused; paint(); sync(); });
    paint();

    // hold still while someone is reading or pointing at it
    root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hold = true; sync(); } });
    root.addEventListener('pointerleave', () => { hold = false; sync(); });
    root.addEventListener('focusin', () => { hold = true; sync(); });
    root.addEventListener('focusout', () => { hold = false; sync(); });
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; sync(); }, { threshold: .35 }).observe(root);
    else inView = true;

    select(0);
  })();

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
