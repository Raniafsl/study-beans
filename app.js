/* ============================================================
   STUDY BEANS CAFÉ ☕ — app.js
   ------------------------------------------------------------
   This file is the BRAIN of the app:
     1. it remembers how the app is doing (the "state")
     2. it runs the timer
     3. it draws the timer on the page (your cup fills up!)
     4. it hands you beans when you finish a focus session
     5. it saves your beans so they survive a page refresh
   ============================================================ */

// ---------- 1. SETTINGS — the knobs you can tweak ----------
// focus session lengths, in minutes — the LENGTH chips under the tabs.
// add your own to the list and the app picks it up automatically!
const FOCUS_PRESETS = [15, 25, 50]; // the quick-pick chips
const DEFAULT_FOCUS_MINUTES = 25;
const MAX_FOCUS_MINUTES = 180;      // the custom box accepts 1..180 minutes

// is this a sane focus length? (used when loading a save + the custom box)
function isValidLength(minutes) {
  return Number.isFinite(minutes) && minutes >= 1 && minutes <= MAX_FOCUS_MINUTES;
}
const SHORT_BREAK_MINUTES = 5;
const LONG_BREAK_MINUTES = 15;
const BEANS_PER_25_MIN = 10;           // beans for a classic 25-minute session — longer sessions pay more
const SESSIONS_BEFORE_LONG_BREAK = 4;  // focus sessions, then a long break

// the shop menu: drink id -> name, emoji, price, and bean multiplier
// for the NEXT focus session (the drink is consumed when it ends)
const DRINKS = {
  espresso: { name: 'ESPRESSO',  emoji: '☕', price: 20, mult: 1.5 },
  latte:    { name: 'LATTE',     emoji: '🥛', price: 35, mult: 2 },
  boba:     { name: 'BOBA TEA',  emoji: '🧋', price: 50, mult: 2.5 },
  matcha:   { name: 'MATCHA',    emoji: '🍵', price: 65, mult: 3 },
  cocoa:    { name: 'HOT COCOA', emoji: '🍫', price: 80, mult: 4 },
};

// break lengths are fixed; the focus length is your choice (state.focusMinutes)
const MODE_MINUTES = {
  short: SHORT_BREAK_MINUTES,
  long: LONG_BREAK_MINUTES,
};

// how long the current mode lasts, in seconds (focus uses your pick)
function modeSeconds(mode) {
  return (mode === 'focus' ? state.focusMinutes : MODE_MINUTES[mode]) * 60;
}

// beans for a finished focus session, scaled by how long it actually ran.
// the classic 25-minute session is the baseline: 15m = 6, 25m = 10, 50m = 20
function beansForSession(totalSeconds) {
  return Math.round((BEANS_PER_25_MIN * totalSeconds) / (25 * 60));
}

// ---------- 2. STATE — the app's memory while it's open ----------
const state = {
  mode: 'focus',                        // 'focus', 'short', or 'long'
  focusMinutes: DEFAULT_FOCUS_MINUTES,  // your chosen focus length (15/25/50)
  totalSeconds: DEFAULT_FOCUS_MINUTES * 60,
  remainingSeconds: DEFAULT_FOCUS_MINUTES * 60,
  running: false,
  endAt: null,                          // clock time (ms) when the timer should stop
  cycleCount: 0,                        // focus sessions done since the last long break
  totalFocus: 0,                        // focus sessions done, all time
  beans: 0,
  drink: null,                          // the shop drink waiting to boost a session
  muted: false,                         // sounds on/off
  stats: {                              // the journal Puff keeps
    totalFocusSeconds: 0,               // time spent finishing focus sessions
    beansEarned: 0,                     // all-time beans (this only ever grows)
    streak: 0,                          // consecutive days with a finished session
    lastStudyDate: null,                // last day you studied (YYYY-MM-DD)
    drinksBought: {},                   // drink id -> how many you've bought
  },
  customize: {                          // your look + Puff's look
    ...DEFAULT_YOU_STYLE,
    puff: { ...PUFF_DEFAULT_STYLE },
  },
};

let tickId = null; // the id of our setInterval, so we can stop it later

// ---------- 3. GRAB THE PARTS OF THE PAGE WE CONTROL ----------
// (these are the same ids you can see in index.html)
const cafeEl = document.getElementById('cafe');
const cupWrapEl = document.getElementById('cupWrap');
const liquidEl = document.getElementById('liquid');
const timeEl = document.getElementById('time');
const modeLabelEl = document.getElementById('modeLabel');
const panelEl = document.getElementById('panel');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const tabEls = document.querySelectorAll('.tab');
const beanEl = document.getElementById('beanCount');
const cycleTextEl = document.getElementById('cycleText');
const cycleDotsEl = document.getElementById('cycleDots');
const bubbleEl = document.getElementById('catBubble');
const beansPillEl = document.getElementById('beansPill');
const lengthInput = document.getElementById('customLength');

