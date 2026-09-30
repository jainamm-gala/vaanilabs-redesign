#!/usr/bin/env node
// Vaani Labs prototype · token guard. No dependencies. Usage: node prototype/_tools/check-tokens.mjs [--list] [--quiet]
// Adapted from spec/components/check-mocks.mjs for the prototype. Exit 1 when any file breaks a rule:
//   1. LINKS       every page (prototype/*.html) links assets/tokens.css → assets/base.css → assets/components.css, in that
//                  order, before any page stylesheet; no other shared stylesheet is linked.
//   2. COMPONENTS  pages/*.css and <style> blocks never re-implement a component: a rule whose subject compound uses a base
//                  class defined in assets/components.css may set layout only (margin*, flex*, order, align/justify/place-self,
//                  grid-row/column/area, width, min/max-width, height, min/max-height, position, inset, top/right/bottom/left,
//                  z-index, display:none).
//   3. SIGNATURES  signature tokens (--bl-*, --mark-*, --call-*-bg/fg/mark, --socket*) appear only in assets/components.css.
//   4. COLOURS     no hex / rgb() / hsl() literal that is not a value in assets/tokens.css, in any CSS, HTML or JS file.
//   5. LENGTHS     no raw px/rem/em length in CSS (components.css, base.css, pages/*.css, <style>, style="") outside @media and
//                  @container conditions: sizes are tokens or calc() of tokens. (JS may set runtime positions in px.)
//   6. HYGIENE     z-index uses a --z-* token (or a local 0–3), no `transition: all`, `!important` only in base.css,
//                  font-family literals only in tokens.css and base.css.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const proto = join(here, '..');
const rel = p => relative(proto, p).split(sep).join('/');
const args = process.argv.slice(2);
const read = p => readFileSync(p, 'utf8');

