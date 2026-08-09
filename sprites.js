/* ============================================================
   sprites.js — the pixel art for Study Beans Café
   ------------------------------------------------------------
   Every sprite is a grid of characters. Each character is one
   pixel of one color (see the PALETTE below). This file turns
   those grids into real SVG squares and builds the café scene.

   The cool part: the art is DATA. Want a bigger cat? Change
   the grids. Want a red apron? Change one letter in the palette.
   ============================================================ */

const SVG_NS = 'http://www.w3.org/2000/svg';
const PX = 4; // one "pixel" = 4 SVG units on the 480x340 scene

// one letter = one color. '.' means "no pixel here".
const PALETTE = {
  O: '#f2a25c', // cat orange
  D: '#d97b35', // dark orange (stripes)
  C: '#fff3e0', // cream
  P: '#ff8fb3', // pink (apron + your cup)
  L: '#ffb1cf', // light pink
  K: '#4a2b17', // dark outline + eyes
  W: '#ffffff', // white
  S: '#ffd9b3', // skin
  H: '#8a5a33', // hair / wood
  B: '#b9d8ff', // blue shirt
  G: '#3f4a5c', // laptop screen back
  A: '#bfe0f4', // laptop screen
  E: '#8fb8d6', // code lines on the screen
  T: '#d7dee9', // laptop base
  M: '#7ec8b8', // mint
  N: '#93d6b8', // light mint
  V: '#b39ddb', // purple
  U: '#6f452b', // coffee
  R: '#b06a3f', // terracotta
  Q: '#c97e4b', // pot rim
  Y: '#ffd9a0', // butter yellow
  F: '#2f3e46', // register screen
  J: '#7ee0c3', // register screen text
  Z: '#6a4a78', // headphones (usually matches the shirt!)
  X: '#ff9e7a', // blush (kept separate from the apron pocket!)
};