// ---------- 4. SAVING — your beans survive a refresh ----------
// the storage key keeps its old name on purpose: renaming it here
// would wipe every saved game out there
const SAVE_KEY = 'mochi-beans-save';

function save() {
  const data = {
    beans: state.beans,
    focusMinutes: state.focusMinutes,
    totalFocus: state.totalFocus,
    cycleCount: state.cycleCount,
    drink: state.drink,
    muted: state.muted,
    stats: state.stats,
    customize: state.customize,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.beans = data.beans ?? 0;
    state.focusMinutes = isValidLength(data.focusMinutes)
      ? data.focusMinutes
      : DEFAULT_FOCUS_MINUTES;
    state.totalFocus = data.totalFocus ?? 0;
    // make sure the timer shows the restored length right away
    state.totalSeconds = modeSeconds(state.mode);
    state.remainingSeconds = state.totalSeconds;
    state.cycleCount = data.cycleCount ?? 0;
    state.drink = data.drink ?? null;
    state.muted = data.muted ?? false;
    state.stats = {
      totalFocusSeconds: 0,
      beansEarned: 0,
      streak: 0,
      lastStudyDate: null,
      drinksBought: {},
      ...(data.stats || {}),
    };
    const savedCustomize = data.customize || {};
    state.customize = {
      ...DEFAULT_YOU_STYLE,
      ...savedCustomize,
      // 'puff' is the new name; 'mochi' is read too so old saves still work
      puff: { ...PUFF_DEFAULT_STYLE, ...(savedCustomize.puff || savedCustomize.mochi || {}) },
    };
  } catch {
    // no save found (or it's broken) — start fresh
  }
}

// ---------- 5. THE TIMER ENGINE ----------
function startTimer() {
  if (state.running) return; // already going
  state.running = true;
  // remember the exact clock time the timer should finish at —
  // that way it stays accurate even if the tab lags
  state.endAt = Date.now() + state.remainingSeconds * 1000;
  tickId = setInterval(tick, 250);
  renderAll();
}

function pauseTimer() {
  if (!state.running) return;
  state.running = false;
  clearInterval(tickId);
  state.remainingSeconds = Math.max(0, Math.round((state.endAt - Date.now()) / 1000));
  renderAll();
}

function tick() {
  // how much time is left, figured out from the clock (not by counting)
  state.remainingSeconds = Math.max(0, Math.round((state.endAt - Date.now()) / 1000));

  if (state.remainingSeconds <= 0) {
    finishSession();
    return;
  }
  renderTime();
  renderCup();
  document.title = `${formatTime(state.remainingSeconds)} — Study Beans ☕`;
}

function finishSession() {
  state.running = false;
  clearInterval(tickId);
  state.remainingSeconds = 0;

  let nextMode = 'focus';

  if (state.mode === 'focus') {
    // 🎉 you earned it! A shop drink (if any) multiplies the beans,
    // then gets consumed — that's the whole point of the boost.
    const drinkId = state.drink;
    const mult = drinkId ? DRINKS[drinkId].mult : 1;
    const earned = Math.round(beansForSession(state.totalSeconds) * mult);
    state.beans += earned;
    state.totalFocus += 1;
    state.cycleCount += 1;
    // the journal: time studied (the length that ACTUALLY ran — you may
    // have changed the chip mid-session, and the running session keeps
    // its own totalSeconds), all-time beans, and the day streak
    state.stats.totalFocusSeconds += state.totalSeconds;
    state.stats.beansEarned += earned;
    updateStreak();
    nextMode = state.cycleCount % SESSIONS_BEFORE_LONG_BREAK === 0 ? 'long' : 'short';
    if (drinkId) {
      state.drink = null;
      applyDrink(null); // back to the plain cup
    }
    save();
    celebrate(earned);
    bounceCat();
    playCoin();
    setTimeout(playAlarm, 350); // soft "session complete" chime after the coin
    setCat(
      drinkId
        ? `yay!! +${earned} beans {bean}{sparkle} (${DRINKS[drinkId].name} boost!)`
        : `yay!! +${earned} beans {bean}{sparkle}`
    );
  } else {
    playAlarm(); // break's over — time to get back to studying
    setCat(
      state.mode === 'long'
        ? 'long break done — let\'s study! {leaf}'
        : 'refreshed! ready for more? {cup}'
    );
  }

  switchMode(nextMode);
}

