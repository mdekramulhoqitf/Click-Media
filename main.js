(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const DESKTOP = 900;

  /* ---------- Scale the 1440px hero stage + header to the viewport ---------- */
  function fitStage() {
    const w = root.clientWidth;
    const z = w >= DESKTOP ? Math.min(1, w / 1440) : 1;
    root.style.setProperty('--hz', z.toFixed(4));
  }
  fitStage();
  window.addEventListener('resize', fitStage);

  /* ---------- Header: scrolled state ---------- */
  const header = $('#siteHeader');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Desktop dropdowns + mega menu ---------- */
  const mega = $('#megaMenu');
  const scrim = $('#megaScrim');
  const megaWrap = $('[data-mega]');
  const megaBtn = $('button', megaWrap);
  let megaTimer;

  function closeAll() {
    mega.classList.remove('is-open');
    scrim.classList.remove('is-open');
    megaBtn.setAttribute('aria-expanded', 'false');
    $$('[data-dropdown]').forEach(d => { d.classList.remove('is-open'); $('button', d).setAttribute('aria-expanded', 'false'); });
  }
  function openMega() {
    clearTimeout(megaTimer);
    closeAll();
    mega.classList.add('is-open');
    scrim.classList.add('is-open');
    megaBtn.setAttribute('aria-expanded', 'true');
  }
  const closeMegaSoon = () => { megaTimer = setTimeout(closeAll, 160); };

  megaBtn.addEventListener('click', () => mega.classList.contains('is-open') ? closeAll() : openMega());
  megaWrap.addEventListener('mouseenter', openMega);
  megaWrap.addEventListener('mouseleave', closeMegaSoon);
  mega.addEventListener('mouseenter', () => clearTimeout(megaTimer));
  mega.addEventListener('mouseleave', closeMegaSoon);
  scrim.addEventListener('click', closeAll);
  $$('a', mega).forEach(a => a.addEventListener('click', closeAll));

  $$('[data-dropdown]').forEach(d => {
    const btn = $('button', d);
    const open = () => { closeAll(); d.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); };
    btn.addEventListener('click', () => d.classList.contains('is-open') ? closeAll() : open());
    d.addEventListener('mouseenter', open);
    d.addEventListener('mouseleave', () => { d.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); });
    $$('a', d).forEach(a => a.addEventListener('click', closeAll));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAll(); closeDrawer(); closeQuote(); } });

  /* ---------- Mobile drawer ---------- */
  const drawer = $('#drawer');
  function openDrawer() { drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  $('#openDrawer').addEventListener('click', openDrawer);
  $$('[data-close-drawer]').forEach(el => el.addEventListener('click', closeDrawer));
  $$('.d-acc > .d-link').forEach(btn => btn.addEventListener('click', () => btn.parentElement.classList.toggle('is-open')));

  /* ---------- Quote modal ---------- */
  const modal = $('#quoteModal');
  const form = $('#quoteForm');
  const sent = $('#quoteSent');
  function openQuote() {
    closeAll();
    form.hidden = false; sent.hidden = true;
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('input[name="name"]', form).focus({ preventScroll: true }), 250);
  }
  function closeQuote() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
    if (!drawer.classList.contains('is-open')) document.body.style.overflow = '';
  }
  $$('[data-open-quote]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openQuote(); }));
  $$('[data-close-quote]').forEach(b => b.addEventListener('click', closeQuote));

  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(inp => {
      const bad = !inp.value.trim();
      inp.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { $('.is-invalid', form).focus(); return; }
    // TODO: connect to a backend / email service. For now the request is shown as sent.
    form.hidden = true; sent.hidden = false;
    form.reset(); $('#dropTitle').textContent = 'Drop your logo, sketch or old print here';
  });
  $$('[required]', form).forEach(inp => inp.addEventListener('input', () => inp.classList.remove('is-invalid')));

  // File drop zone
  const drop = $('#dropZone');
  const fileInput = $('#fileInput');
  const showFiles = files => { if (files && files.length) $('#dropTitle').textContent = [...files].map(f => f.name).join(', '); };
  fileInput.addEventListener('change', () => showFiles(fileInput.files));
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', e => { fileInput.files = e.dataTransfer.files; showFiles(e.dataTransfer.files); });

  /* ---------- Portfolio filter + search ---------- */
  const chips = $$('#chips .chip');
  const cards = $$('#workGrid .work-card');
  const empty = $('#workEmpty');
  const search = $('#workSearch');
  let filter = 'all';
  function applyFilter() {
    const q = search ? search.value.trim().toLowerCase() : '';
    let shown = 0;
    cards.forEach(card => {
      const match = (filter === 'all' || card.dataset.cat === filter) &&
        (!q || (card.dataset.title || card.textContent.toLowerCase()).includes(q));
      card.classList.toggle('is-hidden', !match);
      if (match) shown++;
    });
    if (empty) empty.hidden = shown > 0;
  }
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.toggle('is-active', c === chip));
    filter = chip.dataset.filter;
    applyFilter();
  }));
  if (search) search.addEventListener('input', applyFilter);

  const loadMore = $('#loadMore');
  if (loadMore) loadMore.addEventListener('click', () => {
    // Only 12 projects are in the design so far; more get added here later.
    loadMore.disabled = true;
    loadMore.textContent = 'More projects coming soon';
  });

  /* ---------- Services: mobile scroller dots ---------- */
  const svcGrid = $('#svcGrid');
  const dotsEl = $('#svcDots');
  if (svcGrid && dotsEl) {
    const svcItems = [...svcGrid.children];
    dotsEl.innerHTML = svcItems.map((_, i) => `<i${i === 0 ? ' class="is-on"' : ''}></i>`).join('');
    const dots = [...dotsEl.children];
    svcGrid.addEventListener('scroll', () => {
      const step = svcItems[1].offsetLeft - svcItems[0].offsetLeft;
      const idx = Math.round(svcGrid.scrollLeft / step);
      dots.forEach((d, i) => d.classList.toggle('is-on', i === idx));
    }, { passive: true });
  }

  /* ---------- Testimonials slider ---------- */
  const track = $('#tTrack');
  if (track) {
    const tStep = () => track.firstElementChild.getBoundingClientRect().width + 20;
    $('#tNext').addEventListener('click', () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      track.scrollBy({ left: track.scrollLeft >= max ? -track.scrollWidth : tStep() });
    });
    $('#tPrev').addEventListener('click', () => track.scrollBy({ left: -tStep() }));
  }

  /* ---------- Product gallery thumbnails ---------- */
  const pMain = $('#pMain');
  $$('#pThumbs .p-thumb').forEach(btn => btn.addEventListener('click', () => {
    $$('#pThumbs .p-thumb').forEach(b => b.classList.toggle('is-active', b === btn));
    pMain.style.opacity = 0;
    setTimeout(() => { pMain.src = btn.dataset.src; pMain.style.opacity = 1; }, 150);
  }));

  /* ---------- FAQ accordion ---------- */
  $$('[data-faq] .faq-q').forEach(q => q.addEventListener('click', () => {
    const item = q.parentElement;
    const open = !item.classList.contains('is-open');
    $$('.faq-item', item.parentElement).forEach(i => {
      i.classList.remove('is-open');
      $('.faq-q', i).setAttribute('aria-expanded', 'false');
    });
    if (open) { item.classList.add('is-open'); q.setAttribute('aria-expanded', 'true'); }
  }));

  /* ---------- Category sort ---------- */
  const sortSel = $('#sortSelect');
  const catGrid = $('#catGrid');
  if (sortSel && catGrid) {
    const original = [...catGrid.children];
    sortSel.addEventListener('change', () => {
      let list = [...original];
      if (sortSel.value === 'fast') list.sort((a, b) => a.dataset.days - b.dataset.days);
      if (sortSel.value === 'az') list.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
      list.forEach(el => catGrid.appendChild(el));
    });
  }

  /* ---------- About: timeline ---------- */
  const tlYears = $('#tlYears');
  if (tlYears) {
    const TBC = 'Details to be confirmed by Click Media (placeholder — client to confirm milestones).';
    const milestones = [
      { y: 1991, t: 'Click Media founded in Motijheel', d: TBC, img: 'mock-equipment' },
      { y: 1996, t: 'Milestone to be confirmed', d: TBC, img: 'mock-brochure' },
      { y: 2001, t: 'Milestone to be confirmed', d: TBC, img: 'mock-calendar' },
      { y: 2006, t: 'Digital printing & ID-card line launched', d: 'New digital presses let us print short runs, personalised ID cards and certificates for schools and offices within 24 hours — the start of our same-day service. (Placeholder — client to confirm milestones.)', img: 'mock-id-card' },
      { y: 2011, t: 'Milestone to be confirmed', d: TBC, img: 'mock-signboard' },
      { y: 2016, t: 'Milestone to be confirmed', d: TBC, img: 'mock-packaging' },
      { y: 2021, t: 'Milestone to be confirmed', d: TBC, img: 'mock-interior' },
      { y: 2026, t: '35 years of print', d: TBC, img: 'mock-business-cards' }
    ];
    let cur = 3;
    tlYears.insertAdjacentHTML('beforeend', milestones.map((m, i) =>
      `<button type="button" class="year" data-i="${i}">${m.y}<i></i></button>`).join(''));
    const yearBtns = $$('.year', tlYears);
    const fill = $('#tlFill');
    function show(i, animate) {
      cur = (i + milestones.length) % milestones.length;
      const m = milestones[cur];
      yearBtns.forEach((b, k) => { b.classList.toggle('is-on', k === cur); b.classList.toggle('is-past', k < cur); });
      const dot = $('i', yearBtns[cur]);
      fill.style.width = (dot.getBoundingClientRect().left - tlYears.getBoundingClientRect().left) + 'px';
      $('#tlBig').textContent = m.y;
      $('#tlBadge').textContent = `MILESTONE ${cur + 1} OF ${milestones.length}`;
      $('#tlTitle').textContent = m.t;
      $('#tlText').textContent = m.d;
      $('#tlImg').src = `assets/img/${m.img}.svg`;
      if (animate) { const c = $('#tlCard'); c.classList.remove('m-anim'); void c.offsetWidth; c.classList.add('m-anim'); }
      if (root.clientWidth < DESKTOP) yearBtns[cur].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
    yearBtns.forEach((b, k) => b.addEventListener('click', () => show(k, true)));
    $('#tlPrev').addEventListener('click', () => show(cur - 1, true));
    $('#tlNext').addEventListener('click', () => show(cur + 1, true));
    window.addEventListener('resize', () => show(cur, false));
    show(cur, false);
  }

  /* ---------- Contact page form ---------- */
  const cForm = $('#contactForm');
  if (cForm) {
    const drop = $('[data-drop]', cForm);
    const inp = $('input[type="file"]', drop);
    const title = $('[data-drop-title]', drop);
    const label = title.textContent;
    inp.addEventListener('change', () => { if (inp.files.length) title.textContent = [...inp.files].map(f => f.name).join(', '); });
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
    drop.addEventListener('drop', e => { inp.files = e.dataTransfer.files; inp.dispatchEvent(new Event('change')); });
    $$('[required]', cForm).forEach(i => i.addEventListener('input', () => i.classList.remove('is-invalid')));
    cForm.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('[required]', cForm).forEach(i => { const bad = !i.value.trim(); i.classList.toggle('is-invalid', bad); if (bad) ok = false; });
      if (!ok) { $('.is-invalid', cForm).focus(); return; }
      // TODO: connect to a backend / email service.
      cForm.reset(); title.textContent = label;
      $('.form-ok', cForm).classList.add('is-on');
    });
  }

  /* ---------- Reveal on scroll + stat counters ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  const statsIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      statsIO.unobserve(en.target);
      $$('[data-count]', en.target).forEach(el => {
        const end = +el.dataset.count, suf = el.dataset.suffix || '';
        const t0 = performance.now(), dur = 1400;
        const tick = t => {
          const p = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    });
  }, { threshold: .4 });
  const stats = $('.stats');
  if (stats && !matchMedia('(prefers-reduced-motion: reduce)').matches) statsIO.observe(stats);
})();
