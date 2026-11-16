/* ---------- config ---------- */
const SITE_VERSION = '2026.11.16.10'; // keep in sync with version.txt and the ?v= tags in index.html
const SB_URL = 'https://jkgsytjstauxstiabhwz.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ3N5dGpzdGF1eHN0aWFiaHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDI2ODAsImV4cCI6MjEwNjE3ODY4MH0.M8OzkHtXxaqGddAfmN26F2it1P-kIgttIUXWBHzgi1g';
const PARTY = new Date(Date.UTC(2026, 11, 25, 16, 30)); // 11:30am Eastern
const ADDRESS = '56 Old Fort Ln, Dunbarton, NH';
const LAT = 43.1015, LON = -71.6167;
const CAT_ORDER = ['breakfast', 'snacks', 'dinner', 'dessert', 'paper'];
const CAT_ICON = { breakfast: '🥞', snacks: '🍪', dinner: '🍲', dessert: '🥧', paper: '🍽️' };

/* tiny Supabase REST client — no library needed */
function table(name) {
  const base = `${SB_URL}/rest/v1/${name}`;
  const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' };
  const run = async (method, qs, body) => {
    try {
      const r = await fetch(`${base}?${qs}`, { method, headers: H, body: body && JSON.stringify(body) });
      const data = await r.json().catch(() => null);
      return r.ok ? { data: data || [], error: null } : { data: null, error: data || r.status };
    } catch (e) { return { data: null, error: e }; }
  };
  return {
    list: (order, cols = '*') => run('GET', `select=${cols}&order=${order}`),
    upsert: async (row, key) => {
      try {
        const r = await fetch(`${base}?on_conflict=${key}`, { method: 'POST', headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(row) });
        return r.ok ? { error: null } : { error: r.status };
      } catch (e) { return { error: e }; }
    },
    insert: (row) => run('POST', '', row),
    update: (row, filter) => run('PATCH', filter, row),
    remove: (filter) => run('DELETE', filter),
  };
}
const T_ITEMS = table('xmas_items'), T_RSVP = table('xmas_rsvps'), T_VOTES = table('xmas_votes');
const byId = (id) => `id=eq.${encodeURIComponent(id)}`;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let theme, items = [], rsvps = [], votes = [], loadedOnce = false;

/* ---------- theme picking ---------- */
// Random, but never one of the last few movies this phone has seen.
// Remembers the last 10 (or fewer if there aren't enough themes to keep at least 2 choices).
const RECENT_KEY = 'xmasRecent';
function recentThemes() { try { return JSON.parse(store.get(RECENT_KEY) || '[]').filter((id) => THEMES.some((t) => t.id === id)); } catch { return []; } }
function rememberTheme(id) { const r = recentThemes().filter((x) => x !== id); r.push(id); store.set(RECENT_KEY, JSON.stringify(r.slice(-20))); store.set('xmasTheme', id); }
function pickTheme(forceNew) {
  const q = new URLSearchParams(location.search).get('theme');
  const forced = !forceNew && THEMES.find((x) => x.id === q);
  if (forced) { rememberTheme(forced.id); return forced; }
  const gap = Math.max(1, Math.min(10, THEMES.length - 2));
  const avoid = new Set(recentThemes().slice(-gap));
  if (theme) avoid.add(theme.id);
  let pool = THEMES.filter((t) => !avoid.has(t.id));
  if (!pool.length) pool = THEMES.filter((t) => !theme || t.id !== theme.id);
  const t = pool[Math.floor(Math.random() * pool.length)];
  rememberTheme(t.id);
  return t;
}

function applyTheme(t, meterMode = 'play') {
  theme = t;
  cancelMeter();
  document.body.dataset.theme = t.id;
  $('movie').textContent = t.movie;
  $('title').textContent = t.title;
  $('tagline').textContent = t.tagline;
  $('menuTitle').textContent = t.menuTitle;
  $('menuSub').textContent = t.menuSub;
  $('rSubmit').textContent = t.rsvpBtn;
  $('footLine').textContent = t.foot;
  document.querySelector('meta[name=theme-color]').content = getComputedStyle(document.body).getPropertyValue('--bg').trim() || '#0b1530';
  fx.setup(t.particles);
  renderAll();
  if (meterMode === 'play') playMeter();
  else if (meterMode === 'empty') drawMeterAt(0);
}

