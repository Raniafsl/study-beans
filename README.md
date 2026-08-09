# ☕ Study Beans Café

A cute Y2K-style study timer. You're the customer at a cozy coffee shop —
finish a focus session and your coffee cup fills up... and you earn beans!

## How the three files fit together

| File          | Role                                                        |
| ------------- | ----------------------------------------------------------- |
| `index.html`  | **The structure.** The café scene, the timer, the buttons.  |
| `style.css`   | **The looks.** Retro pixel font, the cup, all animations.   |
| `sprites.js`  | **The art.** Every character & prop as grids of pixels.     |
| `sounds.js`   | **The chiptunes.** Coin blips, purchase jingles, the alarm. |
| `app.js`      | **The brain.** The timer, earning beans, saving your data.  |

There's no framework and no build step to allow smooth changes in future

The café is **pixel art drawn with code** — no image files. Every sprite
in `sprites.js` is a grid of characters (one character = one pixel = one
color). Puff the barista cat **waves hello** when the page opens, using
frame-by-frame animation: two frames of his arm are stacked, and SMIL
(an SVG animation tag) swaps which one is visible — 


— **no audio files**. `sounds.js` is a tiny
synth: each sound is an oscillator (the "instrument") shaped by a gain
envelope (how loud, and for how long). 

## The flow 

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
6. After 4 focus sessions, Puff sends you on a **long break**. 
7. Tap **STYLE** (the palette button) to make the café feel like yours —
   pick a skin tone, hair color, and shirt for the person at the table (the headphones
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

##  map of `app.js`

- **Settings** — the "knobs": how long sessions are, how many beans you earn.
- **State** — the app's memory: which mode, how much time is left, your beans.
- **Saving** — `save()`/`load()` write your beans to `localStorage`.
- **The timer engine** — `startTimer`/`pauseTimer`/`tick`. The timer stores
  *when it should end* and reads the computer's clock, so it stays accurate
  even if the tab lags.
- **Drawing** — `renderTime`, `renderCup` (cup fill %), `renderHud` (beans
  + session dots), `renderControls` (Start/Pause/Resume labels).
- **The cat** — flavor text that reacts to what's happening.
- **Wire-up** — `addEventListener` connects buttons and Puff to their actions.



