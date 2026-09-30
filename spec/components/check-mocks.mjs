#!/usr/bin/env node
// Vaani Labs · mock guard. No dependencies. Usage: node spec/components/check-mocks.mjs [--list] [--quiet]
// Wire it into CI next to spec/tokens/check-contrast.mjs. Exit 1 when any HTML mock:
//   1. LINKS: does not link ../tokens/tokens.css, ../tokens/base.css and components/components.css, in that order,
//      or still links a retired shared stylesheet (shell-partials.css, flow-grammar.css).
//   2. RE-IMPLEMENTS A COMPONENT: a rule in a <style> block whose subject compound selector uses a component base
//      class of components.css (for example .btn, .tag, .bl, .node, .gate) and sets anything other than layout.
//      Layout placement of a component inside a page is allowed: margin*, flex / flex-grow / flex-shrink / flex-basis,
//      order, align-self, justify-self, place-self, grid-row, grid-column, grid-area, width, min-width, max-width,
//      position, inset, top, right, bottom, left, z-index, and display:none (hiding at a breakpoint).
//      Modifier classes (.btn--primary, .is-selected) are not base classes; defining them in a mock is caught only
//      when the compound also uses the base class.
//   3. REDRAWS A SIGNATURE: a mock rule uses a signature token that only components.css may use (the Baseline's
//      --bl-*, the mark's --mark-*, the call-state --call-*-bg/fg, the socket's --socket*). That catches a
//      component re-implemented under a different class name.
//   4. USES A NON-TOKEN COLOUR anywhere in the file: a hex (#abc, #aabbcc, #aabbccdd) or rgb()/rgba()/hsl() literal
//      that is not a value in tokens.css. Hex inside href="#…", id="…" and url(#…) references is ignored.
// Why: the canonical render is only canonical if every mock draws components from one file
// (spec/00-design-direction.md §8.1).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const spec = join(here, '..');
const rel = p => relative(spec, p).split(sep).join('/');
const args = process.argv.slice(2);