// ---------- CSS parsing (flat, good enough for hand-written files) ----------
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
function rules(css, ctx = '') {
  const out = []; css = stripComments(css); let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i); if (open < 0) break;
    const head = css.slice(i, open).trim();
    let depth = 1, k = open + 1;
    while (k < css.length && depth) { if (css[k] === '{') depth++; else if (css[k] === '}') depth--; k++; }
    const body = css.slice(open + 1, k - 1);
    if (/^@(media|supports|layer|container)/.test(head)) out.push(...rules(body, head));
    else if (/^@keyframes/.test(head)) out.push(...rules(body, head).map(r => ({ ...r, keyframe: true })));
    else if (!head.startsWith('@')) out.push({ sel: head, body, ctx });
    i = k;
  }
  return out;
}
const compoundsOf = sel => sel.split(/\s*(?:>|\+|~)\s*|\s+/).filter(Boolean);
const subjectOf = sel => { const c = compoundsOf(sel); return c[c.length - 1] || ''; };
const classesIn = s => [...s.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map(x => x[1]);
const baseOf = compound => (/^\./.test(compound) ? classesIn(compound)[0] : undefined);
const declsOf = body => body.split(';').map(d => d.trim()).filter(Boolean).map(d => { const i = d.indexOf(':'); return [d.slice(0, i).trim().toLowerCase(), d.slice(i + 1).trim()]; });

const componentsPath = join(proto, 'assets', 'components.css');
const componentsCss = read(componentsPath);
const reserved = new Set();
for (const r of rules(componentsCss)) for (const part of r.sel.split(',')) for (const c of compoundsOf(part.trim())) { const b = baseOf(c); if (b) reserved.add(b); }
for (const c of [...reserved]) if (/^(is-|l-|u-|type-)/.test(c)) reserved.delete(c);

const LAYOUT = new Set(['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin-inline', 'margin-block', 'margin-inline-start',
  'margin-inline-end', 'margin-block-start', 'margin-block-end', 'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'order', 'align-self', 'justify-self',
  'place-self', 'grid-row', 'grid-column', 'grid-area', 'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'position', 'inset',
  'top', 'right', 'bottom', 'left', 'z-index']);
const isLayoutOnly = body => declsOf(body).every(([p, v]) => LAYOUT.has(p) || (p === 'display' && /^none\b/.test(v)));
const SIGNATURE = /var\(--(bl-(?:bg|text|strong|sep|line|warn|focus)|mark-(?:bg|fg)|call-[a-z]+-(?:bg|fg|mark)|socket(?:-border)?)\)/;

// ---------- allowed colours: every literal in tokens.css ----------
const tokensCss = read(join(proto, 'assets', 'tokens.css'));
const normHex = h => { h = h.replace('#', '').toUpperCase(); if (h.length === 3 || h.length === 4) h = [...h].map(x => x + x).join(''); return '#' + h; };
const allowedHex = new Set([...tokensCss.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(x => normHex(x[0])));
const normFn = s => s.replace(/\s+/g, '').toLowerCase();
const allowedFn = new Set([...tokensCss.matchAll(/(?:rgba?|hsla?)\([^)]*\)/g)].map(x => normFn(x[0])));
function colourProblems(text, isJs) {
  const out = [];
  let scrubbed = text.replace(/\b(?:href|xlink:href|id|for|aria-controls|aria-labelledby|aria-describedby|data-[\w-]+)="[^"]*"/g, '').replace(/url\(#[^)]*\)/g, '');
  if (isJs) scrubbed = scrubbed.replace(/(['"])#[\w-]+\1/g, '').replace(/'#' \+/g, '');
  const bad = new Set([...scrubbed.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(x => x[0]).filter(h => /[0-9]/.test(h) || /^#[a-fA-F]{6}$/.test(h)).filter(h => !allowedHex.has(normHex(h))));
  for (const h of bad) out.push(`colour ${h} is not a token value`);
  const badFn = new Set([...scrubbed.matchAll(/(?:rgba?|hsla?)\([^)]*\)/g)].map(x => x[0]).filter(f => !allowedFn.has(normFn(f))));
  for (const f of badFn) out.push(`colour ${f} is not a token value`);
  return out;
}
const LEN = /(^|[^\w.#-])(-?\d*\.?\d+)(px|rem|em)\b/g;
function lengthProblems(css, where) {
  const out = []; const seen = new Set();
  for (const r of rules(css)) {
    if (r.keyframe) continue;
    for (const [p, v] of declsOf(r.body)) {
      if (p.startsWith('--')) continue;          // custom properties may alias tokens
      for (const m of v.matchAll(LEN)) { if (+m[2] === 0) continue; const key = `${p}: ${m[2]}${m[3]}`; if (!seen.has(key)) { seen.add(key); out.push(`raw length ${m[2]}${m[3]} in "${r.sel.slice(0, 50)} { ${p} }"${where ? ' (' + where + ')' : ''}`); } }
    }
  }
  return out;
}
function hygiene(css, file) {
  const out = [];
  for (const r of rules(css)) for (const [p, v] of declsOf(r.body)) {
    if (p === 'z-index' && !/var\(--z-|calc\(/.test(v) && !/^[0-3]$/.test(v)) out.push(`z-index ${v} is not a --z-* token ("${r.sel.slice(0, 40)}")`);
    if (p === 'transition' && /\ball\b/.test(v)) out.push(`transition: all in "${r.sel.slice(0, 40)}"`);
    if (/!important/.test(v) && !/base\.css$/.test(file)) out.push(`!important in "${r.sel.slice(0, 40)} { ${p} }"`);
    if (p === 'font-family' && !/var\(--font-/.test(v) && !/(base|tokens)\.css$/.test(file) && v !== 'inherit') out.push(`font-family literal "${v}" in "${r.sel.slice(0, 40)}"`);
  }
  return out;
}
function componentProblems(css) {
  const out = []; const seen = new Set();
  for (const { sel, body } of rules(css)) {
    for (const part of sel.split(',')) {
      const hit = classesIn(subjectOf(part.trim())).find(c => reserved.has(c));
      if (hit && !isLayoutOnly(body) && !seen.has(hit)) { seen.add(hit); out.push(`re-implements component .${hit} ("${part.trim().slice(0, 60)}")`); }
    }
    const sig = body.match(SIGNATURE);
    if (sig && !seen.has('sig:' + sig[1])) { seen.add('sig:' + sig[1]); out.push(`uses signature token --${sig[1]} outside components.css ("${sel.slice(0, 50)}")`); }
  }
  return out;
}

// ---------- scope ----------
const files = [];
const add = (dir, ext) => { const d = join(proto, dir); if (!existsSync(d)) return; for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isFile() && ext.some(e => f.endsWith(e))) files.push(p); } };
add('.', ['.html']); add('pages', ['.css', '.js']); add('assets', ['.css', '.js']);

const report = [];
for (const file of files) {
  const r = rel(file), text = read(file), problems = [];
  if (r === 'assets/tokens.css') continue;
  if (r.endsWith('.html')) {
    const links = [...text.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(x => x[1]).filter(h => !/^https?:/.test(h));
    const order = ['assets/tokens.css', 'assets/base.css', 'assets/components.css'];
    const idx = order.map(o => links.indexOf(o));
    order.forEach((o, i) => { if (idx[i] < 0) problems.push(`does not link ${o}`); });
    if (idx.every(i => i >= 0) && (idx[0] !== 0 || idx[1] !== 1 || idx[2] !== 2)) problems.push('links tokens.css, base.css and components.css out of order, or a stylesheet before them');
    for (const l of links.slice(3)) if (!/^pages\/[\w-]+\.css$/.test(l)) problems.push(`links ${l}; only pages/<page>.css may follow the shared stylesheets`);
    const css = [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(x => x[1]).join('\n');
    problems.push(...componentProblems(css), ...lengthProblems(css, '<style>'), ...hygiene(css, r));
    for (const m of text.matchAll(/style="([^"]*)"/g)) { for (const l of m[1].matchAll(LEN)) if (+l[2] !== 0) problems.push(`raw length ${l[2]}${l[3]} in style="${m[1].slice(0, 50)}"`); }
    problems.push(...colourProblems(text.replace(/<symbol[\s\S]*?<\/symbol>/g, ''), false));
  } else if (r.endsWith('.css')) {
    if (r.startsWith('pages/')) problems.push(...componentProblems(text));
    if (r !== 'assets/components.css') { const sig = rules(text).find(x => SIGNATURE.test(x.body)); if (sig && !r.startsWith('pages/')) problems.push(`uses a signature token outside components.css ("${sig.sel.slice(0, 50)}")`); }
    problems.push(...lengthProblems(text), ...hygiene(text, r), ...colourProblems(stripComments(text), false));
  } else if (r.endsWith('.js')) {
    problems.push(...colourProblems(text.replace(/<symbol[\s\S]*?<\/symbol>/g, ''), true));
  }
  report.push({ file: r, problems });
}

const bad = report.filter(x => x.problems.length);
if (args.includes('--list')) console.log(`${reserved.size} reserved component classes: ${[...reserved].sort().join(' ')}\n`);
for (const x of report) {
  if (args.includes('--quiet') && !x.problems.length) continue;
  console.log(`${x.problems.length ? 'FAIL' : 'ok  '} ${x.file}${x.problems.length ? `\n  - ${x.problems.slice(0, 40).join('\n  - ')}${x.problems.length > 40 ? `\n  … and ${x.problems.length - 40} more` : ''}` : ''}`);
}
console.log(`\n${report.length} files checked, ${bad.length} failing, ${bad.reduce((n, x) => n + x.problems.length, 0)} problems.`);
process.exit(bad.length ? 1 : 0);