/* ---------- gadget build-up: every visit plays the progression from zero ---------- */
let meterAnim = null;
function cancelMeter() { if (meterAnim) { clearTimeout(meterAnim.t); meterAnim = null; } }
function drawMeterAt(n) {
  const s = stats();
  theme.meter($('meter'), { total: s.total, claimed: n, pct: s.total ? n / s.total : 0 });
}
function playMeter(opts = {}) {
  cancelMeter();
  const target = stats().claimed;
  if (!stats().total || !target || reduced) { theme.meter($('meter'), stats()); opts.then && opts.then(); checkFullHouse(); return; }
  if (theme.reset) theme.reset();
  const dur = Math.min(2600, Math.max(1100, target * 130));
  const ease = (x) => 1 - Math.pow(1 - x, 2.2);           // quick start, settles at the end
  let i = 0;
  const run = { t: null };
  meterAnim = run;
  const step = () => {
    if (meterAnim !== run) return;
    drawMeterAt(i);
    if (opts.sound && i > 0) tone(440 + i * 28, 0, .12, .025, 'triangle');
    if (i >= target) {
      meterAnim = null;
      theme.meter($('meter'), stats());                  // land on the live number
      opts.then && opts.then();
      checkFullHouse();
      return;
    }
    i++;
    const gap = dur * (ease(i / target) - ease((i - 1) / target));
    run.t = setTimeout(step, Math.max(40, gap));
  };
  step();
}

/* ---------- full house: one-time celebration when every dish is covered ---------- */
function checkFullHouse() {
  const s = stats();
  if (!s.total || s.claimed < s.total || meterAnim || showing) return;
  const key = 'xmasFull:' + s.total;
  if (store.get(key)) return;
  store.set(key, '1');
  const banner = $('fullhouse');
  banner.querySelector('b').textContent = `All ${s.total} dishes are covered!`;
  banner.classList.add('show');
  fanfare();
  [0, 350, 700].forEach((d, i) => setTimeout(() => burst(innerWidth * (0.2 + i * 0.3), innerHeight * 0.3, 90), d));
  setTimeout(() => banner.classList.remove('show'), 6500);
}

/* ---------- showtime: curtains → marquee → reveal ---------- */
const MQ_FONT = { griswold: "'Bungee Shade'", elf: "'Chewy'", grinch: "'Mountains of Christmas'", homealone: "'Permanent Marker'", polar: "'Rye'", wonderful: "'Limelight'", diehard: "'Anton'", sadtree: "'Short Stack'", frosty: "'Fredoka'", hallmark: "'Great Vibes'", rudolph: "'Sniglet'", carol: "'IM Fell English SC'", miracle: "'DM Serif Display'", puppets: "'Luckiest Guy'" };
let showing = false, skipShow = null;
const wait = (ms) => new Promise((r) => { const t = setTimeout(r, ms); skipShow = () => { clearTimeout(t); r(); }; });

async function showtime(next, after) {
  if (showing) return;
  if (reduced) { applyTheme(next); window.scrollTo(0, 0); after && after(); return; }
  showing = true;
  const st = $('stage'), mq = $('marquee');
  mq.style.setProperty('--mq-bg', next.swatch[0]);
  mq.style.setProperty('--mq-ink', next.swatch[1]);
  mq.style.setProperty('--mq-edge', next.swatch[2]);
  mq.style.setProperty('--mq-font', MQ_FONT[next.id] || 'inherit');
  $('mqEmoji').textContent = next.emoji;
  $('mqTitle').textContent = next.name;
  $('mqSub').textContent = next.title;
  document.body.classList.add('showtime');
  st.className = 'stage on';
  whoosh();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  st.classList.add('shut');                       // curtains swing closed
  await wait(950);
  applyTheme(next, 'empty'); window.scrollTo({ top: 0, behavior: 'instant' }); // swap the movie behind the curtain
  st.classList.add('lit'); fanfare();            // marquee + spotlight
  setTimeout(() => burst(innerWidth / 2, innerHeight * 0.38, 90), 250);
  await wait(2300);                               // hold: time to read it
  st.classList.remove('lit'); st.classList.add('leave');
  await wait(300);
  st.classList.remove('shut'); whoosh();          // curtains part
  setTimeout(() => playMeter(), 450);             // ...and the gadget builds up as they open
  await wait(1150);
  st.className = 'stage';
  document.body.classList.remove('showtime');
  showing = false; skipShow = null;
  after && after();
}
$('stage').addEventListener('click', () => skipShow && skipShow());

$('shuffle').addEventListener('click', () => showtime(pickTheme(true)));

