#!/usr/bin/env node
// Vaani Labs · token build. No dependencies.
// Reads tokens.json (canonical) and writes:
//   tokens.css           CSS custom properties: primitives, light/dark semantics, aliases, density, layout, motion
//   tailwind.theme.css   Tailwind v4 native mapping (@theme / @theme inline / @custom-variant dark)
//   tailwind.preset.js   Tailwind preset (v3, or v4 via @config) mapping utilities to the same variables
//   foundations.html     refreshes the inline token manifest between the TOKEN-MANIFEST markers (if the file exists)
// Usage: node build-tokens.mjs            (then: node check-contrast.mjs)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const T = JSON.parse(readFileSync(join(here, 'tokens.json'), 'utf8'));
const HEADER = '/* Vaani Labs design tokens. GENERATED from tokens.json by build-tokens.mjs. Do not edit by hand. */';

// ---------- helpers ----------
const get = p => p.split('.').reduce((o, k) => (o ? o[k] : undefined), T);
const isRef = v => typeof v === 'string' && /^\{.+\}$/.test(v);
const darkOf = t => t.$extensions?.['in.vaanilabs.modes']?.dark;
const entries = g => Object.entries(g).filter(([k]) => !k.startsWith('$'));
function refToVar(path) {
  const p = path.split('.');
  if (p[0] === 'color') return p.length === 2 ? `var(--${p[1]})` : `var(--${p[1]}-${p[2]})`;
  if (p[0] === 'semantic' && p[1] === 'color') return `var(--${p[2]})`;
  throw new Error(`No CSS mapping for {${path}}`);
}
const cssVal = v => (isRef(v) ? refToVar(v.slice(1, -1)) : v);
function resolveHex(v, mode) { // for the manifest
  while (isRef(v)) { const t = get(v.slice(1, -1)); const d = darkOf(t); v = mode === 'dark' && d !== undefined ? d : t.$value; }
  return v;
}
const shadowCss = arr => arr.map(s => `${s.inset ? 'inset ' : ''}${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`).join(', ');
const q = f => (/^[a-z-]+$/i.test(f) ? f : `"${f}"`);
const FAMILY_VAR = { 'Hanken Grotesk': '--font-hanken', 'Vaani Rupee': '--font-rupee', 'Noto Sans Devanagari': '--font-noto-deva', 'JetBrains Mono': '--font-jetbrains' };
const familyCss = list => list.map(f => (FAMILY_VAR[f] ? `var(${FAMILY_VAR[f]}, ${q(f)})` : q(f))).join(', ');
const decl = (name, value) => `  --${name}: ${value};`;

// ---------- collect ----------
const prim = [];
for (const [fam, g] of entries(T.color)) {
  if ('$value' in g) { prim.push(decl(fam, g.$value)); continue; }
  for (const [k, t] of entries(g)) prim.push(decl(`${fam}-${k}`, t.$value));
}
const semColor = entries(T.semantic.color);
const canon = semColor.filter(([, t]) => !t.$extensions?.['in.vaanilabs.alias']);
const aliases = semColor.filter(([, t]) => t.$extensions?.['in.vaanilabs.alias']);
// component.<group>.<css-name>: colours are theme-split (emitted in the theme blocks), everything else goes to :root.
// The token register that lists them is spec/01-foundations.md §18.
const compGroups = entries(T.component || {});
const compAll = compGroups.flatMap(([g, grp]) => entries(grp).map(([k, t]) => ({ g, k, t, type: t.$type || grp.$type, gdesc: grp.$description })));
const compColors = compAll.filter(c => c.type === 'color');
const compStatic = compAll.filter(c => c.type !== 'color');
const lightSem = [...canon.map(([k, t]) => decl(k, cssVal(t.$value))), '  /* component colours (component.*) */', ...compColors.map(c => decl(c.k, cssVal(c.t.$value)))];
const darkSem = [...canon.map(([k, t]) => decl(k, cssVal(darkOf(t) ?? t.$value))), '  /* component colours (component.*) */', ...compColors.map(c => decl(c.k, cssVal(darkOf(c.t) ?? c.t.$value)))];
const shadowsL = entries(T.semantic.shadow).map(([k, t]) => decl(k, shadowCss(t.$value)));
const shadowsD = entries(T.semantic.shadow).map(([k, t]) => decl(k, shadowCss(darkOf(t) ?? t.$value)));
const aliasDecl = aliases.map(([k, t]) => decl(k, cssVal(t.$value)));