// ---------- CSS parsing (flat: good enough for our hand-written files) ----------
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
function rules(css) {                     // [{ sel, body }] for every style rule, including those inside @media/@supports
  const out = [];
  css = stripComments(css);
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) break;
    const head = css.slice(i, open).trim();
    let depth = 1, k = open + 1;
    while (k < css.length && depth) { if (css[k] === '{') depth++; else if (css[k] === '}') depth--; k++; }
    const body = css.slice(open + 1, k - 1);
    if (/^@(media|supports|layer|container)/.test(head)) out.push(...rules(body));
    else if (!head.startsWith('@') && !/^(from|to|\d+%)(\s*,\s*(from|to|\d+%))*$/.test(head)) out.push({ sel: head, body });
    i = k;
  }
  return out;
}
const compoundsOf = sel => sel.split(/\s*(?:>|\+|~)\s*|\s+/).filter(Boolean);
const subjectOf = sel => { const c = compoundsOf(sel); return c[c.length - 1] || ''; };
const classesIn = s => [...s.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map(x => x[1]);
// A base class is the first class of a compound that does not start with an element name (".btn", ".node").
// Later classes in the compound (".node.is-selected", ".gt.gt--ink") and classes after an element ("i.is-trigger")
// are modifiers.
const baseOf = compound => (/^\./.test(compound) ? classesIn(compound)[0] : undefined);

const componentsCss = readFileSync(join(here, 'components.css'), 'utf8');
const reserved = new Set();
for (const r of rules(componentsCss)) for (const part of r.sel.split(',')) for (const c of compoundsOf(part.trim())) { const b = baseOf(c); if (b) reserved.add(b); }
for (const c of [...reserved]) if (/^is-/.test(c)) reserved.delete(c);

const LAYOUT = new Set(['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin-inline', 'margin-block',
  'margin-inline-start', 'margin-inline-end', 'margin-block-start', 'margin-block-end', 'flex', 'flex-grow', 'flex-shrink', 'flex-basis',
  'order', 'align-self', 'justify-self', 'place-self', 'grid-row', 'grid-column', 'grid-area', 'width', 'min-width', 'max-width',
  'position', 'inset', 'top', 'right', 'bottom', 'left', 'z-index']);
const declsOf = body => body.split(';').map(d => d.trim()).filter(Boolean).map(d => { const i = d.indexOf(':'); return [d.slice(0, i).trim().toLowerCase(), d.slice(i + 1).trim()]; });
const isLayoutOnly = body => declsOf(body).every(([p, v]) => LAYOUT.has(p) || (p === 'display' && /^none\b/.test(v)));
const SIGNATURE = /var\(--(bl-(?:bg|text|strong|sep|line|warn|focus)|mark-(?:bg|fg)|call-[a-z]+-(?:bg|fg|mark)|socket(?:-border)?)\)/;

// ---------- allowed colours: every literal in tokens.css ----------
const tokensCss = readFileSync(join(spec, 'tokens', 'tokens.css'), 'utf8');
const normHex = h => { h = h.replace('#', '').toUpperCase(); if (h.length === 3 || h.length === 4) h = [...h].map(x => x + x).join(''); return '#' + h; };
const allowedHex = new Set([...tokensCss.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(x => normHex(x[0])));
const normFn = s => s.replace(/\s+/g, '').toLowerCase();
const allowedFn = new Set([...tokensCss.matchAll(/(?:rgba?|hsla?)\([^)]*\)/g)].map(x => normFn(x[0])));

// ---------- scope ----------
const SCOPE_DIRS = ['.', '03-pages', '04-flow-designer', 'components', 'brand', 'tokens'];
const TOKEN_SPECIMEN = 'tokens/foundations.html';   // draws token swatches, not components: link and colour checks only
const files = [];
for (const d of SCOPE_DIRS) {
  const dir = join(spec, d);
  for (const f of readdirSync(dir)) if (f.endsWith('.html') && statSync(join(dir, f)).isFile()) files.push(join(dir, f));
}

const report = [];
for (const file of files) {
  const r = rel(file);
  const html = readFileSync(file, 'utf8');
  if (!/<html[\s>]/i.test(html)) continue;   // fragments (brand/mark-symbol.html) are not documents
  const problems = [];
  // 1. links
  const links = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(x => x[1]).filter(h => !/^https?:/.test(h));
  const at = name => links.findIndex(h => h === name || h.endsWith('/' + name));
  const need = ['tokens.css', 'base.css'].concat(r === TOKEN_SPECIMEN ? [] : ['components.css']);
  const idx = need.map(at);
  need.forEach((n, i) => { if (idx[i] < 0) problems.push(`does not link ${n}`); });
  if (idx.every(i => i >= 0) && idx.some((v, i) => i && v < idx[i - 1])) problems.push('links tokens.css, base.css and components.css out of order');
  for (const old of ['shell-partials.css', 'flow-grammar.css']) if (at(old) >= 0) problems.push(`still links the retired ${old} (merged into components.css)`);
  // 2 and 3. inline rules
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(x => x[1]).join('\n');
  const seen = new Set();
  for (const { sel, body } of rules(css)) {
    if (r !== TOKEN_SPECIMEN) {
      for (const part of sel.split(',')) {
        const hit = classesIn(subjectOf(part.trim())).find(c => reserved.has(c));
        if (hit && !isLayoutOnly(body) && !seen.has(hit)) { seen.add(hit); problems.push(`re-implements component .${hit} inline ("${part.trim().slice(0, 60)}")`); }
      }
      const sig = body.match(SIGNATURE);
      if (sig && !seen.has('sig:' + sig[1])) { seen.add('sig:' + sig[1]); problems.push(`redraws a signature component: --${sig[1]} used in "${sel.slice(0, 50)}"`); }
    }
  }
  // 4. colours
  const scrubbed = html.replace(/\b(?:href|xlink:href|id|for|aria-controls|aria-labelledby|aria-describedby)="[^"]*"/g, '').replace(/url\(#[^)]*\)/g, '');
  const badHex = new Set([...scrubbed.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(x => x[0]).filter(h => /[0-9]/.test(h) || /^#[a-fA-F]{6}$/.test(h)).filter(h => !allowedHex.has(normHex(h))));
  for (const h of badHex) problems.push(`colour ${h} is not a token value`);
  const badFn = new Set([...scrubbed.matchAll(/(?:rgba?|hsla?)\([^)]*\)/g)].map(x => x[0]).filter(f => !allowedFn.has(normFn(f))));
  for (const f of badFn) problems.push(`colour ${f} is not a token value`);
  report.push({ file: r, problems });
}

const bad = report.filter(x => x.problems.length);
if (args.includes('--list')) console.log(`${reserved.size} component base classes: ${[...reserved].sort().join(' ')}\n`);
for (const x of report) {
  if (args.includes('--quiet') && !x.problems.length) continue;
  console.log(`${x.problems.length ? 'FAIL' : 'ok  '} ${x.file}${x.problems.length ? `\n  - ${x.problems.join('\n  - ')}` : ''}`);
}
console.log(`\n${report.length} mocks checked, ${bad.length} failing, ${bad.reduce((n, x) => n + x.problems.length, 0)} problems.`);
process.exit(bad.length ? 1 : 0);
