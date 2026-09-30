#!/usr/bin/env node
// Vaani Labs · WCAG 2.x contrast check for every intended token pair, light and dark.
// No dependencies. Usage: node check-contrast.mjs [--json] [--out contrast-report.md]
// Exit code 1 if any required pair fails, so it can run in CI (spec/00-design-direction.md §8).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const outPath = args.includes('--out') ? args[args.indexOf('--out') + 1] : join(here, 'contrast-report.md');
const tokens = JSON.parse(readFileSync(join(here, 'tokens.json'), 'utf8'));
const MODES = ['light', 'dark'];

// ---------- resolve ----------
const get = path => path.split('.').reduce((o, k) => (o ? o[k] : undefined), tokens);
function resolve(path, mode, seen = []) {
  if (seen.includes(path)) throw new Error(`Reference cycle: ${[...seen, path].join(' > ')}`);
  const t = get(path);
  if (!t || !('$value' in t)) throw new Error(`Unknown token ${path}`);
  const dark = t.$extensions?.['in.vaanilabs.modes']?.dark;
  const v = mode === 'dark' && dark !== undefined ? dark : t.$value;
  if (typeof v === 'string' && /^\{.+\}$/.test(v)) return resolve(v.slice(1, -1), mode, [...seen, path]);
  return v;
}
// Semantic colours first, then component colours (component.<group>.<name>, the token register in 01-foundations §18).
const COMP = {};
for (const [g, grp] of Object.entries(tokens.component || {})) if (!g.startsWith('$')) for (const k of Object.keys(grp)) if (!k.startsWith('$')) COMP[k] = `component.${g}.${k}`;
const sem = (name, mode) => resolve(get(`semantic.color.${name}`) ? `semantic.color.${name}` : (COMP[name] || `semantic.color.${name}`), mode);

