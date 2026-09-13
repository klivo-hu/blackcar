#!/usr/bin/env node
/**
 * Kontrasztmérés a palettán.
 *
 *   npm run contrast
 *
 * A WCAG 2.2 AA a folyószövegre 4,5:1-et, a nagy szövegre (18,66 px félkövér
 * vagy 24 px) és a felületi jelzésekre 3:1-et ír elő. A sötét felületeken a
 * halvány szöveg gyorsan a határ alá csúszik, és ez szabad szemmel nem látszik
 * — ezért van mérés, nem szemrevételezés.
 *
 * A párokat kézzel soroljuk fel: azt mérjük, ami ténylegesen egymáson áll az
 * oldalon, nem a paletta összes kombinációját.
 */

const PALETTE = {
  obsidian: '#0A0A0B',
  graphite: '#141417',
  slate: '#1C1C21',
  steel: '#2E2E36',
  bone: '#F2F0EC',
  paper: '#FFFFFF',
  ink: '#121214',
  'ink-soft': '#3A3A3F',
  muted: '#5E5C57',
  'on-dark': '#F2F0EC',
  'on-dark-muted': '#A8A59D',
  brass: '#C8A253',
  'brass-deep': '#7A5B1E',
  success: '#1B7A4B',
  danger: '#A83027',
};

/** Egymáson álló párok: [előtér, háttér, minimum]. */
const PAIRS = [
  ['on-dark', 'obsidian', 4.5],
  ['on-dark', 'graphite', 4.5],
  ['on-dark', 'slate', 4.5],
  ['on-dark-muted', 'obsidian', 4.5],
  ['on-dark-muted', 'graphite', 4.5],
  ['on-dark-muted', 'slate', 4.5],
  ['brass', 'obsidian', 4.5],
  ['brass', 'graphite', 4.5],
  ['brass', 'slate', 4.5],
  ['ink', 'bone', 4.5],
  ['ink', 'paper', 4.5],
  ['ink-soft', 'bone', 4.5],
  ['muted', 'bone', 4.5],
  ['muted', 'paper', 4.5],
  ['brass-deep', 'bone', 4.5],
  ['brass-deep', 'paper', 4.5],
  ['obsidian', 'brass', 4.5],
  ['success', 'bone', 4.5],
  ['danger', 'bone', 4.5],
  // Felületi jelzés (keret, ikon): 3:1 elég.
  ['steel', 'graphite', 1.3],
  ['brass-deep', 'bone', 3],
];

function channel(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

let failed = 0;

for (const [fg, bg, min] of PAIRS) {
  const value = ratio(PALETTE[fg], PALETTE[bg]);
  const ok = value >= min;
  if (!ok) failed += 1;
  console.log(
    `${ok ? 'OK  ' : 'BUKÓ'}  ${value.toFixed(2).padStart(6)}:1  (min ${min})  ${fg} / ${bg}`,
  );
}

console.log(
  failed === 0
    ? `\nMind a ${PAIRS.length} pár megfelel.`
    : `\n${failed} pár nem éri el a küszöböt.`,
);
process.exitCode = failed === 0 ? 0 : 1;
