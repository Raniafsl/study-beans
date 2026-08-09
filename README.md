# ☕ Study Beans Café

A cute Y2K-style study timer. You're the customer at a cozy coffee shop —
finish a focus session and your coffee cup fills up... and you earn beans! 🫘

## Run it

The easiest way: **just double-click `index.html`** — it opens in your browser.

Or serve it like a real website (good practice, and lets your browser behave
more like production):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## How the three files fit together

| File          | Role                                                        |
| ------------- | ----------------------------------------------------------- |
| `index.html`  | **The structure.** The café scene, the timer, the buttons.  |
| `style.css`   | **The looks.** Retro pixel font, the cup, all animations.   |
| `sprites.js`  | **The art.** Every character & prop as grids of pixels.     |
| `sounds.js`   | **The chiptunes.** Coin blips, purchase jingles, the alarm. |
| `app.js`      | **The brain.** The timer, earning beans, saving your data.  |

There's no framework and no build step — that's on purpose. Every line is
yours to read and change.

The café is **pixel art drawn with code** — no image files. Every sprite
in `sprites.js` is a grid of characters (one character = one pixel = one
color). Puff the barista cat **waves hello** when the page opens, using
frame-by-frame animation: two frames of his arm are stacked, and SMIL
(an SVG animation tag) swaps which one is visible — exactly how a game's
sprite sheet works.

Want to change the art? Edit a grid in `sprites.js` or a color in the
`PALETTE`. The scene rebuilds on refresh. Even the **buttons' little
icons** (book, cup, moon, play/pause, bean, journal, palette, speaker)
are pixel grids — they live in `BTN_ICONS` in the same file, and
`mountButtonIcons()` swaps them into the page. No emoji on the buttons!
Puff's speech bubble works the same way: write `{bean}` or `{heart}` in a
line and `setCat()` swaps the token for the matching pixel icon — try
clicking Puff for a few examples.

The sounds work the same way — **no audio files**. `sounds.js` is a tiny
synth: each sound is an oscillator (the "instrument") shaped by a gain
envelope (how loud, and for how long). A square wave is the classic
retro blip; a triangle wave is softer. One quirk: browsers won't play
audio until you've clicked the page at least once (the autoplay rule),
so the audio context is created lazily on your first click.

## The flow (what happens when you use it)

1. Open the app → Puff the barista cat greets you.
2. Pick **Focus**, **Short break**, or **Long break** — and tap the
   **LENGTH** chips to choose how long your focus session runs:
   **15m** (sprint), **25m** (classic), or **50m** (deep work) — or type
   your own number in the little box (1–180 minutes, press Enter).
3. Press **Start** → steam rises, your laptop wobbles, and your cup
   **fills with coffee** as the focus timer runs down.
4. Finish a focus session → the cup is full → **beans!** (10 for a classic
   25-minute session; longer sessions pay more — 15m = 6, 50m = 20),
   a burst of sparkles, and Puff celebrates.
5. Your beans are saved in the browser (`localStorage`), so they're still
   there when you come back tomorrow.
6. After 4 focus sessions, Puff sends you on a **long break**. 🐱
7. Tap **STYLE** (the palette button) to make the café feel like yours —
   pick a skin tone,
   hair color, and shirt for the person at the table (the headphones
   match your shirt!), and a **fur + apron color for Puff** (his stripes
   and pocket shade automatically to match). Everything saves with your beans.
8. Tap **SHOP** (the bean button) to spend beans on a pixel drink —
   espresso (×1.5) up to hot cocoa (×4). It sits on your table and
   **multiplies the beans from your next focus session**, then it's gone.
   Save up for the good stuff!
9. Tap **JOURNAL** (the notebook button) to see your history — total focus
   time, all-time beans, your day streak, and every drink you've bought.
10. Tap the **speaker button** to mute or unmute the chiptunes — coin blips when you
    earn beans, a happy jingle when you buy a drink, and a soft chime
    when a session ends. The mute setting saves with everything else.

## A plain-English map of `app.js`

- **Settings** — the "knobs": how long sessions are, how many beans you earn.
  (Want a 90-minute monster session? Type `90` in the custom box — no code
  needed. Or add `90` to `FOCUS_PRESETS` and the row grows a chip too.)
- **State** — the app's memory: which mode, how much time is left, your beans.
- **Saving** — `save()`/`load()` write your beans to `localStorage`.
- **The timer engine** — `startTimer`/`pauseTimer`/`tick`. The timer stores
  *when it should end* and reads the computer's clock, so it stays accurate
  even if the tab lags.
- **Drawing** — `renderTime`, `renderCup` (cup fill %), `renderHud` (beans
  + session dots), `renderControls` (Start/Pause/Resume labels).
- **The cat** — flavor text that reacts to what's happening.
- **Wire-up** — `addEventListener` connects buttons and Puff to their actions.

## Tiny glossary

- **DOM** — the tree of elements the browser builds from your HTML.
  `document.getElementById('time')` grabs one element so JS can change it.
- **Event listener** — code that runs when something happens (a click, a
  timer tick). `button.addEventListener('click', fn)` = "run `fn` when clicked".
- **State** — all the values that describe "how the app is doing right now".
  Almost every game/app keeps one `state` object so it's easy to see and save.
- **`localStorage`** — the browser's little storage drawer. Data saved there
  survives closing the tab, but only on that one device.
- **`setInterval`** — asks the browser to run a function every N milliseconds.
  `clearInterval` stops it.

## What's next

- **Git + deployment** — save your work to GitHub and put it live on the web
