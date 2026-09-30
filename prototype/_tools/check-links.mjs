#!/usr/bin/env node
// Vaani Labs prototype · link check. No dependencies. Usage: node prototype/_tools/check-links.mjs [--verbose]
// Exit 1 when a local link does not resolve. What it checks:
//   1. HTML   every href / src / srcset / data-back-href / xlink:href in every prototype/*.html resolves to a file on disk
//             (query and fragment stripped; external schemes skipped). Same-page "#id" targets must exist in the file,
//             unless the page renders them at runtime (listed as notes with --verbose).
//   2. JS     every quoted "<page>.html…" reference in assets/*.js and pages/*.js names a page that exists.
//   3. ROUTES links into hash- and view-routed pages name a route the page knows: settings.html#<page>[/<section>],
//             billing.html#<tab>, agents.html?view=<view>, knowledge.html?view=<view> (read from the page's own data files).
// Folders starting with "_" (tools, screenshots, notes) and the spec are not scanned.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const proto = resolve(here, '..');
const rel = p => relative(proto, p).split(sep).join('/');
const verbose = process.argv.includes('--verbose');
const read = p => readFileSync(p, 'utf8');
const list = dir => (existsSync(dir) ? readdirSync(dir) : []);

const htmlFiles = list(proto).filter(f => f.endsWith('.html')).map(f => join(proto, f));
const jsFiles = ['assets', 'pages'].flatMap(d => list(join(proto, d)).filter(f => f.endsWith('.js')).map(f => join(proto, d, f)));
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;   // http:, https:, mailto:, tel:, data:, javascript:, protocol-relative

// ---------- known routes, read from the pages' own sources so the check follows the pages ----------
function settingsRoutes() {
  const f = join(proto, 'pages', 'settings-data.js'); if (!existsSync(f)) return null;
  const s = read(f), ids = new Set();
  const nav = s.slice(s.indexOf('SD.nav'), s.indexOf('SD.subPages'));
  for (const m of nav.matchAll(/\{ id: '([a-z0-9-]+)', label: '[^']+', icon:/g)) ids.add(m[1]);
  const sub = s.match(/SD\.subPages = \{([^;]*)\};/); if (sub) for (const m of sub[1].matchAll(/'([a-z0-9-]+)': \{/g)) ids.add(m[1]);
  const red = s.match(/SD\.redirects = \{([\s\S]*?)\};/); if (red) for (const m of red[1].matchAll(/'([a-z0-9/-]+)': '/g)) ids.add(m[1].split('/')[0]);
  return ids;
}
function billingRoutes() {
  const f = join(proto, 'pages', 'billing.js'); if (!existsSync(f)) return null;
  const m = read(f).match(/var TABS = \[([^\]]*)\]/); return m ? new Set([...m[1].matchAll(/'([a-z-]+)'/g)].map(x => x[1])) : null;
}
const ROUTES = {
  'settings.html': { kind: 'hash', ids: settingsRoutes() },
  'billing.html': { kind: 'hash', ids: billingRoutes() },
  'agents.html': { kind: 'view', ids: new Set(['meetings', 'personal-agents', 'agent-settings']) },
  'knowledge.html': { kind: 'view', ids: new Set(['sources', 'proposals']) }
};

const problems = [], notes = [];
let checked = 0;
function checkRoute(file, target, where) {
  const r = ROUTES[file]; if (!r || !r.ids) return;
  const q = target.indexOf('?'), h = target.indexOf('#');
  if (r.kind === 'hash' && h >= 0) {
    const route = target.slice(h + 1).split(/[?/]/)[0];
    if (route && !r.ids.has(route)) problems.push(`${where}: ${target} → unknown ${file} route #${route}`);
  }
  if (r.kind === 'view' && q >= 0) {
    const view = new URLSearchParams(target.slice(q + 1, h > q ? h : undefined)).get('view');
    if (view && !r.ids.has(view)) problems.push(`${where}: ${target} → unknown ${file} view "${view}"`);
  }
}
function checkLocal(fromFile, url, where) {
  checked += 1;
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return;   // pure query or fragment: same document
  const target = resolve(dirname(fromFile), decodeURIComponent(clean));
  if (!existsSync(target)) { problems.push(`${where}: ${url} → missing ${rel(target)}`); return; }
  if (statSync(target).isDirectory()) problems.push(`${where}: ${url} → is a folder`);
  const base = clean.split('/').pop();
  if (ROUTES[base]) checkRoute(base, url, where);
}

// ---------- 1. HTML ----------
const ATTR = /\s(href|src|srcset|data-back-href|xlink:href|poster)\s*=\s*("([^"]*)"|'([^']*)')/gi;
for (const file of htmlFiles) {
  const raw = read(file);
  const html = raw.replace(/<!--[\s\S]*?-->/g, '');                       // comments are documentation, not links
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, m => m.replace(/>[\s\S]*<\/script>/i, '></script>'));  // inline script text is checked as JS
  const ids = new Set([...html.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)].map(m => m[1]));
  for (const m of body.matchAll(ATTR)) {
    const attr = m[1].toLowerCase(), value = (m[3] ?? m[4] ?? '').trim();
    if (!value || EXTERNAL.test(value) || value.includes('{') || value.includes("' +")) continue;
    const urls = attr === 'srcset' ? value.split(',').map(x => x.trim().split(/\s+/)[0]) : [value];
    for (const u of urls) {
      const where = `${rel(file)} [${attr}]`;
      if (u.startsWith('#')) {
        checked += 1; const id = u.slice(1), self = file.split(sep).pop();
        if (id && ids.has(id)) continue;
        if (ROUTES[self] && ROUTES[self].kind === 'hash') { checkRoute(self, self + u, where); continue; }
        if (id && !ids.has(id)) (attr === 'href' && /^#(g-|main$)/.test(u) ? problems : notes).push(`${where}: ${u} → no element with that id in the static HTML (may be rendered at runtime)`);
        continue;
      }
      checkLocal(file, u, where);
    }
  }
}

// ---------- 2. JS (and inline scripts): quoted page references ----------
const PAGE_REF = /["'`](?:\.\/)?([a-z0-9][a-z0-9-]*\.html)((?:[?#][^"'`\s<>]*)?)["'`]/gi;
const HREF_IN_STRING = /href=\\?["']([a-z0-9][a-z0-9-]*\.html(?:[?#][^"'\\\s<>]*)?)\\?["']/gi;
const sources = jsFiles.map(f => [f, read(f)]).concat(htmlFiles.map(f => [f, [...read(f).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n')]));
for (const [file, text] of sources) {
  const seen = new Set();
  const refs = [...text.matchAll(PAGE_REF)].map(m => m[1] + (m[2] || '')).concat([...text.matchAll(HREF_IN_STRING)].map(m => m[1]));
  for (const ref of refs) {
    if (seen.has(ref)) continue; seen.add(ref);
    checkLocal(join(proto, 'x.html'), ref, `${rel(file)} (string)`);
  }
}

// ---------- report ----------
const uniq = a => [...new Set(a)];
const P = uniq(problems), N = uniq(notes);
if (verbose && N.length) { console.log('Notes (not failures):'); N.forEach(n => console.log('  · ' + n)); console.log(''); }
if (P.length) { console.log(`Broken links (${P.length}):`); P.forEach(p => console.log('  ✗ ' + p)); }
console.log(`\n${htmlFiles.length} HTML files and ${jsFiles.length} scripts scanned, ${checked} local references checked, ${P.length} broken${N.length ? `, ${N.length} runtime-only fragment note${N.length === 1 ? '' : 's'}` : ''}.`);
process.exit(P.length ? 1 : 0);