const stat = [];
stat.push('  /* type */', decl('font-sans', familyCss(T.font.family.sans.$value)), decl('font-mono', familyCss(T.font.family.mono.$value)));
for (const [k, t] of entries(T.font.weight)) stat.push(decl(`fw-${k}`, t.$value));
const roles = entries(T.typography);
for (const [k, t] of roles) {
  const v = t.$value, fam = v.fontFamily.includes('mono') ? 'var(--font-mono)' : 'var(--font-sans)';
  if (t.$deprecated) stat.push(`  /* deprecated: ${t.$deprecated} */`);
  stat.push(decl(`type-${k}-size`, v.fontSize), decl(`type-${k}-lh`, v.lineHeight), decl(`type-${k}-weight`, v.fontWeight), decl(`type-${k}-tracking`, v.letterSpacing),
    decl(`type-${k}`, `var(--type-${k}-weight) var(--type-${k}-size)/var(--type-${k}-lh) ${fam}`));
}
const scale = (label, group, prefix, fmt = v => v) => { stat.push(`  /* ${label} */`); for (const [k, t] of entries(group)) stat.push(decl(`${prefix}${k}`, fmt(t.$value))); };
scale('space (4 px base)', T.space, 'space-');
scale('space roles', T['space-role'], 'space-');
scale('radius', T.radius, 'radius-');
stat.push('  /* border widths and focus */');
for (const [k, t] of entries(T['border-width'])) stat.push(decl(k.startsWith('focus') ? k.replace('focus-', 'focus-').replace(/^focus$/, 'focus-width') : `bw-${k}`, t.$value));
scale('layout sizes', T.size, 'size-');
scale('breakpoints (reference for JS; media queries use literals)', T.breakpoint, 'bp-');
scale('z-index layers', T.z, 'z-');
scale('opacity (graphics only, never on an ancestor of text)', T.opacity, 'opacity-');
scale('motion', T.duration, 'dur-');
stat.push(decl('ease-standard', `cubic-bezier(${T.easing.standard.$value.join(', ')})`));
scale('behavioural timing', T.timing, 'timing-');
scale('entrance offsets', T['motion-shift'], 'shift-');
scale('icons', T.icon, 'icon-');
for (const [g, grp] of compGroups) {
  const items = compStatic.filter(c => c.g === g);
  if (!items.length) continue;
  stat.push(`  /* component.${g}: ${(grp.$description || '').replace(/\*\//g, '')} */`);
  for (const c of items) stat.push(decl(c.k, c.t.$value));
}
// One name, one place (01-foundations §18): a CSS name emitted twice in :root, or a component colour that
// shadows a semantic colour, is a build error.
{
  const seen = new Map();
  for (const line of [...prim, ...stat]) { const m = line.match(/^ {2}--([a-z0-9-]+):/); if (!m) continue; if (seen.has(m[1])) throw new Error(`Duplicate token --${m[1]} (register it once, 01-foundations §18)`); seen.set(m[1], true); }
  for (const c of compColors) if (T.semantic.color[c.k]) throw new Error(`component colour --${c.k} shadows semantic.color.${c.k}`);
}

const dens = m => entries(T.density[m]).map(([k, t]) => decl({ row: 'row-h', control: 'control-h', 'control-sm': 'control-h-sm', 'cell-px': 'cell-px', tag: 'tag-h', 'field-font': 'field-font' }[k], k === 'field-font' ? `${parseInt(t.$value) / 16}rem` : t.$value));
const typeResp = key => roles.flatMap(([k, t]) => { const r = t.$extensions?.['in.vaanilabs.type']?.responsive?.[key]; return r ? [decl(`type-${k}-size`, `${r[0] / 16}rem`), decl(`type-${k}-lh`, `${r[1] / 16}rem`), decl(`type-${k}`, `var(--type-${k}-weight) var(--type-${k}-size)/var(--type-${k}-lh) var(--font-sans)`)] : []; });
const compResp = key => compStatic.flatMap(c => { const r = c.t.$extensions?.['in.vaanilabs.responsive']?.[key]; return r !== undefined ? [decl(c.k, r)] : []; });
// Reduced motion: the media query and the in-app preference (data-motion="reduce", 07-motion MD4) emit the same block.
const reducedMotion = [decl('shift-popover', '0px'), decl('shift-dialog', '0px'), decl('shift-toast', '0px'), decl('shift-sheet', '0%'), decl('dur-trace', '0ms'), decl('dur-pulse', '0ms'), decl('dur-spin', '0ms'), decl('live-pulse-cycles', '0')];

