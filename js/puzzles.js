/* Umaiza's Puzzle World - puzzle generators.
   Every type has gen(level 1..5) -> question object. Answers are always correct by construction. */
(function () {
  const R = {
    int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
    pick: a => a[Math.floor(Math.random() * a.length)],
    shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    sample(a, n) { return R.shuffle(a).slice(0, n); }
  };
  const strip = h => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  // ---------- helpers
  function C(prompt, vis, right, wrongs, o) {
    o = o || {};
    const seen = new Set([String(right)]);
    const w = [];
    wrongs.forEach(x => { if (!seen.has(String(x))) { seen.add(String(x)); w.push(x); } });
    const all = R.shuffle([{ h: right, r: 1 }].concat(w.map(h => ({ h, r: 0 }))));
    return Object.assign({
      kind: 'choice', prompt, vis: vis || '', opts: all.map(x => x.h), ans: all.findIndex(x => x.r),
      say: strip(prompt), key: strip(right)
    }, o);
  }
  function nums(right, n, lo, hi) { // n-1 distinct wrong numbers near right
    const out = new Set(); let guard = 0, span = 2;
    while (out.size < n - 1 && guard++ < 200) {
      if (guard % 12 === 0) span++;
      const v = right + R.int(-span, span);
      if (v !== right && v >= lo && v <= hi) out.add(v);
    }
    for (let v = lo; out.size < n - 1 && v <= hi; v++) if (v !== right) out.add(v);
    return Array.from(out);
  }
  const eg = (e, n, cls) => '<span class="eg ' + (cls || '') + '">' + Array.from({ length: n }, () => '<i>' + e + '</i>').join('') + '</span>';
  const egx = (e, n, k) => '<span class="eg">' + Array.from({ length: n }, (_, i) => '<i class="' + (i < k ? 'gone' : '') + '">' + e + '</i>').join('') + '</span>';
  const blank = t => '<span class="blank">' + (t || '?') + '</span>';
  const op = t => '<span class="op">' + t + '</span>';
  const num = t => '<span class="bignum">' + t + '</span>';

  const COUNTABLE = ['🍎', '🌟', '🎈', '🐟', '🦆', '🍓', '🧸', '🌸', '🐞', '🍪', '🚗', '🍭', '🐥', '🍩'];

  // ---------- type definitions
  const T = {};
  const add = t => { T[t.id] = t; };

  // 1 ADD
  add({
    id: 'add', name: 'Picture Adding', cat: 'maths', emoji: '🍎', color: '#ff8a5c', desc: 'Count and add',
    gen(l) {
      const e = R.pick(COUNTABLE);
      if (l <= 3) {
        const max = [5, 7, 10][l - 1];
        const t = R.int(2, max), a = R.int(1, t - 1), b = t - a;
        return C('How many altogether?', '<div class="eq">' + eg(e, a) + op('+') + eg(e, b) + op('=') + blank() + '</div>', t, nums(t, l === 1 ? 3 : 4, 1, max + 2), { say: 'How many altogether? ' + a + ' plus ' + b });
      }
      if (l === 4) {
        const t = R.int(6, 15), a = R.int(2, t - 2), b = t - a;
        return C('Add them up!', '<div class="eq">' + num(a) + op('+') + eg(e, b) + op('=') + blank() + '</div>', t, nums(t, 4, 2, 18), { say: a + ' plus ' + b + '. How many?' });
      }
      const a = R.int(1, 8), b = R.int(1, 8), c = R.int(1, 20 - a - b > 8 ? 8 : Math.max(1, 20 - a - b)), t = a + b + c;
      return C('What is ' + a + ' + ' + b + ' + ' + c + ' ?', '<div class="eq">' + num(a) + op('+') + num(b) + op('+') + num(c) + op('=') + blank() + '</div>', t, nums(t, 4, 3, 24));
    }
  });

  // 2 SUB
  add({
    id: 'sub', name: 'Take Away', cat: 'maths', emoji: '🐦', color: '#6c8cff', desc: 'How many are left?',
    gen(l) {
      const e = R.pick(COUNTABLE);
      if (l <= 3) {
        const max = [5, 8, 10][l - 1], t = R.int(3, max), k = R.int(1, t - 1), r = t - k;
        return C('Some went away! How many are left?', '<div class="eq">' + egx(e, t, k) + '</div><div class="sub">' + (t) + ' − ' + k + ' = ' + blank() + '</div>', r, nums(r, l === 1 ? 3 : 4, 0, max), { say: 'Take away. How many are left?' });
      }
      const t = l === 4 ? R.int(8, 15) : R.int(12, 20), k = R.int(2, Math.min(t - 1, l === 4 ? 8 : 12)), r = t - k;
      return C('What is ' + t + ' − ' + k + ' ?', '<div class="eq">' + num(t) + op('−') + num(k) + op('=') + blank() + '</div>', r, nums(r, 4, 0, 20));
    }
  });

  // 3 COUNT
  function scatter(items) {
    const cols = 6, rows = 4, cells = R.shuffle(Array.from({ length: cols * rows }, (_, i) => i));
    return '<div class="scatter">' + items.map((e, i) => {
      const c = cells[i] % cols, r = Math.floor(cells[i] / cols);
      const x = (c + 0.5) / cols * 100 + R.int(-4, 4), y = (r + 0.5) / rows * 100 + R.int(-6, 6), rot = R.int(-20, 20);
      return '<i style="left:' + x + '%;top:' + y + '%;transform:translate(-50%,-50%) rotate(' + rot + 'deg)">' + e + '</i>';
    }).join('') + '</div>';
  }
  add({
    id: 'count', name: 'Count It!', cat: 'maths', emoji: '🔢', color: '#ffb400', desc: 'Count what you see',
    gen(l) {
      const e = R.pick(COUNTABLE);
      const n = [R.int(2, 5), R.int(4, 8), R.int(6, 10), R.int(8, 14), R.int(10, 20)][l - 1];
      let items = Array(n).fill(e), extra = 0;
      if (l >= 3) {
        const others = COUNTABLE.filter(x => x !== e);
        extra = l === 3 ? R.int(2, 3) : R.int(3, 5);
        for (let i = 0; i < extra; i++) items.push(R.pick(others));
        items = R.shuffle(items);
        // keep distractors different from target so count is clear
      }
      const tot = Math.min(24, items.length);
      items = items.slice(0, tot);
      const k = items.filter(x => x === e).length;
      const p = l >= 3 ? 'How many ' + e + ' can you see?' : 'How many can you count?';
      return C(p, scatter(items), k, nums(k, l === 1 ? 3 : 4, 1, 24), { say: 'How many can you count?' });
    }
  });

  // 4 MORE
  add({
    id: 'more', name: 'More or Less', cat: 'maths', emoji: '⚖️', color: '#35c37d', desc: 'Which is bigger?',
    gen(l) {
      const e = R.pick(COUNTABLE);
      if (l <= 2) {
        const max = l === 1 ? 6 : 10, a = R.int(1, max), b = R.int(1, max); const bb = a === b ? (a < max ? a + 1 : a - 1) : b;
        const more = Math.random() < 0.6 || l === 1;
        const right = more ? Math.max(a, bb) : Math.min(a, bb);
        const gA = '<div class="grp">' + eg(e, a) + '</div>', gB = '<div class="grp">' + eg(e, bb) + '</div>';
        return C(more ? 'Which group has MORE?' : 'Which group has FEWER?', '', right === a ? gA : gB, [right === a ? gB : gA], { optCls: 'groups', say: more ? 'Which group has more?' : 'Which group has fewer?' });
      }
      if (l === 3) {
        const a = R.int(1, 20); let b = R.int(1, 20); if (a === b) b = a + 1;
        const big = Math.random() < 0.6;
        return C(big ? 'Which number is BIGGER?' : 'Which number is SMALLER?', '', big ? Math.max(a, b) : Math.min(a, b), [big ? Math.min(a, b) : Math.max(a, b)], { optCls: 'numbers' });
      }
      if (l === 4) {
        const s = new Set(); while (s.size < 3) s.add(R.int(1, 30)); const a = Array.from(s);
        const big = Math.random() < 0.5;
        return C(big ? 'Which is the BIGGEST?' : 'Which is the SMALLEST?', '', big ? Math.max(...a) : Math.min(...a), a.filter(x => x !== (big ? Math.max(...a) : Math.min(...a))), { optCls: 'numbers' });
      }
      let a, b, c, d, x, y; do { a = R.int(1, 9); b = R.int(1, 9); c = R.int(1, 9); d = R.int(1, 9); x = a + b; y = c + d; } while (x === y);
      const big = Math.random() < 0.5, rt = (x > y) === big ? a + ' + ' + b : c + ' + ' + d, wr = (x > y) === big ? c + ' + ' + d : a + ' + ' + b;
      return C(big ? 'Which sum is BIGGER?' : 'Which sum is SMALLER?', '', rt, [wr], { optCls: 'numbers' });
    }
  });

  // 5 MISSING
  add({
    id: 'missing', name: 'Missing Number', cat: 'maths', emoji: '❓', color: '#b06cff', desc: 'Find the hidden number',
    gen(l) {
      const e = R.pick(COUNTABLE);
      if (l === 1) {
        const t = R.int(3, 5), a = R.int(1, t - 1), m = t - a;
        return C('What number is hiding?', '<div class="eq">' + eg(e, a) + op('+') + blank() + op('=') + num(t) + '</div>', m, nums(m, 3, 1, 5));
      }
      if (l === 2) {
        const t = R.int(5, 9), a = R.int(1, t - 1), m = t - a;
        return C('What number is hiding?', '<div class="eq">' + num(a) + op('+') + blank() + op('=') + num(t) + '</div>', m, nums(m, 4, 0, 9));
      }
      if (l === 3) {
        const a = R.int(1, 9), m = 10 - a;
        return C('Make 10! What goes in the box?', '<div class="eq">' + num(a) + op('+') + blank() + op('=') + num(10) + '</div>', m, nums(m, 4, 0, 10));
      }
      if (l === 4) {
        if (Math.random() < 0.5) { const t = R.int(8, 15), a = R.int(2, t - 2), m = t - a; return C('What number is hiding?', '<div class="eq">' + blank() + op('+') + num(a) + op('=') + num(t) + '</div>', m, nums(m, 4, 0, 15)); }
        const a = R.int(5, 12), m = R.int(1, a - 1), t = a - m;
        return C('What number is hiding?', '<div class="eq">' + num(a) + op('−') + blank() + op('=') + num(t) + '</div>', m, nums(m, 4, 0, 12));
      }
      const t = R.int(12, 20), a = R.int(3, t - 3), m = t - a;
      return Math.random() < 0.5 ? C('What number is hiding?', '<div class="eq">' + num(a) + op('+') + blank() + op('=') + num(t) + '</div>', m, nums(m, 4, 0, 20))
        : C('What number is hiding?', '<div class="eq">' + num(t) + op('−') + blank() + op('=') + num(a) + '</div>', m, nums(m, 4, 0, 20));
    }
  });

  // 6 SEQ
  add({
    id: 'seq', name: 'Number Train', cat: 'maths', emoji: '🚂', color: '#ef476f', desc: 'What comes next?',
    gen(l) {
      let step, start, len = 5, hole;
      if (l === 1) { step = 1; start = R.int(1, 6); hole = len - 1; }
      else if (l === 2) { step = 1; start = R.int(1, 12); hole = R.int(1, 3); }
      else if (l === 3) { step = 2; start = R.int(0, 6) * 1; hole = R.int(2, 4); }
      else if (l === 4) { step = R.pick([5, 10, -1, -2]); start = step < 0 ? R.int(14, 20) : R.int(0, 3) * Math.abs(step); hole = R.int(2, 4); }
      else { step = R.pick([3, 4, -3, 5, -5, 10]); start = step < 0 ? R.int(25, 35) : R.int(1, 8); hole = R.int(1, 4); }
      const seq = Array.from({ length: len }, (_, i) => start + i * step), m = seq[hole];
      const cars = seq.map((v, i) => '<div class="car ' + (i === hole ? 'q' : '') + '"><b>' + (i === hole ? '?' : v) + '</b></div>').join('');
      return C('What number is missing?', '<div class="train">🚂' + cars + '</div>', m, nums(m, l === 1 ? 3 : 4, Math.min(...seq) - 3 > 0 ? Math.min(...seq) - 3 : 0, Math.max(...seq) + 3), { say: 'What number is missing from the train?' });
    }
  });

  // 7 ORDER (numbers)
  add({
    id: 'order', name: 'Number Order', cat: 'maths', emoji: '🔠', color: '#00a8cc', desc: 'Tap from small to big',
    gen(l) {
      const n = [3, 4, 4, 5, 5][l - 1], max = [10, 10, 20, 30, 50][l - 1];
      const s = new Set(); while (s.size < n) s.add(R.int(1, max)); const arr = Array.from(s);
      const desc = l >= 4 && Math.random() < 0.5;
      const sorted = arr.slice().sort((a, b) => desc ? b - a : a - b);
      return { kind: 'order', prompt: desc ? 'Tap the numbers from BIGGEST to smallest' : 'Tap the numbers from smallest to BIGGEST', say: desc ? 'Tap the numbers from biggest to smallest' : 'Tap the numbers from smallest to biggest',
        items: R.shuffle(arr).map(v => ({ k: String(v), h: String(v) })), order: sorted.map(String), key: sorted.join(', ') };
    }
  });

  // 8 PATTERN
  add({
    id: 'pattern', name: 'Pattern Fun', cat: 'logic', emoji: '🔴', color: '#ff6b9d', desc: 'What comes next?',
    gen(l) {
      const sets = [['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'], ['⭐', '❤️', '🔷', '🌙', '🍎', '🌸'], ['🐶', '🐱', '🐸', '🐥', '🐷', '🐼'], ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉']];
      const set = R.sample(R.pick(sets), 5);
      const units = [[[0, 1]], [[0, 0, 1], [0, 1, 1]], [[0, 1, 2]], [[0, 0, 1, 1], [0, 1, 0, 2]], [[0, 1, 2, 1], [0, 0, 1, 2], [0, 1, 2, 3]]][l - 1];
      const u = R.pick(units), total = Math.min(9, u.length * 2 + (l >= 4 ? 1 : 1));
      const seq = Array.from({ length: total + 1 }, (_, i) => u[i % u.length]);
      const ans = seq.pop(), shown = seq.map(i => set[i]);
      const right = set[ans], used = Array.from(new Set(shown));
      const wrongs = used.filter(x => x !== right); const spare = set.filter(x => !used.includes(x)); if (spare.length) wrongs.push(spare[0]);
      const need = l === 1 ? 3 : 4, wr = R.shuffle(wrongs).slice(0, need - 1);
      return C('What comes next in the pattern?', '<div class="pat">' + shown.map(x => '<i>' + x + '</i>').join('') + '<i class="q">?</i></div>', right, wr, { optCls: 'emo', say: 'What comes next in the pattern?' });
    }
  });

  // 9 ODD ONE OUT
  const FR = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍐', '🍒'], AN = ['🐶', '🐱', '🐰', '🐻', '🦁', '🐯', '🐸', '🐵', '🐼', '🐮'], VE = ['🚗', '🚌', '🚂', '🚲', '🚁', '🚜'],
    TO = ['🧸', '⚽', '🪁', '🧩', '🎲', '🪀'], FO = ['🍕', '🍔', '🍟', '🍦', '🍩', '🍪'], VG = ['🥕', '🥦', '🌽', '🍆', '🥔'], SE = ['🐟', '🐠', '🐙', '🐳', '🦀', '🐬'],
    FL = ['🐦', '🦅', '🦋', '🐝', '🦉'], LA = ['🐶', '🐱', '🐢', '🐘', '🐑', '🐴'], WA = ['⛵', '🚤', '🛶', '🚢'], CD = ['🍦', '🧊', '⛄', '❄️'], HT = ['🔥', '☀️', '🌶️', '☕'], TR = ['🌳', '🌴', '🌲'], FW = ['🌸', '🌻', '🌹', '🌷'];
  add({
    id: 'odd', name: 'Odd One Out', cat: 'logic', emoji: '🕵️', color: '#00b894', desc: 'Which one does not belong?',
    gen(l) {
      let maj, odd, n = 4;
      if (l <= 2) {
        const g = R.sample([FR, AN, VE, TO, FO], 2); maj = R.sample(g[0], 3); odd = R.pick(g[1]);
      } else {
        const pairs = [[SE, LA], [FL, LA], [FR, VG], [WA, VE.slice(0, 2).concat(['🚜'])], [CD, HT], [LA, SE], [FW, TR], [AN, VE]];
        const p = R.pick(pairs); maj = R.sample(p[0], l === 5 ? 4 : 3); odd = R.pick(p[1]); n = maj.length + 1;
      }
      const all = R.shuffle(maj.concat([odd]));
      return C('Which one does NOT belong?', '', odd, maj, { optCls: 'emo', say: 'Which one does not belong?' });
    }
  });

  // 10 MEMORY
  add({
    id: 'memory', name: 'Memory Match', cat: 'look', emoji: '🃏', color: '#f77f00', desc: 'Find the matching pairs',
    gen(l) {
      const pairs = [2, 3, 4, 6, 8][l - 1], cols = [2, 3, 4, 4, 4][l - 1];
      const pool = ['🐶', '🐱', '🐰', '🦁', '🐸', '🐼', '🍎', '🍌', '🍓', '🚗', '⭐', '🌈', '🎈', '🧸', '🦋', '🐢'];
      const cards = R.shuffle(R.sample(pool, pairs).flatMap(e => [e, e]));
      return { kind: 'memory', prompt: 'Find the matching pairs!', say: 'Find the matching pairs', cards, cols, pairs, key: '', noprint: true };
    }
  });

  // 11 SHADOW
  add({
    id: 'shadow', name: 'Shadow Match', cat: 'look', emoji: '👤', color: '#5f27cd', desc: 'Whose shadow is it?',
    gen(l) {
      const pools = [[AN, FR, VE], [AN, TO.concat(['🧸']), FR], [AN], [AN.concat(['🦊', '🐺', '🐹']), ['🐘', '🦒', '🦓', '🐪', '🐄']], [['🐶', '🐱', '🦊', '🐺', '🐯', '🦁', '🐹', '🐰']]][l - 1];
      let opts;
      if (l <= 2) { opts = R.sample(R.pick(pools).concat(R.pick(pools)), 12); opts = Array.from(new Set(opts)).slice(0, 3); }
      else { const g = R.pick(pools); opts = R.sample(g, 4); }
      const rt = R.pick(opts); const n = opts.length;
      return C('Whose shadow is this?', '<div class="shadow"><i>' + rt + '</i></div>', rt, opts.filter(x => x !== rt), { optCls: 'emo', say: 'Whose shadow is this?' });
    }
  });

  // 12 FIRST LETTER
  const WORDS = [['apple', '🍎'], ['ball', '⚽'], ['cat', '🐱'], ['dog', '🐶'], ['egg', '🥚'], ['fish', '🐟'], ['goat', '🐐'], ['hat', '🎩'], ['kite', '🪁'], ['lion', '🦁'], ['moon', '🌙'], ['orange', '🍊'], ['pig', '🐷'], ['rabbit', '🐰'], ['sun', '☀️'], ['tree', '🌳'], ['umbrella', '☂️'], ['van', '🚐'], ['zebra', '🦓'], ['bee', '🐝'], ['banana', '🍌'], ['cow', '🐮'], ['duck', '🦆'], ['frog', '🐸'], ['grapes', '🍇'], ['key', '🔑'], ['leaf', '🍃'], ['mouse', '🐭'], ['owl', '🦉'], ['pizza', '🍕'], ['snake', '🐍'], ['tiger', '🐯'], ['bus', '🚌'], ['car', '🚗'], ['star', '⭐'], ['house', '🏠'], ['bird', '🐦'], ['cake', '🍰'], ['drum', '🥁'], ['hen', '🐔']];
  const W3 = ['cat', 'dog', 'sun', 'pig', 'hat', 'bus', 'cow', 'hen', 'bee', 'car', 'key', 'owl'], W4 = ['fish', 'frog', 'duck', 'kite', 'moon', 'star', 'cake', 'bird', 'lion', 'tree', 'leaf', 'ball', 'goat', 'drum'],
    W5 = ['apple', 'tiger', 'zebra', 'mouse', 'snake', 'house', 'pizza', 'grapes', 'rabbit', 'banana', 'orange'];
  const EM = {}; WORDS.forEach(w => EM[w[0]] = w[1]);
  const L = 'abcdefghijklmnopqrstuvwxyz';
  const CONF = { b: 'd', d: 'b', p: 'q', q: 'p', m: 'n', n: 'm', u: 'v', v: 'u', i: 'j', j: 'i', f: 't', t: 'f', c: 'e', e: 'c', g: 'q' };
  function letterOpts(ch, n, conf) {
    const o = new Set(); if (conf && CONF[ch]) o.add(CONF[ch]);
    while (o.size < n - 1) { const x = R.pick(L.split('')); if (x !== ch) o.add(x); }
    return Array.from(o);
  }
  add({
    id: 'firstletter', name: 'First Sound', cat: 'words', emoji: '🔤', color: '#e84393', desc: 'Which letter does it start with?',
    gen(l) {
      if (l === 5) {
        const w = R.pick(WORDS.filter(x => x[0].length >= 3)), last = w[0].slice(-1);
        return C('Which letter does <b>' + w[0] + '</b> END with?', '<div class="pic">' + w[1] + '</div>', last.toUpperCase(), letterOpts(last, 4, true).map(x => x.toUpperCase()), { optCls: 'letters', say: 'Which letter does ' + w[0] + ' end with?' });
      }
      const w = R.pick(WORDS), f = w[0][0], up = l <= 2;
      const fmt = x => up ? x.toUpperCase() : x;
      return C('Which letter does it start with?', '<div class="pic">' + w[1] + '</div>' + (l >= 3 ? '<div class="wordshow">' + w[0] + '</div>' : ''), fmt(f), letterOpts(f, l === 1 ? 3 : 4, l >= 4).map(fmt), { optCls: 'letters', say: 'Which letter does it start with? ' + (l >= 3 ? w[0] : '') });
    }
  });

  // 13 MISSING LETTER
  add({
    id: 'missingletter', name: 'Missing Letter', cat: 'words', emoji: '🔡', color: '#00cec9', desc: 'Which letter is missing?',
    gen(l) {
      const list = l <= 2 ? W3 : l === 3 ? W4 : W5, w = R.pick(list);
      const pos = l === 1 ? 0 : R.int(0, w.length - 1), ch = w[pos];
      const boxes = w.split('').map((c, i) => '<b class="lb ' + (i === pos ? 'q' : '') + '">' + (i === pos ? '?' : c) + '</b>').join('');
      let wr = letterOpts(ch, l === 1 ? 3 : 4, l >= 4);
      if ('aeiou'.includes(ch) && l >= 3) { wr = R.sample('aeiou'.split('').filter(x => x !== ch), 3); }
      return C('Which letter is missing?', '<div class="pic">' + EM[w] + '</div><div class="lbs">' + boxes + '</div>', ch, wr, { optCls: 'letters', say: 'Which letter is missing?' });
    }
  });

  // 14 WORD BUILD
  const W6 = ['orange', 'rabbit', 'banana', 'monkey', 'flower'];
  EM.monkey = '🐵'; EM.flower = '🌸';
  add({
    id: 'wordbuild', name: 'Build the Word', cat: 'words', emoji: '🧱', color: '#fd9644', desc: 'Tap letters to spell',
    gen(l) {
      const list = l <= 2 ? W3 : l === 3 ? W4 : l === 4 ? W5.filter(x => x.length === 5) : W5.concat(W6).filter(x => x.length >= 5), w = R.pick(list);
      return { kind: 'order', prompt: 'Tap the letters to spell the word', say: 'Spell the word ' + w, pic: EM[w], items: R.shuffle(w.split('').map((c, i) => ({ k: c + i, h: c }))), order: w.split('').map((c, i) => c + i), word: w, key: w, spell: true };
    }
  });

  // 15 RHYME
  const RH = [['cat', 'hat', 'bat', 'mat', 'rat'], ['dog', 'log', 'frog', 'fog'], ['sun', 'bun', 'run', 'fun'], ['pen', 'hen', 'ten', 'men'], ['bee', 'tree', 'key', 'sea'], ['star', 'car', 'jar', 'far'], ['cake', 'lake', 'snake', 'bake'], ['fish', 'dish', 'wish'], ['bed', 'red', 'head'], ['moon', 'spoon', 'noon'], ['ball', 'wall', 'tall', 'fall'], ['night', 'light', 'kite', 'bite'], ['bear', 'chair', 'hair', 'pear'], ['rain', 'train', 'plane', 'chain'], ['boat', 'coat', 'goat'], ['king', 'ring', 'sing', 'wing']];
  add({
    id: 'rhyme', name: 'Rhyme Time', cat: 'words', emoji: '🎵', color: '#fa8231', desc: 'Which word rhymes?',
    gen(l) {
      const fam = R.pick(RH), [w, r] = R.sample(fam, 2), others = R.sample(RH.filter(f => f !== fam), 3).map(f => R.pick(f));
      return C('Which word rhymes with <b>' + w + '</b>?', '<div class="wordshow big">' + w + '</div>', r, others.slice(0, l <= 2 ? 2 : 3), { optCls: 'words', say: 'Which word rhymes with ' + w + '?' });
    }
  });

  // 16 OPPOSITES
  const OP = [['big', 'small'], ['hot', 'cold'], ['up', 'down'], ['in', 'out'], ['day', 'night'], ['happy', 'sad'], ['fast', 'slow'], ['full', 'empty'], ['tall', 'short'], ['old', 'young'],
    ['hard', 'soft'], ['wet', 'dry'], ['clean', 'dirty'], ['loud', 'quiet'], ['near', 'far'], ['early', 'late'], ['thick', 'thin'], ['push', 'pull'], ['open', 'closed'], ['sweet', 'sour'],
    ['smooth', 'rough'], ['awake', 'asleep'], ['above', 'below'], ['laugh', 'cry'], ['buy', 'sell'], ['top', 'bottom'], ['wide', 'narrow'], ['begin', 'end'], ['heavy', 'light'], ['first', 'last']];
  add({
    id: 'opposites', name: 'Opposites', cat: 'words', emoji: '🔄', color: '#4b7bec', desc: 'Find the opposite word',
    gen(l) {
      const lim = l === 1 ? 10 : l === 2 ? 16 : l === 3 ? 22 : 30, p = R.pick(OP.slice(0, lim)), [a, b] = Math.random() < 0.5 ? p : [p[1], p[0]];
      const wr = R.sample(OP.filter(x => x !== p).flat().filter(x => x !== a && x !== b), l <= 3 ? 2 : 3);
      return C('What is the opposite of <b>' + a + '</b>?', '<div class="wordshow big">' + a + '</div>', b, wr, { optCls: 'words', say: 'What is the opposite of ' + a + '?' });
    }
  });

  // 17 CLOCK
  function clockSVG(h, m) {
    const hx = (h % 12 + m / 60) * 30, mx = m * 6; let t = '';
    for (let i = 1; i <= 12; i++) { const a = i * 30 * Math.PI / 180; t += '<text x="' + (100 + 74 * Math.sin(a)).toFixed(1) + '" y="' + (106 - 74 * Math.cos(a)).toFixed(1) + '" text-anchor="middle" font-size="22" font-weight="700" fill="#3b3b6d">' + i + '</text>'; }
    return '<svg class="clock" viewBox="0 0 200 200"><circle cx="100" cy="100" r="94" fill="#fff" stroke="#ff7a59" stroke-width="8"/><circle cx="100" cy="100" r="86" fill="none" stroke="#ffd166" stroke-width="3" stroke-dasharray="2 8"/>' + t +
      '<line x1="100" y1="100" x2="100" y2="52" stroke="#3b3b6d" stroke-width="9" stroke-linecap="round" transform="rotate(' + hx + ' 100 100)"/><line x1="100" y1="100" x2="100" y2="30" stroke="#ef476f" stroke-width="6" stroke-linecap="round" transform="rotate(' + mx + ' 100 100)"/><circle cx="100" cy="100" r="8" fill="#ffb400"/></svg>';
  }
  function timeWords(h, m, l) {
    const nx = h % 12 + 1;
    if (l <= 2 && m === 0) return h + " o'clock";
    if (m === 0) return h + " o'clock";
    if (m === 30) return 'half past ' + h;
    if (m === 15) return 'quarter past ' + h;
    if (m === 45) return 'quarter to ' + nx;
    return h + ':' + String(m).padStart(2, '0');
  }
  add({
    id: 'clock', name: 'Clock Time', cat: 'look', emoji: '⏰', color: '#ee5a24', desc: 'What time is it?',
    gen(l) {
      const mins = [[0], [0, 30], [0, 30], [0, 15, 30, 45], [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]][l - 1];
      const h = R.int(1, 12), m = R.pick(mins), right = timeWords(h, m, l), wr = new Set();
      let guard = 0;
      while (wr.size < (l === 1 ? 2 : 3) && guard++ < 60) { const hh = R.int(1, 12), mm = R.pick(mins), t = timeWords(hh, mm, l); if (t !== right && (l < 3 || Math.random() < 0.6 || hh === h)) wr.add(t); }
      return C('What time does the clock show?', clockSVG(h, m), right, Array.from(wr), { optCls: 'words', say: 'What time does the clock show?' });
    }
  });

  // 18 SHAPES
  const SHAPES = {
    circle: { n: 0, svg: c => '<circle cx="50" cy="50" r="40" fill="' + c + '"/>' }, square: { n: 4, svg: c => '<rect x="12" y="12" width="76" height="76" rx="3" fill="' + c + '"/>' },
    triangle: { n: 3, svg: c => '<polygon points="50,10 92,86 8,86" fill="' + c + '"/>' }, rectangle: { n: 4, svg: c => '<rect x="4" y="24" width="92" height="52" rx="3" fill="' + c + '"/>' },
    star: { n: 10, svg: c => '<polygon points="' + Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 19 : 44, a = Math.PI * i / 5 - Math.PI / 2; return (50 + r * Math.cos(a)).toFixed(1) + ',' + (54 + r * Math.sin(a)).toFixed(1); }).join(' ') + '" fill="' + c + '"/>' },
    heart: { n: 0, svg: c => '<path d="M50 88 C10 56 6 30 24 18 C38 9 50 20 50 30 C50 20 62 9 76 18 C94 30 90 56 50 88Z" fill="' + c + '"/>' },
    oval: { n: 0, svg: c => '<ellipse cx="50" cy="50" rx="44" ry="28" fill="' + c + '"/>' }, diamond: { n: 4, svg: c => '<polygon points="50,6 90,50 50,94 10,50" fill="' + c + '"/>' },
    pentagon: { n: 5, svg: c => '<polygon points="' + Array.from({ length: 5 }, (_, i) => { const a = Math.PI * 2 * i / 5 - Math.PI / 2; return (50 + 42 * Math.cos(a)).toFixed(1) + ',' + (54 + 42 * Math.sin(a)).toFixed(1); }).join(' ') + '" fill="' + c + '"/>' },
    hexagon: { n: 6, svg: c => '<polygon points="' + Array.from({ length: 6 }, (_, i) => { const a = Math.PI * 2 * i / 6; return (50 + 44 * Math.cos(a)).toFixed(1) + ',' + (50 + 44 * Math.sin(a)).toFixed(1); }).join(' ') + '" fill="' + c + '"/>' }
  };
  const SCOL = ['#ff6b6b', '#4dabf7', '#51cf66', '#ffd43b', '#cc5de8', '#ff922b'];
  const shapeSVG = (nm, col) => '<svg class="shape" viewBox="0 0 100 100">' + SHAPES[nm].svg(col || R.pick(SCOL)) + '</svg>';
  add({
    id: 'shapes', name: 'Shape Detective', cat: 'look', emoji: '🔺', color: '#10ac84', desc: 'Name the shapes',
    gen(l) {
      const pool = [['circle', 'square', 'triangle', 'rectangle'], ['circle', 'square', 'triangle', 'rectangle', 'star', 'heart', 'oval', 'diamond'], ['circle', 'square', 'triangle', 'rectangle', 'star', 'heart', 'oval', 'diamond', 'pentagon', 'hexagon'], ['triangle', 'square', 'pentagon', 'hexagon', 'rectangle'], ['triangle', 'square', 'pentagon', 'hexagon']][l - 1];
      if (l <= 3) {
        const nm = R.pick(pool);
        return C('What shape is this?', shapeSVG(nm), nm, R.sample(pool.filter(x => x !== nm), l === 1 ? 2 : 3), { optCls: 'words', say: 'What shape is this?' });
      }
      if (l === 4) {
        const nm = R.pick(pool);
        return C('How many sides does it have?', shapeSVG(nm), SHAPES[nm].n, nums(SHAPES[nm].n, 4, 3, 7), { optCls: 'numbers', say: 'How many sides does this shape have?' });
      }
      const nm = R.pick(pool), n = SHAPES[nm].n, others = pool.filter(x => SHAPES[x].n !== n);
      const col = R.pick(SCOL);
      return C('Which shape has <b>' + n + '</b> sides?', '', shapeSVG(nm, col), R.sample(others, 3).map(x => shapeSVG(x, col)), { optCls: 'emo', key: nm, say: 'Which shape has ' + n + ' sides?' });
    }
  });

  // ---------- categories & meta
  const CATS = {
    maths: { name: 'Number Fun', color: '#ff8a5c', emoji: '🔢' },
    logic: { name: 'Think & Solve', color: '#6c8cff', emoji: '🧠' },
    words: { name: 'Letters & Words', color: '#e84393', emoji: '🔤' },
    look: { name: 'Look & Learn', color: '#10ac84', emoji: '👀' },
    books: { name: 'Puzzle Books', color: '#b06cff', emoji: '📚' }
  };

  window.PZ = { T, CATS, R, strip, MAXLEVEL: 10, H: { C, nums, eg, egx, blank, op, num, scatter, COUNTABLE, clockSVG, timeWords, shapeSVG, SHAPES, SCOL, WORDS, EM, RH, OP, letterOpts, LET: L } };
})();
