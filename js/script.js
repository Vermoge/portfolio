(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  let C = {};
  const readColors = () => { C = { ink: css('--ink'), muted: css('--muted'), line: css('--line'), accent: css('--accent'), spark: css('--spark'), human: css('--human'), ai: css('--ai'), surface: css('--surface') }; };
  readColors();

  // Menu mobile
  const nav = document.querySelector('nav'), menuBtn = document.getElementById('menu-btn');
  const setMenu = open => { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // Heure locale Kinshasa
  const clock = document.getElementById('clock');
  const tick = () => { try { clock.textContent = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kinshasa' }).format(new Date()) + ' (WAT)'; } catch (e) { clock.textContent = 'WAT'; } };
  tick(); setInterval(tick, 30000);

  // Machine à écrire
  const roles = ['data scientist', 'développeur Python & Django', 'administrateur de bases de données', 'chercheur en TAL', 'passionné d’animations JavaScript'];
  const typed = document.getElementById('typed');
  if (!reduce) {
    let r = 0, i = roles[0].length, del = true;
    setTimeout(function step() {
      const w = roles[r];
      if (del) { i--; if (i <= 0) { del = false; r = (r + 1) % roles.length; } }
      else { i++; if (i >= roles[r].length) { del = true; typed.textContent = roles[r]; return setTimeout(step, 1800); } }
      typed.textContent = roles[r].slice(0, i) || '';
      setTimeout(step, del ? 35 : 70);
    }, 2200);
  }

  // Copier l'e-mail
  const copyBtn = document.getElementById('copy');
  copyBtn.addEventListener('click', () => {
    const el = document.getElementById('mail');
    const done = () => { copyBtn.textContent = 'Adresse copiée ✓'; setTimeout(() => copyBtn.textContent = 'Copier l’adresse', 2000); };
    const fallback = () => { const rg = document.createRange(); rg.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); copyBtn.textContent = 'Sélectionnée — Ctrl+C'; };
    try { navigator.clipboard.writeText(el.textContent).then(done, fallback); } catch (e) { fallback(); }
  });

  // Outil canvas
  function setup(c) {
    const r = c.getBoundingClientRect(), d = devicePixelRatio || 1;
    c.width = Math.max(1, r.width * d); c.height = Math.max(1, r.height * d);
    const g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
    return { g, w: r.width, h: r.height };
  }
  const rnd = s => () => (s = (s * 16807) % 2147483647) / 2147483647;

  // Réseau de neurones (hero)
  const net = document.getElementById('net');
  const layers = [4, 6, 6, 3];
  let pulses = [];
  function drawNet(t) {
    const { g, w, h } = setup(net);
    const padX = w * .12, padY = h * .12, usableH = h - padY * 2 - 28;
    const pos = layers.map((n, li) => Array.from({ length: n }, (_, k) => ({
      x: padX + (w - padX * 2) * li / (layers.length - 1),
      y: padY + usableH * (n === 1 ? .5 : k / (n - 1)) * (0.6 + 0.4 * n / 6) + usableH * (1 - (0.6 + 0.4 * n / 6)) / 2
    })));
    // arêtes
    g.lineWidth = 1;
    for (let l = 0; l < pos.length - 1; l++) for (const a of pos[l]) for (const b of pos[l + 1]) {
      g.strokeStyle = C.line; g.globalAlpha = .9; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
    g.globalAlpha = 1;
    // impulsions
    const now = t / 1000;
    if (!reduce && Math.random() < .09) {
      const l = Math.floor(Math.random() * (layers.length - 1));
      pulses.push({ l, a: Math.floor(Math.random() * layers[l]), b: Math.floor(Math.random() * layers[l + 1]), s: now });
    }
    pulses = pulses.filter(p => now - p.s < 1);
    const glow = pos.map(L => L.map(() => 0));
    for (const p of pulses) {
      const k = (now - p.s), A = pos[p.l][p.a], B = pos[p.l + 1][p.b];
      const x = A.x + (B.x - A.x) * k, y = A.y + (B.y - A.y) * k;
      g.strokeStyle = C.accent; g.globalAlpha = .55 * (1 - k); g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(x, y); g.stroke();
      g.globalAlpha = 1; g.fillStyle = C.accent; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill();
      if (k > .85) glow[p.l + 1][p.b] = 1;
    }
    g.lineWidth = 1;
    pos.forEach((L, li) => L.forEach((p, k) => {
      const act = reduce ? .5 : .5 + .5 * Math.sin(now * 1.6 + li * 1.3 + k * .9);
      g.fillStyle = C.surface; g.strokeStyle = glow[li][k] ? C.accent : C.ink;
      g.lineWidth = glow[li][k] ? 2.5 : 1.5;
      g.beginPath(); g.arc(p.x, p.y, 9, 0, 7); g.fill(); g.stroke();
      g.fillStyle = li === layers.length - 1 ? C.spark : C.accent; g.globalAlpha = act;
      g.beginPath(); g.arc(p.x, p.y, 5, 0, 7); g.fill(); g.globalAlpha = 1;
    }));
  }

  // Démo texte hybride
  const hybrid = document.getElementById('hybrid'), varbar = document.getElementById('varbar'), scanstate = document.getElementById('scanstate');
  const heights = [30, 42, 26, 38, 34, 28, 44, 36, 90, 96, 88, 94, 92, 86, 32, 40, 28, 36];
  heights.forEach(() => varbar.appendChild(document.createElement('i')));
  const bars = [...varbar.children];
  function runScan() {
    hybrid.classList.remove('scanned'); scanstate.textContent = 'analyse…';
    bars.forEach(b => { b.style.height = '8%'; b.style.background = C.line; });
    bars.forEach((b, i) => setTimeout(() => {
      b.style.height = heights[i] + '%';
      b.style.background = heights[i] > 70 ? C.ai : C.human;
      if (i === bars.length - 1) { hybrid.classList.add('scanned'); scanstate.textContent = '2 segments générés localisés'; }
    }, reduce ? 0 : 120 + i * 90));
  }

  // Miniatures animées
  const thumbs = [...document.querySelectorAll('.thumb canvas')];
  const anims = {
    segments(g, w, h, t) {
      const R = rnd(7), rows = 7, lh = h / (rows + 2);
      for (let r = 0; r < rows; r++) {
        let x = w * .08; const y = lh * (r + 1.2);
        while (x < w * .92) {
          const len = 20 + R() * 60, isAI = (r === 2 || r === 3 || (r === 4 && x < w * .5));
          const scan = ((t / 2600) % 1.3) * w;
          g.fillStyle = isAI && x < scan ? C.ai : (x < scan ? C.human : C.line);
          g.globalAlpha = x < scan ? .9 : 1;
          g.fillRect(x, y, Math.min(len, w * .92 - x), lh * .45); x += len + 6;
        }
      }
      g.globalAlpha = 1;
      const sx = ((t / 2600) % 1.3) * w; g.fillStyle = C.ink; g.fillRect(sx, lh * .8, 2, h - lh * 1.6);
    },
    graph(g, w, h, t) {
      const nodes = [['Client', .22, .3], ['Commande', .55, .25], ['Produit', .8, .55], ['Facture', .45, .7], ['Adresse', .15, .72]];
      const edges = [[0, 1], [1, 2], [1, 3], [0, 4], [3, 0]];
      const P = nodes.map(([, x, y], i) => [w * x + Math.sin(t / 900 + i) * 6, h * y + Math.cos(t / 1100 + i * 2) * 6]);
      g.strokeStyle = C.muted; g.lineWidth = 1.2;
      edges.forEach(([a, b], i) => {
        g.beginPath(); g.moveTo(...P[a]); g.lineTo(...P[b]); g.stroke();
        const k = ((t / 1500) + i * .2) % 1; g.fillStyle = C.accent;
        g.beginPath(); g.arc(P[a][0] + (P[b][0] - P[a][0]) * k, P[a][1] + (P[b][1] - P[a][1]) * k, 2.5, 0, 7); g.fill();
      });
      g.font = '600 11px Figtree, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      nodes.forEach(([n], i) => {
        const tw = g.measureText(n).width + 16;
        g.fillStyle = C.surface; g.strokeStyle = i === 1 ? C.accent : C.ink; g.lineWidth = 1.5;
        g.beginPath(); g.rect(P[i][0] - tw / 2, P[i][1] - 11, tw, 22); g.fill(); g.stroke();
        g.fillStyle = C.ink; g.fillText(n, P[i][0], P[i][1] + 1);
      });
    },
    agents(g, w, h, t) {
      const R = rnd(3), n = 14;
      g.strokeStyle = C.line; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w / 2, h - 10); g.stroke(); g.setLineDash([]);
      for (let i = 0; i < n; i++) {
        const buyer = i % 2 === 0, bx = buyer ? .2 + R() * .2 : .6 + R() * .2, by = .15 + R() * .7, sp = .5 + R();
        const phase = (Math.sin(t / 1000 * sp + i) + 1) / 2;
        const x = w * (bx + (buyer ? 1 : -1) * phase * .12), y = h * by + Math.cos(t / 800 + i) * 4;
        g.fillStyle = buyer ? C.accent : C.spark; g.beginPath();
        if (buyer) g.arc(x, y, 6, 0, 7); else g.rect(x - 6, y - 6, 12, 12);
        g.fill();
        if (phase > .85) { g.strokeStyle = C.muted; g.globalAlpha = (phase - .85) * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(w / 2, y); g.stroke(); g.globalAlpha = 1; }
      }
    },
    stock(g, w, h, t) {
      const cols = 4, rows = 6, cw = (w * .84) / cols, rh = (h * .76) / rows, x0 = w * .08, y0 = h * .12;
      const hl = Math.floor(t / 700) % (rows - 1) + 1;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        g.fillStyle = r === 0 ? C.ink : (r === hl ? C.accent : C.line);
        g.globalAlpha = r === hl ? .25 : 1;
        g.fillRect(x0 + c * cw + 3, y0 + r * rh + 3, cw - 6, rh - 6);
        g.globalAlpha = 1;
        if (r > 0 && c === 3) { g.fillStyle = C.accent; g.fillRect(x0 + c * cw + 8, y0 + r * rh + rh / 2 - 2, (cw - 16) * (.3 + ((r * 37 + Math.floor(t / 1400)) % 7) / 10), 4); }
      }
    },
    site(g, w, h, t) {
      g.fillStyle = C.ink; g.fillRect(w * .08, h * .12, w * .84, 14);
      const s = (Math.sin(t / 1200) + 1) / 2;
      g.fillStyle = C.spark; g.globalAlpha = .35 + .4 * s; g.fillRect(w * .08, h * .12 + 20, w * .84, h * .32); g.globalAlpha = 1;
      g.fillStyle = C.ink; g.fillRect(w * .14, h * .22 + 20, w * .4, 10); g.fillStyle = C.muted; g.fillRect(w * .14, h * .22 + 38, w * .28, 6);
      for (let i = 0; i < 3; i++) { g.fillStyle = C.line; g.fillRect(w * .08 + i * w * .29, h * .62, w * .26, h * .26); g.fillStyle = C.accent; g.fillRect(w * .08 + i * w * .29, h * .62, w * .26 * ((t / 2000 + i / 3) % 1), 3); }
    },
    shop(g, w, h, t) {
      for (let i = 0; i < 4; i++) {
        const x = w * .08 + i * w * .215, y = h * .16;
        g.fillStyle = C.line; g.fillRect(x, y, w * .19, h * .42);
        g.fillStyle = C.muted; g.fillRect(x, y + h * .46, w * .14, 6); g.fillStyle = C.ink; g.fillRect(x, y + h * .46 + 12, w * .08, 6);
      }
      const k = (t / 2200) % 1, from = [w * .18, h * .4], to = [w * .88, h * .86];
      const x = from[0] + (to[0] - from[0]) * k, y = from[1] + (to[1] - from[1]) * k - Math.sin(k * Math.PI) * h * .25;
      g.fillStyle = C.spark; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill();
      g.fillStyle = C.accent; g.beginPath(); g.arc(to[0], to[1], 11 + (k > .92 ? 3 : 0), 0, 7); g.fill();
      g.fillStyle = css('--accent-ink'); g.font = '700 11px Figtree, system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(String(1 + Math.floor(t / 2200) % 9), to[0], to[1] + 1);
    }
  };

  // Boucle : n'anime que ce qui est visible
  const visible = new Set();
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
  [net, ...thumbs].forEach(c => io.observe(c));
  let scanned = false;
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting && !scanned) { scanned = true; runScan(); o.disconnect(); } }), { threshold: .4 }).observe(hybrid);
  hybrid.addEventListener('click', runScan);

  function frame(t, force) {
    if (force || visible.has(net)) drawNet(t);
    thumbs.forEach(c => { if (force || visible.has(c)) { const { g, w, h } = setup(c); anims[c.dataset.anim](g, w, h, t); } });
  }
  frame(2000, true);
  if (!reduce) { const loop = t => { frame(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  addEventListener('resize', () => frame(performance.now(), true));
  const retheme = () => { readColors(); frame(performance.now(), true); if (scanned) runScan(); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', retheme);
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
