/* Umaiza's Puzzle World - screens */
(function () {
  const { S } = W, { T, CATS, R, strip } = PZ, E = CERT.esc;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const app = () => $('#app');
  let BOOKITEMS = [], view = {}, G = null, editMode = false;
  let BOOKS = [
    { n: 1, name: 'Rainbow Starter', emoji: '🌈', color: '#ff6b6b' }, { n: 2, name: 'Sunshine Fun', emoji: '☀️', color: '#ffa94d' },
    { n: 3, name: 'Brain Box', emoji: '🧠', color: '#51cf66' }, { n: 4, name: 'Think & Spot', emoji: '🔍', color: '#339af0' },
    { n: 5, name: 'Logic Lab', emoji: '🧪', color: '#845ef7' }, { n: 6, name: 'Brain Gym', emoji: '🏋️', color: '#f06595' },
    { n: 7, name: 'Smart Stars', emoji: '🌟', color: '#20c997' }
  ];
  const bookTotal = n => Math.max(1, BOOKITEMS.filter(x => x.book === n).length);
  const bookDone = (st, n) => Object.keys(st.bookDone).filter(k => k.indexOf('b' + n + '_') === 0).length;
  const CAT_ORDER = ['maths', 'logic', 'words', 'look', 'books'];
  const MASC = ['🦄', '🐻', '🐰', '🦁', '🐼', '🐥', '🐸', '🦊'];
  const pips = l => '<span class="pips">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => '<b class="' + (i <= l ? 'on' : '') + (i > 5 ? ' hi' : '') + '"></b>').join('') + '</span>';
  const starsHtml = n => '⭐'.repeat(n);

  // ================= cards
  function allCards() {
    const L = [];
    Object.values(T).forEach(t => L.push({ id: t.id, kind: 'gen', name: t.name, cat: t.cat, emoji: t.emoji, color: t.color, desc: t.desc, t }));
    if (BOOKITEMS.length) BOOKS.forEach(b => L.push({ id: 'book' + b.n, kind: 'book', n: b.n, name: 'Book ' + b.n + ' · ' + b.name, cat: 'books', emoji: b.emoji, color: b.color, desc: bookTotal(b.n) + ' colourful puzzles' }));
    L.forEach((c, i) => { const o = S.cards[c.id] || {}; c.idx = i; c.hidden = !!o.hidden; c.big = !!o.big; c.ord = o.ord == null ? i : o.ord; if (o.name) c.name = o.name; if (o.emoji) c.emoji = o.emoji; if (o.color) c.color = o.color; });
    return L;
  }
  function sortedCards(st) {
    let L = allCards();
    if (!editMode) L = L.filter(c => !c.hidden);
    const f = S.settings.filter; if (f && f !== 'all') L = L.filter(c => c.cat === f);
    const sort = S.settings.sort, lv = c => c.kind === 'gen' ? W.lvl(c.id) : 0, sr = c => (st.byType[c.kind === 'gen' ? c.id : 'b' + c.n] || { stars: 0 }).stars;
    if (sort === 'az') L.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'za') L.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === 'level') L.sort((a, b) => lv(b) - lv(a) || a.name.localeCompare(b.name));
    else if (sort === 'stars') L.sort((a, b) => sr(b) - sr(a) || a.name.localeCompare(b.name));
    else if (sort === 'custom') L.sort((a, b) => a.ord - b.ord);
    else L.sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || a.ord - b.ord);
    return L;
  }
  function cardHtml(c, st) {
    const key = c.kind === 'gen' ? c.id : 'b' + c.n, b = st.byType[key] || { stars: 0, solved: 0, n: 0 };
    let sub;
    if (c.kind === 'gen') sub = pips(W.lvl(c.id)) + '<span class="lv">Level ' + W.lvl(c.id) + '</span>';
    else { const done = bookDone(st, c.n), tot = bookTotal(c.n); sub = '<span class="bar"><i style="width:' + Math.round(done * 100 / tot) + '%"></i></span><span class="lv">' + done + ' / ' + tot + ' done</span>'; }
    const ctl = editMode ? '<div class="ctl"><button data-act="mv" data-id="' + c.id + '" data-d="-1" title="Move left">◀</button><button data-act="mv" data-id="' + c.id + '" data-d="1" title="Move right">▶</button><button data-act="bigc" data-id="' + c.id + '" title="Bigger / smaller">' + (c.big ? '➖' : '➕') + '</button><button data-act="hidec" data-id="' + c.id + '" title="Hide / show">' + (c.hidden ? '🙈' : '👁️') + '</button><button data-act="editc" data-id="' + c.id + '" title="Edit">✏️</button></div>' : '';
    return '<div class="card' + (c.big ? ' big' : '') + (c.hidden ? ' hid' : '') + (editMode ? ' ed' : '') + '" style="--c:' + c.color + '" data-act="open" data-id="' + c.id + '">' +
      '<div class="ico">' + E(c.emoji) + '</div><div class="nm">' + E(c.name) + '</div><div class="ds">' + E(c.desc || '') + '</div><div class="sub">' + sub + '</div>' +
      '<div class="cst">⭐ ' + b.stars + '</div>' + (b.n === 0 ? '<div class="new">NEW</div>' : '') + ctl + '</div>';
  }

  // ================= header
  function topHtml(st) {
    const rk = W.rank(st.stars), p = S.profile;
    const h = new Date().getHours(), gr = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return '<header class="top"><div class="who" data-act="home"><div class="av">👧</div><div><div class="hi">' + gr + ', ' + E(p.nick || 'Star') + '!</div><div class="rk">' + rk.emoji + ' ' + E(rk.name) + '</div></div></div>' +
      '<div class="chips"><div class="chip s" id="cStars" data-act="wins">⭐ <b>' + st.stars + '</b></div><div class="chip f" data-act="wins">🔥 <b>' + st.streak + '</b><small>day' + (st.streak === 1 ? '' : 's') + '</small></div>' +
      '<button class="chip btn" data-act="wins">🏆 My Wins</button><button class="chip btn" data-act="certs">📜 Certificates <b>' + S.certs.length + '</b></button><button class="chip btn" data-act="parent">⚙️</button></div></header>';
  }
  function refreshTop() { const st = W.stats(); const t = $('.top'); if (t) { const n = document.createElement('div'); n.innerHTML = topHtml(st); t.replaceWith(n.firstChild); } }

  // ================= home
  function renderHome() {
    const st = W.stats(), rk = W.rank(st.stars), goal = Math.max(1, +S.settings.goal || 5), td = st.today.solved, pct = Math.min(100, Math.round(td / goal * 100));
    const list = sortedCards(st);
    let grid = '';
    if (S.settings.sort === 'category') {
      CAT_ORDER.forEach(cat => { const cs = list.filter(c => c.cat === cat); if (!cs.length) return; grid += '<h2 class="sec" style="--c:' + CATS[cat].color + '"><span>' + CATS[cat].emoji + '</span>' + CATS[cat].name + '</h2><div class="grid">' + cs.map(c => cardHtml(c, st)).join('') + '</div>'; });
    } else grid = '<div class="grid">' + list.map(c => cardHtml(c, st)).join('') + '</div>';
    if (!list.length) grid = '<p class="empty">No cards here. 🙈</p>';
    const chip = (v, l) => '<button class="fchip' + (S.settings.filter === v ? ' on' : '') + '" data-act="filter" data-v="' + v + '">' + l + '</button>';
    const sorts = [['category', 'By category'], ['az', 'A → Z'], ['za', 'Z → A'], ['level', 'By level'], ['stars', 'By stars'], ['custom', 'My order']];
    app().innerHTML = topHtml(st) +
      '<section class="hero"><div class="mas">🦄</div><div class="herotxt"><h1>Let\'s play puzzles!</h1><p>Pick a game, think hard and win stars!</p>' +
      '<div class="goal"><div class="gbar"><i style="width:' + pct + '%"></i></div><span>' + (td >= goal ? '🎉 Today\'s goal done!' : 'Today: <b>' + td + '</b> of ' + goal + ' puzzles') + '</span></div></div>' +
      '<div class="herorank"><div class="rkE">' + rk.emoji + '</div><b>' + E(rk.name) + '</b><div class="gbar sm"><i style="width:' + rk.pct + '%"></i></div><small>' + (rk.next ? (rk.next - st.stars) + ' ⭐ to ' + E(rk.nextName) : 'Top rank!') + '</small></div>' +
      '<button class="surprise" data-act="surprise">🎲 Surprise me!</button></section>' +
      '<section class="tools"><div class="fchips">' + chip('all', '🌈 All') + CAT_ORDER.map(k => chip(k, CATS[k].emoji + ' ' + CATS[k].name)).join('') + '</div>' +
      '<div class="tctl"><label>Sort <select data-act="sort">' + sorts.map(s => '<option value="' + s[0] + '"' + (S.settings.sort === s[0] ? ' selected' : '') + '>' + s[1] + '</option>').join('') + '</select></label>' +
      '<label>Card size <input type="range" min="130" max="320" step="10" value="' + S.settings.size + '" data-act="size"></label>' +
      '<button class="btn sm' + (editMode ? ' on' : '') + '" data-act="editmode">' + (editMode ? '✅ Done editing' : '✏️ Edit cards') + '</button></div></section>' +
      (editMode ? '<div class="editnote">Edit mode: move ◀ ▶, make bigger ➕, hide 👁️, or change name / picture / colour ✏️</div>' : '') +
      '<main class="dash" style="--cw:' + S.settings.size + 'px">' + grid + '</main><footer class="foot">Made with love for ' + E(S.profile.name) + ' 💖</footer>';
  }

  // ================= play
  function startGame(type) {
    G = { type, i: 0, n: Math.max(1, +S.settings.round || 5), stars: 0, good: 0, sigs: [], q: null, tries: 0, locked: false, done: false, cert: null, lc: '' };
  }
  function genQ() {
    const t = T[G.type]; let q, g = 0;
    do { q = t.gen(W.lvl(G.type)); q.sig = JSON.stringify([q.prompt, q.vis, q.opts, q.items && q.items.map(x => x.k), q.cards]); } while (G.sigs.indexOf(q.sig) >= 0 && g++ < 8);
    G.sigs.push(q.sig); return q;
  }
  function renderPlay() {
    const t = T[G.type]; if (!t) return nav('home');
    const st = W.stats();
    app().innerHTML = '<div class="play" style="--c:' + t.color + '"><div class="playhead"><button class="btn back" data-act="home">← Home</button>' +
      '<div class="ptitle"><span class="pe">' + t.emoji + '</span> ' + E((S.cards[t.id] || {}).name || t.name) + ' <span class="lvl">Level ' + W.lvl(t.id) + ' ' + pips(W.lvl(t.id)) + '</span></div>' +
      '<div class="rdots">' + Array.from({ length: G.n }, (_, i) => '<b class="' + (i < G.i ? 'd' : i === G.i ? 'c' : '') + '"></b>').join('') + '</div>' +
      '<div class="chip s" id="cStars">⭐ <b>' + st.stars + '</b></div></div><div id="qcard" class="qcard"></div></div>';
    if (G.done) return drawSummary();
    drawQ();
  }
  function drawQ() {
    G.q = genQ(); G.tries = 0; G.locked = false; G.wrongs = 0;
    const q = G.q, box = $('#qcard');
    let h = '<div class="prompt"><span>' + q.prompt + '</span><button class="say" data-act="say" title="Read to me">🔊</button></div>';
    if (q.kind === 'choice') {
      h += '<div class="vis">' + q.vis + '</div><div class="opts n' + q.opts.length + ' ' + (q.optCls || '') + '">' + q.opts.map((o, i) => '<button class="opt" data-act="pick" data-i="' + i + '">' + o + '</button>').join('') + '</div>';
    } else if (q.kind === 'order') {
      h += (q.pic ? '<div class="vis"><div class="pic">' + q.pic + '</div></div>' : '') + '<div class="slots' + (q.spell ? ' sp' : '') + (q.wide ? ' wd' : '') + '">' + q.order.map((k, i) => '<div class="slot" data-s="' + i + '"></div>').join('') + '</div>' +
        '<div class="tiles' + (q.spell ? ' sp' : '') + (q.wide ? ' wd' : '') + '">' + q.items.map(it => '<button class="tile" data-act="tile" data-k="' + it.k + '">' + it.h + '</button>').join('') + '</div>';
      G.pos = 0;
    } else if (q.kind === 'memory') {
      h += '<div class="mem c' + q.cols + (q.cols >= 5 ? ' sm' : '') + '">' + q.cards.map((c, i) => '<button class="mcard" data-act="flip" data-i="' + i + '"><span class="mb">?</span><span class="mf">' + c + '</span></button>').join('') + '</div>';
      G.fl = []; G.matched = 0; G.miss = 0; G.q.done = {};
    }
    h += '<div class="hint" id="hint"></div><div class="nextrow"><button class="btn big" id="nextbtn" data-act="next" hidden>' + (G.i + 1 >= G.n ? 'Finish 🏁' : 'Next ▶') + '</button></div>';
    box.innerHTML = h; box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
    if (S.settings.autoRead) W.speak(q.say);
  }
  const OOPS = ['Oops! Try again 💪', 'Almost! Have another go 🌈', 'Not that one — think again 🤔'];
  function pick(i) {
    if (G.locked) return; const q = G.q, btns = $$('.opt');
    W.snd.tap();
    if (i === q.ans) {
      btns[i].classList.add('right'); btns.forEach(b => b.disabled = true);
      const stars = G.tries === 0 ? 3 : (q.opts.length === 2 ? 1 : 2);
      solved(stars, G.tries === 0);
    } else {
      G.tries++; btns[i].classList.add('wrong'); btns[i].disabled = true; W.snd.wrong();
      if (G.tries >= 2 || q.opts.length - G.tries <= 1) { btns[q.ans].classList.add('reveal'); btns.forEach(b => b.disabled = true); $('#hint').textContent = 'That one is right! Let\'s remember it 💚'; solved(0, false); }
      else $('#hint').textContent = R.pick(OOPS);
    }
  }
  function tile(btn) {
    if (G.locked) return; const q = G.q;
    const want = q.items.find(i => i.k === q.order[G.pos]);
    if (btn.dataset.k === q.order[G.pos] || (want && want.h === btn.textContent && !q.words)) {
      W.snd.right(); const slot = $('.slot[data-s="' + G.pos + '"]'); slot.textContent = btn.textContent; slot.classList.add('f'); btn.classList.add('used'); btn.disabled = true; G.pos++;
      $('#hint').textContent = '';
      if (G.pos >= q.order.length) { const w = G.wrongs; solved(w === 0 ? 3 : w <= 2 ? 2 : 1, w === 0); }
    } else { G.wrongs++; W.snd.wrong(); btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake'); $('#hint').textContent = R.pick(OOPS); }
  }
  function flip(i) {
    if (G.locked) return; const q = G.q, cards = $$('.mcard');
    if (q.done[i] || G.fl.indexOf(i) >= 0 || G.fl.length >= 2) return;
    W.snd.flip(); cards[i].classList.add('up'); G.fl.push(i);
    if (G.fl.length === 2) {
      const [a, b] = G.fl;
      if (q.cards[a] === q.cards[b]) { q.done[a] = q.done[b] = 1; G.matched++; G.fl = []; cards[a].classList.add('ok'); cards[b].classList.add('ok'); W.snd.right(); if (G.matched >= q.pairs) { const m = G.miss, p = q.pairs; const stars = m <= p ? 3 : m <= p * 2 ? 2 : 1; setTimeout(() => solved(stars, stars === 3), 450); } }
      else { G.miss++; G.locked = true; setTimeout(() => { cards[a].classList.remove('up'); cards[b].classList.remove('up'); G.fl = []; G.locked = false; }, 800); }
    }
  }
  function solved(stars, good) {
    G.locked = true; const type = G.type;
    W.addHist({ kind: 'gen', type, lvl: W.lvl(type), ok: !!good, stars });
    const lc = W.applyResult(type, good); W.save();
    G.stars += stars; if (good) G.good++; G.lc = lc || G.lc;
    const c = W.checkCert(); if (c) G.cert = c;
    cheer(stars, lc); bumpStars();
    const nb = $('#nextbtn'); if (nb) nb.hidden = false;
    if (nb) setTimeout(() => nb.focus && nb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 100);
  }
  function bumpStars() {
    const st = W.stats(); $$('#cStars b').forEach(b => b.textContent = st.stars);
    $$('#cStars').forEach(c => { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
  }
  const CH = { 3: ['Super!', 'Brilliant!', 'Wow!', 'সাবাশ!', 'You did it!', 'Amazing!', 'দারুণ!'], 2: ['Great job!', 'Well done!', 'ভালো হয়েছে!'], 1: ['You got it!', 'Nice try!'], 0: ['Good learning!'] };
  function cheer(stars, lc) {
    const el = $('#cheer'); let txt = R.pick(CH[stars]), sub = '';
    if (lc === 'up') { txt = 'LEVEL UP!'; sub = 'Level ' + W.lvl(G.type) + ' ⭐ You are getting so clever!'; W.snd.up(); W.confetti(160, true); }
    else if (lc === 'master') { txt = 'MASTER!'; sub = 'Top level champion! 🏆'; W.snd.up(); W.confetti(160, true); }
    else if (stars >= 3) { W.snd.cheer(); W.confetti(90, true); }
    else if (stars > 0) { W.snd.right(); W.confetti(40); }
    if (lc === 'down') sub = 'Let\'s practise a bit more 💪';
    el.innerHTML = '<div class="cheerbox s' + stars + '"><div class="mas">' + R.pick(MASC) + '</div><div class="ctext">' + txt + '</div>' + (stars ? '<div class="cstars">' + starsHtml(stars) + '</div>' : '') + (sub ? '<div class="csub">' + sub + '</div>' : '') + '</div>';
    el.className = 'show'; clearTimeout(cheer.t); cheer.t = setTimeout(() => el.className = '', lc === 'up' || lc === 'master' ? 2300 : 1500);
    if (stars) { const p = document.createElement('div'); p.className = 'plus'; p.textContent = '+' + stars + ' ⭐'; document.body.appendChild(p); setTimeout(() => p.remove(), 1200); }
  }
  function next() {
    const go = () => { G.i++; if (G.i >= G.n) { G.done = true; renderPlay(); } else { renderPlay(); } };
    if (G.cert) { const c = G.cert; G.cert = null; showCert(c, go, true); } else go();
  }
  function drawSummary() {
    const t = T[G.type], box = $('#qcard'), max = G.n * 3, pct = Math.round(G.stars / max * 100);
    W.snd.cheer(); W.confetti(150, true);
    const msg = pct >= 80 ? 'You are a puzzle superstar!' : pct >= 50 ? 'Great thinking today!' : 'Good try! Practice makes you stronger!';
    $$('.rdots b').forEach(b => b.className = 'd');
    box.innerHTML = '<div class="summary"><div class="mas big">' + R.pick(MASC) + '</div><h2>Round complete!</h2><p>' + msg + '</p>' +
      '<div class="sumstars">' + Array.from({ length: max }, (_, i) => '<span class="' + (i < G.stars ? 'on' : '') + '" style="animation-delay:' + (i * 0.07) + 's">⭐</span>').join('') + '</div>' +
      '<div class="sumnum"><b>' + G.stars + '</b> of ' + max + ' stars</div><div class="sumsub"><div>First-try answers: <b>' + G.good + '</b> of ' + G.n + '</div><div>' + E(t.name) + ' · Level ' + W.lvl(G.type) + ' ' + pips(W.lvl(G.type)) + '</div></div>' +
      '<div class="sumbtn"><button class="btn big" data-act="again">Play again ▶</button><button class="btn big alt" data-act="home">🏠 Home</button></div></div>';
  }

  // ================= books
  function renderBook(n) {
    const b = BOOKS.find(x => x.n === n) || { n, name: 'Book ' + n, emoji: '📘', color: '#845ef7' }, st = W.stats(), items = BOOKITEMS.filter(x => x.book === n), cats = {}; items.forEach(x => cats[x.cat] = { n: x.catName, c: x.catCol });
    const f = view.b || 'all', show = items.filter(x => f === 'all' || String(x.cat) === f);
    const done = items.filter(x => st.bookDone[x.id]).length;
    app().innerHTML = topHtml(st) + '<div class="bookhead" style="--c:' + b.color + '"><button class="btn back" data-act="home">← Home</button><h1>' + b.emoji + ' Puzzle Book ' + n + ' · ' + b.name + '</h1><div class="bprog"><span class="bar"><i style="width:' + Math.round(done * 100 / bookTotal(n)) + '%"></i></span> ' + done + ' / ' + bookTotal(n) + ' done</div></div>' +
      '<div class="fchips">' + '<button class="fchip' + (f === 'all' ? ' on' : '') + '" data-act="bfilter" data-v="all">🌈 All ' + items.length + '</button>' + Object.keys(cats).map(k => '<button class="fchip' + (f === k ? ' on' : '') + '" data-act="bfilter" data-v="' + k + '" style="--c:' + cats[k].c + '">' + E(cats[k].n) + '</button>').join('') + '</div>' +
      '<div class="note">Solve on paper (press 🖨 Print) or by thinking, then check your answer!</div>' +
      '<div class="bgrid">' + show.map(x => '<div class="bcard' + (st.bookDone[x.id] ? ' dn' : '') + '" style="--c:' + x.catCol + '" data-act="bopen" data-id="' + x.id + '"><div class="crop"><img loading="lazy" src="books/' + x.id + '.webp" alt=""></div><div class="bt"><b>#' + x.n + '</b> ' + E(x.title) + '</div><div class="bm">' + pips(x.lvl) + (st.bookDone[x.id] ? '<span class="ck">✅</span>' : '') + '</div></div>').join('') + '</div>';
  }
  function renderBookPuzzle(id) {
    const x = BOOKITEMS.find(y => y.id === id); if (!x) return nav('home');
    const st = W.stats(), done = !!st.bookDone[id], idx = BOOKITEMS.indexOf(x), prev = BOOKITEMS[idx - 1], nxt = BOOKITEMS[idx + 1];
    app().innerHTML = topHtml(st) + '<div class="bpz" style="--c:' + x.catCol + '"><div class="playhead"><button class="btn back" data-act="openbook" data-n="' + x.book + '">← Book ' + x.book + '</button><div class="ptitle">#' + x.n + ' ' + E(x.title) + ' ' + pips(x.lvl) + '</div></div>' +
      '<div class="qcard"><div class="prompt"><span>' + E(x.ins) + '</span></div><div class="cropw"><div class="crop" id="bcrop" style="padding-bottom:' + (x.h / 800 * 100) + '%"><img src="books/' + x.id + '.webp" alt=""></div></div>' +
      '<div class="ansline" id="ansline" hidden>Answer: <b>' + E(x.ans) + '</b></div>' +
      '<div class="bbtns"><button class="btn" data-act="printb" data-id="' + id + '">🖨 Print puzzle</button><button class="btn big" id="chk" data-act="check" data-id="' + id + '">👀 Check my answer</button></div>' +
      '<div class="rate" id="rate" hidden><div>Did you get it right?</div><button class="btn big good" data-act="brate" data-id="' + id + '" data-v="1">✅ Yes, I did it!</button><button class="btn big alt" data-act="brate" data-id="' + id + '" data-v="0">🔁 Not yet</button></div>' +
      (done ? '<div class="doneflag">✅ You already solved this one!</div>' : '') +
      '<div class="pn">' + (prev ? '<button class="btn sm" data-act="bopen" data-id="' + prev.id + '">◀ #' + prev.n + '</button>' : '<span></span>') + (nxt ? '<button class="btn sm" data-act="bopen" data-id="' + nxt.id + '">#' + nxt.n + ' ▶</button>' : '') + '</div></div></div>';
  }

  // ================= wins
  function renderWins() {
    const st = W.stats(), rk = W.rank(st.stars), d7 = W.last7(st), mx = Math.max(5, ...d7.map(d => d.v));
    const medals = W.MEDALS.map(m => ({ m, ok: m.t(st) })), earned = medals.filter(x => x.ok).length;
    const types = Object.values(T);
    app().innerHTML = topHtml(st) + '<div class="wins"><div class="playhead"><button class="btn back" data-act="home">← Home</button><div class="ptitle">🏆 My Wins</div></div>' +
      '<section class="winhero"><div class="rkE big">' + rk.emoji + '</div><div><h2>' + E(rk.name) + '</h2><div class="gbar"><i style="width:' + rk.pct + '%"></i></div><small>' + (rk.next ? (rk.next - st.stars) + ' more ⭐ to become ' + E(rk.nextName) : 'You are at the top!') + '</small></div></section>' +
      '<section class="big4"><div class="stat a"><b>' + st.stars + '</b><span>⭐ Stars</span></div><div class="stat b"><b>' + st.solved + '</b><span>🧩 Puzzles solved</span></div><div class="stat c"><b>' + st.streak + '</b><span>🔥 Day streak</span></div><div class="stat d"><b>' + st.acc + '%</b><span>🎯 First-try wins</span></div><div class="stat e"><b>' + S.certs.length + '</b><span>📜 Certificates</span></div><div class="stat f"><b>' + st.today.stars + '</b><span>☀️ Stars today</span></div></section>' +
      '<section class="panel"><h3>This week</h3><div class="chart">' + d7.map((d, i) => '<div class="col' + (d.today ? ' t' : '') + '"><span class="v">' + (d.v || '') + '</span><div class="b"><i style="height:' + Math.round(d.v / mx * 100) + '%;--k:' + i + '"></i></div><em>' + d.label + '</em></div>').join('') + '</div></section>' +
      '<section class="panel"><h3>Medals <small>' + earned + ' / ' + medals.length + '</small></h3><div class="medals">' + medals.map(x => '<div class="medal' + (x.ok ? ' on' : '') + '"><div class="me">' + (x.ok ? x.m.e : '🔒') + '</div><b>' + x.m.n + '</b><small>' + x.m.d + '</small></div>').join('') + '</div></section>' +
      '<section class="panel"><h3>My levels</h3><div class="lvls">' + types.map(t => '<div class="lrow" style="--c:' + t.color + '"><span class="le">' + t.emoji + '</span><span class="ln">' + t.name + '</span>' + pips(W.lvl(t.id)) + '<span class="ls">⭐ ' + ((st.byType[t.id] || {}).stars || 0) + '</span></div>').join('') + '</div></section></div>';
  }

  // ================= certificates
  const certBox = (c, w) => { const k = w / 1000; return '<div class="cw" style="width:' + w + 'px;height:' + Math.round(707 * k) + 'px"><div class="cs" style="transform:scale(' + k + ')">' + CERT.html(c, S.profile) + '</div></div>'; };
  function renderCerts() {
    const st = W.stats(), N = S.settings.certEvery, last = S.lastCert, toGo = Math.max(0, last + N - st.solved);
    app().innerHTML = topHtml(st) + '<div class="certs"><div class="playhead"><button class="btn back" data-act="home">← Home</button><div class="ptitle">📜 My Certificates</div></div>' +
      '<div class="note">A new certificate comes after every <b>' + N + '</b> puzzles. <b>' + toGo + '</b> more to go! 🌟</div>' +
      (S.certs.length ? '<div class="cgrid">' + S.certs.slice().reverse().map(c => '<div class="cth" data-act="viewcert" data-id="' + c.id + '">' + certBox(c, 300) + '<div class="cap">' + c.count + ' puzzles · ' + CERT.fmtDate(c.ts) + '</div></div>').join('') + '</div>' : '<p class="empty">Your first certificate is waiting! Solve ' + N + ' puzzles. 🎁</p>') + '</div>';
  }
  function showCert(c, onClose, fresh) {
    const w = Math.min(innerWidth - 24, 960);
    openModal('<div class="mcert">' + (fresh ? '<div class="newc">🎉 You earned a new certificate! 🎉</div>' : '') + certBox(c, w) + '<div class="mbtns"><button class="btn big" data-act="printcert" data-id="' + c.id + '">🖨 Print</button><button class="btn big alt" data-act="closem">' + (fresh ? 'Yay! Continue ▶' : 'Close') + '</button></div></div>', { onClose, cls: 'wide' });
    if (fresh) { W.snd.cheer(); W.confetti(200, true); }
  }

  // ================= modal
  let modalClose = null;
  function openModal(html, o) { o = o || {}; const m = $('#modal'); m.innerHTML = '<div class="mwrap ' + (o.cls || '') + '"><div class="mbox">' + html + '</div></div>'; m.className = 'open'; modalClose = o.onClose || null; document.body.classList.add('noscroll'); }
  function closeModal(silent) { const m = $('#modal'); m.className = ''; m.innerHTML = ''; document.body.classList.remove('noscroll'); const f = modalClose; modalClose = null; if (f && !silent) f(); }

  // ================= parent gate
  function gate(cb) {
    let pin = '';
    const draw = () => { $('#pdots').innerHTML = [0, 1, 2, 3].map(i => '<b class="' + (i < pin.length ? 'f' : '') + '"></b>').join(''); };
    openModal('<div class="gate"><div class="gl">🔒</div><h3>Parents only</h3><p>Enter your 4-digit PIN</p><div id="pdots" class="pdots"></div><div class="keys">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✖'].map(k => '<button data-act="key" data-k="' + k + '">' + k + '</button>').join('') + '</div></div>', { cls: 'small' });
    draw();
    gate.h = k => {
      if (k === '✖') return closeModal(true);
      if (k === '⌫') pin = pin.slice(0, -1); else if (pin.length < 4) pin += k;
      draw();
      if (pin.length === 4) {
        if (pin === String(S.settings.pin)) { closeModal(true); cb(); }
        else { const d = $('#pdots'); d.classList.add('shake'); setTimeout(() => { pin = ''; d.classList.remove('shake'); draw(); }, 500); }
      }
    };
  }

  // ================= parent panel
  let ptab = 'profile', hshow = 40;
  const getp = (o, p) => p.split('.').reduce((a, k) => a && a[k], o);
  const setp = (o, p, v) => { const k = p.split('.'); const l = k.pop(); const t = k.reduce((a, x) => a[x], o); t[l] = v; };
  function parentPanel() {
    const tabs = [['profile', '👧 Profile'], ['history', '📋 History'], ['levels', '📈 Levels'], ['certs', '📜 Certificates'], ['print', '🖨 Print'], ['settings', '⚙️ Settings']];
    const st = W.stats();
    let body = '';
    if (ptab === 'profile') {
      const f = (k, l, ph) => '<label class="fld"><span>' + l + '</span><input data-f="profile.' + k + '" value="' + E(S.profile[k]) + '" placeholder="' + (ph || '') + '"></label>';
      body = '<p class="pnote">These details are printed on every certificate.</p><div class="form">' + f('name', 'Full name') + f('nick', 'Short name (for hello)') + f('cls', 'Class') + f('section', 'Section') + f('school', 'School name') + f('father', "Father's name") + f('mother', "Mother's name") + '</div>';
    } else if (ptab === 'history') {
      const H = S.hist.slice().reverse(), nm = h => h.kind === 'book' ? '📚 Book ' + h.book + ' #' + (h.pid || '').split('_')[1] : ((T[h.type] || {}).emoji || '') + ' ' + ((T[h.type] || {}).name || h.type);
      body = '<p class="pnote">Everything Umaiza did. You can change a result, change stars, or delete a row. Total: <b>' + st.stars + '⭐</b> · <b>' + st.solved + '</b> solved.</p><div class="tbl"><div class="tr th"><span>When</span><span>Puzzle</span><span>Lvl</span><span>1st try?</span><span>Stars</span><span></span></div>' +
        H.slice(0, hshow).map(h => { const d = new Date(h.ts); return '<div class="tr"><span>' + d.getDate() + '/' + (d.getMonth() + 1) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + '</span><span>' + E(nm(h)) + '</span><span>' + (h.lvl || '') + '</span><span><select data-h="' + h.id + '" data-k="ok"><option value="1"' + (h.ok ? ' selected' : '') + '>Yes</option><option value="0"' + (h.ok ? '' : ' selected') + '>No</option></select></span><span><input type="number" min="0" max="3" value="' + h.stars + '" data-h="' + h.id + '" data-k="stars"></span><span><button class="x" data-act="delh" data-id="' + h.id + '">🗑</button></span></div>'; }).join('') + '</div>' +
        (H.length > hshow ? '<button class="btn sm" data-act="moreh">Show more (' + (H.length - hshow) + ')</button>' : '') + (H.length ? '' : '<p class="empty">Nothing yet.</p>') +
        '<div class="pbtn"><button class="btn sm danger" data-act="clearh">Clear all history</button></div>';
    } else if (ptab === 'levels') {
      body = '<p class="pnote">There are 10 levels. Levels go up by themselves (3 first-try wins in a row) and down gently (2 misses in a row). You can set each game by hand here, or set a top limit in the Settings tab (Highest level allowed).</p><div class="tbl">' + Object.values(T).map(t => '<div class="tr lv"><span>' + t.emoji + ' ' + t.name + '</span><span><select data-lv="' + t.id + '">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(l => l <= W.cap()).map(l => '<option' + (W.lvl(t.id) === l ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></span></div>').join('') + '</div><div class="pbtn wrap"><label>Set ALL games to level <select id="alllv">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(l => l <= W.cap()).map(l => '<option>' + l + '</option>').join('') + '</select></label><button class="btn sm" data-act="setall">Apply</button><button class="btn sm danger" data-act="reslv">Reset all levels to 1</button></div>';
    } else if (ptab === 'certs') {
      body = '<p class="pnote">Edit the title, date or design of a certificate, delete it, or make one now.</p>' +
        S.certs.map(c => '<div class="crow"><div class="cmini">' + certBox(c, 150) + '</div><div class="cform"><b>' + c.count + ' puzzles</b><label>Title <input data-c="' + c.id + '" data-k="title" value="' + E(c.title || '') + '" placeholder="' + E(CERT.designs[c.design % 10].title) + '"></label><label>Date <input type="date" data-c="' + c.id + '" data-k="ts" value="' + new Date(c.ts).toISOString().slice(0, 10) + '"></label><label>Design <select data-c="' + c.id + '" data-k="design">' + CERT.designs.map((d, i) => '<option value="' + i + '"' + (c.design % 10 === i ? ' selected' : '') + '>' + (i + 1) + '. ' + d.name + '</option>').join('') + '</select></label><div><button class="btn sm" data-act="viewcert" data-id="' + c.id + '">👁 View</button> <button class="btn sm" data-act="printcert" data-id="' + c.id + '">🖨 Print</button> <button class="btn sm danger" data-act="delc" data-id="' + c.id + '">🗑 Delete</button></div></div></div>').join('') +
        '<h4>Make a certificate now</h4><div class="pbtn"><label>Design <select id="newcd">' + CERT.designs.map((d, i) => '<option value="' + i + '">' + (i + 1) + '. ' + d.name + '</option>').join('') + '</select></label> <label>Puzzles <input type="number" id="newcn" min="1" value="' + Math.max(1, st.solved) + '" style="width:80px"></label> <button class="btn sm" data-act="newcert">➕ Create</button></div>' +
        '<h4>All 10 designs</h4><div class="dgrid">' + CERT.designs.map((d, i) => '<div class="cth" data-act="viewcert" data-d="' + i + '">' + certBox({ design: i, count: 10, ts: Date.now(), title: '' }, 210) + '<div class="cap">' + (i + 1) + '. ' + d.name + '</div></div>').join('') + '</div>';
    } else if (ptab === 'print') {
      const opts = Object.values(T).filter(t => !t.noprintType && t.id !== 'memory').map(t => '<option value="' + t.id + '">' + t.emoji + ' ' + t.name + '</option>').join('');
      body = '<h4>🖨 Worksheet from a game (new puzzles each time)</h4><div class="pbtn wrap"><label>Game <select id="pwt">' + opts + '</select></label><label>Level <select id="pwl">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(l => '<option>' + l + '</option>').join('') + '</select></label><label>How many <select id="pwn">' + [6, 8, 10, 12, 16, 20].map(n => '<option' + (n === 10 ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label><label><input type="checkbox" id="pwk" checked> Answer key page</label><button class="btn sm" data-act="printws">🖨 Print worksheet</button></div>' +
        (BOOKITEMS.length ? '<h4>📚 Print puzzles from the books</h4><div class="pbtn wrap"><label>Book <select id="pbb">' + BOOKS.map(b => '<option value="' + b.n + '">' + b.n + ' · ' + b.name + '</option>').join('') + '</select></label><label>From # <input type="number" id="pbf" min="1" max="999" value="1" style="width:70px"></label><label>To # <input type="number" id="pbt" min="1" max="999" value="10" style="width:70px"></label><label><input type="checkbox" id="pbk" checked> Answers at the end</label><button class="btn sm" data-act="printbook">🖨 Print pages</button></div>' : '') +
        '<p class="pnote">Tip: in the print window choose A4 and turn on "Background graphics" for the best colours.</p>';
    } else {
      body = '<div class="form">' +
        '<label class="fld"><span>Certificate after every</span><select data-f="settings.certEvery" data-num="1">' + [5, 10, 15, 20, 25, 30].map(n => '<option' + (+S.settings.certEvery === n ? ' selected' : '') + '>' + n + '</option>').join('') + '</select> puzzles</label>' +
        '<label class="fld"><span>Highest level allowed (games never go above this)</span><select data-f="settings.maxLevel" data-num="1">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => '<option' + (W.cap() === n ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' +
        '<label class="fld"><span>Puzzles in one round</span><select data-f="settings.round" data-num="1">' + [3, 5, 8, 10].map(n => '<option' + (+S.settings.round === n ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' +
        '<label class="fld"><span>Daily goal (puzzles)</span><select data-f="settings.goal" data-num="1">' + [3, 5, 8, 10, 15, 20].map(n => '<option' + (+S.settings.goal === n ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' +
        '<label class="fld chk"><input type="checkbox" data-f="settings.sound" ' + (S.settings.sound ? 'checked' : '') + '> <span>Sounds on</span></label>' +
        '<label class="fld chk"><input type="checkbox" data-f="settings.autoRead" ' + (S.settings.autoRead ? 'checked' : '') + '> <span>Read each question aloud automatically (English)</span></label>' +
        '<label class="fld"><span>Parent PIN (4 digits)</span><input data-f="settings.pin" value="' + E(S.settings.pin) + '" maxlength="4" inputmode="numeric" pattern="[0-9]*"></label></div>' +
        '<h4>Backup</h4><div class="pbtn wrap"><button class="btn sm" data-act="export">⬇️ Save backup file</button><label class="btn sm filebtn">⬆️ Load backup<input type="file" accept=".json" id="impf" hidden></label></div>' +
        '<h4>Start again</h4><div class="pbtn wrap"><button class="btn sm danger" data-act="resetall">Erase everything</button></div><p class="pnote">Online sync across devices (Firebase) comes in the next phase. For now everything is saved on this device. Please save a backup now and then.</p>';
    }
    openModal('<div class="parent"><div class="phead"><h3>⚙️ Parent area</h3><button class="btn sm" data-act="closem">✖ Close</button></div><div class="ptabs">' + tabs.map(t => '<button class="ptab' + (ptab === t[0] ? ' on' : '') + '" data-act="ptab" data-t="' + t[0] + '">' + t[1] + '</button>').join('') + '</div><div class="pbody">' + body + '</div></div>', { cls: 'wide', onClose: () => { route(); } });
  }
  function parentBind(e) {
    const el = e.target;
    if (el.dataset.f) {
      let v = el.type === 'checkbox' ? el.checked : el.value; if (el.dataset.num) v = +v;
      if (el.dataset.f === 'settings.pin' && !/^\d{4}$/.test(v)) return;
      setp(S, el.dataset.f, v); W.save();
    } else if (el.dataset.h) {
      const h = S.hist.find(x => x.id === el.dataset.h); if (!h) return;
      if (el.dataset.k === 'ok') h.ok = el.value === '1'; else h.stars = Math.max(0, Math.min(3, +el.value || 0)); W.save();
    } else if (el.dataset.lv) { const L = W.lvState(el.dataset.lv); L.l = +el.value; L.st = 0; L.ms = 0; W.save(); }
    else if (el.dataset.c) {
      const c = S.certs.find(x => x.id === el.dataset.c); if (!c) return; const k = el.dataset.k;
      if (k === 'ts') { const d = new Date(el.value + 'T12:00:00'); if (!isNaN(d)) c.ts = d.getTime(); } else if (k === 'design') c.design = +el.value; else c.title = el.value; W.save();
    } else if (el.id === 'impf') {
      const f = el.files[0]; if (!f) return; const r = new FileReader();
      r.onload = () => { try { W.replace(JSON.parse(r.result)); parentPanel(); toast('Backup loaded!'); } catch (x) { toast('Sorry, that file could not be read.'); } }; r.readAsText(f);
    }
  }

  // ================= small helpers
  function ask(msg, yes) {
    const d = document.createElement('div'); d.id = 'ask';
    d.innerHTML = '<div class="askbox"><p>' + E(msg) + '</p><div class="mbtns"><button class="btn big" data-ask="1">Yes</button><button class="btn big alt" data-ask="0">Cancel</button></div></div>';
    d.addEventListener('click', e => { const b = e.target.closest('[data-ask]'); if (!b) return; d.remove(); if (b.dataset.ask === '1') yes(); });
    document.body.appendChild(d);
  }
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

  // ================= printing
  function doPrint(html, land) {
    if (window.UW_PREVIEW) { toast('Printing works in the installed app (GitHub version).'); return; }
    const pa = $('#printArea'); pa.innerHTML = html;
    let st = $('#pstyle'); if (!st) { st = document.createElement('style'); st.id = 'pstyle'; document.head.appendChild(st); }
    st.textContent = '@page{size:A4 ' + (land ? 'landscape' : 'portrait') + ';margin:' + (land ? '0' : '10mm') + '}';
    const imgs = $$('img', pa); let left = imgs.length;
    const go = () => { document.body.classList.add('printing'); setTimeout(() => { window.print(); }, 150); };
    if (!left) return go();
    imgs.forEach(im => { if (im.complete) { if (!--left) go(); } else { im.onload = im.onerror = () => { if (!--left) go(); }; } });
  }
  addEventListener('afterprint', () => { document.body.classList.remove('printing'); const pa = $('#printArea'); if (pa) pa.innerHTML = ''; });
  function qStatic(q, i) {
    let h = '<div class="pq"><div class="pqn">' + (i + 1) + '</div><div class="pqp">' + q.prompt + '</div>';
    if (q.kind === 'choice') h += '<div class="pqv">' + q.vis + '</div><div class="pqo ' + (q.optCls || '') + '">' + q.opts.map(o => '<span><u></u>' + o + '</span>').join('') + '</div>';
    else if (q.kind === 'order') h += (q.pic ? '<div class="pqv"><div class="pic">' + q.pic + '</div></div>' : '') + '<div class="pqo sp2">' + q.items.map(it => '<span class="ptile">' + it.h + '</span>').join('') + '</div><div class="pqw">' + q.order.map(() => '<i></i>').join('') + '</div>';
    return h + '</div>';
  }
  function printWorksheet(type, lvl, n, key) {
    const t = T[type], qs = []; let g = 0;
    while (qs.length < n && g++ < n * 10) { const q = t.gen(lvl); q.sig = JSON.stringify([q.prompt, q.vis, q.opts, q.items && q.items.map(x => x.k)]); if (!qs.some(x => x.sig === q.sig)) qs.push(q); }
    const p = S.profile;
    let h = '<div class="ws"><div class="wsh"><div class="wst">' + t.emoji + ' ' + t.name + ' <small>Level ' + lvl + '</small></div><div class="wsn">Name: <b>' + E(p.name) + '</b> &nbsp; Date: ____________</div></div><div class="wsg">' + qs.map(qStatic).join('') + '</div><div class="wsf">⭐ ⭐ ⭐ &nbsp; Colour a star when you finish! &nbsp; ⭐ ⭐ ⭐</div></div>';
    if (key) h += '<div class="ws brk"><div class="wsh"><div class="wst">Answer key · ' + t.name + ' · Level ' + lvl + '</div></div><div class="wsk">' + qs.map((q, i) => '<div><b>' + (i + 1) + '</b> ' + E(q.key || strip(q.opts ? q.opts[q.ans] : '')) + '</div>').join('') + '</div></div>';
    doPrint(h, false);
  }
  const cropHtml = (id, h, bottom) => '<div class="pcrop" style="padding-bottom:' + (h / 800 * 100) + '%"><img src="books/' + id + '.webp" style="top:' + (bottom ? '-100%' : '0') + '"></div>';
  function printBooks(items, key) {
    let h = items.map(x => '<div class="bp brk"><div class="bph"><span>' + E(x.title) + ' <small>#' + x.n + ' · Book ' + x.book + '</small></span><span>Name: ' + E(S.profile.nick || '') + ' ______ Date: ______</span></div><div class="bpi">' + cropHtml(x.id, x.h) + '</div><div class="bpins">' + E(x.ins) + '</div></div>').join('');
    if (key) { h += '<div class="brk"><div class="wsh"><div class="wst">Answers</div></div><div class="bak">' + items.map(x => '<div class="ba"><b>Book ' + x.book + ' #' + x.n + ' ' + E(x.title) + '</b>' + cropHtml(x.id, x.h, true) + '<small>' + E(x.ans) + '</small></div>').join('') + '</div></div>'; }
    doPrint(h, false);
  }
  function printCert(c) {
    doPrint('<div class="pc"><div class="pcs">' + CERT.html(c, S.profile) + '</div></div>', true);
  }

  // ================= actions
  const A = {
    home() { nav('home'); },
    wins() { nav('wins'); }, certs() { nav('certs'); },
    parent() { gate(() => { ptab = 'profile'; parentPanel(); }); },
    open(a) {
      if (editMode) return;
      const id = a.dataset.id, c = allCards().find(x => x.id === id); if (!c) return;
      if (c.kind === 'book') nav('book/' + c.n); else nav('play/' + id);
    },
    filter(a) { S.settings.filter = a.dataset.v; W.save(); renderHome(); },
    sort(a) { S.settings.sort = a.value; W.save(); renderHome(); },
    size(a) { S.settings.size = +a.value; const d = $('.dash'); if (d) d.style.setProperty('--cw', a.value + 'px'); W.save(); },
    editmode() { if (editMode) { editMode = false; renderHome(); } else gate(() => { editMode = true; renderHome(); }); },
    mv(a) {
      const id = a.dataset.id, d = +a.dataset.d; const L = sortedCards(W.stats()); L.forEach((c, i) => { S.cards[c.id] = S.cards[c.id] || {}; S.cards[c.id].ord = i; });
      const all = allCards().filter(c => !L.includes(c)); all.forEach((c, i) => { S.cards[c.id] = S.cards[c.id] || {}; S.cards[c.id].ord = 1000 + i; });
      const i = L.findIndex(c => c.id === id), j = i + d; if (j < 0 || j >= L.length) return;
      S.cards[L[i].id].ord = j; S.cards[L[j].id].ord = i; S.settings.sort = 'custom'; W.save(); renderHome();
    },
    bigc(a) { const o = S.cards[a.dataset.id] = S.cards[a.dataset.id] || {}; o.big = !o.big; W.save(); renderHome(); },
    hidec(a) { const o = S.cards[a.dataset.id] = S.cards[a.dataset.id] || {}; o.hidden = !o.hidden; W.save(); renderHome(); },
    editc(a) {
      const id = a.dataset.id, c = allCards().find(x => x.id === id), cols = ['#ff8a5c', '#ff6b6b', '#ffa94d', '#ffd43b', '#51cf66', '#20c997', '#339af0', '#6c8cff', '#845ef7', '#e84393', '#f06595', '#10ac84'];
      openModal('<div class="editc"><h3>Edit card</h3><label class="fld"><span>Name</span><input id="ecn" value="' + E(c.name) + '"></label><label class="fld"><span>Picture (emoji)</span><input id="ece" value="' + E(c.emoji) + '" maxlength="4"></label><div class="emq">' + ['🧸', '🎈', '🦄', '🐻', '🚂', '🌈', '⭐', '🍭', '🐠', '🚀', '🦋', '👑'].map(e => '<button data-act="emo" data-e="' + e + '">' + e + '</button>').join('') + '</div><div class="swatches" id="ecc" data-v="' + c.color + '">' + cols.map(x => '<button data-act="swatch" data-c="' + x + '" style="background:' + x + '" class="' + (x === c.color ? 'on' : '') + '"></button>').join('') + '</div><div class="mbtns"><button class="btn big" data-act="savec" data-id="' + id + '">Save</button><button class="btn big alt" data-act="resetc" data-id="' + id + '">Reset</button><button class="btn big alt" data-act="closem">Cancel</button></div></div>', { cls: 'small' });
    },
    emo(a) { $('#ece').value = a.dataset.e; },
    swatch(a) { $$('#ecc button').forEach(b => b.classList.remove('on')); a.classList.add('on'); $('#ecc').dataset.v = a.dataset.c; },
    savec(a) { const o = S.cards[a.dataset.id] = S.cards[a.dataset.id] || {}; o.name = $('#ecn').value.trim() || undefined; o.emoji = $('#ece').value.trim() || undefined; o.color = $('#ecc').dataset.v; W.save(); closeModal(true); renderHome(); },
    resetc(a) { const o = S.cards[a.dataset.id]; if (o) { delete o.name; delete o.emoji; delete o.color; } W.save(); closeModal(true); renderHome(); },
    surprise() { const L = sortedCards(W.stats()).filter(c => c.kind === 'gen'); const c = R.pick(L.length ? L : allCards().filter(c => c.kind === 'gen')); nav('play/' + c.id); },
    say() { if (G && G.q) W.speak(G.q.say); },
    pick(a) { pick(+a.dataset.i); }, tile(a) { tile(a); }, flip(a) { flip(+a.dataset.i); },
    next() { next(); },
    again() { startGame(G.type); renderPlay(); },
    openbook(a) { nav('book/' + a.dataset.n); },
    bfilter(a) { view.b = a.dataset.v; renderBook(+view.a); },
    bopen(a) { nav('bpuz/' + a.dataset.id); },
    check(a) { const x = $('#bcrop img'); x.style.top = '-100%'; $('#ansline').hidden = false; $('#rate').hidden = false; $('#chk').hidden = true; W.snd.tap(); },
    brate(a) {
      const id = a.dataset.id, x = BOOKITEMS.find(y => y.id === id), st = W.stats();
      if (a.dataset.v === '1') {
        if (st.bookDone[id]) { cheer(0, ''); $('#cheer .ctext').textContent = 'Great practice!'; } else {
          W.addHist({ kind: 'book', book: x.book, pid: id, lvl: x.lvl, ok: true, stars: 3 }); W.save(); const c = W.checkCert(); cheer(3, ''); refreshTop(); bumpStars();
          if (c) setTimeout(() => showCert(c, () => { }, true), 1400);
        }
        const nx = BOOKITEMS[BOOKITEMS.indexOf(x) + 1]; setTimeout(() => nav(nx && nx.book === x.book ? 'bpuz/' + nx.id : 'book/' + x.book), 1700);
      } else { const t = $('#bcrop img'); t.style.top = '0'; $('#rate').hidden = true; $('#ansline').hidden = true; $('#chk').hidden = false; }
    },
    printb(a) { const x = BOOKITEMS.find(y => y.id === a.dataset.id); printBooks([x], false); },
    viewcert(a) { const c = a.dataset.d != null ? { design: +a.dataset.d, count: 10, ts: Date.now(), title: '' } : S.certs.find(x => x.id === a.dataset.id); if (c) { const keep = $('#modal').className === 'open' && $('.parent'); if (keep) { closeModal(true); } showCert(c, a.dataset.d != null || keep ? () => parentPanel() : null, false); } },
    printcert(a) { const c = S.certs.find(x => x.id === a.dataset.id); if (c) printCert(c); },
    closem() { closeModal(); },
    key(a) { gate.h(a.dataset.k); },
    ptab(a) { ptab = a.dataset.t; parentPanel(); },
    moreh() { hshow += 40; parentPanel(); },
    delh(a) { ask('Delete this row?', () => { S.hist = S.hist.filter(h => h.id !== a.dataset.id); W.save(); parentPanel(); }); },
    clearh() { ask('Delete ALL history? Stars and level progress will go to zero (certificates stay).', () => { S.hist = []; W.save(); parentPanel(); }); },
    setall() { const v = +$('#alllv').value || 1; Object.keys(T).forEach(id => { const L = W.lvState(id); L.l = Math.min(v, W.cap()); L.st = 0; L.ms = 0; }); W.save(); toast('All games set to level ' + v + ' ✅'); parentPanel(); },
    reslv() { ask('Reset all levels to 1?', () => { S.lv = {}; W.save(); parentPanel(); }); },
    delc(a) { ask('Delete this certificate?', () => { S.certs = S.certs.filter(c => c.id !== a.dataset.id); W.save(); parentPanel(); }); },
    newcert() { const d = +$('#newcd').value, n = Math.max(1, +$('#newcn').value || 1); S.certs.push({ id: W.uid(), ts: Date.now(), design: d, count: n, title: '' }); W.save(); parentPanel(); },
    printws() { const t = $('#pwt').value, l = +$('#pwl').value, n = +$('#pwn').value, k = $('#pwk').checked; closeModal(true); printWorksheet(t, l, n, k); },
    printbook() { const b = +$('#pbb').value, f = Math.max(1, +$('#pbf').value || 1), t = Math.min(999, +$('#pbt').value || 10); const L = BOOKITEMS.filter(x => x.book === b && x.n >= f && x.n <= t), k = $('#pbk').checked; closeModal(true); printBooks(L, k); },
    export() { const b = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }), u = URL.createObjectURL(b), a2 = document.createElement('a'); a2.href = u; a2.download = 'umaiza-puzzle-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a2.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); },
    resetall() { ask('Erase EVERYTHING (profile, history, certificates)?', () => ask('Really sure? This cannot be undone.', () => { W.reset(); parentPanel(); })); }
  };

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (!a || a.tagName === 'SELECT' || a.type === 'range') return;
    if (e.target.closest('.ctl') && a.classList.contains('card')) return;
    const f = A[a.dataset.act]; if (f) { e.stopPropagation(); f(a, e); }
  });
  document.addEventListener('change', e => {
    const a = e.target; if (a.dataset && a.dataset.act && (a.tagName === 'SELECT' || a.type === 'range')) { A[a.dataset.act](a); return; }
    if ($('#modal.open')) parentBind(e);
  });
  document.addEventListener('input', e => { const a = e.target; if (a.dataset && a.dataset.act === 'size') A.size(a); else if ($('#modal.open') && a.tagName === 'INPUT' && a.type !== 'file' && a.type !== 'checkbox' && a.type !== 'date') parentBind(e); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modal.open')) closeModal(); });

  // ================= router
  function route() {
    const h = window.UW_PREVIEW ? cur : (location.hash.replace(/^#\/?/, '') || 'home'), p = h.split('/');
    view = { v: p[0], a: p[1], b: view.v === p[0] && view.a === p[1] ? view.b : 'all' };
    if (view.v === 'play') { if (!G || G.type !== view.a || G.done) startGame(view.a); renderPlay(); }
    else if (view.v === 'book') renderBook(+view.a);
    else if (view.v === 'bpuz') renderBookPuzzle(view.a);
    else if (view.v === 'wins') renderWins();
    else if (view.v === 'certs') renderCerts();
    else { G = null; renderHome(); }
    window.scrollTo(0, 0);
  }
  let cur = 'home';
  function nav(p) { cur = p; if (window.UW_PREVIEW || location.hash === '#/' + p) route(); else location.hash = '#/' + p; }

  async function init() {
    try { const r = await fetch('books.json'); if (r.ok) BOOKITEMS = await r.json(); } catch (e) { }
    try { const r = await fetch('bookmeta.json'); if (r.ok) { const m = await r.json(); if (Array.isArray(m) && m.length) BOOKS = m; } } catch (e) { }
    addEventListener('hashchange', route);
    route();
    if (!window.UW_PREVIEW && 'serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
    if (window.speechSynthesis) speechSynthesis.getVoices();
    window.APP = { nav, route, G: () => G };
  }
  init();
})();