const SPRITES = {
  // Puff's head: ears, face, whiskers, blush
  catHead: [
    '.KK..........KK.',
    '.KOK........KOK.',
    '.KOK........KOK.',
    '.KOK........KOK.',
    'KOOOOOOOOOOOOOOK',
    'KOOOOOOOOOOOOOOK',
    'KOOOKKOOOOOKKOOK',
    'KOXXKKOOOOKKXXOK',
    'KOWOOOOPPOOOOWOK',
    'KOWOOOOPPOOOOWOK',
    'KOOOOOOKKOOOOOOK',
    'KOOOOOOOOOOOOOOK',
    'KOOOOOOOOOOOOOOK',
    'KKKKKKKKKKKKKKKK',
  ],
  // Puff's body with apron + pocket
  catBody: [
    'KKKKKKKKKKKKKKKKKK',
    'KOOOOOOOOOOOOOOOOK',
    'KODOOOOOOOOOOODOOK',
    'KOOOOOOOOOOOOOOOOK',
    'KOOCCCCCCCCCCCCOOK',
    'KOOCCCCCCCCCCCCOOK',
    'KOOCPPPPPPPPPPCOOK',
    'KOOCPPPPPPPPPPCOOK',
    'KOOCPPPPLLPPPPCOOK',
    'KOOCPPPPPPPPPPCOOK',
    'KOOCCCCCCCCCCCCOOK',
    'KKKKKKKKKKKKKKKKKK',
  ],
  // one arm sprite — used twice (hanging, and raised to wave)
  arm: [
    '..KK..',
    '.KOOK.',
    '.KOOK.',
    '.KOOK.',
    '.KOOK.',
    '.KOOK.',
    '.KOOK.',
    '..KK..',
  ],
  tail: [
    '.KK.',
    'KOOK',
    'KOOK',
    'KOOK',
    'KOOK',
    '.KK.',
  ],
  // you, studying — bigger now, with headphones!
  // S = skin, H = hair, B = shirt, Z = headphones (all customizable)
  you: [
    '...KKKKKKKKKK...',
    '..KTTTTTTTTTTK..',
    '.KTTTTTTTTTTTTK.',
    '.KTHHSSSSSSHHTK.',
    '.KTHHSSSSSSHHTK.',
    '.KHHSSSSSSSSHHK.',
    '.KHHSKKSSKKSHHK.',
    '.KHHSKKSSKKSHHK.',
    '.KHHSSSKKKSSHHK.',
    '.KHHSSSSSSSSHHK.',
    'KKHHHHHHHHHHHHKK',
    'KKBBBBBBBBBBBBKK',
    'KBBBBBBBBBBBBBBK',
    'KBBBBBBBBBBBBBBK',
    'KBBBBBBBBBBBBBBK',
    'KBBBBBBBBBBBBBBK',
    'KBBBBBBBBBBBBBBK',
    'KBBBBBBBBBBBBBBK',
    'KBBBBBBBBBBBBBBK',
    'KBBBBBBBBBBBBBBK',
    'KBBBBBBBBBBBBBBK',
    'KKKKKKKKKKKKKKKK',
  ],
  laptop: [
    'KKKKKKKKKKKKKKKKKKKKKK',
    'KGGGGGGGGGGGGGGGGGGGGK',
    'KGSSSSSSSSSSSSSSSSSSGK',
    'KGSSEEEEEESSSEEEESSSGK',
    'KGSSSSSSSSSSSSSSSSSSGK',
    'KGEEEEESSSSSSEEESSSSGK',
    'KGGGGGGGGGGGGGGGGGGGGK',
    'KKKWWWWWWWWWWWWWWWWKKK',
  ],
  books: [
    'KKKKKKKKKKKK',
    'KWWVVVVVVVVK',
    'KWWVVVVVVVVK',
    'KKKKKKKKKKKK',
    'KWWOOOOOOOOK',
    'KWWOOOOOOOOK',
    'KKKKKKKKKKKK',
  ],
  cup: [
    'KKKKKKKKKK...',
    'KUUUUUUUUK...',
    'KPPPPPPPPKPP.',
    'KPPPPPPPPKPP.',
    'KPPPPPPPPKPP.',
    'KPPPPPPPPK...',
    'KPPPPPPPPK...',
    'KKKKKKKKKK...',
  ],
  // the shop drinks — each one replaces the cup on your table
  cupEspresso: [
    'KKKKKKKKKK...',
    'KUUUUUUUUK...',
    'KWWWWWWWWKPP.',
    'KWWWWWWWWKPP.',
    'KWWWWWWWWKPP.',
    'KWWWWWWWWK...',
    'KWWWWWWWWK...',
    'KKKKKKKKKK...',
  ],
  cupLatte: [
    'KKKKKKKKKK...',
    'KUUUUUUUUK...',
    'KCCCCCCCCKPP.',
    'KCWCCCCCCKPP.',
    'KCCCCCCCCKPP.',
    'KCCCCCCCCK...',
    'KCCCCCCCCK...',
    'KKKKKKKKKK...',
  ],
  cupBoba: [
    '.....PP......',
    '.....PP......',
    '.....PP......',
    'KKKKKKKKKK...',
    'KAAAAAAAAK...',
    'KAAAAAAAAK...',
    'KAAUUUUUAK...',
    'KAAUUUUUAK...',
    'KAAAAAAAAK...',
    'KKKKKKKKKK...',
  ],
  cupMatcha: [
    'KKKKKKKKKK...',
    'KMMMMMMMMK...',
    'KMMMMMMMMKPP.',
    'KMMMMMMMMKPP.',
    'KMMMMMMMMKPP.',
    'KMMMMMMMMK...',
    'KMMMMMMMMK...',
    'KKKKKKKKKK...',
  ],
  cupCocoa: [
    'KKKKKKKKKK...',
    'KWWWWWWWWK...',
    'KWWWWWWWWK...',
    'KRRRRRRRRKPP.',
    'KRRRRRRRRKPP.',
    'KRRRRRRRRKPP.',
    'KRRRRRRRRK...',
    'KKKKKKKKKK...',
  ],
  plant: [
    '..MMMMMM....',
    '.MMMMMMMMM..',
    '.MMNMMMMNMM.',
    '..MMMMMM....',
    '..QQQQQQ....',
    '.RRRRRRRRR..',
    '.RRRRRRRRR..',
    '.RRRRRRRRR..',
    '..RRRRRR....',
  ],
  register: [
    'KKKKKKKKKKKKKKKK',
    'KRRRRRRRRRRRRRRK',
    'KRKKKKKKKKKKKKRK',
    'KRKJJJJJJJJJJKRK',
    'KRKJJJJJJJJJJKRK',
    'KRKKKKKKKKKKKKRK',
    'KRRRRRRRRRRRRRRK',
    'KRRRYYRYYRYYRRRK',
    'KRRRYYRYYRYYRRRK',
    'KRRRRRRRRRRRRRRK',
    'KRRRRRRRRRRRRRRK',
    'KKKKKKKKKKKKKKKK',
  ],
  tipJar: [
    '..KKKKKK..',
    '.KWWWWWWK.',
    'KWWWWWWWWK',
    'KWWWWWWWWK',
    'KWYYYYYYWK',
    'KWWWWWWWWK',
    '.KWWWWWWK.',
    '..KKKKKK..',
  ],
  counterMug: [
    'KKKKKKKK',
    'KUUUUUUK',
    'KPPPPPPK',
    'KPPPPPPK',
    'KPPPPPPK',
    'KPPPPPPK',
    'KKKKKKKK',
  ],
};