/* ---------- data ---------- */
async function load() {
  const [a, b, c] = await Promise.all([
    T_ITEMS.list('sort,created_at'),
    T_RSVP.list('created_at'),
    T_VOTES.list('updated_at', 'vote'),
  ]);
  if (a.error || b.error) {
    $('cats').innerHTML = '<p class="loading">Couldn’t reach the North Pole server. Try refreshing in a sec. 📡</p>';
    return;
  }
  const first = !loadedOnce; loadedOnce = true;
  items = a.data; rsvps = b.data;
  if (c.data) votes = c.data.map((v) => v.vote);
  renderAll();
  if (first && !showing) playMeter(); else checkFullHouse();
}
let reloadT;
const reloadSoon = () => { clearTimeout(reloadT); reloadT = setTimeout(load, 250); };
setInterval(() => { if (!document.hidden && !dlg.open) load(); }, 12000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) reloadSoon(); });

/* ---------- render ---------- */
function stats() {
  const total = items.length, claimed = items.filter((i) => i.claimed_by).length;
  return { total, claimed, pct: total ? claimed / total : 0 };
}

function renderAll() {
  if (!theme) return;
  if (!meterAnim) theme.meter($('meter'), stats());
  renderItems();
  renderRsvps();
  renderPoll();
  renderJump();
}

function renderItems() {
  if (!items.length) return;
  $('cats').innerHTML = CAT_ORDER.map((c) => {
    const list = items.filter((i) => i.category === c);
    const [name, kick] = theme.cats[c];
    const open = list.filter((i) => !i.claimed_by).length;
    return `<article class="cat cat-${c}">
      <header><span class="ico">${CAT_ICON[c]}</span><div><h3>${name}</h3><p>${esc(kick)}</p></div>
      <span class="count ${open || !list.length ? '' : 'done'}">${!list.length ? 'add one!' : open ? open + ' open' : 'all set ✓'}</span></header>
      <ul>${list.map((i) => `<li class="item ${i.claimed_by ? 'claimed' : 'open'}">
        <button type="button" data-id="${i.id}">
          <span class="nm">${esc(i.name)}</span><span class="dots"></span>
          ${i.claimed_by ? `<span class="who">${esc(i.claimed_by)}</span>` : `<span class="claim">${esc(theme.claimBtn)}</span>`}
        </button></li>`).join('')}
        <li class="add"><button type="button" data-add="${c}">+ add something to ${name.toLowerCase()}</button></li>
      </ul></article>`;
  }).join('');
}

$('cats').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.add) return addItemDialog(b.dataset.add);
  const it = items.find((i) => i.id === b.dataset.id);
  if (!it) return;
  if (it.claimed_by) claimedDialog(it); else claimDialog(it, e);
});

function renderRsvps() {
  const A = rsvps.reduce((s, r) => s + r.adults, 0), K = rsvps.reduce((s, r) => s + r.kids, 0);
  $('numA').textContent = A; $('numK').textContent = K;
  $('barA').style.width = Math.min(100, (A / 16) * 100) + '%';
  $('barK').style.width = Math.min(100, (K / 18) * 100) + '%';
  $('rsvpList').innerHTML = rsvps.length
    ? rsvps.map((r) => `<li><div><b>${esc(r.family)}</b><span>${r.adults} adult${r.adults === 1 ? '' : 's'}${r.kids ? ` · ${r.kids} kid${r.kids === 1 ? '' : 's'}` : ''}</span>${r.note ? `<em>${esc(r.note)}</em>` : ''}</div>
      <button type="button" class="mini" data-rid="${r.id}">edit</button></li>`).join('')
    : '<li class="empty">Nobody on the list yet — be the first!</li>';
}

/* ---------- dialogs ---------- */
const dlg = $('dlg');
function openDialog(title, body, actions) {
  $('dlgTitle').textContent = title;
  $('dlgBody').innerHTML = body;
  $('dlgActions').innerHTML = actions.map((a, i) => `<button value="${i}" class="btn ${a.cls || ''}" ${a.submit ? '' : 'formnovalidate'}>${esc(a.label)}</button>`).join('');
  return new Promise((res) => {
    dlg.onclose = () => {
      const a = actions[+dlg.returnValue];
      res(a ? a.value : null);
      dlg.returnValue = '';
    };
    dlg.showModal();
    const f = dlg.querySelector('input');
    if (f) { f.focus(); f.select(); }
  });
}
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

const myName = () => store.get('xmasName') || '';