// ---------- tokens.css ----------
const block = (sel, lines) => `${sel} {\n${lines.join('\n')}\n}`;
const css = [
  HEADER,
  '/* Load order: tokens.css, then base.css (global rules), then the app. Themes: set data-theme="light|dark" on <html>',
  '   before first paint (pre-hydration script); the prefers-color-scheme block is the no-JS fallback only. */',
  '',
  block(':root', ['  /* primitives: colour */', ...prim, ...stat]),
  '',
  '/* Light theme (default) */',
  block(':root,\n[data-theme="light"]', [...lightSem, '  /* elevation */', ...shadowsL, '  color-scheme: light;']),
  '',
  '/* Dark theme */',
  block('[data-theme="dark"]', [...darkSem, '  /* elevation: ring-free shadows; overlays carry --border-overlay */', ...shadowsD, '  color-scheme: dark;']),
  '',
  '/* No-JS fallback: follow the OS until the pre-hydration script sets data-theme */',
  '@media (prefers-color-scheme: dark) {\n' + block(':root:not([data-theme="light"])', [...darkSem, ...shadowsD, '  color-scheme: dark;']).replace(/^/gm, '  ') + '\n}',
  '',
  '/* Role aliases. Re-declared on every scope that can change theme or surface, because a custom property',
  '   that references another is resolved where it is declared, not where it is used. */',
  block(':root,\n[data-theme],\n[data-surface]', aliasDecl),
  '',
  '/* Content placed on an inverse plane (toasts, tooltips) */',
  block('[data-surface="inverse"]', [decl('text', 'var(--text-inverse)'), decl('text-2', 'var(--text-inverse-2)'), decl('text-3', 'var(--text-inverse-2)'), decl('accent-text', 'var(--text-inverse)'), decl('focus', 'var(--focus-inverse)')]),
  '',
  '/* Density: data surfaces only. Forms, dialogs and the inspector set data-density="standard". */',
  block(':root,\n[data-density="standard"]', dens('standard')),
  block('[data-density="compact"]', dens('compact')),
  '@media (pointer: coarse), (max-width: 767.98px) {\n' + block(':root,\n[data-density]', dens('touch')).replace(/^/gm, '  ') + '\n}',
  '',
  '/* Page grid and responsive type */',
  block(':root', [decl('page-margin', '24px'), decl('grid-gutter', '24px'), decl('grid-columns', '12')]),
  '@media (max-width: 1023.98px) {\n' + block(':root', [decl('grid-gutter', '16px'), decl('grid-columns', '8')]).replace(/^/gm, '  ') + '\n}',
  '@media (min-width: 768px) and (max-width: 1023.98px) {\n' + block(':root', [...typeResp('md-lg'), ...compResp('md-lg')]).replace(/^/gm, '  ') + '\n}',
  '@media (max-width: 767.98px) {\n' + block(':root', [decl('page-margin', '16px'), decl('grid-gutter', '12px'), decl('grid-columns', '4'), ...typeResp('lt-md'), ...compResp('lt-md')]).replace(/^/gm, '  ') + '\n}',
  '/* Short viewports: the Baseline folds into a header chip (spec/00-design-direction.md §6.1) */',
  '@media (max-height: 720px) {\n' + block(':root', [decl('size-baseline', '0px')]).replace(/^/gm, '  ') + '\n}',
  '',
  '/* Reduced motion: no movement, no loops; opacity fades and instant state changes remain */',
  '@media (prefers-reduced-motion: reduce) {\n' + block(':root', reducedMotion).replace(/^/gm, '  ') + '\n}',
  '/* The in-app Motion preference (Account menu: Match system / Reduce motion) applies the same values */',
  block(':root[data-motion="reduce"]', reducedMotion),
  '',
].join('\n');
writeFileSync(join(here, 'tokens.css'), css);

