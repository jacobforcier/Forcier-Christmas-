/* Extras: secrets tracker, snow globe, rare falling treasures, Director's Cut,
   12 Days banners, Christmas Eve Santa tracker, Christmas-morning unwrap, ugly sweater mode.
   Relies on globals from app.js ($, store, toast, burst, fx, theme, THEMES, showtime, etc). */

/* ---------- Eastern-time calendar helpers ---------- */
function etParts(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23' })
    .formatToParts(d).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24 };
}
const etDayKey = () => { const e = etParts(); return `${e.y}-${e.m}-${e.d}`; };
function daysUntilXmas() {
  const e = etParts();
  return Math.round((Date.UTC(2026, 11, 25) - Date.UTC(e.y, e.m - 1, e.d)) / 86400e3);
}

/* ---------- 1. secrets tracker ---------- */
const SECRETS = [
  { id: 'gag', name: 'Movie gag', hint: 'The gadget under the title has a trick up its sleeve.' },
  { id: 'sleigh', name: 'Santa flyover', hint: 'Someone important keeps checking the date.' },
  { id: 'snowday', name: 'Snow day', hint: 'Some titles like being tapped. A lot. Quickly.' },
  { id: 'globe', name: 'Snow globe', hint: 'Give it a good shake.' },
  { id: 'catch', name: 'Lucky catch', hint: 'Keep an eye on the sky. Things fall… rarely.' },
  { id: 'director', name: 'Director’s Cut', hint: 'One button likes to be held, not tapped.' },
  { id: 'sweater', name: 'Ugly sweater', hint: 'There’s a present on this page. Unwrap it.' },
];
const foundSecrets = () => { try { return JSON.parse(store.get('xmasSecrets') || '[]'); } catch { return []; } };
function renderSecrets() {
  const f = foundSecrets(), n = SECRETS.filter((s) => f.includes(s.id)).length;
  $('secretsText').textContent = n ? `Secrets found: ${n} of ${SECRETS.length}` : 'psst… this page hides some secrets';
  $('secretsDots').innerHTML = SECRETS.map((s) => `<i class="${f.includes(s.id) ? 'on' : ''}"></i>`).join('');
  $('secretsBtn').classList.toggle('all', n === SECRETS.length);
}
window.secretFound = (id) => {
  const f = foundSecrets();
  if (f.includes(id)) return;
  f.push(id); store.set('xmasSecrets', JSON.stringify(f));
  renderSecrets();
  const n = SECRETS.filter((s) => f.includes(s.id)).length;
  $('secretsBtn').classList.remove('ping'); void $('secretsBtn').offsetWidth; $('secretsBtn').classList.add('ping');
  if (n === SECRETS.length) setTimeout(allSecrets, 2200);
  else setTimeout(() => toast(`🤫 Secret found! ${n} of ${SECRETS.length}`), 2300);
};
function allSecrets() {
  fanfare();
  [0, 300, 600, 900].forEach((d, i) => setTimeout(() => burst(innerWidth * (0.15 + i * 0.23), innerHeight * 0.35, 80), d));
  const b = $('fullhouse');
  b.querySelector('.fh-ico').textContent = '🏅';
  b.querySelector('b').textContent = 'Secret Santa Society!';
  b.querySelector('span:not(.fh-ico)').textContent = `You found all ${SECRETS.length} secrets. Tell no one. 🤫`;
  b.classList.add('show');
  setTimeout(() => { b.classList.remove('show'); setTimeout(() => { b.querySelector('.fh-ico').textContent = '🎉'; b.querySelector('span:not(.fh-ico)').textContent = 'Thank you, everyone. See you on the 25th! 🎄'; }, 800); }, 6500);
}
$('secretsBtn').addEventListener('click', () => {
  const f = foundSecrets();
  const needMotion = !f.includes('globe') && motionNeedsPermission && !motionGranted && 'ontouchend' in window;
  openDialog(`🤫 Secrets: ${SECRETS.filter((s) => f.includes(s.id)).length} of ${SECRETS.length}`,
    `<ul class="secret-list">${SECRETS.map((s) => f.includes(s.id)
      ? `<li class="got">✅ <b>${s.name}</b></li>`
      : `<li>❔ <span>${s.hint}</span></li>`).join('')}</ul>
     ${needMotion ? '<button type="button" class="btn ghost" id="motionBtn">📳 Let my phone feel shakes</button>' : ''}`,
    [{ label: 'Close', value: null, cls: 'ghost' }]);
  const mb = $('motionBtn');
  if (mb) mb.addEventListener('click', async () => {
    try { if ((await DeviceMotionEvent.requestPermission()) === 'granted') { motionGranted = true; mb.textContent = '📳 Ready. Now shake!'; mb.disabled = true; } }
    catch { mb.textContent = 'Motion not available'; }
  });
});
renderSecrets();

