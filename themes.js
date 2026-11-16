/* Each theme is a loving nod to a classic Christmas movie.
   meter(el, s) draws the hero progress gadget; s = {claimed, total, pct}. */
const THEMES = [
  {
    id: 'griswold',
    movie: 'a Christmas Vacation kind of night',
    title: 'The Fun, Old-Fashioned Family Christmas',
    tagline: 'Twenty-five thousand twinkle lights. A house full of family. Hopefully zero squirrels in the tree.',
    menuTitle: 'The Spread',
    menuSub: 'Every dish you claim plugs in another bulb on the house.',
    cats: {
      breakfast: ['Breakfast', 'Fuel for the 11:30 arrival'],
      snacks: ['Snacks', 'Grazing table — proceed with caution'],
      dinner: ['Dinner', 'No dry turkey here. It’s stew.'],
      paper: ['Paper Goods', 'The unsung heroes of the day'],
    },
    claimBtn: 'Plug it in',
    open: 'Bulb’s out',
    rsvpBtn: 'Count us in!',
    foot: 'Merry Christmas! Don’t forget to check the fuse box.',
    particles: { kind: 'flake', colors: ['#ffffff', '#dfe9ff'], count: 70 },
    burst: ['#ff3b3b', '#ffd23f', '#3bd16f', '#3b8bff', '#ff8a3b'],
    bulbs: 24,
    meter(el, s) {
      const n = this.bulbs, lit = Math.round(s.pct * n);
      const cols = this.burst;
      let bulbs = '';
      for (let i = 0; i < n; i++) {
        const x = 12 + i * (576 / (n - 1));
        const y = 18 + Math.sin((i / (n - 1)) * Math.PI * 3) ** 2 * 18;
        const on = i < lit;
        bulbs += `<g class="bulb ${on ? 'on' : ''}" style="--c:${cols[i % cols.length]};--d:${(i * 0.37) % 2}s">
          <rect x="${x - 3}" y="${y - 2}" width="6" height="6" rx="1" fill="#2a2a2a"/>
          <ellipse cx="${x}" cy="${y + 11}" rx="6" ry="9"/></g>`;
      }
      let wire = 'M0 18';
      for (let i = 0; i <= 60; i++) {
        const x = i * 10, y = 18 + Math.sin((i / 60) * Math.PI * 3) ** 2 * 18;
        wire += ` L${x} ${y}`;
      }
      el.innerHTML = `<svg viewBox="0 0 600 70" class="lights" preserveAspectRatio="none"><path d="${wire}" fill="none" stroke="#1d2a1d" stroke-width="2.5"/>${bulbs}</svg>
        <p class="meter-label"><b>${lit}</b> of ${n} bulbs lit · ${s.claimed}/${s.total} dishes claimed${lit === n ? ' · <em>IT’S BEAUTIFUL</em>' : ''}</p>`;
    },
    gag(el) {
      el.classList.add('fuse');
      toast('💥 Fuse blown! Somebody check the basement…');
      setTimeout(() => { el.classList.remove('fuse'); toast('✨ …and we’re back.'); }, 1600);
    },
  },
  {
    id: 'elf',
    movie: 'an Elf kind of day',
    title: 'Sing Loud. Eat Louder.',
    tagline: 'The four main food groups: breakfast, snacks, stew, and paper plates.',
    menuTitle: 'The Four Main Food Groups',
    menuSub: 'Claim something and watch the Cheer-o-meter climb.',
    cats: {
      breakfast: ['Breakfast', 'Syrup on everything is optional (but encouraged)'],
      snacks: ['Snacks', 'Candy, candy canes, candy corn… and dip'],
      dinner: ['Dinner', 'Warm-you-up stew'],
      paper: ['Paper Goods', 'Smiling’s my favorite. Plates are a close second.'],
    },
    claimBtn: 'I’m on it!',
    open: 'Needs an elf',
    rsvpBtn: 'Son of a nutcracker, we’re in!',
    foot: 'The best way to spread Christmas cheer is to sign up for egg bites.',
    particles: { kind: 'sprinkle', colors: ['#ff4f8b', '#ffd43b', '#2fd0a5', '#5aa9ff', '#ffffff'], count: 55 },
    burst: ['#ff4f8b', '#ffd43b', '#2fd0a5', '#5aa9ff', '#e2382f'],
    meter(el, s) {
      const ang = -90 + s.pct * 180;
      el.innerHTML = `<svg viewBox="0 0 220 125" class="gauge">
        <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#5aa9ff"/><stop offset=".5" stop-color="#ffd43b"/><stop offset="1" stop-color="#ff4f8b"/></linearGradient></defs>
        <path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="url(#gg)" stroke-width="22" stroke-linecap="round"/>
        <path d="M20 110 A90 90 0 0 1 200 110" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="2 12" opacity=".7"/>
        <g class="needle" style="transform:rotate(${ang}deg)"><path d="M110 110 L106 40 L110 30 L114 40 Z" fill="#1f7a3a"/></g>
        <circle cx="110" cy="110" r="10" fill="#e2382f" stroke="#fff" stroke-width="3"/>
      </svg>
      <p class="meter-label">CHEER-O-METER: <b>${Math.round(s.pct * 100)}%</b> · ${s.claimed}/${s.total} claimed</p>`;
    },
    gag(el) {
      el.classList.add('jiggle');
      const r = el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 80);
      toast('🍭 SANTA’S COMING! I KNOW HIM!');
      setTimeout(() => el.classList.remove('jiggle'), 900);
    },
  },
  {
    id: 'grinch',
    movie: 'a Grinchy Who-liday',
    title: 'Every Who Down in Dunbarton',
    tagline: 'Bring a dish and watch this heart grow three sizes.',
    menuTitle: 'The Who-Feast',
    menuSub: 'Every claimed dish grows the heart a little more.',
    cats: {
      breakfast: ['Breakfast', 'Who-hash and morning munchies'],
      snacks: ['Snacks', 'Things that go “noise noise noise” when you chew'],
      dinner: ['Dinner', 'Roast beast? Beef stew. Close enough.'],
      paper: ['Paper Goods', 'Stuff a certain green someone would steal'],
    },
    claimBtn: 'Grow the heart',
    open: 'Still stolen',
    rsvpBtn: 'Fahoo fores, we’re coming!',
    foot: 'Maybe Christmas doesn’t come from a store. Maybe it comes from cinnamon rolls.',
    particles: { kind: 'flake', colors: ['#ffffff', '#d8ffd0'], count: 60 },
    burst: ['#e3262f', '#79c43c', '#ffffff', '#ffd43b'],
    meter(el, s) {
      const scale = 1 + s.pct * 2;
      el.innerHTML = `<div class="heartbox"><svg viewBox="0 0 100 90" class="heart" style="transform:scale(${scale / 3})">
        <path d="M50 85 C 10 55, 0 35, 12 18 C 24 2, 44 6, 50 22 C 56 6, 76 2, 88 18 C 100 35, 90 55, 50 85 Z" fill="#e3262f" stroke="#7a0f14" stroke-width="3"/>
        <path d="M24 22 C 28 16, 34 15, 38 18" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/></svg></div>
        <p class="meter-label">Heart size: <b>${scale.toFixed(1)}×</b> · ${s.claimed}/${s.total} dishes claimed${s.pct >= 1 ? ' · <em>THREE SIZES!</em>' : ''}</p>`;
    },
    gag(el) {
      el.classList.add('thump');
      toast('💚 …and what happened then? Well, in Who-ville they say…');
      setTimeout(() => el.classList.remove('thump'), 1300);
    },
  },
  {
    id: 'homealone',
    movie: 'a Home Alone kind of plan',
    title: 'Operation: Christmas Day',
    tagline: 'This house is protected by family. Here’s the battle plan — claim your position.',
    menuTitle: 'The Battle Plan',
    menuSub: 'Every position needs somebody on it. Initial the plan.',
    cats: {
      breakfast: ['Breakfast', '11:30 hrs — rations'],
      snacks: ['Snacks', 'Perimeter snacks (NOT booby-trapped)'],
      dinner: ['Dinner', 'Hot meal. We checked: no cheese pizza was harmed.'],
      paper: ['Paper Goods', 'Supplies & ordnance'],
    },
    claimBtn: 'I’ve got it',
    open: 'UNGUARDED',
    rsvpBtn: 'Reporting for duty',
    foot: 'Keep the change, ya filthy animal. 🎄',
    particles: { kind: 'flake', colors: ['#ffffff'], count: 45 },
    burst: ['#ffffff', '#ffd84a', '#ff5a4a'],
    meter(el, s) {
      el.innerHTML = `<div class="plan">
        <svg viewBox="0 0 160 110" class="house"><path d="M10 55 L80 8 L150 55 M22 47 V104 H138 V47" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="${s.pct >= 1 ? '0' : '5 4'}"/>
        <rect x="68" y="70" width="24" height="34" fill="none" stroke="currentColor" stroke-width="2"/>
        <rect x="34" y="62" width="20" height="16" fill="none" stroke="currentColor" stroke-width="2"/>
        <rect x="106" y="62" width="20" height="16" fill="none" stroke="currentColor" stroke-width="2"/>
        <text x="80" y="50" text-anchor="middle" font-size="10" fill="currentColor">HQ</text></svg>
        <div class="plan-side"><p class="meter-label">Positions covered</p><p class="plan-num">${s.claimed}<small>/${s.total}</small></p>
        <p class="plan-status">${s.pct >= 1 ? 'HOUSE SECURE ✔' : 'DEFENSES: ' + Math.round(s.pct * 100) + '%'}</p></div></div>`;
    },
    gag() {
      const pc = document.getElementById('paintcan');
      pc.classList.remove('swing'); void pc.offsetWidth; pc.classList.add('swing');
      toast('🪣 Look out below!');
    },
  },
  {
    id: 'polar',
    movie: 'a Polar Express kind of night',
    title: 'All Aboard for Christmas Day',
    tagline: 'One ticket per dish. The train leaves for Dunbarton at 11:30 sharp.',
    menuTitle: 'The Dining Car',
    menuSub: 'Claim a dish to get your ticket punched. Every punch moves the train.',
    cats: {
      breakfast: ['Breakfast', 'Morning service'],
      snacks: ['Snacks', 'Hot chocolate & treats car'],
      dinner: ['Dinner', 'Supper service'],
      paper: ['Paper Goods', 'Conductor’s supplies'],
    },
    claimBtn: 'Punch my ticket',
    open: 'Unpunched',
    rsvpBtn: 'Tickets, please!',
    foot: 'The thing about trains: it doesn’t matter where they’re going. What matters is the stew.',
    particles: { kind: 'flake', colors: ['#ffffff', '#ffe7a8'], count: 80 },
    burst: ['#f5c542', '#ffffff', '#c0392b'],
    meter(el, s) {
      el.innerHTML = `<div class="track">
        <span class="stop a">Dunbarton</span><span class="stop b">North Pole ⭐</span>
        <div class="rail"></div>
        <div class="train" style="left:calc(${s.pct * 100}% - ${s.pct * 64}px)"><span class="steam"></span>🚂</div>
      </div>
      <p class="meter-label"><b>${s.claimed}</b> of ${s.total} tickets punched · ${Math.round(s.pct * 100)}% of the way there</p>`;
    },
    gag(el) {
      el.classList.add('whistle');
      toast('🚂 WHOOO-WHOOO! All aboard!');
      setTimeout(() => el.classList.remove('whistle'), 1500);
    },
  },
  {
    id: 'wonderful',
    movie: 'It’s a Wonderful Life (in glorious black & white)',
    title: 'It’s a Wonderful Christmas',
    tagline: 'Every time somebody claims a dish, an angel gets its wings.',
    menuTitle: 'Supper at the Old House',
    menuSub: 'Teacher says every time a dish gets claimed, an angel gets its wings.',
    cats: {
      breakfast: ['Breakfast', 'Morning in Bedford Falls'],
      snacks: ['Snacks', 'The Building & Loan snack fund'],
      dinner: ['Dinner', 'A hot supper on a cold night'],
      paper: ['Paper Goods', 'Plates, cups, and such'],
    },
    claimBtn: 'Count me in',
    open: 'Wingless',
    rsvpBtn: 'Merry Christmas, you wonderful old house!',
    foot: 'No one is a failure who has family. 🔔',
    particles: { kind: 'flake', colors: ['#ffffff', '#cfcfcf'], count: 90 },
    burst: ['#ffffff', '#d9d9d9', '#f1e3b5'],
    meter(el, s) {
      el.innerHTML = `<div class="bellbox"><span class="bell">🔔</span>
        <p class="meter-label"><b>${s.claimed}</b> angel${s.claimed === 1 ? '' : 's'} got ${s.claimed === 1 ? 'its' : 'their'} wings · ${s.total - s.claimed} still waiting</p>
        <div class="wings">${'🪽'.repeat(Math.min(s.claimed, 30))}</div></div>`;
    },
    gag(el) {
      el.classList.add('ring');
      ding();
      toast('🔔 Attaboy, Clarence!');
      setTimeout(() => el.classList.remove('ring'), 1200);
    },
  },
];