// ---------- Tailwind key names ----------
const TW_SKIP_ALIAS = /^(bg-subtle|bg-muted|text-|focus-ring|accent-subtle|accent-fg|link$|success-fg|success-bg|warning-fg|warning-bg|danger-fg|danger-bg|info-fg|info-bg)/;
function twKey(name) {
  if (name === 'bg') return 'page';
  if (name === 'text') return 'fg';
  if (/^text-/.test(name)) return name.replace(/^text-/, 'fg-');
  if (name === 'border') return 'line';
  if (/^border-/.test(name)) return name.replace(/^border-/, 'line-');
  return name.replace(/-text$/, '-fg').replace(/-border$/, '-line');
}
const twColors = [...canon.map(([k]) => k), ...aliases.map(([k]) => k).filter(k => !TW_SKIP_ALIAS.test(k)), ...compColors.map(c => c.k)];
const spacingKeys = { 0: 0, px: 1, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 10: 40, 12: 48, 14: 56, 16: 64, 20: 80, 24: 96 };

// ---------- tailwind.theme.css (v4) ----------
const th = [HEADER, '/* Tailwind v4: @import "tailwindcss"; @import "./tokens.css"; @import "./base.css"; @import "./tailwind.theme.css"; */', '',
  '@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));', '',
  '/* Static scales: literals identical to tokens.css (no var() here, so no self-reference) */', '@theme {',
  '  --color-*: initial;', '  --font-*: initial;', '  --text-*: initial;', '  --radius-*: initial;', '  --shadow-*: initial;', '  --ease-*: initial;', '  --breakpoint-*: initial;',
  '  --spacing: 4px;',
  `  --font-sans: ${familyCss(T.font.family.sans.$value)};`, `  --font-mono: ${familyCss(T.font.family.mono.$value)};`,
  ...entries(T.font.weight).map(([k, t]) => `  --font-weight-${k}: ${t.$value};`),
  ...roles.flatMap(([k, t]) => { const v = t.$value; return [`  --text-${k}: ${v.fontSize};`, `  --text-${k}--line-height: ${v.lineHeight};`, `  --text-${k}--letter-spacing: ${v.letterSpacing};`, `  --text-${k}--font-weight: ${v.fontWeight};`]; }),
  ...entries(T.radius).map(([k, t]) => `  --radius-${k}: ${t.$value};`),
  '  --radius-tag: 4px;', '  --radius-control: 6px;', '  --radius-panel: 8px;', '  --radius-dialog: 12px;',
  ...entries(T.breakpoint).map(([k, t]) => `  --breakpoint-${k}: ${t.$value};`),
  `  --ease-standard: cubic-bezier(${T.easing.standard.$value.join(', ')});`,
  `  --default-transition-duration: ${T.duration.base.$value};`, `  --default-transition-timing-function: cubic-bezier(${T.easing.standard.$value.join(', ')});`,
  '}', '',
  '/* Theme-dependent values: utilities read the live CSS variable, so data-theme switches them */', '@theme inline {',
  ...twColors.map(k => `  --color-${twKey(k)}: var(--${k});`),
  '  --color-transparent: transparent;', '  --color-current: currentColor;',
  ...entries(T.semantic.shadow).map(([k]) => `  --shadow-${k}: var(--${k});`),
  '  /* sizing utilities (h-row, w-sidebar, size-icon ...) and containers (max-w-form ...) */',
  ...[['row', 'row-h'], ['control', 'control-h'], ['control-sm', 'control-h-sm'], ['tag', 'tag-h'], ['header', 'size-header'], ['baseline', 'size-baseline'],
    ['topbar', 'size-topbar'], ['bottombar', 'size-bottombar'], ['sidebar', 'size-sidebar'], ['rail', 'size-rail'], ['inspector', 'size-inspector'],
    ['sheet-record', 'size-sheet-record'], ['sheet-detail', 'size-sheet-detail'], ['sheet-gate', 'size-sheet-gate'], ['settings-nav', 'size-settings-nav'],
    ['hit', 'size-hit-min'], ['touch', 'size-hit-touch'], ['icon-xs', 'icon-xs'], ['icon-sm', 'icon-sm'], ['icon', 'icon-md'], ['icon-lg', 'icon-lg'], ['icon-xl', 'icon-xl'],
  ].map(([k, v]) => `  --spacing-${k}: var(--${v});`),
  ...['narrow', 'form', 'page'].map(k => `  --container-${k}: var(--size-container-${k});`),
  '  --container-measure: var(--size-measure);',
  '  /* v4 has no theme namespace for z-index, duration or opacity: use z-(--z-chrome), duration-(--dur-fast), opacity-(--opacity-dim) */',
  '}', ''].join('\n');
