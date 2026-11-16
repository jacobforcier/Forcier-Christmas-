/* Each theme is a loving nod to a classic Christmas movie.
   meter(el, s) draws the hero progress gadget; s = {claimed, total, pct}. */
const THEMES = [
  {
    id: 'griswold',
    name: 'Christmas Vacation', emoji: '💡', swatch: ['#0b1530', '#ffcf3f', '#ff6b5a'],
    movie: 'a Christmas Vacation kind of night',
    title: 'The Fun, Old-Fashioned Family Christmas',
    tagline: 'Twenty-five thousand twinkle lights. A house full of family. Hopefully zero squirrels in the tree.',
    menuTitle: 'The Spread',
    menuSub: 'Every dish you claim plugs in another bulb on the house.',
    cats: {
      breakfast: ['Breakfast', 'Fuel for the 11:30 arrival'],
      snacks: ['Snacks', 'Grazing table — proceed with caution'],
      dinner: ['Dinner', 'No dry turkey here. It’s stew.'],
      dessert: ['Dessert', 'Somebody bring the Jell-O mold'],
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
    name: 'Elf', emoji: '🧝', swatch: ['#fff6e8', '#e2382f', '#1f9d55'],
    movie: 'an Elf kind of day',
    title: 'Sing Loud. Eat Louder.',
    tagline: 'The four main food groups: breakfast, snacks, stew, and paper plates.',
    menuTitle: 'The Four Main Food Groups',
    menuSub: 'Claim something and watch the Cheer-o-meter climb.',
    cats: {
      breakfast: ['Breakfast', 'Syrup on everything is optional (but encouraged)'],
      snacks: ['Snacks', 'Candy, candy canes, candy corn… and dip'],
      dinner: ['Dinner', 'Warm-you-up stew'],
      dessert: ['Dessert', 'Spaghetti with syrup counts. Probably.'],
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
    name: 'The Grinch', emoji: '💚', swatch: ['#0f3d2a', '#9be15d', '#ff4d57'],
    movie: 'a Grinchy Who-liday',
    title: 'Every Who Down in Dunbarton',
    tagline: 'Bring a dish and watch this heart grow three sizes.',
    menuTitle: 'The Who-Feast',
    menuSub: 'Every claimed dish grows the heart a little more.',
    cats: {
      breakfast: ['Breakfast', 'Who-hash and morning munchies'],
      snacks: ['Snacks', 'Things that go “noise noise noise” when you chew'],
      dinner: ['Dinner', 'Roast beast? Beef stew. Close enough.'],
      dessert: ['Dessert', 'Who-pudding, Who-pie, Who-anything sweet'],
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
    name: 'Home Alone', emoji: '🪤', swatch: ['#12407a', '#ffd84a', '#ff6a5a'],
    movie: 'a Home Alone kind of plan',
    title: 'Operation: Christmas Day',
    tagline: 'This house is protected by family. Here’s the battle plan — claim your position.',
    menuTitle: 'The Battle Plan',
    menuSub: 'Every position needs somebody on it. Initial the plan.',
    cats: {
      breakfast: ['Breakfast', '11:30 hrs — rations'],
      snacks: ['Snacks', 'Perimeter snacks (NOT booby-trapped)'],
      dinner: ['Dinner', 'Hot meal. We checked: no cheese pizza was harmed.'],
      dessert: ['Dessert', 'Post-mission rewards'],
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
    name: 'The Polar Express', emoji: '🚂', swatch: ['#241736', '#f5c542', '#f4e6c1'],
    movie: 'a Polar Express kind of night',
    title: 'All Aboard for Christmas Day',
    tagline: 'One ticket per dish. The train leaves for Dunbarton at 11:30 sharp.',
    menuTitle: 'The Dining Car',
    menuSub: 'Claim a dish to get your ticket punched. Every punch moves the train.',
    cats: {
      breakfast: ['Breakfast', 'Morning service'],
      snacks: ['Snacks', 'Hot chocolate & treats car'],
      dinner: ['Dinner', 'Supper service'],
      dessert: ['Dessert', 'The dessert car (ring the bell)'],
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
    name: 'It\u2019s a Wonderful Life', emoji: '🔔', swatch: ['#1b1b1b', '#ecebe6', '#8a8a8a'],
    movie: 'It’s a Wonderful Life (in glorious black & white)',
    title: 'It’s a Wonderful Christmas',
    tagline: 'Every time somebody claims a dish, an angel gets its wings.',
    menuTitle: 'Supper at the Old House',
    menuSub: 'Teacher says every time a dish gets claimed, an angel gets its wings.',
    cats: {
      breakfast: ['Breakfast', 'Morning in Bedford Falls'],
      snacks: ['Snacks', 'The Building & Loan snack fund'],
      dinner: ['Dinner', 'A hot supper on a cold night'],
      dessert: ['Dessert', 'Zuzu\u2019s petals aren\u2019t edible. Pie is.'],
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
  {
    id: 'diehard',
    name: 'Die Hard', emoji: '🏢', swatch: ['#0d0d10', '#ff8a1f', '#ffcc33'],
    movie: 'a Die Hard Christmas (yes, it counts)',
    title: 'Welcome to the Party, Pal',
    tagline: 'Come out to Dunbarton, we’ll get together, have a few laughs.',
    menuTitle: 'The Party Floor',
    menuSub: 'Every claimed dish lights up another floor of the tower.',
    cats: {
      breakfast: ['Breakfast', 'Now I have a cinnamon roll. Ho-ho-ho.'],
      snacks: ['Snacks', 'Twinkies not included'],
      dinner: ['Dinner', 'Thirty floors of stew. Okay, one pot.'],
      dessert: ['Dessert', 'Sweets on the 30th floor'],
      paper: ['Paper Goods', 'Supplies (no duct tape required)'],
    },
    claimBtn: 'Yippee-ki-yay',
    open: 'Floor dark',
    rsvpBtn: 'Welcome to the party!',
    foot: 'Shoes REQUIRED for the walk. Make fists with your toes on your own time.',
    particles: { kind: 'flake', colors: ['#ffffff', '#ffd2a1', '#ff9a3c'], count: 55 },
    burst: ['#bfe6ff', '#ffffff', '#ff7a1a', '#ffcc33', '#8fd3ff'],
    floors: 14,
    meter(el, s) {
      const F = this.floors, lit = Math.round(s.pct * F), done = s.pct >= 1;
      let win = '';
      for (let f = 0; f < F; f++) {
        const y = 196 - f * 12.5, on = f < lit;
        for (let w = 0; w < 6; w++) {
          const flick = on && (f * 6 + w) % 7 === 3 ? ' flick' : '';
          win += `<rect class="win${on ? ' on' : ''}${flick}" x="${236 + w * 21.5}" y="${y}" width="14" height="8" rx="1"/>`;
        }
      }
      el.innerHTML = `<svg viewBox="0 0 600 230" class="tower">
        <path class="sky2" d="M0 230 V170 h40 v-30 h30 v40 h26 v-62 h34 v52 h40 v-24 h32 v84 Z M600 230 V160 h-34 v-34 h-28 v54 h-30 v-72 h-36 v62 h-30 v60 Z"/>
        <path class="bldg" d="M226 230 V20 L246 6 H350 L370 20 V230 Z"/>
        <rect class="heli" x="268" y="2" width="60" height="6" rx="2"/>
        ${win}
        <text x="298" y="${done ? 17 : 16}" text-anchor="middle" class="roof ${done ? 'on' : ''}">${done ? 'PARTY’S ON' : '30TH FLOOR'}</text>
        <circle class="beacon" cx="372" cy="16" r="3.5"/>
      </svg>
      <p class="meter-label"><b>${lit}</b> of ${F} floors lit · ${s.claimed}/${s.total} dishes claimed${done ? ' · <em>WELCOME TO THE PARTY</em>' : ''}</p>`;
    },
    gag(el) {
      document.body.classList.remove('boom'); void document.body.offsetWidth; document.body.classList.add('boom');
      const r = el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * 0.3, 110);
      toast('💥 Welcome to the party, pal!');
      setTimeout(() => document.body.classList.remove('boom'), 700);
    },
  },
  {
    id: 'sadtree',
    name: 'The Sad Little Tree', emoji: '🌲', swatch: ['#f3ead7', '#c2412d', '#4a7a3d'],
    movie: 'a sad-little-tree kind of Christmas',
    title: 'It’s Not Such a Bad Little Tree',
    tagline: 'All it needs is a little love. And maybe some egg bites.',
    menuTitle: 'Decorate the Tree',
    menuSub: 'Every dish you claim hangs another ornament. Watch it stand up straight.',
    cats: {
      breakfast: ['Breakfast', 'Good grief, it’s early'],
      snacks: ['Snacks', 'Popcorn-and-toast dinners not accepted'],
      dinner: ['Dinner', 'Real food. Not jellybeans.'],
      dessert: ['Dessert', 'Fuel for skating on the pond'],
      paper: ['Paper Goods', 'Plates for the whole gang'],
    },
    claimBtn: 'Hang an ornament',
    open: 'Bare branch',
    rsvpBtn: 'Count us in. Good grief!',
    foot: 'Christmas isn’t about the stuff. (But please do bring the stuff.)',
    particles: { kind: 'flake', colors: ['#aab4bf', '#cfd8e0', '#ffffff'], count: 45 },
    burst: ['#c2412d', '#e0a526', '#4a7a3d', '#3d6fa8'],
    meter(el, s) {
      const spots = 20, shown = Math.round(s.pct * spots), done = s.pct >= 1;
      const droop = (1 - s.pct) * 12, bend = (1 - s.pct) * 26;
      const levels = [[160, 50], [134, 42], [108, 33], [84, 24], [62, 15]];
      let br = '', orn = '', k = 0;
      const cols = ['#c2412d', '#e0a526', '#3d6fa8', '#c2412d'];
      for (const [y, len] of levels) {
        const sag = 8 + (1 - s.pct) * 10;
        br += `<path d="M150 ${y} Q${150 - len * .6} ${y + 2} ${150 - len} ${y + sag}M150 ${y} Q${150 + len * .6} ${y + 2} ${150 + len} ${y + sag}"/>`;
        for (const [x, yy] of [[150 - len, y + sag], [150 + len, y + sag], [150 - len * .5, y + sag * .45], [150 + len * .5, y + sag * .45]]) {
          if (k < shown) orn += `<circle cx="${x}" cy="${yy + 5}" r="5" fill="${cols[k % 4]}"/><circle cx="${x - 1.6}" cy="${yy + 3.4}" r="1.5" fill="#fff" opacity=".7"/>`;
          k++;
        }
      }
      const tipX = 150 + bend * 1.6, tipY = 34 + bend * .5;
      el.innerHTML = `<svg viewBox="0 0 300 210" class="sadtree">
        <ellipse cx="150" cy="196" rx="120" ry="12" fill="#fff" opacity=".9"/>
        <g class="tree" style="transform: rotate(${droop}deg)">
          <path class="trunk" d="M150 194 L150 120 Q150 ${70 + bend * .3} ${tipX} ${tipY}" fill="none"/>
          <g class="branches" fill="none">${br}</g>${orn}
          ${done ? `<polygon class="star" points="${tipX},${tipY - 14} ${tipX + 4},${tipY - 4} ${tipX + 14},${tipY - 4} ${tipX + 6},${tipY + 2} ${tipX + 9},${tipY + 12} ${tipX},${tipY + 6} ${tipX - 9},${tipY + 12} ${tipX - 6},${tipY + 2} ${tipX - 14},${tipY - 4} ${tipX - 4},${tipY - 4}"/>` : ''}
        </g>
        ${done ? '<path class="blanket" d="M118 196 Q120 176 150 178 Q180 176 182 196 Z"/>' : ''}
      </svg>
      <p class="meter-label"><b>${shown}</b> of ${spots} ornaments · ${s.claimed}/${s.total} dishes claimed${done ? ' · <em>WHAT A TREE!</em>' : ''}</p>`;
    },
    gag(el) {
      el.classList.add('sag');
      toast('🌲 It’s not a bad little tree. It just needs a little love.');
      setTimeout(() => el.classList.remove('sag'), 1600);
    },
  },
  {
    id: 'frosty',
    name: 'Frosty', emoji: '⛄', swatch: ['#dff1ff', '#e8483c', '#13385c'],
    movie: 'a build-a-snowman afternoon',
    title: 'Build-a-Snowman Christmas',
    tagline: 'Every dish adds another piece. Finish him and he comes to life.',
    menuTitle: 'Snowman Supplies',
    menuSub: 'Claim a dish to roll the next snowball.',
    cats: {
      breakfast: ['Breakfast', 'Fuel before the snowball fight'],
      snacks: ['Snacks', 'Snow-day snacking'],
      dinner: ['Dinner', 'Warm-you-up stew (keep it away from Frosty)'],
      dessert: ['Dessert', 'Treats that won’t melt him'],
      paper: ['Paper Goods', 'Coal, carrots & paper plates'],
    },
    claimBtn: 'Roll a snowball',
    open: 'Melted',
    rsvpBtn: 'Thumpety-thump, we’re coming!',
    foot: 'Don’t cry. He’ll be back again someday. Like leftovers.',
    particles: { kind: 'flake', colors: ['#ffffff', '#a9d3f5', '#ffffff'], count: 95 },
    burst: ['#ffffff', '#e8483c', '#ff9f1c', '#13385c', '#a9d3f5'],
    steps: ['a pile of snow', 'bottom snowball', 'middle snowball', 'his head', 'coal & a carrot', 'a scarf', 'THE HAT'],
    meter(el, s) {
      const st = s.pct >= 1 ? 6 : Math.floor(s.pct * 6), prev = this._st ?? st;
      this._st = st;
      const pop = (n) => (n > prev ? ' pop' : '');
      el.innerHTML = `<svg viewBox="0 0 300 210" class="snowman ${st >= 6 ? 'alive' : ''}">
        <ellipse cx="150" cy="196" rx="130" ry="13" fill="#fff"/>
        ${st < 1 ? '<path d="M110 196 Q150 168 190 196 Z" fill="#fff" stroke="#cfe3f3" stroke-width="2"/>' : ''}
        ${st >= 1 ? `<circle class="ball${pop(1)}" cx="150" cy="160" r="38"/>` : ''}
        ${st >= 2 ? `<circle class="ball${pop(2)}" cx="150" cy="106" r="28"/>` : ''}
        ${st >= 3 ? `<circle class="ball${pop(3)}" cx="150" cy="64" r="20"/>` : ''}
        ${st >= 4 ? `<g class="face${pop(4)}"><circle cx="143" cy="60" r="2.6"/><circle cx="157" cy="60" r="2.6"/><path d="M150 66 L170 70 L150 71 Z" fill="#ff9f1c"/>
          <circle cx="150" cy="96" r="2.6"/><circle cx="150" cy="108" r="2.6"/><circle cx="150" cy="120" r="2.6"/>
          <path class="arm l" d="M124 102 L96 86 M106 92 L100 80" /><path class="arm r" d="M176 102 L204 86 M194 92 L202 80"/></g>` : ''}
        ${st >= 5 ? `<g class="scarf${pop(5)}"><path d="M130 80 Q150 90 170 80 L170 87 Q150 97 130 87 Z"/><path d="M160 86 L166 112 L156 112 L152 88 Z"/></g>` : ''}
        ${st >= 6 ? `<g class="hat${pop(6)}"><rect x="134" y="42" width="32" height="5" rx="2"/><rect x="139" y="16" width="22" height="28" rx="2"/><rect x="139" y="36" width="22" height="5" fill="#e8483c"/></g>` : ''}
      </svg>
      <p class="meter-label">${st >= 6 ? '<em>HE’S ALIVE!</em>' : `Next up: <b>${this.steps[st + 1]}</b>`} · ${s.claimed}/${s.total} dishes claimed</p>`;
    },
    gag(el) {
      el.classList.add('hop');
      const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height * .3, 70);
      toast('⛄ Happy birthday!');
      setTimeout(() => el.classList.remove('hop'), 1200);
    },
  },
  {
    id: 'hallmark',
    name: 'Cozy Small-Town Romance', emoji: '💌', swatch: ['#fbeee9', '#c0587e', '#b98a4b'],
    movie: 'a cozy made-for-TV holiday romance',
    title: 'Christmas in Dunbarton Falls',
    tagline: 'A big-city lawyer comes home and learns the true meaning of buffalo chicken dip.',
    menuTitle: 'The Bakery Order',
    menuSub: 'Save the family inn, one dish at a time.',
    cats: {
      breakfast: ['Breakfast', 'Coffee-shop meet-cute'],
      snacks: ['Snacks', 'Cookie-decorating contest (it’s rigged)'],
      dinner: ['Dinner', 'The town tree-lighting supper'],
      dessert: ['Dessert', 'Grandma’s secret recipe (it’s love)'],
      paper: ['Paper Goods', 'Plaid. Everything plaid.'],
    },
    claimBtn: 'Save the inn',
    open: 'Needs a hero',
    rsvpBtn: 'We’ll be home for Christmas',
    foot: 'No big-city promotions were accepted in the making of this Christmas.',
    particles: { kind: 'flake', colors: ['#ffffff', '#f2c4d2', '#e9d3b0'], count: 70 },
    burst: ['#c0587e', '#f2c4d2', '#b98a4b', '#ffffff'],
    plot: [['Arrives', 0], ['Meets baker', 1 / 3], ['Saves inn', 2 / 3], ['Snowfall kiss', 1]],
    meter(el, s) {
      const x = (p) => 40 + p * 520;
      const cur = this.plot.filter(([, p]) => s.pct >= p).pop();
      el.innerHTML = `<svg viewBox="0 0 600 112" class="plot">
        <path d="M40 54 H560" class="track"/><path d="M40 54 H${x(s.pct)}" class="fill"/>
        ${this.plot.map(([t, p]) => `<g class="beat ${s.pct >= p ? 'hit' : ''}"><circle cx="${x(p)}" cy="54" r="9"/><text x="${x(p)}" y="96" text-anchor="${p === 0 ? 'start' : p === 1 ? 'end' : 'middle'}" dx="${p === 0 ? -8 : p === 1 ? 8 : 0}">${t}</text></g>`).join('')}
        <text class="heart" x="${x(s.pct)}" y="40" text-anchor="middle">💗</text>
      </svg>
      <p class="meter-label">Cheese-o-Meter: <b>${Math.round(s.pct * 100)}%</b> · Act: <em>${cur[0]}</em> · ${s.claimed}/${s.total} claimed</p>`;
    },
    gag(el) {
      const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 70);
      el.classList.add('swoon');
      toast('❄️ Snow begins to fall. Cue the string music. 🎻');
      setTimeout(() => el.classList.remove('swoon'), 1600);
    },
  },
  {
    id: 'rudolph',
    name: 'Rudolph', emoji: '🦌', swatch: ['#1d2b45', '#ff3b3b', '#ffd166'],
    movie: 'a stop-motion Christmas classic',
    title: 'Foggy Christmas Eve',
    tagline: 'One very bright nose and a whole lot of side dishes will get this sleigh off the ground.',
    menuTitle: 'The Sleigh Manifest',
    menuSub: 'Every claimed dish turns the nose up a notch.',
    cats: {
      breakfast: ['Breakfast', 'Pre-flight fuel'],
      snacks: ['Snacks', 'Reindeer-games snacks'],
      dinner: ['Dinner', 'Supper at the North Pole'],
      dessert: ['Dessert', 'Abominably good desserts'],
      paper: ['Paper Goods', 'Misfit plates & cups'],
    },
    claimBtn: 'Light it up',
    open: 'Misfit dish',
    rsvpBtn: 'Ready for takeoff!',
    foot: 'Every misfit has a seat at this table.',
    particles: { kind: 'flake', colors: ['#ffffff', '#dfe7f3'], count: 75 },
    burst: ['#ff3b3b', '#ffd166', '#ffffff', '#7fb3ff'],
    meter(el, s) {
      const glow = 18 + s.pct * 80, fog = (1 - s.pct) * .9;
      el.innerHTML = `<svg viewBox="0 0 300 200" class="rudolph">
        <defs><radialGradient id="ng"><stop offset="0" stop-color="#ff5b5b" stop-opacity=".95"/><stop offset=".35" stop-color="#ff3b3b" stop-opacity=".45"/><stop offset="1" stop-color="#ff3b3b" stop-opacity="0"/></radialGradient>
          <filter id="fogblur"><feGaussianBlur stdDeviation="8"/></filter></defs>
        <circle class="glow" cx="150" cy="128" r="${glow}" fill="url(#ng)" style="opacity:${.35 + s.pct * .65}"/>
        <g class="antler"><path d="M118 62 Q100 30 84 20 M104 40 Q90 38 82 44 M110 50 Q96 56 92 64"/><path d="M182 62 Q200 30 216 20 M196 40 Q210 38 218 44 M190 50 Q204 56 208 64"/></g>
        <ellipse cx="150" cy="100" rx="38" ry="44" fill="#8a5a36"/><ellipse cx="150" cy="122" rx="24" ry="18" fill="#c08b5c"/>
        <circle cx="136" cy="88" r="5" fill="#1a1a1a"/><circle cx="164" cy="88" r="5" fill="#1a1a1a"/><circle cx="137.5" cy="86.5" r="1.6" fill="#fff"/><circle cx="165.5" cy="86.5" r="1.6" fill="#fff"/>
        <circle class="nose" cx="150" cy="122" r="11" fill="#ff3b3b"/><circle cx="146" cy="118" r="3" fill="#fff" opacity=".7"/>
        <g class="fog" filter="url(#fogblur)" style="opacity:${fog}"><ellipse cx="60" cy="150" rx="90" ry="26"/><ellipse cx="240" cy="140" rx="100" ry="30"/><ellipse cx="150" cy="178" rx="160" ry="26"/><ellipse cx="90" cy="70" rx="70" ry="20"/><ellipse cx="230" cy="64" rx="70" ry="22"/></g>
      </svg>
      <p class="meter-label">Nose power: <b>${Math.round(s.pct * 100)}%</b> · ${s.pct >= 1 ? '<em>FOG CLEARED. WE FLY!</em>' : s.pct > .6 ? 'fog lifting' : 'fog’s thick'} · ${s.claimed}/${s.total} claimed</p>`;
    },
    gag(el) {
      el.classList.add('flash');
      toast('🔴 Nose to full power. Fog doesn’t stand a chance.');
      setTimeout(() => el.classList.remove('flash'), 1400);
    },
  },
  {
    id: 'carol',
    name: 'A Christmas Carol', emoji: '🕯️', swatch: ['#1a130c', '#efd9a7', '#8c2f1e'],
    movie: 'A Christmas Carol, by candlelight',
    title: 'God Bless Us, Every One',
    tagline: 'Three ghosts. One family. Absolutely no humbug.',
    menuTitle: 'The Ledger',
    menuSub: 'Settle an account: every claim lights the ghosts’ candles.',
    cats: {
      breakfast: ['Breakfast', 'Christmas morning, reformed-miser style'],
      snacks: ['Snacks', 'Fezziwig’s party spread'],
      dinner: ['Dinner', 'The Cratchits’ table'],
      dessert: ['Dessert', 'Christmas pudding & such'],
      paper: ['Paper Goods', 'Counting-house supplies'],
    },
    claimBtn: 'Settle it',
    open: 'Unpaid',
    rsvpBtn: 'We’ll keep Christmas well',
    foot: 'Keep Christmas in your heart all year. Keep the leftovers in the fridge.',
    particles: { kind: 'flake', colors: ['#ffffff', '#e8d6ae'], count: 60 },
    burst: ['#efd9a7', '#ffb347', '#ffffff', '#8c2f1e'],
    meter(el, s) {
      const lit = s.pct >= 1 ? 3 : Math.floor(s.pct * 3);
      const names = ['Past', 'Present', 'Yet to Come'];
      el.innerHTML = `<div class="candles">${names.map((n, i) => `<div class="candle ${i < lit ? 'lit' : ''}">
        <span class="flame"></span><span class="wax" style="height:${70 - i * 8}px"></span><span class="cname">${n}</span></div>`).join('')}</div>
      <p class="meter-label"><b>${lit}</b> of 3 ghosts’ candles lit · accounts settled: ${s.claimed}/${s.total}${lit === 3 ? ' · <em>NO HUMBUG HERE</em>' : ''}</p>`;
    },
    gag() {
      document.body.classList.remove('haunt'); void document.body.offsetWidth; document.body.classList.add('haunt');
      toast('👻 Bah, hum… just kidding. Merry Christmas!');
      setTimeout(() => document.body.classList.remove('haunt'), 2200);
    },
  },
  {
    id: 'miracle',
    name: 'Miracle on 34th Street', emoji: '✉️', swatch: ['#2a0f12', '#f3d9a4', '#c8102e'],
    movie: 'a Miracle on 34th Street kind of case',
    title: 'The People vs. Skipping Christmas',
    tagline: 'Exhibit A: Santa is real. Exhibit B: this sign-up sheet.',
    menuTitle: 'Evidence for the Court',
    menuSub: 'Every claimed dish delivers another sack of letters to Santa.',
    cats: {
      breakfast: ['Breakfast', 'Parade-morning breakfast'],
      snacks: ['Snacks', 'Department-store samples'],
      dinner: ['Dinner', 'Exhibit C: stew'],
      dessert: ['Dessert', 'Exhibit D: dessert'],
      paper: ['Paper Goods', 'Court-approved paper goods'],
    },
    claimBtn: 'Deliver it',
    open: 'Undelivered',
    rsvpBtn: 'We believe!',
    foot: 'Believing is easy when there’s a fifth dessert.',
    particles: { kind: 'flake', colors: ['#ffffff', '#f3d9a4'], count: 60 },
    burst: ['#f3d9a4', '#c8102e', '#ffffff', '#2e6b3f'],
    meter(el, s) {
      const max = 12, n = Math.round(s.pct * max), done = s.pct >= 1;
      const rows = [5, 4, 2, 1]; let sacks = '', k = 0;
      rows.forEach((cnt, r) => {
        for (let i = 0; i < cnt; i++) {
          if (k < n) {
            const x = 150 - (cnt * 34) / 2 + i * 34 + 17, y = 150 - r * 26;
            sacks += `<g class="sack" transform="translate(${x} ${y})"><path d="M-15 10 Q-17 -8 -6 -12 L6 -12 Q17 -8 15 10 Z"/><path class="tie" d="M-6 -12 L0 -17 L6 -12"/><text y="4" text-anchor="middle">✉</text></g>`;
          }
          k++;
        }
      });
      el.innerHTML = `<svg viewBox="0 0 300 200" class="court">
        <rect x="40" y="164" width="220" height="30" rx="3" class="bench"/><rect x="40" y="160" width="220" height="6" class="bench-top"/>
        <text x="150" y="185" text-anchor="middle" class="seal">⚖ THE PEOPLE v. SKIPPING CHRISTMAS</text>
        ${sacks}
        ${done ? '<g class="verdict"><rect x="66" y="22" width="168" height="30" rx="4"/><text x="150" y="43" text-anchor="middle">CASE DISMISSED!</text></g>' : ''}
      </svg>
      <p class="meter-label"><b>${n}</b> of ${max} sacks of letters delivered · ${s.claimed}/${s.total} dishes claimed</p>`;
    },
    gag(el) {
      el.classList.remove('gavel'); void el.offsetWidth; el.classList.add('gavel');
      toast('⚖️ Order in the court! Santa Claus is real.');
      setTimeout(() => el.classList.remove('gavel'), 900);
    },
  },
];