async function claimDialog(it, ev) {
  const r = await openDialog(`Who’s bringing ${it.name}?`,
    `<label class="field">Your name / family<input id="dName" maxlength="40" required value="${esc(myName())}" placeholder="e.g. Aunt Linda"></label>`,
    [{ label: 'Never mind', value: null, cls: 'ghost' }, { label: theme.claimBtn + ' 🎁', value: 'ok', submit: true }]);
  const name = r && $('dName').value.trim();
  if (!name) return;
  store.set('xmasName', name);
  const { data, error } = await T_ITEMS.update({ claimed_by: name, updated_at: new Date() }, `${byId(it.id)}&claimed_by=is.null`);
  if (error) return toast('Hmm, that didn’t save. Try again?');
  if (!data.length) { toast('Ope — someone beat you to it!'); return load(); }
  it.claimed_by = name;
  renderAll();
  const x = ev ? ev.clientX : innerWidth / 2, y = ev ? ev.clientY : innerHeight / 2;
  burst(x, y, 60); jingle();
  toast(`🎉 ${it.name} is covered. Thanks, ${name}!`);
}

async function claimedDialog(it) {
  const acts = [
    { label: 'Close', value: null, cls: 'ghost' },
    { label: 'Release it', value: 'release', cls: 'warn' },
    { label: 'Save name', value: 'rename', submit: true },
  ];
  if (it.added_by) acts.splice(1, 0, { label: 'Delete item', value: 'delete', cls: 'warn' });
  const r = await openDialog(it.name,
    `<p class="dlg-note">Currently being brought by <b>${esc(it.claimed_by)}</b>.</p>
     <label class="field">Change the name<input id="dName" maxlength="40" required value="${esc(it.claimed_by)}"></label>`, acts);
  if (r === 'rename') {
    const n = $('dName').value.trim(); if (!n) return;
    await T_ITEMS.update({ claimed_by: n, updated_at: new Date() }, byId(it.id));
    toast('Updated ✏️');
  } else if (r === 'release') {
    await T_ITEMS.update({ claimed_by: null, updated_at: new Date() }, byId(it.id));
    toast(`${it.name} is back up for grabs.`);
  } else if (r === 'delete') {
    await T_ITEMS.remove(byId(it.id));
    toast(`${it.name} removed from the list.`);
  } else return;
  load();
}

async function addItemDialog(cat) {
  const r = await openDialog(`Add to ${theme.cats[cat][0]}`,
    `<label class="field">What is it?<input id="dItem" maxlength="60" required placeholder="e.g. Deviled eggs"></label>
     <label class="field">Your name / family<input id="dName" maxlength="40" value="${esc(myName())}" placeholder="optional if you’re not bringing it"></label>
     <label class="check"><input type="checkbox" id="dMine" checked> I’m bringing it</label>`,
    [{ label: 'Cancel', value: null, cls: 'ghost' }, { label: 'Add it', value: 'ok', submit: true }]);
  if (!r) return;
  const name = $('dItem').value.trim(), who = $('dName').value.trim(), mine = $('dMine').checked;
  if (!name) return;
  if (mine && !who) return toast('Add your name so we know who’s bringing it!');
  if (who) store.set('xmasName', who);
  const { error } = await T_ITEMS.insert({ category: cat, name, claimed_by: mine ? who : null, added_by: who || 'someone', sort: 500 });
  if (error) return toast('That didn’t save — try again?');
  if (mine) { burst(innerWidth / 2, innerHeight / 2, 60); jingle(); }
  toast(`➕ ${name} added!`);
  load();
}

/* ---------- RSVPs ---------- */
const stepState = { rAdults: 2, rKids: 0 };
document.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
  const [k, d] = b.dataset.step.split(':');
  stepState[k] = Math.max(0, Math.min(20, stepState[k] + +d));
  $(k).textContent = stepState[k];
}));

$('rsvpForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const family = $('rFamily').value.trim();
  if (!family) return;
  const row = { family, adults: stepState.rAdults, kids: stepState.rKids, note: $('rNote').value.trim() || null, updated_at: new Date() };
  const existing = rsvps.find((r) => r.family.toLowerCase() === family.toLowerCase());
  const q = existing ? T_RSVP.update(row, byId(existing.id)) : T_RSVP.insert(row);
  const { error } = await q;
  if (error) return toast('Hmm, that didn’t save. Try again?');
  store.set('xmasName', store.get('xmasName') || family);
  $('rsvpForm').reset(); stepState.rAdults = 2; stepState.rKids = 0; $('rAdults').textContent = 2; $('rKids').textContent = 0;
  const r = $('rSubmit').getBoundingClientRect();
  burst(r.left + r.width / 2, r.top, 70); jingle();
  toast(existing ? `Updated ${family} ✏️` : `🎄 ${family} added to the list!`);
  load();
});