function switchMode(mode) {
  state.mode = mode;
  state.running = false;
  clearInterval(tickId);    state.totalSeconds = modeSeconds(mode);
  state.remainingSeconds = state.totalSeconds;
  state.endAt = null;
  renderAll();
}

function resetTimer() {
  state.running = false;
  clearInterval(tickId);
  state.remainingSeconds = state.totalSeconds;
  state.endAt = null;
  setCat('reset! your cup is fresh {cup}');
  renderAll();
}

// ---------- 6. DRAWING THINGS ON THE PAGE ----------
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function renderTime() {
  timeEl.textContent = formatTime(state.remainingSeconds);
}

function renderCup() {
  // focus = the cup fills as you study; breaks = the cup drains as you sip
  const elapsed = state.totalSeconds - state.remainingSeconds;
  let fill = (elapsed / state.totalSeconds) * 100;
  if (state.mode !== 'focus') fill = 100 - fill;

  liquidEl.style.setProperty('--fill', `${Math.max(0, Math.min(100, fill)).toFixed(1)}%`);

  cupWrapEl.classList.toggle('running', state.running);
  cafeEl.classList.toggle('studying', state.mode === 'focus' && state.running);
}

function renderLengthChips() {
  // which focus length is selected? a preset chip lights up...
  document.querySelectorAll('.length-chip').forEach((chip) => {
    chip.classList.toggle('active', Number(chip.dataset.minutes) === state.focusMinutes);
  });
  // ...or the custom box shows your number when it isn't a preset
  lengthInput.value = FOCUS_PRESETS.includes(state.focusMinutes) ? '' : state.focusMinutes;
}

function renderTabs() {
  tabEls.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.mode === state.mode);
  });

  panelEl.classList.remove('mode-focus', 'mode-short', 'mode-long');
  panelEl.classList.add(`mode-${state.mode}`);

  // the pixel icons match the tabs: book / cup / moon
  const labels = {
    focus: iconHTML('book') + 'focus time!',
    short: iconHTML('cup') + 'short break — sip & rest',
    long: iconHTML('moon') + 'long break — cat nap time',
  };
  modeLabelEl.innerHTML = labels[state.mode];
}

function renderShop() {
  // price + availability on every buy button, and the active-boost note
  document.querySelectorAll('.buy-btn').forEach((btn) => {
    const d = DRINKS[btn.dataset.drink];
    const owned = state.drink === btn.dataset.drink;
    const affordable = state.beans >= d.price;
    btn.disabled = owned || !affordable;
    // the drink's own pixel icon sits next to its price (the drink id
    // doubles as the icon name — espresso -> icon 'espresso')
    btn.innerHTML = owned ? 'READY' : iconHTML(btn.dataset.drink) + ' ' + d.price;
  });
  const boostEl = document.getElementById('boostNote');
  if (state.drink) {
    boostEl.hidden = false;
    const d = DRINKS[state.drink];
    boostEl.textContent = `${d.emoji} ${d.name} — next focus ×${d.mult} beans`;
  } else {
    boostEl.hidden = true;
  }
}

function dateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// the day streak: studying today keeps it alive, missing a day resets it
function updateStreak() {
  const today = dateStr(new Date());
  if (state.stats.lastStudyDate === today) return; // already counted today
  const yesterday = dateStr(new Date(Date.now() - 86400000));
  state.stats.streak =
    state.stats.lastStudyDate === yesterday ? state.stats.streak + 1 : 1;
  state.stats.lastStudyDate = today;
}

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function renderJournal() {
  const s = state.stats;
  document.getElementById('statFocus').textContent = formatDuration(s.totalFocusSeconds);
  document.getElementById('statBeans').textContent = s.beansEarned;
  document.getElementById('statStreak').textContent = `${s.streak} day${s.streak === 1 ? '' : 's'}`;
  const totalDrinks = Object.values(s.drinksBought).reduce((a, b) => a + b, 0);
  document.getElementById('statDrinks').textContent = totalDrinks;
  // per-drink breakdown (only drinks you've actually bought)
  const listEl = document.getElementById('statDrinkList');
  listEl.innerHTML = '';
  for (const id of Object.keys(DRINKS)) {
    const count = s.drinksBought[id];
    if (!count) continue;
    const line = document.createElement('div');
    line.className = 'journal-sub';
    line.textContent = `${DRINKS[id].emoji} ${DRINKS[id].name} x${count}`;
    listEl.appendChild(line);
  }
}