/* ---------- 2. shake → snow globe ---------- */
let globeBusy = false, motionOn = false, motionGranted = false;
function snowGlobe() {
  if (globeBusy) return;
  globeBusy = true;
  audio(); fx.globe(); whoosh();
  document.body.classList.remove('globe'); void document.body.offsetWidth; document.body.classList.add('globe');
  toast('🔮 Snow globe! Watch it settle…');
  window.secretFound('globe');
  setTimeout(() => { document.body.classList.remove('globe'); globeBusy = false; }, 7000);
}
function listenMotion() {
  if (motionOn) return; motionOn = true;
  // Count distinct jolts: a spike in movement, then a short gap before the next one counts.
  let last = null, peaks = [], lastPeak = 0;
  addEventListener('devicemotion', (e) => {
    const now = Date.now();
    let mag;
    const a = e.acceleration;                               // movement without gravity (most phones)
    if (a && a.x != null) mag = Math.hypot(a.x, a.y, a.z);
    else {                                                  // fallback: change in raw reading
      const g = e.accelerationIncludingGravity; if (!g || g.x == null) return;
      mag = last ? Math.hypot(g.x - last.x, g.y - last.y, g.z - last.z) : 0;
      last = { x: g.x, y: g.y, z: g.z };
    }
    if (mag > 11 && now - lastPeak > 120) {
      lastPeak = now;
      peaks = peaks.filter((t) => now - t < 1300); peaks.push(now);
      if (peaks.length >= 3) { peaks = []; snowGlobe(); }
    }
  });
}
const motionNeedsPermission = typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function';
if (typeof DeviceMotionEvent !== 'undefined') listenMotion(); // harmless before permission: iPhones just send nothing until allowed
// iPhone: motion needs a one-time "Allow" that can only be asked right after a tap. Ask on the first tap anywhere
// (not while someone is typing in a box), once per visit.
if (motionNeedsPermission) {
  const ask = (e) => {
    if (e.target.closest && e.target.closest('input, textarea, dialog')) return;
    document.removeEventListener('touchend', ask, true);
    let asked = null; try { asked = sessionStorage.getItem('xmasMotionAsked'); } catch {}
    if (asked) return;
    try { sessionStorage.setItem('xmasMotionAsked', '1'); } catch {}
    DeviceMotionEvent.requestPermission().then((r) => { if (r === 'granted') motionGranted = true; }).catch(() => {});
  };
  document.addEventListener('touchend', ask, true);
}
// computers: a quick side-to-side mouse wiggle counts as a shake
(() => {
  let lx = null, dir = 0, flips = [];
  addEventListener('mousemove', (e) => {
    if (lx !== null) {
      const dx = e.clientX - lx;
      if (Math.abs(dx) > 18) {
        const nd = Math.sign(dx), now = Date.now();
        if (dir && nd !== dir) { flips = flips.filter((t) => now - t < 900); flips.push(now); if (flips.length >= 6) { flips = []; snowGlobe(); } }
        dir = nd;
      }
    }
    lx = e.clientX;
  }, { passive: true });
})();