// ---------- tiny icons for the buttons ----------
// Same idea as the big sprites, just 10x10: one character = one pixel.
// These replace the emoji that used to live on the buttons.
const BTN_ICONS = {
  book: [
    '..........',
    '.KKKKKKKK.',
    '.KWWWHWWWK',
    '.KWWWHWWWK',
    '.KKKKKKKKK',
    '.KWWWHWWWK',
    '.KWWWHWWWK',
    '.KWWWWWWWK',
    '.KKKKKKKK.',
    '..........',
  ],
  cup: [
    '..........',
    '...K..K...',
    '...KKKK...',
    '..KMMMMK..',
    '..KMMMMK..',
    '..KWWWWK..',
    '..KKKKKK..',
    '..........',
    '..........',
    '..........',
  ],
  moon: [
    '..........',
    '...KKKK...',
    '..KWWWWK..',
    '..KWWWWWK.',
    '..KWWWWWK.',
    '..KWWWWWK.',
    '...KWWWWK.',
    '...KKKKK..',
    '..........',
    '..........',
  ],
  play: [
    '..........',
    '..........',
    '....KK....',
    '...KWWK...',
    '...KWWWK..',
    '...KWWWWK.',
    '...KWWWWK.',
    '...KWWWK..',
    '...KWWK...',
    '....KK....',
  ],
  pause: [
    '..........',
    '..........',
    '...KK.KK..',
    '...KK.KK..',
    '...KK.KK..',
    '...KK.KK..',
    '...KK.KK..',
    '...KK.KK..',
    '..........',
    '..........',
  ],
  bean: [
    '..........',
    '..KKKKKK..',
    '.KUUUUUUK.',
    '.KUUUUUUK.',
    '.KUURRUUK.',
    '.KUUUUUUK.',
    '.KUUUUUUK.',
    '..KKKKKK..',
    '..........',
    '..........',
  ],
  journal: [
    '..........',
    '.KKKKKKKK.',
    '.KWWWWWWWK',
    '.KWKWWWWWK',
    '.KWWWWWWWK',
    '.KWKWWWWWK',
    '.KWWWWWWWK',
    '.KWKWWWWWK',
    '.KKKKKKKK.',
    '..........',
  ],
  style: [
    '..........',
    '..KKKKKK..',
    '.KWWWWWWK.',
    '.KWWWWWWK.',
    'KWWMWWPWWK',
    'KWWWWWWWWK',
    '.KWWBWWWK.',
    '.KWWWWWWK.',
    '..KKKKKK..',
    '..........',
  ],
  speaker: [
    '..........',
    '..KK...K..',
    '..KKK..K..',
    '..KKKK.KK.',
    '..KKKKKKK.',
    '..KKKK.KK.',
    '..KKK..K..',
    '..KK...K..',
    '..........',
    '..........',
  ],
  speakerOff: [
    '..........',
    '..KK..X...',
    '..KKK.X...',
    '..KKXKK...',
    '.KKXKKK...',
    '.KXKKKK...',
    'XKKKKKK...',
    '..........',
    '..........',
    '..........',
  ],
  // speech-bubble + celebration accents (used via {heart} tokens in
  // Puff's lines, and as the floating celebration pops)
  heart: [
    '..........',
    '.KK....KK.',
    'KPPK..KPPK',
    'KPPPPPPPPK',
    'KPPPPPPPPK',
    '.KPPPPPPK.',
    '..KPPPPK..',
    '...KPPK...',
    '....KK....',
    '..........',
  ],
  sparkle: [
    '..........',
    '....K.....',
    '...KYK....',
    '..KYYYK...',
    '..KYYYK...',
    '...KYK....',
    '....K.....',
    '..........',
    '..........',
    '..........',
  ],
  star: [
    '....K.....',
    '...KYK....',
    '.KYYYYYK..',
    'KYYYYYYYYK',
    '.KYYYYYK..',
    '..KYYYK...',
    '...KYK....',
    '....K.....',
    '..........',
    '..........',
  ],
  flower: [
    '..........',
    '..KKKKKK..',
    '.KWWWWWWK.',
    'KWWYYYYWWK',
    'KWWYYYYWWK',
    '.KWWWWWWK.',
    '..KKKKKK..',
    '..........',
    '..........',
    '..........',
  ],
  paw: [
    '..........',
    '..KK..KK..',
    '.KPPK.KPPK',
    '.KPPK.KPPK',
    '..KK..KK..',
    '...KKKK...',
    '..KPPPPK..',
    '..KPPPPK..',
    '...KKKK...',
    '..........',
  ],
  cloud: [
    '..........',
    '....KK....',
    '..KKWWKK..',
    '.KWWWWWWK.',
    'KKWWWWWWWK',
    'KKKKKKKKKK',
    '..........',
    '..........',
    '..........',
    '..........',
  ],
  leaf: [
    '..........',
    '....KK....',
    '...KMMK...',
    '..KMMMMK..',
    '.KMMMMMMK.',
    '.KMMMMMMK.',
    '..KMMMMK..',
    '...KKKK...',
    '..........',
    '..........',
  ],
  // the five shop drinks — mini versions of the cups that sit on
  // your table, drawn in the same 10x10 icon style
  espresso: [
    '..........',
    '..KKKKKK..',
    '.KUUUUUUK.',
    '.KUUUUUUK.',
    '.KUUUUUUK.',
    '.KWWWWWWK.',
    '..KKKKKK..',
    '..........',
    '..........',
    '..........',
  ],
  latte: [
    '..........',
    '..KKKKKK..',
    '.KCCCCCCK.',
    '.KCWCCCWK.',
    '.KWWWWWWK.',
    '.KWWWWWWK.',
    '..KKKKKK..',
    '..........',
    '..........',
    '..........',
  ],
  boba: [
    '..........',
    '....PP....',
    '....PP....',
    '..KKKKKK..',
    '.KAAAAAAK.',
    '.KAAAAAAK.',
    '.KAUUUUAK.',
    '.KAUUUUAK.',
    '..KKKKKK..',
    '..........',
  ],
  matcha: [
    '..........',
    '..KKKKKK..',
    '.KMMMMMMK.',
    '.KMMMMMMK.',
    '.KMMMMMMK.',
    '.KMMMMMMK.',
    '..KKKKKK..',
    '..........',
    '..........',
    '..........',
  ],
  cocoa: [
    '..........',
    '..KKKKKK..',
    '.KWWWWWWK.',
    '.KWWWWWWK.',
    '.KRRRRRRK.',
    '.KRRRRRRK.',
    '..KKKKKK..',
    '..........',
    '..........',
    '..........',
  ],
};

