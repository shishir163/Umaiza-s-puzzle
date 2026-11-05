/* Certificate designs - each is fixed 1000x707 px (A4 landscape ratio), scaled by CSS */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // deco: [emoji, left%, top%, size px, rotate deg]
  const D = [
    { name: 'Rainbow Party', title: 'Certificate of Achievement', ribbon: '★ Super Puzzle Star ★', seal: '🏅',
      bg: 'radial-gradient(circle at 15% 15%,#fff7c2,#fff7c200 40%),radial-gradient(circle at 85% 85%,#d6f5ff,#d6f5ff00 45%),#ffffff',
      frame: 'border:16px solid transparent;border-image:linear-gradient(135deg,#ff595e,#ffca3a,#8ac926,#1982c4,#6a4c93) 1;',
      ink: '#3b3b6d', ink2: '#6a4c93', acc: '#ff595e', name: '#ef476f',
      deco: [['🌈', 6, 6, 74, -8], ['☁️', 84, 6, 70, 0], ['🎈', 5, 70, 70, -10], ['🎈', 90, 66, 66, 10], ['⭐', 50, 3, 40, 0], ['🎉', 92, 88, 52, 0], ['🧸', 4, 90, 56, 0]] },
    { name: 'Starry Night', title: 'Super Star Award', ribbon: '✦ Shining Brightly ✦', seal: '🌟',
      bg: 'radial-gradient(circle at 20% 20%,#3a3a8c,#3a3a8c00 50%),linear-gradient(160deg,#141446,#2b2b7a 60%,#432c8f)',
      frame: 'border:10px double #ffd166;box-shadow:inset 0 0 40px rgba(255,209,102,.35);',
      ink: '#fff3c4', ink2: '#bfc4ff', acc: '#ffd166', name: '#ffd166', dark: 1,
      deco: [['🌙', 7, 7, 80, -10], ['⭐', 88, 8, 56, 12], ['✨', 14, 80, 54, 0], ['⭐', 92, 78, 44, 0], ['🌟', 48, 3, 44, 0], ['✨', 76, 90, 46, 0], ['🦉', 4, 44, 52, 0]] },
    { name: 'Candy Land', title: 'Sweet Brain Certificate', ribbon: '🍭 Yummy Thinker 🍭', seal: '🍰',
      bg: 'repeating-linear-gradient(45deg,#fff0f6 0 26px,#ffe0ec 26px 52px)',
      frame: 'border:16px dashed #ff6fa5;border-radius:34px;',
      ink: '#7a2a5a', ink2: '#c2255c', acc: '#ff6fa5', name: '#d6336c',
      deco: [['🍭', 5, 6, 70, -14], ['🍬', 90, 8, 56, 20], ['🧁', 5, 82, 64, 0], ['🍩', 90, 80, 64, 10], ['🍪', 48, 2, 44, 0], ['🍓', 80, 88, 46, 0], ['🍦', 14, 40, 0, 0]] },
    { name: 'Jungle Friends', title: 'Jungle Champion Award', ribbon: '🌴 Brave & Clever 🌴', seal: '🦁',
      bg: 'radial-gradient(circle at 80% 20%,#d8f5a2,#d8f5a200 45%),linear-gradient(160deg,#e9fac8,#b8e994)',
      frame: 'border:14px ridge #2f9e44;border-radius:18px;',
      ink: '#1b4d2e', ink2: '#2b8a3e', acc: '#f08c00', name: '#e8590c',
      deco: [['🦁', 5, 5, 72, 0], ['🐵', 90, 6, 64, 0], ['🌴', 4, 76, 80, 0], ['🦜', 91, 76, 60, 0], ['🍃', 50, 2, 46, 0], ['🐘', 80, 88, 52, 0], ['🦒', 14, 90, 0, 0]] },
    { name: 'Under the Sea', title: 'Ocean Explorer Certificate', ribbon: '🐚 Deep Thinker 🐚', seal: '🐙',
      bg: 'radial-gradient(circle at 20% 80%,rgba(255,255,255,.55) 0 4px,transparent 5px),radial-gradient(circle at 70% 30%,rgba(255,255,255,.5) 0 6px,transparent 7px),linear-gradient(180deg,#d0f4ff,#7ed6f2 70%,#4cb8e6)',
      frame: 'border:14px solid #1c7ed6;border-radius:42px;',
      ink: '#0b3d66', ink2: '#1864ab', acc: '#ff6b6b', name: '#e03131',
      deco: [['🐠', 6, 6, 66, 0], ['🐳', 88, 6, 70, 0], ['🐙', 5, 78, 66, 0], ['🦀', 90, 82, 56, 0], ['🐚', 50, 2, 42, 0], ['🫧', 20, 90, 40, 0], ['🐬', 78, 90, 46, 0]] },
    { name: 'Space Explorer', title: 'Space Genius Certificate', ribbon: '🚀 Out of This World 🚀', seal: '🚀',
      bg: 'radial-gradient(circle at 80% 20%,#6d3fd0,#6d3fd000 45%),linear-gradient(160deg,#10102e,#241b5e 55%,#3b1f78)',
      frame: 'border:8px solid #a78bfa;border-radius:24px;box-shadow:inset 0 0 40px #7c3aed;',
      ink: '#f1ecff', ink2: '#c4b5fd', acc: '#5eead4', name: '#5eead4', dark: 1,
      deco: [['🪐', 6, 6, 76, -10], ['🚀', 89, 7, 64, 20], ['👽', 5, 80, 60, 0], ['🌍', 90, 78, 60, 0], ['⭐', 48, 2, 40, 0], ['☄️', 78, 90, 44, 0], ['✨', 18, 90, 40, 0]] },
    { name: 'Flower Garden', title: 'Little Gardener Award', ribbon: '🌸 Blooming Brain 🌸', seal: '🌻',
      bg: 'radial-gradient(circle at 10% 90%,#ffd8e8,#ffd8e800 40%),radial-gradient(circle at 90% 10%,#fff3bf,#fff3bf00 40%),#f4fff0',
      frame: 'border:14px dotted #f06595;border-radius:34px;',
      ink: '#4a2c5a', ink2: '#a61e4d', acc: '#40c057', name: '#d6336c',
      deco: [['🌸', 5, 6, 70, -10], ['🌻', 90, 6, 72, 0], ['🦋', 6, 78, 62, 10], ['🌷', 90, 80, 64, 0], ['🌼', 50, 2, 42, 0], ['🐝', 80, 90, 44, 0], ['🌹', 16, 90, 44, 0]] },
    { name: 'Royal Princess', title: 'Royal Certificate of Excellence', ribbon: '👑 Puzzle Princess 👑', seal: '👑',
      bg: 'radial-gradient(circle at 50% 0%,#fff8e1,#fff8e100 60%),linear-gradient(160deg,#fdf2ff,#f3e5ff)',
      frame: 'border:14px double #c9a227;box-shadow:inset 0 0 0 6px #fdf2ff,inset 0 0 0 9px #c9a227;',
      ink: '#4a2a6e', ink2: '#7b3fb0', acc: '#c9a227', name: '#8e24aa',
      deco: [['👑', 47, 1, 52, 0], ['🏰', 5, 7, 70, 0], ['🦄', 89, 8, 70, 0], ['💎', 6, 82, 52, 0], ['✨', 91, 82, 48, 0], ['🌹', 50, 90, 40, 0], ['🎀', 80, 90, 40, 0]] },
    { name: 'Farm Fun', title: 'Farm Hero Certificate', ribbon: '🐮 Happy Farmer 🐮', seal: '🐥',
      bg: 'linear-gradient(180deg,#d0ebff 0 55%,#b2f2bb 55% 100%)',
      frame: 'border:16px groove #e67700;border-radius:20px;',
      ink: '#5c3d0e', ink2: '#b35900', acc: '#e03131', name: '#c92a2a',
      deco: [['☀️', 5, 5, 70, 0], ['☁️', 86, 7, 64, 0], ['🐮', 5, 80, 68, 0], ['🐷', 90, 82, 60, 0], ['🚜', 50, 90, 48, 0], ['🐥', 78, 90, 44, 0], ['🌾', 16, 90, 44, 0]] },
    { name: 'Dino & Toys', title: 'Toy Box Champion Award', ribbon: '🦖 Roar-some Thinker 🦖', seal: '🧸',
      bg: 'radial-gradient(circle at 20% 20%,#fff3bf,#fff3bf00 40%),radial-gradient(circle at 80% 80%,#ffd8a8,#ffd8a800 45%),#fff9db',
      frame: 'border:14px dashed #2b8a3e;border-radius:26px;',
      ink: '#3d3d0a', ink2: '#2b8a3e', acc: '#fd7e14', name: '#d9480f',
      deco: [['🦖', 5, 6, 74, 0], ['🧸', 90, 7, 66, 0], ['🚂', 5, 82, 62, 0], ['🪁', 90, 76, 62, 0], ['🧩', 50, 2, 42, 0], ['🎲', 78, 90, 42, 0], ['🦕', 16, 90, 44, 0]] }
  ];

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmtDate = ts => { const d = new Date(ts); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };

  function html(cert, p) {
    const d = D[cert.design % D.length];
    const line = [p.cls ? 'Class ' + p.cls : '', p.section ? 'Section ' + p.section : '', p.school || ''].filter(Boolean).join('  •  ');
    const deco = d.deco.filter(x => x[3] > 0 && !(x[2] >= 86 && x[1] > 12 && x[1] < 88)).map(x => [x[0], x[1] >= 88 ? 94 : x[1] <= 10 ? 5.5 : x[1], x[2], x[3], x[4]]).map(x => '<i style="left:' + x[1] + '%;top:' + x[2] + '%;font-size:' + x[3] + 'px;transform:translate(-50%,0) rotate(' + x[4] + 'deg)">' + x[0] + '</i>').join('');
    return '<div class="cert' + (d.dark ? ' dark' : '') + '" style="background:' + d.bg + ';--ink:' + d.ink + ';--ink2:' + d.ink2 + ';--acc:' + d.acc + ';--nm:' + d.name + '">' +
      '<div class="c-frame" style="' + d.frame + '"></div><div class="c-deco">' + deco + '</div>' +
      '<div class="c-body">' +
      '<div class="c-school">' + esc(p.school || '') + '</div>' +
      '<h1 class="c-title">' + esc(cert.title || d.title) + '</h1>' +
      '<div class="c-ribbon">' + esc(d.ribbon) + '</div>' +
      '<div class="c-pre">This certificate is proudly given to</div>' +
      '<div class="c-name">' + esc(p.name || 'Our Little Star') + '</div>' +
      '<div class="c-line">' + esc(line) + '</div>' +
      '<div class="c-text">for solving <b>' + cert.count + '</b> puzzles with clever thinking, patience and a big smile!<br>Keep shining, keep learning!</div>' +
      '<div class="c-date">Given on ' + esc(fmtDate(cert.ts)) + '</div>' +
      '<div class="c-foot">' +
      '<div class="c-sig"><span>' + esc(p.father || '') + '</span><small>Father</small></div>' +
      '<div class="c-seal">' + d.seal + '<em>' + cert.count + '</em></div>' +
      '<div class="c-sig"><span>' + esc(p.mother || '') + '</span><small>Mother</small></div>' +
      '</div></div></div>';
  }

  window.CERT = { designs: D, html, fmtDate, esc };
})();
