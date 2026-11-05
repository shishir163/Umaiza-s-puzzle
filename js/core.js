/* Umaiza's Puzzle World - core: state, stats, levels, sound, effects */
(function () {
  const KEY = 'umaiza_world_v1';
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const DEFAULT = () => ({
    v: 1,
    profile: { name: 'Umaiza Binte Mamun', nick: 'Umaiza', cls: 'Nursery', section: 'Rose', school: 'Playpen School', father: '', mother: '' },
    settings: { pin: '1234', maxLevel: 10, certEvery: 10, round: 5, goal: 5, sound: true, autoRead: false, size: 190, sort: 'category', filter: 'all' },
    cards: {}, lv: {}, hist: [], certs: [], lastCert: 0
  });
  function load() {
    const d = DEFAULT();
    try {
      const o = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (o) { Object.assign(d, o); d.profile = Object.assign(DEFAULT().profile, o.profile); d.settings = Object.assign(DEFAULT().settings, o.settings); }
    } catch (e) { }
    return d;
  }
  const S = load();
  const W = { S, uid, listeners: [] };
  W.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
    W.listeners.forEach(f => f());
  };
  W.replace = function (o) { Object.keys(S).forEach(k => delete S[k]); Object.assign(S, DEFAULT(), o); S.profile = Object.assign(DEFAULT().profile, o.profile || {}); S.settings = Object.assign(DEFAULT().settings, o.settings || {}); W.save(); };
  W.reset = function () { W.replace(DEFAULT()); };

  // ---------- levels
  W.MAXL = 10;
  W.cap = () => Math.max(1, Math.min(W.MAXL, +S.settings.maxLevel || W.MAXL));
  W.lvl = t => Math.min((S.lv[t] || { l: 1 }).l, W.cap());
  W.lvState = t => (S.lv[t] = S.lv[t] || { l: 1, st: 0, ms: 0 });
  W.applyResult = function (t, good) {
    const L = W.lvState(t); if (L.l > W.cap()) L.l = W.cap();
    if (good) {
      L.st++; L.ms = 0;
      if (L.st >= 3) { L.st = 0; if (L.l < W.cap()) { L.l++; return 'up'; } return 'master'; }
    } else {
      L.st = 0; L.ms++;
      if (L.ms >= 2) { L.ms = 0; if (L.l > 1) { L.l--; return 'down'; } }
    }
    return '';
  };

  // ---------- history & stats
  W.addHist = function (e) {
    const h = Object.assign({ id: uid(), ts: Date.now() }, e);
    S.hist.push(h);
    return h;
  };
  const dayKey = ts => { const d = new Date(ts); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  W.dayKey = dayKey;
  W.stats = function () {
    const H = S.hist, o = { stars: 0, solved: 0, good: 0, total: H.length, today: { stars: 0, solved: 0 }, byType: {}, bookDone: {}, days: {} };
    const tk = dayKey(Date.now());
    H.forEach(h => {
      const st = +h.stars || 0;
      o.stars += st;
      if (st > 0) o.solved++;
      if (h.ok) o.good++;
      const dk = dayKey(h.ts); o.days[dk] = (o.days[dk] || 0) + st;
      if (dk === tk) { o.today.stars += st; if (st > 0) o.today.solved++; }
      const key = h.kind === 'book' ? 'b' + h.book : h.type;
      const b = o.byType[key] = o.byType[key] || { stars: 0, solved: 0, n: 0 };
      b.stars += st; b.n++; if (st > 0) b.solved++;
      if (h.kind === 'book' && st > 0) o.bookDone[h.pid] = true;
    });
    // day streak
    let streak = 0, d = new Date(); if (!o.days[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (o.days[dayKey(d)]) { streak++; d.setDate(d.getDate() - 1); }
    o.streak = streak;
    o.acc = o.total ? Math.round(o.good / o.total * 100) : 0;
    return o;
  };
  W.last7 = function (o) {
    const out = [], d = new Date(); d.setDate(d.getDate() - 6);
    for (let i = 0; i < 7; i++) { out.push({ label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()], v: o.days[dayKey(d)] || 0, today: i === 6 }); d.setDate(d.getDate() + 1); }
    return out;
  };
  const RANKS = [[0, 'Little Seed', '🌱'], [15, 'Tiny Sprout', '🌿'], [40, 'Bright Bud', '🌼'], [80, 'Shining Star', '⭐'], [150, 'Clever Cub', '🦁'], [250, 'Super Brain', '🧠'], [400, 'Puzzle Princess', '👸'], [600, 'Brain Queen', '👑'], [900, 'Genius Fairy', '🧚'], [1300, 'Puzzle Legend', '🏆']];
  W.rank = function (stars) {
    let i = 0; RANKS.forEach((r, k) => { if (stars >= r[0]) i = k; });
    const cur = RANKS[i], nxt = RANKS[i + 1];
    return { name: cur[1], emoji: cur[2], idx: i, next: nxt ? nxt[0] : null, nextName: nxt ? nxt[1] : '', pct: nxt ? Math.round((stars - cur[0]) / (nxt[0] - cur[0]) * 100) : 100 };
  };
  W.MEDALS = [
    { id: 'first', e: '🌟', n: 'First Star', d: 'Solve your first puzzle', t: o => o.solved >= 1 },
    { id: 's10', e: '🎈', n: '10 Puzzles', d: 'Solve 10 puzzles', t: o => o.solved >= 10 },
    { id: 's25', e: '🎨', n: '25 Puzzles', d: 'Solve 25 puzzles', t: o => o.solved >= 25 },
    { id: 's50', e: '🚀', n: '50 Puzzles', d: 'Solve 50 puzzles', t: o => o.solved >= 50 },
    { id: 's100', e: '💯', n: '100 Puzzles', d: 'Solve 100 puzzles', t: o => o.solved >= 100 },
    { id: 's250', e: '👑', n: '250 Puzzles', d: 'Solve 250 puzzles', t: o => o.solved >= 250 },
    { id: 'st3', e: '🔥', n: '3 Day Streak', d: 'Play 3 days in a row', t: o => o.streak >= 3 },
    { id: 'st7', e: '🌈', n: '7 Day Streak', d: 'Play 7 days in a row', t: o => o.streak >= 7 },
    { id: 'lv3', e: '🥈', n: 'Level 3', d: 'Reach level 3 in any game', t: () => Object.values(S.lv).some(x => x.l >= 3) },
    { id: 'lv5', e: '🥇', n: 'Level 5', d: 'Reach level 5 in any game', t: () => Object.values(S.lv).some(x => x.l >= 5) },
    { id: 'books', e: '📚', n: 'Book Worm', d: 'Finish 10 book puzzles', t: o => Object.keys(o.bookDone).length >= 10 },
    { id: 'allr', e: '🧩', n: 'All Rounder', d: 'Play 10 different games', t: o => Object.keys(o.byType).filter(k => !/^b\d+$/.test(k)).length >= 10 }
  ];

  // ---------- certificates
  W.checkCert = function () {
    const o = W.stats(), N = Math.max(1, +S.settings.certEvery || 10);
    if (o.solved >= S.lastCert + N) {
      const count = Math.floor(o.solved / N) * N;
      const c = { id: uid(), ts: Date.now(), design: S.certs.length % window.CERT.designs.length, count, title: '' };
      S.certs.push(c); S.lastCert = count; W.save();
      return c;
    }
    return null;
  };

  // ---------- sound
  let ac = null;
  function ctx() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
  function tone(f, t0, d, type, vol) {
    const a = ctx(); if (!a || !S.settings.sound) return;
    const o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, a.currentTime + t0); g.gain.linearRampToValueAtTime(vol || .18, a.currentTime + t0 + .02); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + t0 + d);
    o.connect(g); g.connect(a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + d + .05);
  }
  W.snd = {
    tap() { tone(520, 0, .08, 'triangle', .1); },
    right() { [523, 659, 784].forEach((f, i) => tone(f, i * .09, .22, 'triangle')); },
    cheer() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * .1, .3, 'triangle', .2)); },
    wrong() { tone(260, 0, .18, 'sine', .12); tone(200, .12, .25, 'sine', .12); },
    up() { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * .09, .35, 'square', .09)); },
    flip() { tone(700, 0, .06, 'triangle', .1); }
  };
  W.speak = function (txt) {
    try {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt); u.lang = 'en-GB'; u.rate = .85; u.pitch = 1.15;
      const v = speechSynthesis.getVoices().find(x => /^en/i.test(x.lang)); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { }
  };

  // ---------- confetti
  let cvs, cx, parts = [], raf = 0;
  function fxInit() {
    cvs = document.getElementById('fx'); if (!cvs) return; cx = cvs.getContext('2d');
    const rs = () => { cvs.width = innerWidth * devicePixelRatio; cvs.height = innerHeight * devicePixelRatio; };
    rs(); addEventListener('resize', rs);
  }
  const COLS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff8fab', '#00c2a8', '#ff9f1c'];
  W.confetti = function (n, big) {
    if (!cvs) fxInit(); if (!cvs) return;
    const dp = devicePixelRatio, w = cvs.width, h = cvs.height;
    for (let i = 0; i < n; i++) {
      const emo = Math.random() < (big ? .25 : .12);
      parts.push({ x: w / 2 + (Math.random() - .5) * w * .3, y: h * .45, vx: (Math.random() - .5) * 16 * dp, vy: (-Math.random() * 15 - 5) * dp, g: .42 * dp, r: (4 + Math.random() * 6) * dp, c: COLS[i % COLS.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 120 + Math.random() * 60, e: emo ? ['⭐', '🌟', '💖', '🎈'][i % 4] : null });
    }
    if (!raf) raf = requestAnimationFrame(step);
  };
  function step() {
    cx.clearRect(0, 0, cvs.width, cvs.height);
    parts = parts.filter(p => p.life > 0 && p.y < cvs.height + 50);
    parts.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.rot += p.vr; p.life--;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalAlpha = Math.min(1, p.life / 30);
      if (p.e) { cx.font = (p.r * 4) + 'px serif'; cx.textAlign = 'center'; cx.fillText(p.e, 0, 0); }
      else { cx.fillStyle = p.c; cx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); }
      cx.restore();
    });
    raf = parts.length ? requestAnimationFrame(step) : 0;
    if (!parts.length) cx.clearRect(0, 0, cvs.width, cvs.height);
  }

  window.W = W;
})();