writeFileSync(join(here, 'tailwind.theme.css'), th);

// ---------- tailwind.preset.js ----------
const obj = pairs => Object.fromEntries(pairs);
const preset = {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    screens: obj(entries(T.breakpoint).map(([k, t]) => [k, t.$value])),
    colors: { transparent: 'transparent', current: 'currentColor', inherit: 'inherit', ...obj(twColors.map(k => [twKey(k), `var(--${k})`])) },
    spacing: obj(Object.entries(spacingKeys).map(([k, px]) => [k, px === 1 ? 'var(--space-1)' : `var(--space-${px})`])),
    fontFamily: { sans: 'var(--font-sans)', mono: 'var(--font-mono)' },
    fontWeight: obj(entries(T.font.weight).map(([k]) => [k, `var(--fw-${k})`])),
    fontSize: obj(roles.map(([k]) => [k, [`var(--type-${k}-size)`, { lineHeight: `var(--type-${k}-lh)`, letterSpacing: `var(--type-${k}-tracking)`, fontWeight: `var(--type-${k}-weight)` }]])),
    borderRadius: { none: '0px', ...obj(entries(T.radius).filter(([k]) => k !== '0').map(([k]) => [k, `var(--radius-${k})`])), tag: 'var(--radius-4)', control: 'var(--radius-6)', panel: 'var(--radius-8)', dialog: 'var(--radius-12)' },
    borderWidth: { DEFAULT: 'var(--bw-hairline)', 0: '0px', 1: 'var(--bw-hairline)', 2: 'var(--bw-strong)' },
    outlineWidth: { 2: 'var(--focus-width)' },
    outlineOffset: { 2: 'var(--focus-offset)', 3: 'var(--focus-offset-node)', '-2': 'var(--focus-offset-inset)' },
    boxShadow: obj(entries(T.semantic.shadow).map(([k]) => [k, `var(--${k})`])),
    zIndex: obj(entries(T.z).map(([k]) => [k, `var(--z-${k})`])),
    opacity: { 0: '0', 100: '1', ...obj(entries(T.opacity).map(([k]) => [k, `var(--opacity-${k})`])) },
    transitionDuration: { 0: '0ms', fast: 'var(--dur-fast)', DEFAULT: 'var(--dur-base)', base: 'var(--dur-base)', slow: 'var(--dur-slow)' },
    transitionTimingFunction: { DEFAULT: 'var(--ease-standard)', standard: 'var(--ease-standard)' },
    extend: {
      width: { sidebar: 'var(--size-sidebar)', rail: 'var(--size-rail)', inspector: 'var(--size-inspector)', 'sheet-record': 'var(--size-sheet-record)', 'sheet-detail': 'var(--size-sheet-detail)', 'sheet-gate': 'var(--size-sheet-gate)', 'settings-nav': 'var(--size-settings-nav)' },
      height: { header: 'var(--size-header)', baseline: 'var(--size-baseline)', topbar: 'var(--size-topbar)', bottombar: 'var(--size-bottombar)', row: 'var(--row-h)', control: 'var(--control-h)', 'control-sm': 'var(--control-h-sm)', tag: 'var(--tag-h)' },
      minHeight: { hit: 'var(--size-hit-min)', touch: 'var(--size-hit-touch)' },
      maxWidth: { narrow: 'var(--size-container-narrow)', form: 'var(--size-container-form)', page: 'var(--size-container-page)', measure: 'var(--size-measure)' },
      size: { 'icon-xs': 'var(--icon-xs)', 'icon-sm': 'var(--icon-sm)', icon: 'var(--icon-md)', 'icon-lg': 'var(--icon-lg)', 'icon-xl': 'var(--icon-xl)' },
    },
  },
};
const presetJs = `${HEADER.replace('/*', '/**').replace('*/', '')}
 * Tailwind v3: presets: [require('./tailwind.preset.js')]. Tailwind v4: prefer tailwind.theme.css; or @config "./tailwind.config.js" that lists this preset.
 * Colours are CSS variables from tokens.css, so the theme switches with data-theme. Opacity modifiers (bg-accent/50) are
 * deliberately not supported: no alpha on text or state colours (spec/01-foundations.md).
 * Keys: bg -> page, text -> fg, border -> line, *-text -> *-fg, *-border -> *-line. Example: "bg-surface-2 text-fg-3 border-line-strong".
 */
/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(preset, null, 2)};
`;
writeFileSync(join(here, 'tailwind.preset.js'), presetJs);