function renderHud() {
  beanEl.textContent = state.beans;
  cycleTextEl.textContent = state.cycleCount;
  renderShop();
  renderJournal();

  // rebuild the little dot meter (coffee beans light up as you go)
  cycleDotsEl.innerHTML = '';
  for (let i = 0; i < SESSIONS_BEFORE_LONG_BREAK; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i < state.cycleCount ? ' on' : '');
    cycleDotsEl.appendChild(dot);
  }
}

function renderControls() {
  // the play/pause pixel icon swaps with the label
  let icon = 'play', label = 'START';
  if (state.running) {
    icon = 'pause';
    label = 'PAUSE';
  } else if (state.remainingSeconds < state.totalSeconds) {
    label = 'RESUME';
  }
  startBtn.innerHTML = iconHTML(icon) + label;
}

function renderAll() {
  renderTime();
  renderCup();
  renderTabs();
  renderLengthChips();
  renderHud();
  renderControls();
  document.title = 'Study Beans Café ☕';
}

// ---------- 7. THE CAT — flavor text ----------
const CAT_LINES = [
  '{sparkle} psst... you got this!',
  'one sip at a time {cup}',
  'i believe in you! {star}',
  'beans grow from focus {bean}',
  'your future self says hi {heart}',
  'pawsitive vibes only {paw}',
];

// Puff's speech: plain text, plus {icon} tokens that become tiny pixel
// icons — e.g. "yay!! +20 beans {bean}{sparkle}" (tokens live in BTN_ICONS)
function setCat(text) {
  bubbleEl.textContent = '';
  String(text)
    .split(/(\{[a-zA-Z]+\})/g)
    .forEach((part) => {
      const name = part.slice(1, -1);
      if (/^\{[a-zA-Z]+\}$/.test(part) && BTN_ICONS[name]) {
        bubbleEl.appendChild(iconSVG(name));
      } else {
        bubbleEl.appendChild(document.createTextNode(part));
      }
    });
}

function bounceCat() {
  // re-query Puff every time: the style customizer redraws him!
  const barista = document.getElementById('barista');
  if (!barista) return;
  barista.classList.remove('bounce');
  void barista.offsetWidth; // force the browser to restart the animation
  barista.classList.add('bounce');
}

// ---------- 8. CELEBRATION ----------
const PARTY_ICONS = ['sparkle', 'star', 'bean', 'heart', 'flower'];

function celebrate(amount = BEANS_PER_25_MIN) {
  // little pixel icons burst out of the timer panel
  for (let i = 0; i < 14; i++) {
    const pop = document.createElement('span');
    pop.className = 'pop';
    pop.appendChild(iconSVG(PARTY_ICONS[Math.floor(Math.random() * PARTY_ICONS.length)]));
    pop.style.left = `${10 + Math.random() * 80}%`;
    pop.style.top = `${15 + Math.random() * 55}%`;
    pop.style.animationDelay = `${Math.random() * 0.3}s`;
    panelEl.appendChild(pop);
    setTimeout(() => pop.remove(), 1500);
  }

  // "+beans" floats up next to your bean count
  const gain = document.createElement('span');
  gain.className = 'gain';
  gain.appendChild(document.createTextNode(`+${amount} `));
  gain.appendChild(iconSVG('bean'));
  beansPillEl.appendChild(gain);
  setTimeout(() => gain.remove(), 1500);
}

// ---------- 9. WIRE UP THE BUTTONS ----------
startBtn.addEventListener('click', () => {
  if (state.running) {
    pauseTimer();
    setCat('paused — your cup is waiting {cup}');
  } else {
    startTimer();
    setCat(state.mode === 'focus' ? 'stay caffeinated, superstar {star}' : 'sip & rest, friend {cloud}');
  }
});

resetBtn.addEventListener('click', resetTimer);

tabEls.forEach((tab) => {
  tab.addEventListener('click', () => {
    switchMode(tab.dataset.mode);
    setCat(state.mode === 'focus' ? 'fresh cup, fresh start! {book}' : 'okay, time for a little break {cup}');
  });
});

// click Puff for a random pep talk.
// Event delegation: we listen on the whole document, and only act if
// the click landed on Puff. That way it keeps working even when the
// style customizer redraws him (replacing the element we clicked).
document.addEventListener('click', (e) => {
  if (e.target.closest && e.target.closest('#barista')) {
    setCat(CAT_LINES[Math.floor(Math.random() * CAT_LINES.length)]);
    bounceCat();
  }
});