$('rsvpList').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-rid]'); if (!b) return;
  const r = rsvps.find((x) => x.id === b.dataset.rid); if (!r) return;
  const res = await openDialog(`Edit ${r.family}`,
    `<label class="field">Adults<input id="eA" type="number" min="0" max="20" value="${r.adults}"></label>
     <label class="field">Kids<input id="eK" type="number" min="0" max="20" value="${r.kids}"></label>
     <label class="field">Note<input id="eN" maxlength="140" value="${esc(r.note || '')}"></label>`,
    [{ label: 'Cancel', value: null, cls: 'ghost' }, { label: 'Remove', value: 'del', cls: 'warn' }, { label: 'Save', value: 'save', submit: true }]);
  if (res === 'save') {
    const clamp = (v) => Math.max(0, Math.min(20, parseInt(v, 10) || 0));
    await T_RSVP.update({ adults: clamp($('eA').value), kids: clamp($('eK').value), note: $('eN').value.trim() || null, updated_at: new Date() }, byId(r.id));
    toast('Saved ✏️');
  } else if (res === 'del') {
    await T_RSVP.remove(byId(r.id));
    toast(`${r.family} removed.`);
  } else return;
  load();
});

/* ---------- jump bar ---------- */
function renderJump() {
  const open = items.filter((i) => !i.claimed_by).length;
  $('jbFood').textContent = items.length ? (open ? open : '✓') : '';
  $('jbFood').classList.toggle('done', items.length > 0 && !open);
}
$('jump').addEventListener('click', (e) => {
  const a = e.target.closest('a[data-sec]'); if (!a) return;
  e.preventDefault();
  $(a.dataset.sec).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
});
// highlight whichever section is on screen
const jumpLinks = [...document.querySelectorAll('#jump a[data-sec]')];
const seen = new Map();
const io = new IntersectionObserver((ents) => {
  ents.forEach((en) => seen.set(en.target.id, en.isIntersecting ? en.intersectionRatio : 0));
  let best = null, bestR = 0;
  jumpLinks.forEach((l) => { const r = seen.get(l.dataset.sec) || 0; if (r > bestR) { bestR = r; best = l.dataset.sec; } });
  jumpLinks.forEach((l) => l.classList.toggle('on', l.dataset.sec === best));
}, { rootMargin: '-30% 0px -50% 0px', threshold: [0, .01, .25, .5, 1] });
jumpLinks.forEach((l) => io.observe($(l.dataset.sec)));
// show the bar's shadow once it's stuck to the top
const jumpSentinel = document.createElement('div'); $('jump').before(jumpSentinel);
new IntersectionObserver(([en]) => $('jump').classList.toggle('stuck', !en.isIntersecting)).observe(jumpSentinel);

/* ---------- add to calendar ---------- */
const GCAL = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  + '&text=' + encodeURIComponent('🎄 Forcier Family Christmas')
  + '&dates=20261225T163000Z/20261225T230000Z'
  + '&location=' + encodeURIComponent(ADDRESS)
  + '&details=' + encodeURIComponent('Brunch at 11:30, presents, family walk (weather permitting), then beef stew.\nSign-ups: ' + location.origin + location.pathname);
$('calBtn').addEventListener('click', () => {
  const apple = `<a class="btn cal-opt" href="christmas.ics">🍎 Apple / Outlook Calendar</a>`;
  const google = `<a class="btn cal-opt ${isApple ? 'ghost' : ''}" href="${GCAL}" target="_blank" rel="noopener">📆 Google Calendar</a>`;
  openDialog('Add Christmas to your calendar',
    `<p class="dlg-note">Friday 12/25, 11:30am at 56 Old Fort Ln.${isApple ? ' Includes a reminder the day before.' : ''}</p>
     <div class="cal-opts">${isApple ? apple + google : google + apple.replace('btn cal-opt', 'btn cal-opt ghost')}</div>`,
    [{ label: 'Close', value: null, cls: 'ghost' }]);
  $('dlgBody').querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setTimeout(() => dlg.close(), 300)));
});

/* ---------- the great debate ---------- */
const voterKey = (() => {
  let k = store.get('xmasVoter');
  if (!k) { k = 'v' + Math.random().toString(36).slice(2) + Date.now().toString(36); store.set('xmasVoter', k); }
  return k;
})();
const myVote = () => { const v = store.get('xmasVote'); return v === null ? null : v === '1'; };