/* ---------- 3. rare falling treasures ---------- */
const TREASURE = {
  griswold: [['🐿️', 'You caught the squirrel! Get it out of the tree!'], ['💡', 'Found the one bulb that was out!']],
  elf: [['🍝', 'Spaghetti and syrup. Breakfast of champions!'], ['🍭', 'Candy-cane forest snack, caught!']],
  grinch: [['💚', 'You caught a heart. It grew three sizes!'], ['🎁', 'Rescued a stolen present!']],
  homealone: [['🕷️', 'Caught the tarantula! Nobody scream.'], ['🍕', 'Saved the last slice of cheese pizza!']],
  polar: [['🎟️', 'Golden ticket caught. Punch it!'], ['🔔', 'You caught the bell. Can you still hear it?']],
  wonderful: [['🔔', 'A bell rang. Somebody got their wings!'], ['🌸', 'Caught Zuzu’s petals!']],
  diehard: [['🧨', 'Defused it. Welcome to the party!'], ['📞', 'Got the radio. Come out to the coast!']],
  sadtree: [['🔴', 'One more ornament for the little tree!'], ['🧣', 'A blanket for the tree. Aww.']],
  frosty: [['🎩', 'You caught the magic hat!'], ['🥕', 'Caught a carrot nose!']],
  hallmark: [['💌', 'A handwritten letter from the inn!'], ['☕', 'Hot cocoa meet-cute, caught!']],
  rudolph: [['🔴', 'Caught a glowing nose. Fog’s lifting!'], ['🧸', 'Rescued a misfit toy!']],
  carol: [['🕯️', 'Caught a ghost’s candle!'], ['🦃', 'The prize turkey, caught for the Cratchits!']],
  miracle: [['✉️', 'Caught a letter to Santa. Deliver it!'], ['🎅', 'Caught him. He’s real!']],
  puppets: [['🧀', 'Caught the cheese! Someone will be thrilled.'], ['💡', 'Light the lamp! (Not the rat.)']],
};
function dropTreasure() {
  if (document.hidden || dlg.open || showing || reduced) return false;
  const list = TREASURE[theme.id] || [['🎁', 'You caught a present!']];
  const [emo, msg] = list[Math.floor(Math.random() * list.length)];
  const el = document.createElement('button');
  el.type = 'button'; el.className = 'treasure'; el.setAttribute('aria-label', 'Catch the falling ornament');
  el.innerHTML = `<span class="cap"></span><span class="ball"><span class="emo">${emo}</span></span>`;
  document.body.appendChild(el);
  const x0 = innerWidth * (0.12 + Math.random() * 0.76), dur = 9000 + Math.random() * 3000, t0 = performance.now(), sway = 30 + Math.random() * 30;
  let done = false;
  const step = (now) => {
    if (done) return;
    const t = (now - t0) / dur;
    if (t >= 1) { el.remove(); return; }
    el.style.transform = `translate(${x0 + Math.sin(t * 7) * sway}px, ${-80 + t * (innerHeight + 160)}px) rotate(${Math.sin(t * 7 + 1) * 14}deg)`;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  el.addEventListener('pointerdown', (e) => {
    if (done) return; done = true;
    audio(); jingle();
    burst(e.clientX, e.clientY, 60);
    el.classList.add('caught');
    const n = +(store.get('xmasCaught') || 0) + 1; store.set('xmasCaught', String(n));
    toast(`${emo} ${msg}${n > 1 ? ` (${n} caught so far)` : ''}`);
    window.secretFound('catch');
    setTimeout(() => el.remove(), 500);
  });
  return true;
}
(function scheduleTreasure(first) {
  const wait = first ? 40000 + Math.random() * 40000 : 75000 + Math.random() * 90000; // rare: first after ~1 min, then every ~1.5–3 min
  setTimeout(() => { const ok = theme && dropTreasure(); setTimeout(() => scheduleTreasure(false), ok ? 0 : 15000); }, wait);
})(true);
window.dropTreasure = dropTreasure; // handy for testing

/* ---------- 4. Director's Cut: press and hold 🎞️ ---------- */
(() => {
  const btn = $('shuffle'); let t = null;
  const suppress = () => { window.suppressShuffle = true; setTimeout(() => { window.suppressShuffle = false; }, 700); }; // only swallow the release of this press
  const start = () => { clearTimeout(t); t = setTimeout(() => { suppress(); directorsCut(); }, 550); };
  const cancel = () => clearTimeout(t);
  btn.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, cancel));
  btn.addEventListener('contextmenu', (e) => { e.preventDefault(); suppress(); if (!dlg.open) directorsCut(); });
})();
function directorsCut() {
  if (showing) return;
  window.secretFound('director');
  openDialog('🎬 Director’s Cut',
    `<p class="dlg-note">Pick any movie:</p><div class="dc-grid">${THEMES.map((t) => `<button type="button" class="dc ${t.id === theme.id ? 'now' : ''}" data-dc="${t.id}"
      style="--s1:${t.swatch[0]};--s2:${t.swatch[1]};--s3:${t.swatch[2]}"><span class="dc-poster">${t.emoji}</span><span class="dc-name">${t.name}</span></button>`).join('')}</div>`,
    [{ label: 'Close', value: null, cls: 'ghost' }]);
  $('dlgBody').querySelectorAll('[data-dc]').forEach((b) => b.addEventListener('click', () => {
    const t = THEMES.find((x) => x.id === b.dataset.dc);
    dlg.close();
    if (t.id === theme.id) return;
    rememberTheme(t.id);
    setTimeout(() => showtime(t), 150);
  }));
}