// ---------- tiny SVG helpers ----------
function makeRect(parent, x, y, w, h, fill) {
  const r = document.createElementNS(SVG_NS, 'rect');
  r.setAttribute('x', x);
  r.setAttribute('y', y);
  r.setAttribute('width', w);
  r.setAttribute('height', h);
  r.setAttribute('fill', fill);
  r.setAttribute('shape-rendering', 'crispEdges');
  parent.appendChild(r);
  return r;
}

// the pixel squares that make up a button icon
function iconRects(name) {
  const rects = [];
  BTN_ICONS[name].forEach((row, ry) => {
    [...row].forEach((ch, rx) => {
      const color = PALETTE[ch];
      if (color) rects.push({ x: rx, y: ry, color });
    });
  });
  return rects;
}

// an icon as an SVG string — used where JS builds button labels
// (Start/Pause/Resume, the shop prices)
function iconHTML(name) {
  const rects = iconRects(name)
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="1" height="1" fill="${r.color}"/>`)
    .join('');
  return `<svg class="btn-icon icon-${name}" viewBox="0 0 10 10" aria-hidden="true">${rects}</svg>`;
}

// an icon as a real SVG element
function iconSVG(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', `btn-icon icon-${name}`);
  svg.setAttribute('viewBox', '0 0 10 10');
  svg.setAttribute('aria-hidden', 'true');
  iconRects(name).forEach((r) => makeRect(svg, r.x, r.y, 1, 1, r.color));
  return svg;
}

// swap every <span data-icon="..."></span> in the page for its pixel icon
function mountButtonIcons() {
  document.querySelectorAll('[data-icon]').forEach((el) => {
    const svg = iconSVG(el.dataset.icon);
    if (el.hasAttribute('hidden')) svg.setAttribute('hidden', '');
    el.replaceWith(svg);
  });
}

// turn one sprite grid into a group of little squares at (x, y)
// `overrides` lets us swap colors for ONE sprite — that's how the
// skin-tone / hair / shirt customizer works.
function drawSprite(parent, name, x, y, overrides) {
  const rows = SPRITES[name];
  const g = document.createElementNS(SVG_NS, 'g');
  rows.forEach((row, ry) => {
    [...row].forEach((ch, rx) => {
      const color = (overrides && overrides[ch]) || PALETTE[ch];
      if (!color) return; // '.' = transparent
      makeRect(g, x + rx * PX, y + ry * PX, PX, PX, color);
    });
  });
  parent.appendChild(g);
  return g;
}

function text(parent, x, y, str, size, fill) {
  const t = document.createElementNS(SVG_NS, 'text');
  t.setAttribute('x', x);
  t.setAttribute('y', y);
  t.setAttribute('text-anchor', 'middle');
  t.setAttribute('font-family', "'Press Start 2P', 'Baloo 2', monospace");
  t.setAttribute('font-size', size);
  t.setAttribute('fill', fill);
  t.textContent = str;
  parent.appendChild(t);
  return t;
}

// ---------- the scene builders ----------
function drawFloor(layer) {
  const planks = ['#d8a55e', '#d09e56'];
  const seam = '#a8753c';
  let row = 0;
  for (let y = 222; y < 339; y += 5) {
    makeRect(layer, 0, y, 480, 4, planks[row % 2]);
    makeRect(layer, 0, y + 4, 480, 1, seam);
    const offset = row % 2 === 0 ? 0 : 26;
    for (let x = 26 + offset; x < 480; x += 52) {
      makeRect(layer, x, y, 1, 4, seam);
    }
    row++;
  }
}

function drawRug(layer) {
  makeRect(layer, 76, 284, 328, 56, '#e5b9a8'); // border
  makeRect(layer, 80, 288, 320, 48, '#fbead8'); // base
  // a little checkerboard pattern
  for (let y = 288; y < 336; y += 8) {
    for (let x = 80 + ((y / 8) % 2) * 8; x < 400; x += 16) {
      makeRect(layer, x, y, 8, 8, '#f6d9c9');
    }
  }
}

// Puff's hello wave, frame by frame. SMIL swaps the arm's opacity
// between the two frames instantly (calcMode="discrete") — exactly
// like flipping two frames of a sprite sheet.
function addWave(el, startOpacity) {
  const anim = document.createElementNS(SVG_NS, 'animate');
  anim.setAttribute('attributeName', 'opacity');
  anim.setAttribute('calcMode', 'discrete');
  anim.setAttribute('values', startOpacity === 1 ? '1;0;1;0;1' : '0;1;0;1;0');
  anim.setAttribute('keyTimes', '0;0.12;0.22;0.5;0.6');
  anim.setAttribute('dur', '2.4s');
  anim.setAttribute('begin', '0.7s');
  anim.setAttribute('fill', 'freeze');
  el.appendChild(anim);
}

// Puff! Drawn behind the counter so the counter hides his paws.
// `slot` is where he lives (his own group, so restyling keeps his
// position); `overrides` swaps his fur/apron colors.
function buildCat(slot, overrides) {
  const idle = document.createElementNS(SVG_NS, 'g');
  idle.classList.add('cat-idle');

  const cat = document.createElementNS(SVG_NS, 'g');
  cat.id = 'barista';
  cat.classList.add('cat-group');
  cat.setAttribute('cursor', 'pointer');
  cat.setAttribute('title', 'click Puff!');

  drawSprite(cat, 'tail', 166, 180, overrides);
  drawSprite(cat, 'catBody', 184, 164, overrides);
  drawSprite(cat, 'catHead', 184, 108, overrides);

  // the same arm sprite twice: hanging down (rest) and raised (wave)
  const down = drawSprite(cat, 'arm', 252, 170, overrides);
  down.classList.add('arm-down');
  addWave(down, 1);
  const up = drawSprite(cat, 'arm', 252, 114, overrides);
  up.classList.add('arm-up');
  addWave(up, 0);

  idle.appendChild(cat);
  slot.appendChild(idle);
}

function drawCounter(layer) {
  makeRect(layer, 14, 203, 452, 28, '#e5ac66'); // top
  makeRect(layer, 14, 201, 452, 4, '#f7cf96');  // top highlight
  makeRect(layer, 14, 231, 452, 36, '#cf9250'); // front
  for (let x = 28; x < 466; x += 28) {
    makeRect(layer, x, 235, 2, 28, '#c28545');  // wood seams
  }
  makeRect(layer, 14, 262, 452, 8, '#a96c38');  // base
  // the café name, printed on the counter front (shifted right so
  // the person sitting at the table isn't covered by it)
  text(layer, 340, 249, 'STUDY BEANS', 10, '#f7e3c4');
  text(layer, 340, 263, 'SIP - STUDY - SHINE', 7, '#ffe28a');
}

function drawTable(layer) {
  makeRect(layer, 78, 282, 324, 22, '#cf9152'); // tabletop
  makeRect(layer, 78, 284, 324, 4, '#e3b172');  // top highlight
  makeRect(layer, 78, 304, 324, 30, '#b57a3f'); // front
  makeRect(layer, 90, 310, 300, 16, '#a96c38'); // inset panel
  makeRect(layer, 92, 330, 12, 10, '#a06a34');  // legs
  makeRect(layer, 376, 330, 12, 10, '#a06a34');
}

// ---------- Puff's custom look (fur / apron) ----------
const PUFF_DEFAULT_STYLE = {
  fur: PALETTE.O,
  apron: PALETTE.P,
};

let puffStyle = { ...PUFF_DEFAULT_STYLE };

// mix a color toward white (amount > 0) or black (amount < 0)
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const target = amount >= 0 ? 255 : 0;
  const t = Math.abs(amount);
  const out = rgb.map((v) => Math.round(v + (target - v) * t));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// the letters to swap when redrawing Puff: fur, stripes (a darker
// shade of the fur), apron, and pocket (a lighter shade of the apron)
function puffOverrides() {
  return {
    O: puffStyle.fur,
    D: shade(puffStyle.fur, -0.35),
    P: puffStyle.apron,
    L: shade(puffStyle.apron, 0.4),
  };
}

// (re)draw Puff. He lives in his own #puffSlot so restyling him
// never changes his position behind the counter.
function applyPuffStyle(style) {
  if (style) puffStyle = { ...puffStyle, ...style };
  const slot = document.getElementById('puffSlot');
  slot.innerHTML = '';
  buildCat(slot, puffOverrides());
}

// ---------- the shop drinks (which cup sits on your table) ----------
// drink id -> sprite name
const CUP_SPRITES = {
  espresso: 'cupEspresso',
  latte: 'cupLatte',
  boba: 'cupBoba',
  matcha: 'cupMatcha',
  cocoa: 'cupCocoa',
};

// (re)draw the cup on your table. null = the plain everyday cup.
function applyDrink(drinkId) {
  const slot = document.getElementById('tableCupSlot');
  slot.innerHTML = '';
  const sprite = (drinkId && CUP_SPRITES[drinkId]) || 'cup';
  drawSprite(slot, sprite, 0, 0);
}

// ---------- your custom look (skin / hair / shirt) ----------
const DEFAULT_YOU_STYLE = {
  skin: PALETTE.S,
  hair: PALETTE.H,
  shirt: PALETTE.B,
};

let youStyle = { ...DEFAULT_YOU_STYLE };

// (re)draw the person with the current style.
// The headphones (Z) match the shirt — so they always look put-together.
function applyYouStyle(style) {
  if (style) youStyle = { ...youStyle, ...style };
  const layer = document.getElementById('spriteLayer');
  const old = document.getElementById('youSprite');
  if (old) old.remove();
  const you = drawSprite(layer, 'you', 208, 194, {
    S: youStyle.skin,
    H: youStyle.hair,
    B: youStyle.shirt,
    Z: youStyle.shirt,
  });
  you.id = 'youSprite';
}

// put the whole scene together. Order matters: things drawn
// later appear in FRONT of things drawn earlier.
function buildScene() {
  const layer = document.getElementById('spriteLayer');

  drawFloor(layer);
  drawRug(layer);

  // Puff's own little slot: restyling him clears + rebuilds this
  // group, but the group itself stays put (behind the counter)
  const puffSlot = document.createElementNS(SVG_NS, 'g');
  puffSlot.id = 'puffSlot';
  layer.appendChild(puffSlot);
  buildCat(puffSlot);

  drawCounter(layer);

  // things sitting on the counter
  drawSprite(layer, 'tipJar', 44, 173);
  drawSprite(layer, 'counterMug', 140, 177);
  drawSprite(layer, 'register', 352, 157);

  // you, studying (bigger + customizable!)
  applyYouStyle();

  // your table (drawn over you, like a real table in front of you)
  drawTable(layer);

  // things on your table (laptop moved left so YOU stay visible)
  const laptop = drawSprite(layer, 'laptop', 118, 250);
  laptop.classList.add('laptop'); // so CSS can wobble it while you study
  drawSprite(layer, 'books', 256, 254);

  // your cup lives in its own slot so the shop can swap it
  const cupPos = document.createElementNS(SVG_NS, 'g');
  cupPos.setAttribute('transform', 'translate(310,250)');
  cupPos.id = 'tableCupSlot';
  layer.appendChild(cupPos);
  applyDrink(null);

  drawSprite(layer, 'plant', 360, 246);
}

// ---------- a tiny self-check so we never ship a broken grid ----------
function validateSprites() {
  const errors = [];
  for (const [name, rows] of Object.entries({ ...SPRITES, ...BTN_ICONS })) {
    const w = rows[0].length;
    rows.forEach((row, i) => {
      if (row.length !== w) {
        errors.push(`${name} row ${i}: ${row.length} chars (expected ${w})`);
      }
      [...row].forEach((ch, j) => {
        if (ch !== '.' && !PALETTE[ch]) {
          errors.push(`${name} row ${i} col ${j}: unknown char '${ch}'`);
        }
      });
    });
  }
  // button icons must also fit inside their 10x10 box
  for (const [name, rows] of Object.entries(BTN_ICONS)) {
    if (rows[0].length > 10 || rows.length > 10) {
      errors.push(`${name}: too big for a 10x10 icon (${rows[0].length}x${rows.length})`);
    }
  }
  if (errors.length) console.warn('sprite problems:\n' + errors.join('\n'));
  return errors;
}

// lets us run a quick check from Node too: node -e "require('./sprites.js')"
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SPRITES, BTN_ICONS, PALETTE, validateSprites };
}