// ---------- manifest for foundations.html ----------
const spec = join(here, 'foundations.html');
if (existsSync(spec)) {
  const manifest = {
    primitives: entries(T.color).map(([fam, g]) => ({ fam, desc: g.$description, steps: '$value' in g ? [{ k: fam, v: g.$value }] : entries(g).map(([k, t]) => ({ k, v: t.$value, d: t.$description || '' })) })),
    semantic: canon.map(([k, t]) => ({ k, d: t.$description, l: resolveHex(t.$value, 'light'), dk: resolveHex(darkOf(t) ?? t.$value, 'dark'), lr: isRef(t.$value) ? t.$value.slice(1, -1).replace(/^(color|semantic\.color)\./, '') : '', dr: isRef(darkOf(t) ?? t.$value) ? (darkOf(t) ?? t.$value).slice(1, -1).replace(/^(color|semantic\.color)\./, '') : '' })),
    aliases: aliases.map(([k, t]) => ({ k, to: t.$value.slice(1, -1).replace('semantic.color.', '') })),
    type: roles.map(([k, t]) => ({ k, d: t.$description, ...t.$value, ext: t.$extensions?.['in.vaanilabs.type'] })),
    space: entries(T.space).map(([k, t]) => ({ k, v: t.$value })), spaceRole: entries(T['space-role']).map(([k, t]) => ({ k, v: t.$value, d: t.$description })),
    radius: entries(T.radius).map(([k, t]) => ({ k, v: t.$value, d: t.$description || '' })),
    shadow: entries(T.semantic.shadow).map(([k, t]) => ({ k, d: t.$description, l: shadowCss(t.$value), dk: shadowCss(darkOf(t) ?? t.$value) })),
    z: entries(T.z).map(([k, t]) => ({ k, v: t.$value, d: t.$description || '' })), opacity: entries(T.opacity).map(([k, t]) => ({ k, v: t.$value, d: t.$description })),
    duration: entries(T.duration).map(([k, t]) => ({ k, v: t.$value, d: t.$description || '' })), timing: entries(T.timing).map(([k, t]) => ({ k, v: t.$value, d: t.$description || '' })),
    size: entries(T.size).map(([k, t]) => ({ k, v: t.$value, d: t.$description || '' })), breakpoint: entries(T.breakpoint).map(([k, t]) => ({ k, v: t.$value, d: t.$description })),
    grid: entries(T.grid).map(([k, t]) => ({ k, ...t.$value })), density: ['standard', 'compact', 'touch'].map(m => ({ m, d: T.density[m].$description, v: obj(entries(T.density[m]).map(([k, t]) => [k, t.$value])) })),
    icon: entries(T.icon).map(([k, t]) => ({ k, v: t.$value, d: t.$description || '' })), borderWidth: entries(T['border-width']).map(([k, t]) => ({ k, v: t.$value, d: t.$description || '' })),
    component: compAll.map(c => ({ g: c.g, k: c.k, type: c.type, l: c.type === 'color' ? resolveHex(c.t.$value, 'light') : c.t.$value, dk: c.type === 'color' ? resolveHex(darkOf(c.t) ?? c.t.$value, 'dark') : '', d: c.t.$description || '' })),
    interaction: entries(T.interaction || {}).map(([k, t]) => ({ k, v: t.$value, d: t.$description || '' })),
    meta: T.$extensions?.['in.vaanilabs.meta'] || {},
  };
  const html = readFileSync(spec, 'utf8');
  const re = /(<script id="token-manifest" type="application\/json">)[\s\S]*?(<\/script>)/;
  if (re.test(html)) writeFileSync(spec, html.replace(re, `$1${JSON.stringify(manifest).replace(/</g, '\\u003c')}$2`));
}
console.log(`tokens.css (${css.length} chars), tailwind.theme.css, tailwind.preset.js written; ${canon.length} semantic colours, ${aliases.length} aliases, ${roles.length} type roles, ${compAll.length} component tokens (${compColors.length} colours), ${entries(T.interaction || {}).length} interaction constants.`);
