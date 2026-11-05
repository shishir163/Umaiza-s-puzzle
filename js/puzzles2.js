/* Levels 6-10 for every game. Wraps the generators in puzzles.js: levels 1-5 stay as they are. */
(function () {
  const { T, R } = PZ, H = PZ.H;
  const { C, nums, eg, blank, op, num, COUNTABLE, clockSVG, shapeSVG, SHAPES, SCOL, WORDS, EM, RH, OP, letterOpts } = H;
  const wrap = (id, hard) => { const old = T[id].gen; T[id].gen = function (l) { return l <= 5 ? old.call(this, l) : hard(l); }; };
  const uniq = a => Array.from(new Set(a));
  function nb(right, n, lo) { // plausible wrong numbers, sized to the answer
    const D = right < 20 ? [1, -1, 2, -2, 3, -3, 5, -5, 10] : right < 100 ? [1, -1, 2, -2, 3, -3, 5, -5, 10, -10] : [1, -1, 2, -2, 10, -10, 20, -20, 100, -100];
    const c = R.shuffle(D).map(d => right + d).filter(v => v >= Math.max(lo || 0, 0) && v !== right);
    return uniq(c).slice(0, n - 1);
  }
  const eqv = (a, o, b, t) => '<div class="eq">' + a + op(o) + b + op('=') + blank(t) + '</div>';

  // ---- ADD
  wrap('add', l => {
    let a, b;
    if (l === 6) { a = R.int(10, 22); b = R.int(4, 9); }
    else if (l === 7) { a = R.int(11, 39); b = R.int(10, 30); }
    else if (l === 8) { a = R.int(20, 70); b = R.int(10, 99 - a); }
    else if (l === 9) { a = R.int(30, 99); b = R.int(30, 99); }
    else { a = R.int(100, 500); b = R.int(100, 400); }
    const t = a + b;
    return C('What is ' + a + ' + ' + b + ' ?', eqv(num(a), '+', num(b)), t, nb(t, 4), { optCls: 'numbers' });
  });

  // ---- SUB
  wrap('sub', l => {
    let t, k;
    if (l === 6) { t = R.int(15, 30); k = R.int(3, 12); }
    else if (l === 7) { t = R.int(30, 50); k = R.int(10, t - 5); }
    else if (l === 8) { t = R.int(50, 100); k = R.int(10, t - 5); }
    else if (l === 9) { do { t = R.int(41, 99); } while (t % 10 > 7); do { k = R.int(12, t - 5); } while (k % 10 <= t % 10); }
    else { t = R.int(200, 600); k = R.int(30, t - 50); }
    const r = t - k;
    return C('What is ' + t + ' − ' + k + ' ?', eqv(num(t), '−', num(k)), r, nb(r, 4), { optCls: 'numbers' });
  });

  // ---- COUNT -> groups and times tables
  wrap('count', l => {
    const e = R.pick(COUNTABLE);
    if (l === 6) { const n = R.int(3, 6); return C('Count in 2s. How many altogether?', '<div class="grps">' + Array.from({ length: n }, () => '<span class="g">' + eg(e, 2) + '</span>').join('') + '</div>', 2 * n, nb(2 * n, 4, 1), { optCls: 'numbers', say: 'Count in twos. How many altogether?' }); }
    if (l === 7) { const n = R.int(2, 4); return C('Count in 5s. How many altogether?', '<div class="grps">' + Array.from({ length: n }, () => '<span class="g">' + eg(e, 5) + '</span>').join('') + '</div>', 5 * n, nb(5 * n, 4, 1), { optCls: 'numbers', say: 'Count in fives. How many altogether?' }); }
    if (l === 8) { const n = R.int(2, 9); return C(n + ' bags with 10 in each. How many altogether?', '<div class="grps">' + Array.from({ length: n }, () => '<span class="g bag">👜<b>10</b></span>').join('') + '</div>', 10 * n, nb(10 * n, 4, 1), { optCls: 'numbers' }); }
    if (l === 9) {
      const r = R.int(2, 5), c = R.int(2, 6), t = r * c;
      return C('How many are there? Rows × columns', '<div class="arr" style="grid-template-columns:repeat(' + c + ',auto)">' + Array.from({ length: t }, () => '<i>' + e + '</i>').join('') + '</div>', t, uniq([r * (c + 1), (r + 1) * c, r + c, t + 2, t - 2]).filter(v => v > 0 && v !== t).slice(0, 3), { optCls: 'numbers', say: 'How many are there? Rows times columns' });
    }
    const a = R.int(2, 9), b = R.int(2, 9), t = a * b;
    return C('What is ' + a + ' × ' + b + ' ?', eqv(num(a), '×', num(b)), t, uniq([a * (b + 1), a * (b - 1), (a + 1) * b, a + b, t + 2, t - 2]).filter(v => v > 0 && v !== t).slice(0, 3), { optCls: 'numbers' });
  });

  // ---- MORE -> signs
  const signQ = (L, Rr, lv, rv, extra) => {
    const right = lv < rv ? '&lt;' : lv > rv ? '&gt;' : '=';
    return C('Which sign goes in the box?', '<div class="eq">' + L + blank('?') + Rr + '</div>', right, ['&lt;', '&gt;', '='].filter(x => x !== right), Object.assign({ optCls: 'numbers', say: 'Which sign goes in the box? Less than, greater than, or equal?' }, extra));
  };
  wrap('more', l => {
    if (l === 6) { const a = R.int(10, 99); let b = R.int(10, 99); if (a === b) b = a + 1; const big = Math.random() < .5; return C(big ? 'Which number is BIGGER?' : 'Which number is SMALLER?', '', big ? Math.max(a, b) : Math.min(a, b), [big ? Math.min(a, b) : Math.max(a, b)], { optCls: 'numbers' }); }
    if (l === 7) { const a = R.int(10, 100); const b = Math.random() < .15 ? a : R.int(10, 100); return signQ(num(a), num(b), a, b); }
    if (l === 8) { const a = R.int(5, 40), b = R.int(5, 40), t = a + b, c = Math.random() < .25 ? t : Math.max(2, t + R.int(-8, 8)); return signQ(num(a + ' + ' + b), num(c), t, c); }
    if (l === 9) { const a = R.int(2, 9), b = R.int(2, 9), p = a * b, c = R.int(5, 40), d = Math.random() < .25 ? Math.max(1, p - c) : R.int(1, 40); return signQ(num(a + ' × ' + b), num(c + ' + ' + d), p, c + d); }
    const pairs = [[[2, 6], [3, 4]], [[2, 8], [4, 4]], [[3, 6], [2, 9]], [[2, 10], [4, 5]], [[3, 8], [4, 6]], [[2, 12], [3, 8]]];
    if (Math.random() < .5) { const [x, y] = R.pick(pairs); return signQ(num(x[0] + ' × ' + x[1]), num(y[0] + ' × ' + y[1]), x[0] * x[1], y[0] * y[1]); }
    const a = R.int(100, 900); let b = R.int(100, 900); if (Math.random() < .2) b = a;
    return signQ(num(a), num(b), a, b);
  });

  // ---- MISSING
  wrap('missing', l => {
    let t, a, m;
    if (l === 6) {
      if (Math.random() < .5) { t = R.int(15, 30); a = R.int(10, t - 3); m = t - a; return C('What number is hiding?', '<div class="eq">' + num(a) + op('+') + blank() + op('=') + num(t) + '</div>', m, nb(m, 4), { optCls: 'numbers' }); }
      a = R.int(15, 30); m = R.int(3, 12); t = a - m; return C('What number is hiding?', '<div class="eq">' + blank() + op('−') + num(m) + op('=') + num(t) + '</div>', a, nb(a, 4), { optCls: 'numbers' });
    }
    if (l === 7) { t = R.int(25, 50); a = R.int(10, t - 8); m = t - a; return C('What number is hiding?', Math.random() < .5 ? '<div class="eq">' + num(a) + op('+') + blank() + op('=') + num(t) + '</div>' : '<div class="eq">' + blank() + op('+') + num(a) + op('=') + num(t) + '</div>', m, nb(m, 4), { optCls: 'numbers' }); }
    if (l === 8) { const a2 = R.pick([10, 20, 30, 40, 50, 60]); t = 100; m = t - a2; return C('Make 100! What goes in the box?', '<div class="eq">' + num(a2) + op('+') + blank() + op('=') + num(100) + '</div>', m, uniq([m + 10, m - 10, m + 5, m - 5, m + 20]).filter(v => v > 0).slice(0, 3), { optCls: 'numbers' }); }
    if (l === 9) { a = R.int(2, 5); m = R.int(2, 9); t = a * m; return C('What number is hiding?', '<div class="eq">' + num(a) + op('×') + blank() + op('=') + num(t) + '</div>', m, uniq([m + 1, m - 1, m + 2, a + m, m + 3]).filter(v => v > 0 && v !== m).slice(0, 3), { optCls: 'numbers' }); }
    a = R.int(2, 9); m = R.int(2, 9); t = a * m;
    return Math.random() < .5 ? C('What number is hiding?', '<div class="eq">' + blank() + op('×') + num(a) + op('=') + num(t) + '</div>', m, uniq([m + 1, m - 1, m + 2, a + m, m + 3]).filter(v => v > 0 && v !== m).slice(0, 3), { optCls: 'numbers' })
      : C('What number is hiding?', '<div class="eq">' + num(t) + op('÷') + blank() + op('=') + num(a) + '</div>', m, uniq([m + 1, m - 1, m + 2, a + m, m + 3]).filter(v => v > 0 && v !== m).slice(0, 3), { optCls: 'numbers' });
  });

  // ---- SEQ
  wrap('seq', l => {
    let seq = [], hole = R.int(1, 3), len = 5;
    if (l === 6) { const st = R.pick([2, 3, 4, 5, 6, 7]), s = R.int(1, 15); seq = Array.from({ length: len }, (_, i) => s + i * st); }
    else if (l === 7) { const st = R.pick([3, 4, 5, 10]), s = R.int(50, 100); seq = Array.from({ length: len }, (_, i) => s - i * st); }
    else if (l === 8) { const st = R.pick([15, 20, 25, 50, 100]), s = R.int(0, 4) * st; seq = Array.from({ length: len }, (_, i) => s + i * st); }
    else if (l === 9) { let d = R.int(1, 3), v = R.int(1, 10); for (let i = 0; i < len; i++) { seq.push(v); v += d; d++; } }
    else { const k = R.int(0, 2); if (k === 0) { const s = R.int(1, 4); seq = Array.from({ length: len }, (_, i) => s * Math.pow(2, i)); } else if (k === 1) { const s = R.pick([5, 6, 8, 10]) * 16; seq = Array.from({ length: len }, (_, i) => s / Math.pow(2, i)); } else { const a = R.int(2, 5), b = R.int(6, 10); let v = R.int(1, 10); for (let i = 0; i < len; i++) { seq.push(v); v += i % 2 ? b : a; } } }
    const m = seq[hole];
    const cars = seq.map((v, i) => '<div class="car ' + (i === hole ? 'q' : '') + '"><b>' + (i === hole ? '?' : v) + '</b></div>').join('');
    return C('What number is missing?', '<div class="train">🚂' + cars + '</div>', m, nb(m, 4), { optCls: 'numbers', say: 'What number is missing from the train?' });
  });

  // ---- ORDER
  wrap('order', l => {
    if (l === 10) {
      const exps = []; const vals = new Set();
      while (exps.length < 4) {
        const t = R.int(0, 2); let e, v;
        if (t === 0) { const a = R.int(2, 12), b = R.int(2, 12); e = a + ' + ' + b; v = a + b; }
        else if (t === 1) { const a = R.int(10, 30), b = R.int(2, 9); e = a + ' − ' + b; v = a - b; }
        else { const a = R.int(2, 6), b = R.int(2, 6); e = a + ' × ' + b; v = a * b; }
        if (!vals.has(v)) { vals.add(v); exps.push({ e, v }); }
      }
      const desc = Math.random() < .5, sorted = exps.slice().sort((a, b) => desc ? b.v - a.v : a.v - b.v);
      return { kind: 'order', prompt: desc ? 'Work them out. Tap from BIGGEST to smallest' : 'Work them out. Tap from smallest to BIGGEST', say: 'Work out each sum. Then tap them in order.', items: R.shuffle(exps).map(x => ({ k: 'v' + x.v, h: x.e })), order: sorted.map(x => 'v' + x.v), key: sorted.map(x => x.e + ' = ' + x.v).join(', '), wide: true };
    }
    const n = [5, 5, 6, 6][l - 6], max = [99, 199, 500, 999][l - 6];
    const s = new Set(); while (s.size < n) s.add(R.int(l === 9 ? 100 : 10, max)); const arr = Array.from(s);
    const desc = Math.random() < .5, sorted = arr.slice().sort((a, b) => desc ? b - a : a - b);
    return { kind: 'order', prompt: desc ? 'Tap the numbers from BIGGEST to smallest' : 'Tap the numbers from smallest to BIGGEST', say: desc ? 'Tap the numbers from biggest to smallest' : 'Tap the numbers from smallest to biggest', items: R.shuffle(arr).map(v => ({ k: String(v), h: String(v) })), order: sorted.map(String), key: sorted.join(', ') };
  });

  // ---- PATTERN
  wrap('pattern', l => {
    const sets = [['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'], ['⭐', '❤️', '🔷', '🌙', '🍎', '🌸'], ['🐶', '🐱', '🐸', '🐥', '🐷', '🐼']];
    const shell = (items, gr) => '<div class="pat' + (gr ? ' gr' : '') + '">' + items.map(x => '<i>' + x + '</i>').join('') + '<i class="q">?</i></div>';
    if (l === 6 || l === 9) {
      const set = l === 6 ? R.sample(R.pick(sets), 5) : ['⬆️', '➡️', '⬇️', '⬅️', '↗️', '↘️'];
      const units = l === 6 ? [[0, 1, 2, 3], [0, 0, 1, 2, 0], [0, 1, 1, 2, 2], [0, 1, 2, 1, 3]] : [[0, 1, 2, 3], [0, 0, 1, 1, 2, 2], [0, 1, 0, 2, 3], [0, 1, 2, 3, 4, 5]];
      const u = R.pick(units), total = Math.min(11, u.length * 2 + 1 + (u.length < 5 ? 1 : 0));
      const seq = Array.from({ length: total + 1 }, (_, i) => u[i % u.length]), ans = seq.pop(), shown = seq.map(i => set[i]), right = set[ans];
      const wr = R.shuffle(uniq(set.filter(x => x !== right))).slice(0, 3);
      return C('What comes next in the pattern?', shell(shown), right, wr, { optCls: 'emo', say: 'What comes next in the pattern?' });
    }
    if (l === 7) {
      const e = R.pick(['🔴', '🔵', '🟢', '🟡', '⭐', '🍎']), n = R.int(1, 3), shown = [n, n + 1, n + 2].map(k => e.repeat(k)), right = n + 3;
      const wr = uniq([right + 1, right - 1, right + 2, n + 2]).filter(v => v > 0 && v !== right).slice(0, 3);
      return C('The pattern is growing. What comes next?', shell(shown, 1), '<span class="eg"><i>' + e.repeat(right) + '</i></span>', wr.map(v => '<span class="eg"><i>' + e.repeat(v) + '</i></span>'), { optCls: 'groups g2', key: right + ' ' + e, say: 'The pattern is growing. What comes next?' });
    }
    if (l === 8) {
      const [a, b] = R.sample(['🍎', '🍌', '🍇', '🍓', '🐶', '🐱', '⭐', '🌙'], 2), s = R.int(1, 4), shown = [0, 1, 2, 3, 4].map(i => (i % 2 ? b : a) + '<b>' + (s + i) + '</b>'), ni = 5;
      const right = (ni % 2 ? b : a) + ' ' + (s + ni), other = (ni % 2 ? a : b);
      return C('The picture and the number both follow a pattern. What comes next?', shell(shown), right, [other + ' ' + (s + ni), (ni % 2 ? b : a) + ' ' + (s + ni - 1), (ni % 2 ? b : a) + ' ' + (s + ni + 1)], { optCls: 'words', key: right, say: 'The picture and the number both follow a pattern. What comes next?' });
    }
    const [a, b] = R.sample(['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'], 2), shown = [1, 2, 3, 4].map((k, i) => (i % 2 ? b : a).repeat(k)), right = 5;
    return C('Colours take turns and the number grows. What comes next?', shell(shown, 1), '<span class="eg"><i>' + a.repeat(5) + '</i></span>', [b.repeat(5), a.repeat(4), b.repeat(6)].map(x => '<span class="eg"><i>' + x + '</i></span>'), { optCls: 'groups g2', key: '5 ' + a, say: 'Colours take turns and the number grows. What comes next?' });
  });

  // ---- ODD
  const CAT = { colours: ['red', 'blue', 'green', 'yellow', 'pink', 'purple'], days: ['Monday', 'Friday', 'Sunday', 'Tuesday', 'Thursday'], animals: ['dog', 'cat', 'cow', 'hen', 'fox', 'goat'], body: ['hand', 'foot', 'nose', 'ear', 'eye', 'knee'], furniture: ['chair', 'table', 'bed', 'sofa', 'desk'], fruit: ['apple', 'mango', 'banana', 'grape', 'lemon'], months: ['May', 'June', 'March', 'July'], school: ['pencil', 'book', 'ruler', 'eraser'], vehicles: ['bus', 'train', 'car', 'bike'] };
  wrap('odd', l => {
    if (l === 6) { const ev = Math.random() < .5, pool = R.shuffle(Array.from({ length: 30 }, (_, i) => i + 1)); const maj = pool.filter(x => (x % 2 === 0) === ev).slice(0, 3), odd = pool.find(x => (x % 2 === 0) !== ev); return C(ev ? 'Three numbers are EVEN. Which one is NOT even?' : 'Three numbers are ODD. Which one is NOT odd?', '', odd, maj, { optCls: 'numbers' }); }
    if (l === 7) { const V = ['A', 'E', 'I', 'O', 'U'], K = 'BCDFGHJKLMNPRSTW'.split(''), v = Math.random() < .5; const maj = R.sample(v ? V : K, 3), odd = R.pick(v ? K : V); return C(v ? 'Three letters are vowels. Which one is NOT a vowel?' : 'Three letters are NOT vowels. Which one is a vowel?', '', odd, maj, { optCls: 'letters' }); }
    if (l === 8) { const ks = R.sample(Object.keys(CAT), 2), maj = R.sample(CAT[ks[0]], 3), odd = R.pick(CAT[ks[1]]); return C('Which word does NOT belong?', '', odd, maj, { optCls: 'words' }); }
    if (l === 9) { const m = R.pick([5, 10]), mul = R.shuffle(Array.from({ length: 10 }, (_, i) => (i + 1) * m)).slice(0, 3), odd = R.int(1, 10 * m); const bad = odd % m === 0 ? odd + 1 : odd; return C('Which number is NOT in the ' + m + ' times table?', '', bad, mul, { optCls: 'numbers' }); }
    const four = R.sample(['square', 'rectangle', 'diamond'], 3), others = ['triangle', 'pentagon', 'hexagon'], odd = R.pick(others), col = R.pick(SCOL);
    return C('Which shape does NOT have 4 sides?', '', shapeSVG(odd, col), four.map(x => shapeSVG(x, col)), { optCls: 'emo', key: odd });
  });

  // ---- MEMORY
  wrap('memory', l => {
    const pairs = [10, 12, 12, 15, 18][l - 6], cols = [5, 6, 6, 6, 6][l - 6];
    const pool = ['🐶', '🐱', '🐰', '🦁', '🐸', '🐼', '🍎', '🍌', '🍓', '🚗', '⭐', '🌈', '🎈', '🧸', '🦋', '🐢', '🍇', '🍉', '🦊', '🐯', '🐮', '🐷', '🐵', '🚌'];
    const faces = ['😀', '😃', '😄', '😁', '😆', '🙂', '😊', '😇', '🥰', '😍', '😎', '🤩', '😜', '🤗', '😴', '😮', '😢', '😡'];
    const src = l === 8 ? faces : pool;
    const cards = R.shuffle(R.sample(src, pairs).flatMap(e => [e, e]));
    return { kind: 'memory', prompt: 'Find the matching pairs!', say: 'Find the matching pairs', cards, cols, pairs, key: '', noprint: true, small: true };
  });

  // ---- SHADOW
  const SIM = [['🐶', '🐱', '🦊', '🐺', '🐯', '🦁', '🐹', '🐰', '🐻', '🐼'], ['🐢', '🐊', '🦎', '🐍', '🐸', '🦖'], ['🦆', '🐔', '🐧', '🦉', '🦅', '🐥', '🦜'], ['🐠', '🐟', '🐡', '🐬', '🐳', '🦈', '🐙']];
  const sil = (e, f) => '<i class="sil' + (f ? ' flip' : '') + '">' + e + '</i>';
  wrap('shadow', l => {
    const g = R.pick(SIM), n = l === 7 ? 4 : 5, opts = R.sample(g, n), rt = R.pick(opts);
    if (l === 6) return C('Whose shadow is this?', '<div class="shadow"><i>' + rt + '</i></div>', rt, opts.filter(x => x !== rt), { optCls: 'emo', key: rt });
    if (l === 7 || l === 8 || l === 10) {
      const f = l === 10; return C('Which shadow belongs to this picture?', '<div class="pic">' + rt + '</div>', sil(rt, f), opts.filter(x => x !== rt).map(x => sil(x, f)), { optCls: 'emo', key: rt });
    }
    return C('Whose shadow is this? (It is turned around!)', '<div class="shadow"><i style="transform:scaleX(-1);display:inline-block">' + rt + '</i></div>', rt, opts.filter(x => x !== rt), { optCls: 'emo', key: rt });
  });

  // ---- FIRST LETTER
  const DIG = [['ship', '🚢', 'sh'], ['sheep', '🐑', 'sh'], ['shell', '🐚', 'sh'], ['shoe', '👟', 'sh'], ['chair', '🪑', 'ch'], ['cheese', '🧀', 'ch'], ['chick', '🐤', 'ch'], ['cherry', '🍒', 'ch'], ['thumb', '👍', 'th'], ['three', '3️⃣', 'th']];
  const vow = w => w.split('').filter(c => 'aeiou'.indexOf(c) >= 0).length;
  function misspell(w) {
    const out = new Set(); let g = 0;
    while (out.size < 3 && g++ < 60) {
      const k = R.int(0, 2), i = R.int(1, w.length - 2); let m;
      if (k === 0) m = w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2);
      else if (k === 1) m = w.slice(0, i) + w.slice(i + 1);
      else m = w.slice(0, i) + w[i] + w.slice(i);
      if (m !== w && m.length >= 3) out.add(m);
    }
    return Array.from(out);
  }
  wrap('firstletter', l => {
    if (l === 6) {
      const ws = R.shuffle(WORDS.filter(x => x[0].length >= 3)), t = ws[0], wr = []; const used = new Set([t[0][0]]);
      for (const w of ws.slice(1)) { if (!used.has(w[0][0])) { used.add(w[0][0]); wr.push(w[1]); if (wr.length === 3) break; } }
      return C('Which picture starts with the letter <b>' + t[0][0].toUpperCase() + '</b>?', '<div class="pic big">' + t[0][0].toUpperCase() + '</div>', t[1], wr, { optCls: 'emo', key: t[0], say: 'Which picture starts with the letter ' + t[0][0] + '?' });
    }
    if (l === 7) { const w = R.pick(WORDS.filter(x => x[0].length >= 3 && x[0].length <= 8)), n = w[0].length; return C('How many letters are in <b>' + w[0] + '</b>?', '<div class="pic">' + w[1] + '</div><div class="wordshow">' + w[0] + '</div>', n, nums(n, 4, 2, 10), { optCls: 'numbers', say: 'How many letters are in ' + w[0] + '?' }); }
    if (l === 8) {
      const t = R.pick(DIG), d = t[2], wr = R.sample(WORDS.filter(x => !x[0].startsWith('sh') && !x[0].startsWith('ch') && !x[0].startsWith('th')), 3).map(x => x[1]);
      return C('Which picture starts with <b>' + d.toUpperCase() + '</b>?', '<div class="pic big">' + d.toUpperCase() + '</div>', t[1], wr, { optCls: 'emo', key: t[0], say: 'Which picture starts with ' + d + '?' });
    }
    if (l === 9) { const w = R.pick(WORDS.filter(x => x[0].length >= 4 && x[0].length <= 8)), n = vow(w[0]); return C('How many vowels (a e i o u) are in <b>' + w[0] + '</b>?', '<div class="pic">' + w[1] + '</div><div class="wordshow">' + w[0] + '</div>', n, nums(n, 4, 0, 5), { optCls: 'numbers', say: 'How many vowels are in ' + w[0] + '?' }); }
    const w = R.pick(WORDS.filter(x => x[0].length >= 4)); const wr = misspell(w[0]);
    return C('Which word is spelled correctly?', '<div class="pic">' + w[1] + '</div>', w[0], wr, { optCls: 'words' });
  });

  // ---- MISSING LETTER
  const EM2 = { pencil: '✏️', spider: '🕷️', turtle: '🐢', window: '🪟', garden: '🌻', bridge: '🌉', bucket: '🪣', dolphin: '🐬', giraffe: '🦒', kitchen: '🍳', chicken: '🐔', octopus: '🐙', balloon: '🎈', penguin: '🐧', monster: '👾', blanket: '🛏️', butter: '🧈', button: '🔘', kitten: '🐱', ladder: '🪜', summer: '☀️', yellow: '💛', puppy: '🐶', mummy: '🧟', happy: '😀', whale: '🐋', phone: '📱', rainbow: '🌈' };
  Object.assign(EM, EM2); DIG.forEach(d => { EM[d[0]] = d[1]; });
  const W6 = ['orange', 'rabbit', 'banana', 'monkey', 'flower', 'pencil', 'bridge', 'garden', 'window', 'spider', 'turtle', 'bucket'], W7 = ['rainbow', 'dolphin', 'giraffe', 'kitchen', 'chicken', 'octopus', 'penguin', 'monster', 'blanket'];
  const DBL = [['butter', 'tt'], ['rabbit', 'bb'], ['balloon', 'll'], ['apple', 'pp'], ['mummy', 'mm'], ['puppy', 'pp'], ['button', 'tt'], ['kitten', 'tt'], ['ladder', 'dd'], ['summer', 'mm'], ['yellow', 'll'], ['happy', 'pp']];
  const DG2 = [['ship', 'sh'], ['chair', 'ch'], ['thumb', 'th'], ['sheep', 'sh'], ['cheese', 'ch'], ['whale', 'wh'], ['phone', 'ph'], ['chick', 'ch'], ['shell', 'sh'], ['three', 'th'], ['shoe', 'sh'], ['cherry', 'ch']];
  const CLOZE = [['Birds can ___.', 'fly', ['bark', 'dig']], ['Fish live in ___.', 'water', ['trees', 'sand']], ['We wear a ___ on our head.', 'hat', ['shoe', 'sock']], ['The sun is ___ in the day.', 'bright', ['sleepy', 'wet']], ['I brush my ___ every morning.', 'teeth', ['ears', 'knees']], ['A cow gives us ___.', 'milk', ['bread', 'eggs']], ['We use an umbrella when it ___.', 'rains', ['shines', 'sings']], ['The baby is ___ in her bed.', 'sleeping', ['running', 'flying']], ['Ice is very ___.', 'cold', ['hot', 'soft']], ['A hen lays ___.', 'eggs', ['milk', 'nuts']], ['We read a ___.', 'book', ['spoon', 'cloud']], ['The cat chased the ___.', 'mouse', ['table', 'cake']]].map(x => [x[0], x[1], x[2].map(w => w.replace('?', ''))]);
  wrap('missingletter', l => {
    const blanks = (w, i, j) => w.split('').map((c, k) => (k >= i && k < j) ? (k === i ? '<b class="lb q w' + (j - i) + '">?</b>' : '') : '<b class="lb">' + c + '</b>').join('');
    if (l === 6 || l === 8) {
      const w = R.pick(l === 6 ? W6 : W7), pos = R.int(0, w.length - 1), ch = w[pos]; let wr = letterOpts(ch, 4, true);
      if ('aeiou'.includes(ch)) wr = R.sample('aeiou'.split('').filter(x => x !== ch), 3);
      return C('Which letter is missing?', '<div class="pic">' + (EM[w] || '') + '</div><div class="lbs">' + blanks(w, pos, pos + 1) + '</div>', ch, wr, { optCls: 'letters', say: 'Which letter is missing?' });
    }
    if (l === 7) {
      const [w, d] = R.pick(DG2), i = w.indexOf(d), all = ['sh', 'ch', 'th', 'wh', 'ph'];
      return C('Which two letters are missing?', '<div class="pic">' + (EM[w] || '') + '</div><div class="lbs">' + blanks(w, i, i + 2) + '</div>', d, R.sample(all.filter(x => x !== d), 3), { optCls: 'words', key: d });
    }
    if (l === 9) {
      const [w, d] = R.pick(DBL), i = w.indexOf(d), all = ['tt', 'pp', 'll', 'mm', 'dd', 'bb', 'ss', 'nn'];
      return C('Which double letters are missing?', '<div class="pic">' + (EM[w] || '') + '</div><div class="lbs">' + blanks(w, i, i + 2) + '</div>', d, R.sample(all.filter(x => x !== d), 3), { optCls: 'words', key: d });
    }
    const [s, r, wr] = R.pick(CLOZE);
    return C('Which word fits the sentence?', '<div class="wordshow cloze">' + s.replace('___', '<span class="blankw">?</span>') + '</div>', r, wr, { optCls: 'words', key: r, say: s.replace('___', 'blank') });
  });

  // ---- WORD BUILD
  const SENT3 = ['I like to play', 'The cat is big', 'We go to school', 'My dog can run', 'She has a hat', 'Birds fly high'], SENT5 = ['The little bird sat on a tree', 'We play in the park every day', 'My mother makes tasty rice for lunch', 'A big red bus stopped at school', 'The sun shines in the blue sky', 'I can count from one to ten'];
  const W8 = ['elephant', 'umbrella', 'sandwich', 'computer', 'football', 'birthday', 'airplane', 'dinosaur', 'notebook', 'bluebird'];
  Object.assign(EM, { elephant: '🐘', umbrella: '☂️', sandwich: '🥪', computer: '💻', football: '⚽', birthday: '🎂', airplane: '✈️', dinosaur: '🦖', notebook: '📓', bluebird: '🐦' });
  wrap('wordbuild', l => {
    if (l <= 8) {
      const w = R.pick(l === 6 ? W6 : l === 7 ? W7 : W8);
      return { kind: 'order', prompt: 'Tap the letters to spell the word', say: 'Spell the word ' + w, pic: EM[w], items: R.shuffle(w.split('').map((c, i) => ({ k: c + i, h: c }))), order: w.split('').map((c, i) => c + i), word: w, key: w, spell: true };
    }
    let s; do { s = R.pick(l === 9 ? SENT3 : SENT5); } while (new Set(s.toLowerCase().split(' ')).size !== s.split(' ').length);
    const ws = s.split(' ');
    return { kind: 'order', prompt: 'Tap the words to make a sentence', say: 'Put the words in order to make a sentence', items: R.shuffle(ws.map((w, i) => ({ k: w + '#' + i, h: w }))), order: ws.map((w, i) => w + '#' + i), key: s, wide: true, words: true };
  });

  // ---- RHYME
  const RH2 = [['blue', 'shoe', 'zoo', 'two', 'glue'], ['see', 'tea', 'key', 'me', 'bee'], ['night', 'kite', 'bite', 'white'], ['rain', 'train', 'cane', 'plane'], ['boat', 'coat', 'goat', 'note'], ['say', 'day', 'play', 'hay', 'they'], ['moon', 'spoon', 'tune', 'soon'], ['nose', 'rose', 'toes', 'goes'], ['five', 'dive', 'hive', 'alive'], ['fly', 'sky', 'cry', 'high', 'why']];
  const LOOK = [['cat', 'hat', ['cut', 'cot', 'car']], ['pin', 'win', ['pen', 'pan', 'pit']], ['bed', 'red', ['bad', 'bid', 'bud']], ['dog', 'log', ['dig', 'dot', 'dug']], ['bus', 'plus', ['bug', 'bun', 'bat']], ['cap', 'map', ['cop', 'cup', 'cab']], ['big', 'pig', ['bag', 'bug', 'bit']], ['pot', 'hot', ['pit', 'pat', 'pop']]];
  wrap('rhyme', l => {
    if (l === 6) { const [w, r, d] = R.pick(LOOK); return C('Which word rhymes with <b>' + w + '</b>?', '<div class="wordshow big">' + w + '</div>', r, d, { optCls: 'words', say: 'Which word rhymes with ' + w + '?' }); }
    if (l === 7 || l === 9) {
      const fams = l === 7 ? RH : RH2, fam = R.pick(fams), maj = R.sample(fam, 3), others = R.sample(fams.filter(f => f !== fam), 1)[0], odd = R.pick(others);
      return C('Three words rhyme. Which one does NOT?', '', odd, maj, { optCls: 'words' });
    }
    if (l === 8) { const fam = R.pick(RH2), [w, r] = R.sample(fam, 2), others = R.sample(RH2.filter(f => f !== fam), 3).map(f => R.pick(f)); return C('Which word rhymes with <b>' + w + '</b>?', '<div class="wordshow big">' + w + '</div>', r, others, { optCls: 'words', say: 'Which word rhymes with ' + w + '?' }); }
    const fam = R.pick(RH2), [a, b] = R.sample(fam, 2), wr = [];
    const fs = R.sample(RH2.filter(f => f !== fam), 3); fs.forEach(f => { const [x, y] = R.sample(f, 1).concat([R.pick(RH2.filter(g => g !== f && g !== fam))].map(g => R.pick(g))); wr.push(x + ' – ' + y); });
    return C('Which pair of words rhymes?', '', a + ' – ' + b, wr, { optCls: 'words', say: 'Which pair of words rhymes?' });
  });

  // ---- OPPOSITES
  const OP2 = [['ancient', 'modern'], ['brave', 'afraid'], ['polite', 'rude'], ['lazy', 'busy'], ['shallow', 'deep'], ['strong', 'weak'], ['arrive', 'leave'], ['careful', 'careless'], ['include', 'exclude'], ['victory', 'defeat'], ['increase', 'decrease'], ['future', 'past'], ['inside', 'outside'], ['expensive', 'cheap'], ['tight', 'loose'], ['accept', 'refuse'], ['float', 'sink'], ['borrow', 'lend'], ['remember', 'forget']];
  const SYN = [['big', 'large'], ['small', 'tiny'], ['happy', 'glad'], ['fast', 'quick'], ['begin', 'start'], ['shut', 'close'], ['pretty', 'beautiful'], ['smart', 'clever'], ['jump', 'leap'], ['road', 'street'], ['rock', 'stone'], ['tired', 'sleepy'], ['angry', 'mad'], ['huge', 'enormous'], ['scared', 'afraid'], ['mend', 'repair'], ['gift', 'present'], ['talk', 'speak'], ['hurry', 'rush'], ['story', 'tale']];
  const PRE = [['happy', 'unhappy'], ['kind', 'unkind'], ['lock', 'unlock'], ['agree', 'disagree'], ['possible', 'impossible'], ['polite', 'impolite'], ['correct', 'incorrect'], ['visible', 'invisible'], ['honest', 'dishonest'], ['tidy', 'untidy'], ['appear', 'disappear'], ['fair', 'unfair'], ['patient', 'impatient']];
  wrap('opposites', l => {
    if (l === 6 || l === 8) { const [a, b] = Math.random() < .5 ? R.pick(OP2) : R.pick(OP2).slice().reverse(), pool = OP2.flat().filter(x => x !== a && x !== b); return C('What is the opposite of <b>' + a + '</b>?', '<div class="wordshow big">' + a + '</div>', b, R.sample(pool, l === 6 ? 2 : 3), { optCls: 'words', say: 'What is the opposite of ' + a + '?' }); }
    if (l === 7 || l === 9) { const [a, b] = Math.random() < .5 ? R.pick(SYN) : R.pick(SYN).slice().reverse(), pool = ['table', 'green', 'banana', 'window', 'river', 'cloud', 'pencil', 'garden', 'sleep', 'water'].concat(OP2.flat().filter(x => x !== a && x !== b)); return C('Which word means the SAME as <b>' + a + '</b>?', '<div class="wordshow big">' + a + '</div>', b, R.sample(pool, l === 7 ? 2 : 3), { optCls: 'words', say: 'Which word means the same as ' + a + '?' }); }
    const [base, right] = R.pick(PRE), pre = right.slice(0, right.length - base.length), wr = uniq(['un', 'dis', 'im', 'in', 'ir'].filter(p => p !== pre).map(p => p + base)).slice(0, 3);
    return C('Which word means the OPPOSITE of <b>' + base + '</b>?', '<div class="wordshow big">' + base + '</div>', right, wr, { optCls: 'words', say: 'Which word means the opposite of ' + base + '?' });
  });

  // ---- CLOCK
  const nxt = h => h % 12 + 1;
  function w5(h, m) {
    const n = nxt(h), M = { 5: 'five past ' + h, 10: 'ten past ' + h, 15: 'quarter past ' + h, 20: 'twenty past ' + h, 25: 'twenty-five past ' + h, 30: 'half past ' + h, 35: 'twenty-five to ' + n, 40: 'twenty to ' + n, 45: 'quarter to ' + n, 50: 'ten to ' + n, 55: 'five to ' + n };
    return m === 0 ? h + " o'clock" : M[m];
  }
  const dig = (h, m) => h + ':' + String(m).padStart(2, '0');
  const mini = (h, m) => clockSVG(h, m).replace('class="clock"', 'class="clock mini"');
  wrap('clock', l => {
    if (l === 6) { const h = R.int(1, 12), m = R.pick([0, 30]), right = H.timeWords(nxt(h), m, 3), wr = new Set(); let g = 0; while (wr.size < 3 && g++ < 50) { const t = H.timeWords(R.int(1, 12), R.pick([0, 30]), 3); if (t !== right) wr.add(t); } return C('What time will it be in <b>1 hour</b>?', clockSVG(h, m), right, Array.from(wr), { optCls: 'words', say: 'What time will it be in one hour?' }); }
    if (l === 7) { const h = R.int(1, 12), m = R.pick([5, 10, 20, 25, 35, 40, 50, 55, 15, 45]), right = w5(h, m), wr = new Set(); let g = 0; while (wr.size < 3 && g++ < 60) { const t = w5(R.int(1, 12), R.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])); if (t !== right && (Math.random() < .5 || t.indexOf(String(h)) >= 0)) wr.add(t); } return C('What time does the clock show?', clockSVG(h, m), right, Array.from(wr), { optCls: 'words', say: 'What time does the clock show?' }); }
    if (l === 8) {
      const h = R.int(1, 12), m = R.pick([0, 15, 30, 45]), seen = new Set([h + ':' + m]), wr = []; let g = 0;
      while (wr.length < 2 && g++ < 80) { const hh = Math.random() < .5 ? h : R.int(1, 12), mm = Math.random() < .5 ? m : R.pick([0, 15, 30, 45]); if (!seen.has(hh + ':' + mm)) { seen.add(hh + ':' + mm); wr.push(mini(hh, mm)); } }
      return C('Which clock shows <b>' + dig(h, m) + '</b>?', '<div class="digital">' + dig(h, m) + '</div>', mini(h, m), wr, { optCls: 'emo clocks', key: dig(h, m), say: 'Which clock shows ' + dig(h, m) + '?' });
    }
    if (l === 9) { const h = R.int(1, 10), d = R.int(1, 2), m = R.pick([0, 30]), eh = h + d, right = dig(eh, m), w12 = x => (x - 1 + 12) % 12 + 1; return C('A film starts at ' + dig(h, m) + ' and lasts ' + d + ' hour' + (d > 1 ? 's' : '') + '. What time does it end?', '', right, uniq([dig(w12(eh + 1), m), dig(w12(eh - 1), m), dig(eh, m === 0 ? 30 : 0), dig(h, m === 0 ? 30 : 0)]).filter(x => x !== right).slice(0, 3), { optCls: 'words' }); }
    const h = R.int(1, 10), m1 = R.pick([0, 15, 30, 45]), mins = 60 - m1, right = mins;
    return C('How many minutes from <b>' + dig(h, m1) + '</b> to <b>' + dig(h + 1, 0) + '</b>?', '', right, uniq([right + 15, right - 15, right + 5, 60, 30, 45]).filter(v => v !== right && v > 0).slice(0, 3), { optCls: 'numbers' });
  });

  // ---- SHAPES
  SHAPES.octagon = { n: 8, svg: c => '<polygon points="' + Array.from({ length: 8 }, (_, i) => { const a = Math.PI * 2 * i / 8 + Math.PI / 8; return (50 + 44 * Math.cos(a)).toFixed(1) + ',' + (50 + 44 * Math.sin(a)).toFixed(1); }).join(' ') + '" fill="' + c + '"/>' };
  const POLY = ['triangle', 'square', 'pentagon', 'hexagon', 'octagon'];
  const SOLID = [['cube', ['🎲', '🧊']], ['sphere', ['⚽', '🏀', '🌍', '🎱']], ['cone', ['🍦']], ['cylinder', ['🥫', '🛢️']], ['cuboid', ['🧱', '🍫']]];
  wrap('shapes', l => {
    if (l === 6) { const nm = R.pick(POLY.concat(['rectangle'])), n = SHAPES[nm].n; return C('How many corners does it have?', shapeSVG(nm), n, nums(n, 4, 3, 9), { optCls: 'numbers', say: 'How many corners does this shape have?' }); }
    if (l === 7) { const s = R.pick(SOLID), e = R.pick(s[1]); return C('What 3D shape is this?', '<div class="pic">' + e + '</div>', s[0], R.sample(SOLID.filter(x => x !== s).map(x => x[0]), 3), { optCls: 'words', say: 'What 3D shape is this?' }); }
    if (l === 8) { const [a, b] = R.sample(POLY, 2), col = R.pick(SCOL), more = Math.random() < .5; const hi = SHAPES[a].n > SHAPES[b].n ? a : b, lo = hi === a ? b : a; return C(more ? 'Which shape has MORE sides?' : 'Which shape has FEWER sides?', '', shapeSVG(more ? hi : lo, col), [shapeSVG(more ? lo : hi, col)], { optCls: 'emo', key: more ? hi : lo, say: more ? 'Which shape has more sides?' : 'Which shape has fewer sides?' }); }
    if (l === 9) { const [a, b] = [R.pick(POLY), R.pick(POLY)], t = SHAPES[a].n + SHAPES[b].n; return C('How many sides altogether?', '<div class="two">' + shapeSVG(a) + '<span class="op">+</span>' + shapeSVG(b) + '</div>', t, nb(t, 4, 3), { optCls: 'numbers', say: 'How many sides altogether?' }); }
    const nm = R.pick(['triangle', 'pentagon', 'hexagon', 'octagon']), n = SHAPES[nm].n; return C('I have <b>' + n + '</b> sides and <b>' + n + '</b> corners. What shape am I?', '', nm, R.sample(['triangle', 'pentagon', 'hexagon', 'octagon', 'square', 'circle'].filter(x => x !== nm), 3), { optCls: 'words', say: 'I have ' + n + ' sides and ' + n + ' corners. What shape am I?' });
  });
})();
