// One-off helper: builds a self-contained index.preview.html so we can
// preview the app without a server. Not part of the app itself.
import { readFileSync, writeFileSync } from 'node:fs';

const css = readFileSync('style.css', 'utf8');
const sprites = readFileSync('sprites.js', 'utf8');
const sounds = readFileSync('sounds.js', 'utf8');
const js = readFileSync('app.js', 'utf8');
let html = readFileSync('index.html', 'utf8');

html = html.replace('<link rel="stylesheet" href="style.css" />', `<style>\n${css}\n</style>`);
html = html.replace('<script src="sprites.js"></script>', `<script>\n${sprites}\n</script>`);
html = html.replace('<script src="sounds.js"></script>', `<script>\n${sounds}\n</script>`);
html = html.replace('<script src="app.js"></script>', `<script>\n${js}\n</script>`);

writeFileSync('index.preview.html', html);
console.log('wrote index.preview.html');