// ---------- 9a. FOCUS LENGTH (chips + custom box) ----------
// the one place a length becomes official: sets it, saves it, and applies
// it to a fresh idle focus session on the spot (otherwise next time)
function applyFocusLength(minutes) {
  state.focusMinutes = minutes;
  save();
  renderLengthChips();
  const idleFocus =
    state.mode === 'focus' &&
    !state.running &&
    state.remainingSeconds === state.totalSeconds;
  if (idleFocus) {
    state.totalSeconds = minutes * 60;
    state.remainingSeconds = state.totalSeconds;
    renderAll();
    return true; // applied now
  }
  return false; // queued for the next focus session
}

function catLengthLine(minutes, applied) {
  return applied ? `${minutes} minutes — let's go! {book}` : `got it — next focus is ${minutes}m`;
}

document.querySelectorAll('.length-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const minutes = Number(chip.dataset.minutes);
    if (minutes === state.focusMinutes) return; // already picked
    setCat(catLengthLine(minutes, applyFocusLength(minutes)));
  });
});

// the custom box: type any minutes, press Enter (or click away) to commit
function commitCustomLength() {
  const minutes = Math.round(Number(lengthInput.value.trim()));
  if (!isValidLength(minutes)) {
    // invalid — show the current length again and let Puff explain
    renderLengthChips();
    setCat('hmm — try a length from 1 to 180 minutes');
    return;
  }
  if (minutes === state.focusMinutes) return; // same length, nothing to do
  setCat(catLengthLine(minutes, applyFocusLength(minutes)));
}

lengthInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    commitCustomLength();
    lengthInput.blur(); // drop focus so the page feels tidy
  }
});
lengthInput.addEventListener('blur', commitCustomLength);

// ---------- 9b. THE STYLE CUSTOMIZER ----------
const styleBtn = document.getElementById('styleBtn');
const stylePanel = document.getElementById('stylePanel');

function highlightSwatches() {
  document.querySelectorAll('.swatch').forEach((sw) => {
    const part = sw.closest('.swatches').dataset.part;
    const current = part.startsWith('puff-')
      ? state.customize.puff[part.slice(5)]
      : state.customize[part];
    sw.classList.toggle('selected', current === sw.dataset.color);
  });
}

styleBtn.addEventListener('click', () => {
  stylePanel.hidden = !stylePanel.hidden;
});

document.querySelectorAll('.swatch').forEach((sw) => {
  sw.addEventListener('click', () => {
    const part = sw.closest('.swatches').dataset.part;
    if (part.startsWith('puff-')) {
      state.customize.puff[part.slice(5)] = sw.dataset.color;
      applyPuffStyle(state.customize.puff);
    } else {
      state.customize[part] = sw.dataset.color;
      applyYouStyle(state.customize);
    }
    save();
    highlightSwatches();
  });
});

// ---------- 9c. THE JOURNAL ----------
const journalBtn = document.getElementById('journalBtn');
const journalPanel = document.getElementById('journalPanel');

journalBtn.addEventListener('click', () => {
  journalPanel.hidden = !journalPanel.hidden;
});

// ---------- 9e. SOUND TOGGLE ----------
const soundBtn = document.getElementById('soundBtn');

function renderSoundBtn() {
  // both speaker icons live in the button; show the one that matches
  const on = soundBtn.querySelector('.icon-speaker');
  const off = soundBtn.querySelector('.icon-speakerOff');
  if (on) on.hidden = state.muted;
  if (off) off.hidden = !state.muted;
  soundBtn.title = state.muted ? 'sound is off — click to unmute' : 'sound is on — click to mute';
}

soundBtn.addEventListener('click', () => {
  state.muted = !state.muted;
  setMuted(state.muted);
  save();
  renderSoundBtn();
  if (!state.muted) playPurchase(); // a little confirmation blip
});

// ---------- 9d. THE BEAN SHOP ----------
const shopBtn = document.getElementById('shopBtn');
const shopPanel = document.getElementById('shopPanel');

shopBtn.addEventListener('click', () => {
  shopPanel.hidden = !shopPanel.hidden;
});

document.querySelectorAll('.buy-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.drink;
    const d = DRINKS[id];
    if (state.beans < d.price || state.drink === id) return;
    state.beans -= d.price;
    state.drink = id;
    state.stats.drinksBought[id] = (state.stats.drinksBought[id] || 0) + 1;
    applyDrink(id);
    playPurchase();
    save();
    renderAll(); // refresh the beans pill + shop buttons
    setCat(`${d.name} is brewing — boost ready! {sparkle}`);
  });
});

// ---------- 10. START THE APP ----------
load();
setMuted(state.muted);
applyYouStyle(state.customize);
applyPuffStyle(state.customize.puff);
applyDrink(state.drink);
renderAll();
renderSoundBtn();
setCat("hi! i'm puff — pick a session {heart}");
highlightSwatches();