function renderPoll() {
  const yes = votes.filter(Boolean).length, no = votes.length - yes, total = votes.length;
  const pct = total ? yes / total : 0.5;
  $('pollYesN').textContent = yes; $('pollNoN').textContent = no;
  $('pollYesBar').style.width = pct * 100 + '%';
  $('pollKnot').style.left = pct * 100 + '%';
  const mine = myVote();
  document.querySelectorAll('.vote').forEach((b) => b.classList.toggle('mine', mine !== null && (b.dataset.vote === '1') === mine));
  const p = Math.round(pct * 100);
  $('pollVerdict').textContent = !total ? 'No votes yet. Somebody start the argument.'
    : yes === no ? `Dead even at ${yes}–${no}. This will be settled over beef stew.`
    : yes > no ? `${p}% say YES. The family has spoken${p >= 80 ? ', and it\u2019s not close' : ''}. 🎄`
    : `${100 - p}% say NO?! Somebody needs to rewatch it. 🧨`;
}

document.querySelectorAll('.vote').forEach((b) => b.addEventListener('click', async (e) => {
  const v = b.dataset.vote === '1', prev = myVote();
  if (prev === v) return toast(v ? 'You already voted yes. Correct, by the way. 🎄' : 'Still a no? Bold. 🧨');
  // optimistic update
  if (prev === null) votes.push(v); else { const i = votes.indexOf(prev); if (i > -1) votes[i] = v; }
  store.set('xmasVote', v ? '1' : '0');
  renderPoll();
  burst(e.clientX, e.clientY, 50);
  toast(v ? (prev === null ? '🎄 Vote counted. Welcome to the party, pal!' : '🎄 Changed to YES. Good call.') : (prev === null ? '🧨 Vote counted. Bold take.' : '🧨 Switched to NO?! Okay…'));
  const { error } = await T_VOTES.upsert({ voter_key: voterKey, vote: v, updated_at: new Date() }, 'voter_key');
  if (error) toast('That vote didn\u2019t save. Try again?');
  reloadSoon();
}));

/* ---------- countdown ---------- */
function tick() {
  const diff = PARTY - Date.now();
  const cd = $('countdown');
  if (diff <= 0) {
    const sameDay = Date.now() - PARTY < 12 * 3600e3;
    cd.innerHTML = `<p class="now">${sameDay ? '🎄 It’s happening! Merry Christmas! 🎄' : 'Merry Christmas — see you next year! ❤️'}</p>`;
    return;
  }
  const s = Math.floor(diff / 1000);
  $('cdD').textContent = Math.floor(s / 86400);
  $('cdH').textContent = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
  $('cdM').textContent = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  $('cdS').textContent = String(s % 60).padStart(2, '0');
  setTimeout(tick, 1000);
}

