(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  let C = {};
  const readColors = () => { C = { ink: css('--ink'), muted: css('--muted'), line: css('--line'), human: css('--human'), ai: css('--ai'), spark: css('--spark'), surface: css('--surface'), onInk: css('--on-ink'), nh: css('--net-human'), na: css('--net-ai') }; };
  readColors();

  // Heure de Kinshasa
  const clock = document.getElementById('clock');
  const tick = () => { try { clock.textContent = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kinshasa' }).format(new Date()) + ' WAT'; } catch (e) {} };
  tick(); setInterval(tick, 30000);

  // Nom cinétique : la graisse suit le curseur
  const rows = [...document.querySelectorAll('#name .row')];
  rows.forEach(r => { const t = r.textContent; r.textContent = ''; [...t].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; r.appendChild(s); }); });
  const chars = [...document.querySelectorAll('#name .ch')];
  const W = chars.map(() => 300), target = chars.map(() => 300);
  let mx = -1e4, my = -1e4, overName = false;
  const nameEl = document.getElementById('name');
  if (fine) {
    nameEl.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; overName = true; });
    nameEl.addEventListener('pointerleave', () => { overName = false; });
  } else document.getElementById('hint').textContent = 'Touchez le nom';
  nameEl.addEventListener('pointerdown', e => { mx = e.clientX; my = e.clientY; overName = true; setTimeout(() => overName = false, 900); });

  function updateName(t) {
    const rects = chars.map(c => c.getBoundingClientRect());
    chars.forEach((c, i) => {
      let v;
      if (overName) {
        const r = rects[i], d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        v = 300 + 600 * Math.max(0, 1 - d / 260);
      } else {
        // vague lente quand personne ne survole
        const k = (t / 1000 * 1.1 - i * .32) % 6;
        v = 300 + 600 * Math.max(0, Math.sin(Math.min(Math.max(k, 0), Math.PI)));
      }
      target[i] = v;
      W[i] += (target[i] - W[i]) * .14;
      c.style.fontVariationSettings = `"wght" ${W[i].toFixed(0)}`;
      c.classList.toggle('hot', W[i] > 780);
    });
  }

  // Rôles tapés
  const roles = ['data scientist', 'développeur Python & Django', 'administrateur de bases de données', 'chercheur en TAL', 'passionné d’animations JavaScript'];
  const typed = document.getElementById('typed');
  if (!reduce) {
    let r = 0, i = roles[0].length, del = true;
    setTimeout(function step() {
      if (del) { i--; if (i <= 0) { del = false; r = (r + 1) % roles.length; } }
      else { i++; if (i >= roles[r].length) { del = true; typed.textContent = roles[r]; return setTimeout(step, 1800); } }
      typed.textContent = roles[r].slice(0, i);
      setTimeout(step, del ? 35 : 70);
    }, 2200);
  }

  // Copier l'adresse
  const copyBtn = document.getElementById('copy');
  copyBtn.addEventListener('click', () => {
    const el = document.getElementById('mail');
    const done = () => { copyBtn.textContent = 'Adresse copiée ✓'; setTimeout(() => copyBtn.textContent = 'Copier l’adresse', 2000); };
    const fallback = () => { const rg = document.createRange(); rg.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); copyBtn.textContent = 'Sélectionnée, faites Ctrl+C'; };
    try { navigator.clipboard.writeText(el.textContent).then(done, fallback); } catch (e) { fallback(); }
  });

  // Canvas
  function setup(c) {
    const r = c.getBoundingClientRect(), d = devicePixelRatio || 1;
    const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, r.width, r.height);
    return { g, w: r.width, h: r.height };
  }
  const rnd = s => () => (s = (s * 16807) % 2147483647) / 2147483647;

  // Sismographe du paragraphe (humain, sans rupture)
  const seis = document.getElementById('seis'), scoreEl = document.getElementById('score');
  const seisR = rnd(11), seisBase = Array.from({ length: 28 }, () => .25 + seisR() * .35);
  function drawSeis(t) {
    const { g, w, h } = setup(seis);
    const n = seisBase.length, bw = w / n;
    g.strokeStyle = C.line; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(0, h * .3); g.lineTo(w, h * .3); g.stroke(); g.setLineDash([]);
    g.fillStyle = C.muted; g.font = '10px "IBM Plex Mono", monospace'; g.fillText('seuil de rupture', 2, h * .3 - 5);
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const v = seisBase[i] * (.8 + .2 * Math.sin(t / 700 + i * .9));
      sum += v;
      const bh = v * h * .62;
      g.fillStyle = C.human; g.globalAlpha = .85;
      g.fillRect(i * bw + 1.5, h - bh, bw - 3, bh);
    }
    g.globalAlpha = 1;
    scoreEl.textContent = (Math.max(0, sum / n - .38) * .3).toFixed(2).replace('.', ',');
  }

  // Démo d'analyse du texte hybride
  const lab = document.getElementById('lab'), hybrid = document.getElementById('hybrid'), beam = document.getElementById('beam');
  const varbar = document.getElementById('varbar'), scanstate = document.getElementById('scanstate');
  const heights = [30, 42, 26, 38, 34, 28, 44, 36, 90, 96, 88, 94, 92, 86, 32, 40, 28, 36];
  heights.forEach(() => varbar.appendChild(document.createElement('i')));
  const bars = [...varbar.children], segs = [...hybrid.querySelectorAll('.seg')];
  let scanTimers = [];
  function runScan() {
    scanTimers.forEach(clearTimeout); scanTimers = [];
    segs.forEach(s => s.classList.remove('on'));
    bars.forEach(b => { b.style.height = '8%'; b.style.background = C.line; });
    scanstate.textContent = 'analyse en cours…';
    const step = reduce ? 0 : 110, lr = lab.getBoundingClientRect(), hr = hybrid.getBoundingClientRect();
    if (!reduce) {
      beam.style.transition = 'none'; beam.style.left = (hr.left - lr.left) + 'px'; beam.style.opacity = '1';
      requestAnimationFrame(() => { beam.style.transition = `left ${bars.length * step}ms linear, opacity .3s ease`; beam.style.left = (hr.right - lr.left) + 'px'; });
    }
    bars.forEach((b, i) => scanTimers.push(setTimeout(() => {
      b.style.height = heights[i] + '%';
      b.style.background = heights[i] > 70 ? C.ai : C.human;
      const si = Math.min(segs.length - 1, Math.floor(i / bars.length * segs.length));
      segs.slice(0, si + 1).forEach(s => s.classList.add('on'));
      if (i === bars.length - 1) { segs.forEach(s => s.classList.add('on')); beam.style.opacity = '0'; scanstate.textContent = '2 phrases générées localisées'; }
    }, 150 + i * step)));
  }
  document.getElementById('scan').addEventListener('click', runScan);
  let scanned = false;
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting && !scanned) { scanned = true; runScan(); o.disconnect(); } }), { threshold: .45 }).observe(lab);

  // Réseau de neurones : les mots d'une phrase entrent, le signal se propage, la sortie vote humain / IA
  const net = document.getElementById('net'), netstate = document.getElementById('netstate');
  const sentences = segs.map(s => ({ kind: s.classList.contains('a') ? 'a' : 'h', words: s.textContent.trim().replace(/[.,]/g, '').split(/\s+/) }));
  const LAY = [5, 8, 8, 6, 2];
  const NR = rnd(42);
  const nodes = LAY.map(n => Array.from({ length: n }, () => ({ x: 0, y: 0, ox: 0, oy: 0, vx: 0, vy: 0, act: 0, kind: 'h', ph: NR() * 6.28 })));
  const edges = LAY.slice(0, -1).map((n, l) => Array.from({ length: n }, () => Array.from({ length: LAY[l + 1] }, () => ({ w: .15 + NR() * .85, s: NR() - .5, hot: 0, kind: 'h' }))));
  let pulses = [], rings = [], nW = 0, nH = 0, nowT = 0, lastFire = -1e9, sIdx = -1, cur = sentences[0], outCount = [0, 0];
  let nmx = -1e4, nmy = -1e4;
  const kc = k => k === 'a' ? C.na : C.nh;

  function layoutNet(w, h) {
    const narrow = w < 560, x0 = w * (narrow ? .22 : .16), x1 = w * (narrow ? .74 : .8);
    nodes.forEach((layer, l) => {
      const x = x0 + (x1 - x0) * l / (LAY.length - 1);
      const span = h * .8 * Math.min(1, .3 + layer.length / 9);
      layer.forEach((n, k) => { n.x = x; n.y = h / 2 - span / 2 + (layer.length === 1 ? span / 2 : span * k / (layer.length - 1)); });
    });
  }
  const P = n => [n.x + n.ox, n.y + n.oy];
  const ctrl = (A, B, s) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + s * 70];
  const qpt = (A, Q, B, t) => { const u = 1 - t; return [u * u * A[0] + 2 * u * t * Q[0] + t * t * B[0], u * u * A[1] + 2 * u * t * Q[1] + t * t * B[1]]; };

  function spawn(l, a, kind) {
    if (l >= LAY.length - 1) return;
    if (l === LAY.length - 2) { const right = NR() < .86; pulses.push({ l, a, b: right === (kind === 'h') ? 0 : 1, t0: nowT, dur: 520 + NR() * 360, kind }); return; }
    const outs = edges[l][a].map((e, b) => ({ b, k: e.w * NR() })).sort((p, q) => q.k - p.k);
    const n = pulses.length > 120 ? 1 : 1 + (NR() < .45 ? 1 : 0);
    outs.slice(0, n).forEach(({ b }) => pulses.push({ l, a, b, t0: nowT, dur: 480 + NR() * 380, kind }));
  }
  function fire() {
    sIdx = (sIdx + 1) % sentences.length; cur = sentences[sIdx]; outCount = [0, 0]; lastFire = nowT;
    netstate.textContent = `Phrase ${sIdx + 1}/${sentences.length} · « ${cur.words.slice(0, 5).join(' ')}… »`;
    nodes[0].forEach((n, i) => {
      n.act = 1; n.kind = cur.kind;
      for (let k = 0; k < 2; k++) pulses.push({ l: 0, a: i, b: Math.floor(NR() * LAY[1]), t0: nowT + i * 70, dur: 500 + NR() * 300, kind: cur.kind });
    });
  }
  net.addEventListener('pointermove', e => { const r = net.getBoundingClientRect(); nmx = e.clientX - r.left; nmy = e.clientY - r.top; });
  net.addEventListener('pointerleave', () => { nmx = nmy = -1e4; });
  net.addEventListener('click', e => {
    const r = net.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    rings.push({ x, y, t0: nowT });
    nodes.flat().forEach(n => { const dx = n.x - x, dy = n.y - y, d = Math.hypot(dx, dy) || 1; if (d < 320) { const f = (1 - d / 320) * 9; n.vx += dx / d * f; n.vy += dy / d * f; } });
    fire();
  });
  document.getElementById('netfire').addEventListener('click', fire);

  function drawNet(t) {
    nowT = t;
    const { g, w, h } = setup(net);
    if (w !== nW || h !== nH) { layoutNet(w, h); nW = w; nH = h; }
    if (!reduce && t - lastFire > 3200) fire();
    const narrow = w < 560;

    // mouvement des neurones : dérive, répulsion du curseur, ressort vers la position de base
    nodes.flat().forEach(n => {
      const dx = n.x + n.ox - nmx, dy = n.y + n.oy - nmy, d = Math.hypot(dx, dy) || 1;
      if (d < 130) { const f = (1 - d / 130) * 1.6; n.vx += dx / d * f; n.vy += dy / d * f; }
      const tx = reduce ? 0 : Math.sin(t / 1500 + n.ph) * 3, ty = reduce ? 0 : Math.cos(t / 1700 + n.ph * 1.3) * 3;
      n.vx += (tx - n.ox) * .06; n.vy += (ty - n.oy) * .06;
      n.vx *= .82; n.vy *= .82; n.ox += n.vx; n.oy += n.vy;
      n.act *= .965;
    });

    // connexions
    edges.forEach((L1, l) => L1.forEach((row, a) => row.forEach((e, b) => {
      const A = P(nodes[l][a]), B = P(nodes[l + 1][b]), Q = ctrl(A, B, e.s);
      const hot = e.hot > .04;
      g.strokeStyle = hot ? kc(e.kind) : C.onInk;
      g.globalAlpha = hot ? .2 + .65 * e.hot : .05 + .1 * e.w;
      g.lineWidth = hot ? 1 + e.hot * 1.5 : .5 + e.w * .7;
      g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo(Q[0], Q[1], B[0], B[1]); g.stroke();
      e.hot *= .955;
    })));
    g.globalAlpha = 1;

    // impulsions
    pulses = pulses.filter(p => {
      const k = (t - p.t0) / p.dur;
      if (k < 0) return true;
      const e = edges[p.l][p.a][p.b];
      if (k >= 1) {
        const n = nodes[p.l + 1][p.b]; n.act = 1; n.kind = p.kind;
        if (p.l + 1 === LAY.length - 1) outCount[p.b]++;
        else spawn(p.l + 1, p.b, p.kind);
        return false;
      }
      e.hot = Math.max(e.hot, .9); e.kind = p.kind;
      const A = P(nodes[p.l][p.a]), B = P(nodes[p.l + 1][p.b]), Q = ctrl(A, B, e.s), col = kc(p.kind);
      g.strokeStyle = col; g.lineWidth = 2.5; g.lineCap = 'round';
      g.beginPath();
      for (let i = 0; i <= 8; i++) { const pt = qpt(A, Q, B, Math.max(0, k - .18 + .18 * i / 8)); i ? g.lineTo(pt[0], pt[1]) : g.moveTo(pt[0], pt[1]); }
      g.stroke();
      const pt = qpt(A, Q, B, k);
      g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 14;
      g.beginPath(); g.arc(pt[0], pt[1], 3.2, 0, 7); g.fill(); g.shadowBlur = 0;
      return true;
    });

    // ondes de clic
    rings = rings.filter(r => {
      const k = (t - r.t0) / 900; if (k >= 1) return false;
      g.strokeStyle = C.spark; g.globalAlpha = 1 - k; g.lineWidth = 2;
      g.beginPath(); g.arc(r.x, r.y, 10 + k * 260, 0, 7); g.stroke(); g.globalAlpha = 1;
      return true;
    });

    // neurones
    nodes.forEach((layer, l) => layer.forEach((n, i) => {
      const [x, y] = P(n), col = kc(n.kind), r = (l === LAY.length - 1 ? 9 : 5.5) + n.act * 4;
      if (n.act > .08) { g.fillStyle = col; g.globalAlpha = n.act * .18; g.beginPath(); g.arc(x, y, r + 6 + n.act * 12, 0, 7); g.fill(); g.globalAlpha = 1; }
      g.fillStyle = C.ink; g.strokeStyle = n.act > .15 ? col : C.onInk; g.lineWidth = 1.6;
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke();
      g.fillStyle = col; g.globalAlpha = Math.min(1, n.act * 1.3);
      g.beginPath(); g.arc(x, y, r * .55, 0, 7); g.fill(); g.globalAlpha = 1;
    }));

    // mots en entrée
    g.font = `${narrow ? 11 : 13}px "IBM Plex Mono", monospace`; g.textAlign = 'right'; g.textBaseline = 'middle';
    nodes[0].forEach((n, i) => {
      const [x, y] = P(n); let word = cur.words[i] || '·';
      if (narrow && word.length > 8) word = word.slice(0, 7) + '…';
      g.fillStyle = n.act > .3 ? kc(cur.kind) : C.onInk; g.globalAlpha = .55 + .45 * n.act;
      g.fillText(word, x - 14, y); g.globalAlpha = 1;
    });

    // vote en sortie
    const tot = outCount[0] + outCount[1], pH = (outCount[0] + 1) / (tot + 2);
    g.textAlign = 'left';
    [['Humain', pH, 'h'], ['IA', 1 - pH, 'a']].forEach(([lab, p, k], i) => {
      const [x, y] = P(nodes[LAY.length - 1][i]);
      g.fillStyle = kc(k); g.font = `600 ${narrow ? 13 : 16}px Unbounded, system-ui, sans-serif`;
      g.fillText(lab, x + 20, y - 9);
      g.fillStyle = C.onInk; g.globalAlpha = .75; g.font = `${narrow ? 11 : 13}px "IBM Plex Mono", monospace`;
      g.fillText(p.toFixed(2).replace('.', ','), x + 20, y + 11); g.globalAlpha = 1;
    });
    // libellés des couches
    if (!narrow) {
      g.font = '11px "IBM Plex Mono", monospace'; g.textAlign = 'center'; g.fillStyle = C.onInk; g.globalAlpha = .45;
      ['mots', 'traits', 'variance', 'contexte', 'vote'].forEach((s, l) => g.fillText(s.toUpperCase(), nodes[l][0].x, h - 10));
      g.globalAlpha = 1;
    }
  }
  fire();

  // Animations des projets
  const anims = {
    segments(g, w, h, t) {
      const R = rnd(7), rows = 7, lh = h / (rows + 2), scan = ((t / 2600) % 1.3) * w;
      for (let r = 0; r < rows; r++) {
        let x = w * .08; const y = lh * (r + 1.2);
        while (x < w * .92) {
          const len = 20 + R() * 60, isAI = (r === 2 || r === 3 || (r === 4 && x < w * .5));
          g.fillStyle = x < scan ? (isAI ? C.ai : C.human) : C.line;
          g.fillRect(x, y, Math.min(len, w * .92 - x), lh * .45); x += len + 6;
        }
      }
      g.fillStyle = C.ink; g.fillRect(Math.min(scan, w - 2), lh * .8, 2, h - lh * 1.6);
    },
    graph(g, w, h, t) {
      const nodes = [['Client', .22, .3], ['Commande', .55, .25], ['Produit', .8, .55], ['Facture', .45, .72], ['Adresse', .16, .72]];
      const edges = [[0, 1], [1, 2], [1, 3], [0, 4], [3, 0]];
      const P = nodes.map(([, x, y], i) => [w * x + Math.sin(t / 900 + i) * 6, h * y + Math.cos(t / 1100 + i * 2) * 6]);
      g.strokeStyle = C.muted; g.lineWidth = 1.2;
      edges.forEach(([a, b], i) => {
        g.beginPath(); g.moveTo(...P[a]); g.lineTo(...P[b]); g.stroke();
        const k = ((t / 1500) + i * .2) % 1; g.fillStyle = C.ai;
        g.beginPath(); g.arc(P[a][0] + (P[b][0] - P[a][0]) * k, P[a][1] + (P[b][1] - P[a][1]) * k, 2.5, 0, 7); g.fill();
      });
      g.font = '600 11px "Familjen Grotesk", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      nodes.forEach(([n], i) => {
        const tw = g.measureText(n).width + 16;
        g.fillStyle = i === 1 ? C.spark : C.surface; g.strokeStyle = C.ink; g.lineWidth = 1.5;
        g.beginPath(); g.rect(P[i][0] - tw / 2, P[i][1] - 11, tw, 22); g.fill(); g.stroke();
        g.fillStyle = i === 1 ? '#15131D' : C.ink; g.fillText(n, P[i][0], P[i][1] + 1);
      });
    },
    agents(g, w, h, t) {
      const R = rnd(3), n = 14;
      g.strokeStyle = C.line; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w / 2, h - 10); g.stroke(); g.setLineDash([]);
      for (let i = 0; i < n; i++) {
        const buyer = i % 2 === 0, bx = buyer ? .2 + R() * .2 : .6 + R() * .2, by = .15 + R() * .7, sp = .5 + R();
        const phase = (Math.sin(t / 1000 * sp + i) + 1) / 2;
        const x = w * (bx + (buyer ? 1 : -1) * phase * .12), y = h * by + Math.cos(t / 800 + i) * 4;
        g.fillStyle = buyer ? C.human : C.ai; g.beginPath();
        if (buyer) g.arc(x, y, 6, 0, 7); else g.rect(x - 6, y - 6, 12, 12);
        g.fill();
        if (phase > .85) { g.strokeStyle = C.spark; g.lineWidth = 2; g.globalAlpha = (phase - .85) * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(w / 2, y); g.stroke(); g.globalAlpha = 1; g.lineWidth = 1; }
      }
    },
    stock(g, w, h, t) {
      const cols = 4, rws = 6, cw = (w * .84) / cols, rh = (h * .76) / rws, x0 = w * .08, y0 = h * .12;
      const hl = Math.floor(t / 700) % (rws - 1) + 1;
      for (let r = 0; r < rws; r++) for (let c = 0; c < cols; c++) {
        g.fillStyle = r === 0 ? C.ink : (r === hl ? C.spark : C.line);
        g.fillRect(x0 + c * cw + 3, y0 + r * rh + 3, cw - 6, rh - 6);
        if (r > 0 && c === 3) { g.fillStyle = C.human; g.fillRect(x0 + c * cw + 8, y0 + r * rh + rh / 2 - 2, (cw - 16) * (.3 + ((r * 37 + Math.floor(t / 1400)) % 7) / 10), 4); }
      }
    },
    site(g, w, h, t) {
      g.fillStyle = C.ink; g.fillRect(w * .08, h * .12, w * .84, 14);
      const s = (Math.sin(t / 1200) + 1) / 2;
      g.fillStyle = C.spark; g.globalAlpha = .45 + .45 * s; g.fillRect(w * .08, h * .12 + 20, w * .84, h * .32); g.globalAlpha = 1;
      g.fillStyle = '#15131D'; g.fillRect(w * .14, h * .22 + 20, w * .4, 10); g.fillRect(w * .14, h * .22 + 38, w * .28, 6);
      for (let i = 0; i < 3; i++) { g.fillStyle = C.line; g.fillRect(w * .08 + i * w * .29, h * .62, w * .26, h * .26); g.fillStyle = C.ai; g.fillRect(w * .08 + i * w * .29, h * .62, w * .26 * ((t / 2000 + i / 3) % 1), 3); }
    },
    shop(g, w, h, t) {
      for (let i = 0; i < 4; i++) {
        const x = w * .08 + i * w * .215, y = h * .16;
        g.fillStyle = C.line; g.fillRect(x, y, w * .19, h * .42);
        g.fillStyle = C.muted; g.fillRect(x, y + h * .46, w * .14, 6); g.fillStyle = C.ink; g.fillRect(x, y + h * .46 + 12, w * .08, 6);
      }
      const k = (t / 2200) % 1, from = [w * .18, h * .4], to = [w * .88, h * .86];
      const x = from[0] + (to[0] - from[0]) * k, y = from[1] + (to[1] - from[1]) * k - Math.sin(k * Math.PI) * h * .25;
      g.fillStyle = C.spark; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill();
      g.fillStyle = C.ai; g.beginPath(); g.arc(to[0], to[1], 11 + (k > .92 ? 3 : 0), 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '700 11px "Familjen Grotesk", system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(String(1 + Math.floor(t / 2200) % 9), to[0], to[1] + 1);
    }
  };

  // Aperçu flottant (bureau) et miniatures (mobile)
  const prows = [...document.querySelectorAll('.prow')];
  const preview = document.getElementById('preview'), pcanvas = document.getElementById('pcanvas');
  let active = null, px = 0, py = 0, cx = 0, cy = 0;
  if (fine) {
    prows.forEach(row => {
      row.addEventListener('pointerenter', () => { active = row.dataset.anim; preview.classList.add('show'); });
      row.addEventListener('pointerleave', () => { active = null; preview.classList.remove('show'); });
    });
    addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; });
  }

  // Curseur
  const cursor = document.getElementById('cursor');
  if (fine && !reduce) {
    addEventListener('pointermove', e => { cursor.classList.add('on'); px = e.clientX; py = e.clientY; }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('on'));
    document.querySelectorAll('a, button, .prow, #name').forEach(el => {
      el.addEventListener('pointerenter', () => cursor.classList.add('big'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('big'));
    });
  }

  // Boucle : on n'anime que ce qui est visible
  const thumbs = prows.map(r => ({ c: r.querySelector('.thumb canvas'), anim: r.dataset.anim }));
  const visible = new Set();
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
  [seis, nameEl, net, ...thumbs.map(x => x.c)].forEach(c => io.observe(c));

  function frame(t, force) {
    if (force || visible.has(nameEl)) updateName(t);
    if (force || visible.has(net)) drawNet(t);
    if (force || visible.has(seis)) drawSeis(t);
    thumbs.forEach(({ c, anim }) => { if (c.offsetParent && (force || visible.has(c))) { const { g, w, h } = setup(c); anims[anim](g, w, h, t); } });
    if (fine) {
      cx += (px - cx) * .18; cy += (py - cy) * .18;
      cursor.style.translate = `${px}px ${py}px`;
      preview.style.left = cx + 'px'; preview.style.top = (cy - 40) + 'px';
      if (active) { const { g, w, h } = setup(pcanvas); anims[active](g, w, h, t); }
    }
  }
  frame(1400, true);
  if (!reduce) { const loop = t => { frame(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  else chars.forEach(c => c.style.fontVariationSettings = '"wght" 600');
  addEventListener('resize', () => frame(performance.now(), true));
  const retheme = () => { readColors(); frame(performance.now(), true); if (scanned) runScan(); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', retheme);
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