/* ---------- 6. the 12 Days of Christmas banners ---------- */
const TWELVE = {
  12: '🥁 12 days to go! Twelve drummers drumming. (Please, not at the table.)',
  11: '🎶 11 days to go! Eleven pipers piping. One of them is bringing bread.',
  10: '🦵 10 days to go! Ten lords a-leaping over the dessert table.',
  9: '💃 9 days to go! Nine ladies dancing in the kitchen.',
  8: '🥛 8 days to go! Eight maids a-milking. Someone grab the orange juice.',
  7: '🦢 7 days to go! Seven swans a-swimming. The pond’s frozen, so they’re skating.',
  6: '🥚 6 days to go! Six geese a-laying. Egg bites: covered.',
  5: '💍 5 days to go! FIVE GOLDEN RINGS… of cinnamon roll.',
  4: '📞 4 days to go! Four calling birds. Call your cousins and RSVP.',
  3: '🐔 3 days to go! Three French hens. Zero French toast (so far).',
  2: '🕊️ 2 days to go! Two turtle doves and one big pot of stew.',
  1: '🍐 Christmas Eve! A partridge in a pear tree, and see you tomorrow!',
};
function dayBanner() {
  const left = daysUntilXmas(), msg = TWELVE[left];
  const key = 'xmasDayBanner:' + etDayKey();
  if (!msg || store.get(key)) return;
  const el = $('dayBanner');
  el.innerHTML = `<span>${msg}</span><button type="button" aria-label="Dismiss">✕</button>`;
  el.classList.add('show');
  el.querySelector('button').addEventListener('click', () => { el.classList.remove('show'); store.set(key, '1'); });
  setTimeout(() => { el.classList.remove('show'); store.set(key, '1'); }, 9000);
}
setTimeout(dayBanner, 3500);

/* ---------- 7. Christmas Eve: Santa tracker + "go to bed" ---------- */
function santaTracker() {
  const e = etParts(), cd = $('countdown');
  let el = $('santaTracker');
  const eve = e.m === 12 && e.d === 24 && e.h >= 18, early = e.m === 12 && e.d === 25 && e.h < 6;
  if (!eve && !early) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'santaTracker'; el.className = 'santa-tracker'; cd.after(el); }
  let html;
  if (early) html = '<b>🎅 Santa has landed in Dunbarton!</b><span>😴 Go back to bed. Seriously.</span>';
  else {
    const left = Math.max(0, Date.UTC(2026, 11, 25, 5) - Date.now()), frac = left / (6 * 3600e3);
    const miles = Math.max(3, Math.round(frac * 4800 + Math.sin(Date.now() / 7000) * 40));
    const pct = Math.min(100, Math.max(0, (1 - frac) * 100));
    html = `<b>🎅 Santa tracker: about ${miles.toLocaleString()} miles from Dunbarton</b>
      <div class="st-track"><i style="width:${pct}%"></i><span style="left:${pct}%">🛷</span></div>
      ${e.h >= 22 ? '<span>😴 Go to bed! He only comes when you’re asleep.</span>' : '<span>Cookies out? Carrots for the reindeer?</span>'}`;
  }
  el.innerHTML = html;
}
santaTracker(); setInterval(santaTracker, 10000);

/* ---------- 8. Christmas morning: unwrap the site ---------- */
function maybeWrap() {
  const e = etParts();
  if (!(e.y === 2026 && e.m === 12 && e.d === 25) || store.get('xmasUnwrapped2026')) return;
  const w = $('wrap');
  w.classList.add('on');
  document.body.classList.add('wrapped');
  w.addEventListener('click', () => {
    if (w.classList.contains('open')) return;
    audio(); w.classList.add('open'); whoosh(); fanfare();
    [0, 250, 500].forEach((d, i) => setTimeout(() => burst(innerWidth * (0.25 + i * 0.25), innerHeight * 0.4, 100), d + 300));
    store.set('xmasUnwrapped2026', '1');
    setTimeout(() => { w.classList.remove('on', 'open'); document.body.classList.remove('wrapped'); toast('🎄 MERRY CHRISTMAS! See you at 11:30!'); }, 1400);
  });
}
maybeWrap();

/* ---------- 9. ugly sweater mode ---------- */
function setSweater(on, announce) {
  document.body.classList.toggle('sweater', on);
  store.set('xmasSweater', on ? '1' : '');
  if (announce) { toast(on ? '🧶 Ugly sweater mode: ON. Itchy, but festive.' : '🧶 Sweater off. Phew, it was getting warm.'); burst(innerWidth / 2, innerHeight / 2, 50); }
}
$('sweaterBtn').addEventListener('click', () => { audio(); setSweater(!document.body.classList.contains('sweater'), true); window.secretFound('sweater'); });
if (store.get('xmasSweater')) setSweater(true, false);