/* ---------- directions ---------- */
const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
$('directions').href = isApple
  ? `https://maps.apple.com/?daddr=${encodeURIComponent(ADDRESS)}`
  : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`;

/* ---------- weather ---------- */
const WMO = {
  0: ['☀️', 'Clear skies'], 1: ['🌤️', 'Mostly clear'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Overcast'],
  45: ['🌫️', 'Foggy'], 48: ['🌫️', 'Icy fog'], 51: ['🌦️', 'Light drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌧️', 'Heavy drizzle'],
  56: ['🧊', 'Freezing drizzle'], 57: ['🧊', 'Freezing drizzle'], 61: ['🌧️', 'Light rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'],
  66: ['🧊', 'Freezing rain'], 67: ['🧊', 'Freezing rain'], 71: ['🌨️', 'Light snow'], 73: ['🌨️', 'Snow'], 75: ['❄️', 'Heavy snow'],
  77: ['🌨️', 'Snow grains'], 80: ['🌦️', 'Showers'], 81: ['🌧️', 'Showers'], 82: ['⛈️', 'Heavy showers'], 85: ['🌨️', 'Snow showers'],
  86: ['❄️', 'Heavy snow showers'], 95: ['⛈️', 'Thunderstorms'], 96: ['⛈️', 'Thunderstorms'], 99: ['⛈️', 'Thunderstorms'],
};
const wmo = (c) => WMO[c] || ['🌡️', 'Weather'];

async function weather() {
  const el = $('weather');
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=16`;
    const w = await (await fetch(url)).json();
    const i = w.daily.time.indexOf('2026-12-25');
    const cur = w.current;
    const [ci, ct] = wmo(cur.weather_code);
    if (i === -1) {
      const days = Math.ceil((PARTY - Date.now()) / 86400e3) - 15;
      el.innerHTML = `<div class="wx locked"><span class="wx-ico">🔮</span><div>
        <p class="wx-big">Christmas forecast unlocks in ${Math.max(days, 1)} day${days === 1 ? '' : 's'}</p>
        <p>The weather elves can only see 16 days out. Check back around Dec 9!</p>
        <p class="wx-now">Right now in Dunbarton: ${ci} ${Math.round(cur.temperature_2m)}°F, ${ct.toLowerCase()}</p></div></div>`;
      return;
    }
    const d = w.daily, code = d.weather_code[i], hi = Math.round(d.temperature_2m_max[i]), lo = Math.round(d.temperature_2m_min[i]);
    const pop = d.precipitation_probability_max[i] ?? 0, wind = Math.round(d.wind_speed_10m_max[i]);
    const [ico, txt] = wmo(code);
    let verdict, cls;
    if (pop >= 70 || code >= 95 || [56, 57, 66, 67, 65, 75, 82, 86].includes(code)) { verdict = 'Walk looks iffy — maybe a living-room dance party instead 🕺'; cls = 'no'; }
    else if (hi < 20 || wind > 20) { verdict = 'Walk is ON — but bundle up like Randy 🧣🧤'; cls = 'maybe'; }
    else if (pop >= 40) { verdict = 'Walk is a maybe — keep the boots by the door 🥾'; cls = 'maybe'; }
    else { verdict = 'Walk is ON! Lace up those boots 🥾'; cls = 'yes'; }
    el.innerHTML = `<div class="wx ${cls}"><span class="wx-ico">${ico}</span><div>
      <p class="wx-big">${txt}, ${hi}° / ${lo}°F</p>
      <p>${pop}% chance of precip · wind up to ${wind} mph</p>
      <p class="verdict">${verdict}</p>
      <p class="wx-now">Christmas Day forecast for Dunbarton, NH${i > 7 ? ' (still a ways out — may change)' : ''}</p></div></div>`;
  } catch {
    el.innerHTML = '<p class="loading">Weather elves are on break. Check back later! ☕</p>';
  }
}

/* ---------- toast ---------- */
let toastT;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ---------- sound (only after a tap) ---------- */
let ac;
function audio() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); return ac; } catch { return null; } }
function tone(f, t0, dur, vol = 0.08, type = 'sine') {
  const a = audio(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, a.currentTime + t0);
  g.gain.linearRampToValueAtTime(vol, a.currentTime + t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur + 0.05);
}
function jingle() { [659, 659, 659, 0, 659, 659, 659, 0, 659, 784, 523, 587, 659].forEach((f, i) => f && tone(f, i * 0.11, 0.25, 0.05, 'triangle')); }
function fanfare() { [[523, 0], [659, .1], [784, .2], [1047, .32], [784, .5], [1047, .62]].forEach(([f, t], i) => tone(f, t, i > 3 ? .5 : .18, .045, 'triangle')); }
function whoosh() {
  const a = audio(); if (!a) return;
  try {
    const len = a.sampleRate * 0.9, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = 'bandpass'; f.frequency.setValueAtTime(300, a.currentTime); f.frequency.linearRampToValueAtTime(900, a.currentTime + .9); f.Q.value = .8;
    g.gain.value = .05; src.buffer = buf; src.connect(f).connect(g).connect(a.destination); src.start();
  } catch {}
}
function ding() { [1046, 2093, 2637, 3136].forEach((f, i) => tone(f, 0, 2.2 - i * 0.4, 0.07 / (i + 1))); }