// ---------- colour maths ----------
function parse(c) {
  c = c.trim();
  let m;
  if ((m = c.match(/^#([0-9a-f]{3,8})$/i))) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map(x => x + x).join('');
    const n = [0, 2, 4, 6].map(i => (i < h.length ? parseInt(h.slice(i, i + 2), 16) : 255));
    return { r: n[0], g: n[1], b: n[2], a: n[3] / 255 };
  }
  if ((m = c.match(/^rgba?\(([^)]+)\)$/i))) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  throw new Error(`Cannot parse colour ${c}`);
}
const over = (top, base) => ({ r: top.r * top.a + base.r * (1 - top.a), g: top.g * top.a + base.g * (1 - top.a), b: top.b * top.a + base.b * (1 - top.a), a: 1 });
const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
function ratio(fgName, bgName, mode, baseName = 'surface') {
  let bg = parse(sem(bgName, mode));
  if (bg.a < 1) bg = over(bg, parse(sem(baseName, mode)));
  let fg = parse(sem(fgName, mode));
  if (fg.a < 1) fg = over(fg, bg);
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return { ratio: (a + 0.05) / (b + 0.05), fg: hex(fg), bg: hex(bg) };
}

// ---------- the intended pairs ----------
// kind: text >= 4.5 · large >= 3 · ui (non-text component or state indicator) >= 3 · focus >= 3 ·
//       ordinal >= 2 (lightest sequential step, dataviz rule) · info (reported, no threshold)
const MIN = { text: 4.5, large: 3, ui: 3, focus: 3, ordinal: 2, info: 0 };
const PLANES = ['bg', 'surface', 'surface-2', 'surface-3', 'surface-raised', 'surface-overlay'];
const SELECTED = ['accent-soft', 'accent-soft-hover'];
const SOFTS = ['success-soft', 'warning-soft', 'danger-soft', 'info-soft'];
const FRAMES = ['neel', 'teal', 'ochre', 'rose', 'slate'].map(k => `frame-${k}`);
const pairs = [];
const add = (group, kind, fgs, bgs, note = '', only) => { for (const f of [].concat(fgs)) for (const b of [].concat(bgs)) pairs.push({ group, kind, fg: f, bg: b, note, only }); };

// Text
add('Neutral text', 'text', ['text', 'text-2', 'text-3'], [...PLANES, ...SELECTED, 'canvas', ...FRAMES], 'Body, secondary and tertiary text on every plane, selected rows, the canvas and frame tints');
add('Neutral text', 'text', ['text-2', 'text-3'], SOFTS, 'Meta inside notices and tinted rows');
add('Neutral text', 'text', 'text', 'text-selection', 'Selected text');
add('Accent text', 'text', 'accent-text', PLANES, 'Links, active nav icon, Neel text');
add('Accent text', 'text', 'link-hover', ['bg', 'surface', 'surface-2'], 'Link hover');
add('Accent text', 'text', 'accent-soft-text', SELECTED, 'Text on selection tint, {{variable}} chips, active phase segment');
add('Accent text', 'text', 'on-accent', ['accent', 'accent-hover', 'accent-press'], 'Primary button label, every state');
for (const s of ['success', 'warning', 'danger', 'info']) {
  add('Status text', 'text', `${s}-text`, [`${s}-soft`, 'bg', 'surface', 'surface-2'], `${s} tag / notice text, and inline status sentences`);
}
for (const s of ['success', 'warning', 'danger']) add('Status text', 'text', `on-${s}`, s, `Label on a filled ${s} badge or button`);
add('Inverse', 'text', ['text-inverse', 'text-inverse-2'], 'surface-inverse', 'Toasts and tooltips');
add('Baseline', 'text', ['bl-text', 'bl-strong', 'bl-warn'], 'bl-bg', 'The Baseline band');
add('Canvas', 'text', 'ink-tile-fg', 'ink-tile', 'Trigger glyph on the solid ink tile');
add('Brand', 'ui', 'mark-fg', 'mark-bg', 'The mark: strands on the Neel-ink tile');
add('Reported only', 'info', 'mark-bg', ['bg', 'surface'], 'Mark tile edge vs plane: in dark the tile dissolves into the plane and the white strands (16:1) carry the mark');
add('Large text', 'large', ['text', 'text-2', 'text-3'], ['bg', 'surface'], 'Display and title sizes (every text pair already clears 4.5)');

// Non-text UI
add('Controls', 'ui', 'control', [...PLANES, ...SELECTED], 'Input, checkbox and radio borders, off switch track (1.4.11)');
add('Controls', 'ui', 'on-accent', 'accent', 'Check glyph and switch thumb on the accent fill');
add('Focus', 'focus', 'focus', [...PLANES, ...SELECTED, ...SOFTS, 'canvas', ...FRAMES], '2 px outline, 2 px offset (2.4.7 / 2.4.11 / 1.4.11)');
add('Focus', 'focus', 'focus-inverse', 'surface-inverse', 'Focus inside toasts');
add('Focus', 'focus', 'bl-focus', 'bl-bg', 'Focus inside the Baseline');
add('Selection and indicators', 'ui', 'accent-mark', [...PLANES, ...SELECTED, 'canvas'], 'Selection borders and bars, active tab underline, progress fill, minimap viewport');
add('Selection and indicators', 'ui', 'live', [...PLANES, 'success-soft', ...SELECTED, 'bl-bg'], 'The live dot wherever it appears (always with the word "Live")');
add('Selection and indicators', 'ui', ['success', 'warning', 'danger'], [...PLANES, 'canvas'], 'State dots, node warning/error borders, field error borders');
add('Canvas', 'ui', ['edge', 'edge-active', 'control'], ['canvas', ...FRAMES], 'Connections, sockets and the dashed fallback path');
add('Data viz', 'ui', ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-other'], 'surface', 'Categorical marks (charts sit on --surface)');
add('Data viz', 'ui', 'chart-neutral', ['surface', 'surface-2'], 'Single-series and ranked marks; also over the surface-2 hover band');
add('Data viz', 'ui', ['sentiment-positive', 'sentiment-neutral', 'sentiment-mixed', 'sentiment-negative'], 'surface', 'Sentiment marks (with icon and word)');
add('Data viz', 'ui', 'chart-highlight', ['surface', 'surface-2'], 'The hovered, focused or selected datum: the only Neel inside a chart');
add('Data viz', 'ui', ['talk-agent', 'talk-caller'], ['surface', 'surface-2'], 'Talk strip lanes: segments on the surface-2 lane track');
add('Data viz', 'ordinal', 'seq-1', 'surface', 'Lightest sequential step still reads as a mark');
for (let i = 1; i <= 5; i++) add('Data viz', 'text', `seq-${i}-fg`, `seq-${i}`, 'Value label inside a sequential (heatmap) cell');

// Component colours (component.*, 1.1.0)
add('Navigation', 'text', ['text', 'text-2'], ['nav-hover-bg', 'nav-active-bg'], 'Nav item labels on the hovered and current keys');
add('Navigation', 'text', 'accent-text', 'nav-active-bg', 'The active nav icon on the current key');
add('Navigation', 'focus', 'focus', ['nav-hover-bg', 'nav-active-bg'], 'Focus on a hovered or current nav item');
add('Controls', 'text', 'on-danger', 'danger-hover', 'Solid destructive button label on hover');
add('Canvas', 'ui', 'edge-hover', ['canvas', ...FRAMES], 'Hovered connector and connectors of the selection');
add('Compare', 'ui', 'diff-changed-bar', ['diff-changed-bg', 'surface'], 'The 2 px bar on a changed step or row (with the word "Changed")');
add('Compare', 'text', ['text', 'text-2', 'text-3'], 'diff-changed-bg', 'Text on a changed step or row');
add('Compare', 'text', 'diff-added-fg', 'diff-added-bg', '"Added" tag and text on an added step or row');
add('Compare', 'text', 'diff-removed-fg', 'diff-removed-bg', '"Removed" tag and text on a removed step or row');
add('Tokens', 'text', 'variable-fg', 'variable-bg', '{{variable}} chips');
add('Utility', 'text', 'qr-fg', 'qr-bg', 'UPI QR modules on the quiet zone (fixed in both themes)');

// Reported only (documented exemptions)
add('Reported only', 'info', 'text-dis', ['surface', 'surface-2'], 'Disabled text is exempt (1.4.3); always paired with a reason');
add('Reported only', 'info', ['border', 'border-strong', 'border-overlay'], 'surface', 'Hairlines are structural decoration, not component identifiers');
add('Reported only', 'info', 'accent', ['surface', 'bg'], 'Primary fill vs plane: the label and check glyph carry identity and state');
add('Reported only', 'info', 'canvas-dot', 'canvas', 'Canvas texture, decorative');

// ---------- run ----------
const rows = [];
for (const mode of MODES) for (const p of pairs) {
  if (p.only && p.only !== mode) continue;
  const r = ratio(p.fg, p.bg, mode);
  const min = MIN[p.kind];
  rows.push({ mode, group: p.group, kind: p.kind, note: p.note, tokFg: p.fg, tokBg: p.bg, fg: r.fg, bg: r.bg, ratio: r.ratio, min, pass: p.kind === 'info' ? null : r.ratio >= min - 1e-9 });
}
const failures = rows.filter(r => r.pass === false);
const required = rows.filter(r => r.pass !== null);

if (args.includes('--json')) { console.log(JSON.stringify(rows, null, 2)); process.exit(failures.length ? 1 : 0); }

// ---------- report ----------
const f2 = n => n.toFixed(2);
const lines = [];
lines.push('# Contrast report', '');
lines.push(`Generated by \`spec/tokens/check-contrast.mjs\` from \`tokens.json\`. WCAG 2.x relative-luminance contrast. Alpha colours are composited over their plane first.`, '');
lines.push(`**Result: ${failures.length ? `${failures.length} FAILURES` : 'all required pairs pass'}** · ${required.length} required pairs checked (${required.filter(r => r.mode === 'light').length} light, ${required.filter(r => r.mode === 'dark').length} dark) · ${rows.length - required.length} reported only.`, '');
lines.push('| Kind | Threshold | Meaning |', '|---|---:|---|',
  '| text | 4.5:1 | Any text below 24 px (or 18.66 px bold). Every text pair in the system is held to this, so size never decides legibility. |',
  '| large | 3:1 | Text at 24 px+ (display and title-24 roles). |',
  '| ui | 3:1 | Component boundaries and state indicators (WCAG 1.4.11). |',
  '| focus | 3:1 | Focus outline against the plane it sits on (2.4.7, 2.4.11). |',
  '| ordinal | 2:1 | Lightest step of the sequential ramp against the chart surface (dataviz rule). |',
  '| info | none | Reported for the record: disabled text, hairlines, decorative texture, fills whose meaning is carried by a label. |', '');

// Tightest required pair per kind and mode: the pairs to watch when a value changes.
lines.push('## Tightest pairs', '', '| Mode | Kind | Pair | Ratio | Threshold |', '|---|---|---|---:|---:|');
for (const mode of MODES) {
  const req = rows.filter(r => r.mode === mode && r.pass !== null);
  for (const k of ['text', 'ui', 'focus', 'ordinal']) {
    const w = req.filter(r => r.kind === k).sort((a, b) => a.ratio / a.min - b.ratio / b.min)[0];
    if (w) lines.push(`| ${mode} | ${k} | \`--${w.tokFg}\` on \`--${w.tokBg}\` | ${f2(w.ratio)} | ${w.min} |`);
  }
}
lines.push('');

if (failures.length) {
  lines.push('## Failures', '', '| Mode | Foreground | Background | Kind | Ratio | Needs |', '|---|---|---|---|---:|---:|');
  for (const r of failures) lines.push(`| ${r.mode} | \`--${r.tokFg}\` ${r.fg} | \`--${r.tokBg}\` ${r.bg} | ${r.kind} | ${f2(r.ratio)} | ${r.min} |`);
  lines.push('');
}

for (const mode of MODES) {
  lines.push(`## ${mode === 'light' ? 'Light' : 'Dark'} theme`, '');
  let group = null;
  for (const r of rows.filter(x => x.mode === mode)) {
    if (r.group !== group) {
      group = r.group;
      lines.push('', `### ${group}`, '', '| Foreground | Background | Kind | Ratio | Result | Use |', '|---|---|---|---:|---|---|');
    }
    const res = r.pass === null ? 'reported' : r.pass ? 'pass' : '**FAIL**';
    lines.push(`| \`--${r.tokFg}\` ${r.fg} | \`--${r.tokBg}\` ${r.bg} | ${r.kind} | ${f2(r.ratio)} | ${res} | ${r.note} |`);
  }
  lines.push('');
}
writeFileSync(outPath, lines.join('\n') + '\n');
console.log(`${required.length} required pairs, ${failures.length} failures. Report: ${outPath}`);
for (const r of failures) console.log(`FAIL ${r.mode} --${r.tokFg} on --${r.tokBg}: ${f2(r.ratio)} < ${r.min}`);
process.exit(failures.length ? 1 : 0);