/* ---------- particles ---------- */
const fx = (() => {
  const c = $('fx'), x = c.getContext('2d');
  let W, H, dpr, flakes = [], bits = [], cfg = { kind: 'flake', colors: ['#fff'], count: 60 }, extra = 0;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr;
    c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
  }
  function mk(top) {
    const r = (Math.random() * 2.4 + 0.8) * dpr;
    return { x: Math.random() * W, y: top ? -10 : Math.random() * H, r, vy: (Math.random() * 0.6 + 0.35) * dpr * (r / dpr) * 0.6 + 0.3 * dpr,
      vx: (Math.random() - 0.5) * 0.3 * dpr, ph: Math.random() * 6.28, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.05,
      col: cfg.colors[Math.floor(Math.random() * cfg.colors.length)], a: Math.random() * 0.5 + 0.5 };
  }
  function setup(p) {
    cfg = p;
    const n = reduced ? 0 : Math.round(p.count * Math.min(1.4, innerWidth / 900 + 0.4));
    flakes = Array.from({ length: n }, () => mk(false));
  }
  function draw(f) {
    x.globalAlpha = f.a; x.fillStyle = f.col;
    if (cfg.kind === 'sprinkle' || f.conf) {
      x.save(); x.translate(f.x, f.y); x.rotate(f.rot);
      x.fillRect(-f.r * 1.8, -f.r * 0.6, f.r * 3.6, f.r * 1.2); x.restore();
    } else { x.beginPath(); x.arc(f.x, f.y, f.r, 0, 6.283); x.fill(); }
  }
  function frame(t) {
    x.clearRect(0, 0, W, H);
    for (const f of flakes) {
      f.y += f.vy * (1 + extra * 2.5); f.x += f.vx + Math.sin(t / 1400 + f.ph) * 0.35 * dpr + extra * 1.5 * dpr; f.rot += f.vr;
      if (f.y > H + 10) Object.assign(f, mk(true));
      if (f.x > W + 10) f.x = -10; if (f.x < -10) f.x = W + 10;
      draw(f);
    }
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.vy += 0.18 * dpr; b.x += b.vx; b.y += b.vy; b.rot += b.vr; b.a -= 0.008;
      if (b.a <= 0 || b.y > H + 20) { bits.splice(i, 1); continue; }
      draw(b);
    }
    x.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  function burstAt(px, py, n) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * 6.283, sp = (Math.random() * 7 + 3) * dpr;
      bits.push({ x: px * dpr, y: py * dpr, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 4 * dpr, r: (Math.random() * 2 + 2) * dpr,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, conf: true, a: 1,
        col: theme.burst[Math.floor(Math.random() * theme.burst.length)] });
    }
  }
  function blizzard() {
    const add = Array.from({ length: 260 }, () => mk(true));
    add.forEach((f) => { f.y = -Math.random() * H; f.col = '#fff'; });
    flakes.push(...add); extra = 1;
    setTimeout(() => { extra = 0; flakes.splice(-260); }, 9000);
  }
  addEventListener('resize', () => { size(); setup(cfg); });
  size(); requestAnimationFrame(frame);
  return { setup, burstAt, blizzard };
})();
const burst = (x, y, n) => fx.burstAt(x, y, n);

/* ---------- easter eggs ---------- */
// 1: the progress gadget does a movie gag
const tapMeter = () => { if (meterAnim) return; audio(); playMeter({ sound: true, then: () => theme.gag($('meter')) }); };
$('meter').addEventListener('click', tapMeter);
$('meter').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapMeter(); } });

// 2: tap the date → sleigh flyover
$('dateFact').addEventListener('click', () => {
  const s = $('sleigh'); s.classList.remove('fly'); void s.offsetWidth; s.classList.add('fly');
  setTimeout(() => toast('🎅 Ho ho ho! He’s checking the sign-up list twice.'), 900);
});

// 3: tap the title 5 times (or Konami code) → snow day
let taps = 0, tapT;
$('title').addEventListener('click', () => {
  taps++; clearTimeout(tapT); tapT = setTimeout(() => (taps = 0), 1500);
  if (taps >= 5) { taps = 0; snowDay(); }
});
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let kpos = 0;
addEventListener('keydown', (e) => {
  kpos = e.key === KONAMI[kpos] ? kpos + 1 : e.key === KONAMI[0] ? 1 : 0;
  if (kpos === KONAMI.length) { kpos = 0; snowDay(); }
});
function snowDay() {
  fx.blizzard(); jingle();
  document.body.classList.add('snowday');
  toast('❄️ SNOW DAY! Secret found — you’re officially on the nice list.');
  setTimeout(() => document.body.classList.remove('snowday'), 9000);
}

/* ---------- stay up to date ---------- */
// GitHub Pages lets browsers cache files for ~10 min. If a newer version is live, reload once to pick it up.
async function checkVersion() {
  try {
    const live = (await (await fetch('version.txt?t=' + Date.now(), { cache: 'no-store' })).text()).trim();
    if (!live || live === SITE_VERSION) return;
    let tried = null; try { tried = sessionStorage.getItem('xmasReloadedFor'); } catch {}
    if (tried === live) return; // already reloaded once for this version; don't loop
    try { sessionStorage.setItem('xmasReloadedFor', live); } catch {}
    if (dlg.open) return; // never yank the page out from under someone typing
    location.reload();
  } catch {}
}
checkVersion();
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });

/* ---------- go ---------- */
applyTheme(pickTheme(false));
tick();
load();
weather();
