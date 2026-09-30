/** Vaani Labs design tokens. GENERATED from tokens.json by build-tokens.mjs. Do not edit by hand. 
 * Tailwind v3: presets: [require('./tailwind.preset.js')]. Tailwind v4: prefer tailwind.theme.css; or @config "./tailwind.config.js" that lists this preset.
 * Colours are CSS variables from tokens.css, so the theme switches with data-theme. Opacity modifiers (bg-accent/50) are
 * deliberately not supported: no alpha on text or state colours (spec/01-foundations.md).
 * Keys: bg -> page, text -> fg, border -> line, *-text -> *-fg, *-border -> *-line. Example: "bg-surface-2 text-fg-3 border-line-strong".
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  "darkMode": [
    "selector",
    "[data-theme=\"dark\"]"
  ],
  "theme": {
    "screens": {
      "sm": "480px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1440px"
    },
    "colors": {
      "transparent": "transparent",
      "current": "currentColor",
      "inherit": "inherit",
      "page": "var(--bg)",
      "surface": "var(--surface)",
      "surface-2": "var(--surface-2)",
      "surface-3": "var(--surface-3)",
      "surface-raised": "var(--surface-raised)",
      "surface-overlay": "var(--surface-overlay)",
      "surface-inverse": "var(--surface-inverse)",
      "line": "var(--border)",
      "line-strong": "var(--border-strong)",
      "line-overlay": "var(--border-overlay)",
      "control": "var(--control)",
      "fg": "var(--text)",
      "fg-2": "var(--text-2)",
      "fg-3": "var(--text-3)",
      "fg-dis": "var(--text-dis)",
      "fg-inverse": "var(--text-inverse)",
      "fg-inverse-2": "var(--text-inverse-2)",
      "accent": "var(--accent)",
      "accent-hover": "var(--accent-hover)",
      "accent-press": "var(--accent-press)",
      "on-accent": "var(--on-accent)",
      "accent-fg": "var(--accent-text)",
      "accent-soft": "var(--accent-soft)",
      "accent-soft-hover": "var(--accent-soft-hover)",
      "accent-soft-fg": "var(--accent-soft-text)",
      "accent-mark": "var(--accent-mark)",
      "link-hover": "var(--link-hover)",
      "focus": "var(--focus)",
      "focus-inverse": "var(--focus-inverse)",
      "fg-selection": "var(--text-selection)",
      "success": "var(--success)",
      "success-fg": "var(--success-text)",
      "success-soft": "var(--success-soft)",
      "success-line": "var(--success-border)",
      "on-success": "var(--on-success)",
      "warning": "var(--warning)",
      "warning-fg": "var(--warning-text)",
      "warning-soft": "var(--warning-soft)",
      "warning-line": "var(--warning-border)",
      "on-warning": "var(--on-warning)",
      "danger": "var(--danger)",
      "danger-fg": "var(--danger-text)",
      "danger-soft": "var(--danger-soft)",
      "danger-line": "var(--danger-border)",
      "on-danger": "var(--on-danger)",
      "live": "var(--live)",
      "bl-bg": "var(--bl-bg)",
      "bl-fg": "var(--bl-text)",
      "bl-strong": "var(--bl-strong)",
      "bl-sep": "var(--bl-sep)",
      "bl-line": "var(--bl-line)",
      "bl-warn": "var(--bl-warn)",
      "bl-focus": "var(--bl-focus)",
      "canvas": "var(--canvas)",
      "canvas-dot": "var(--canvas-dot)",
      "edge": "var(--edge)",
      "edge-active": "var(--edge-active)",
      "ink-tile": "var(--ink-tile)",
      "ink-tile-fg": "var(--ink-tile-fg)",
      "mark-bg": "var(--mark-bg)",
      "mark-fg": "var(--mark-fg)",
      "scrim": "var(--scrim)",
      "chart-1": "var(--chart-1)",
      "chart-2": "var(--chart-2)",
      "chart-3": "var(--chart-3)",
      "chart-4": "var(--chart-4)",
      "chart-other": "var(--chart-other)",
      "chart-grid": "var(--chart-grid)",
      "chart-axis": "var(--chart-axis)",
      "seq-1": "var(--seq-1)",
      "seq-2": "var(--seq-2)",
      "seq-3": "var(--seq-3)",
      "seq-4": "var(--seq-4)",
      "seq-5": "var(--seq-5)",
      "seq-1-fg": "var(--seq-1-fg)",
      "seq-2-fg": "var(--seq-2-fg)",
      "seq-3-fg": "var(--seq-3-fg)",
      "seq-4-fg": "var(--seq-4-fg)",
      "seq-5-fg": "var(--seq-5-fg)",
      "sentiment-positive": "var(--sentiment-positive)",
      "sentiment-neutral": "var(--sentiment-neutral)",
      "sentiment-mixed": "var(--sentiment-mixed)",
      "sentiment-negative": "var(--sentiment-negative)",
      "frame-neel": "var(--frame-neel)",
      "frame-neel-line": "var(--frame-neel-border)",
      "frame-teal": "var(--frame-teal)",
      "frame-teal-line": "var(--frame-teal-border)",
      "frame-ochre": "var(--frame-ochre)",
      "frame-ochre-line": "var(--frame-ochre-border)",
      "frame-rose": "var(--frame-rose)",
      "frame-rose-line": "var(--frame-rose-border)",
      "frame-slate": "var(--frame-slate)",
      "frame-slate-line": "var(--frame-slate-border)",
      "talk-agent": "var(--talk-agent)",
      "talk-caller": "var(--talk-caller)",
      "info": "var(--info)",
      "info-fg": "var(--info-text)",
      "info-soft": "var(--info-soft)",
      "info-line": "var(--info-border)",
      "chart-neutral": "var(--chart-neutral)",
      "selection-bg": "var(--selection-bg)",
      "selection-line": "var(--selection-border)",
      "row-hover": "var(--row-hover)",
      "row-selected": "var(--row-selected)",
      "row-selected-hover": "var(--row-selected-hover)",
      "row-selected-bar": "var(--row-selected-bar)",
      "skeleton": "var(--skeleton)",
      "seq-empty": "var(--seq-empty)",
      "chart-label": "var(--chart-label)",
      "socket": "var(--socket)",
      "socket-line": "var(--socket-border)",
      "call-idle-fg": "var(--call-idle-fg)",
      "call-idle-bg": "var(--call-idle-bg)",
      "call-idle-mark": "var(--call-idle-mark)",
      "call-dialling-fg": "var(--call-dialling-fg)",
      "call-dialling-bg": "var(--call-dialling-bg)",
      "call-dialling-mark": "var(--call-dialling-mark)",
      "call-ringing-fg": "var(--call-ringing-fg)",
      "call-ringing-bg": "var(--call-ringing-bg)",
      "call-ringing-mark": "var(--call-ringing-mark)",
      "call-live-fg": "var(--call-live-fg)",
      "call-live-bg": "var(--call-live-bg)",
      "call-live-mark": "var(--call-live-mark)",
      "call-hold-fg": "var(--call-hold-fg)",
      "call-hold-bg": "var(--call-hold-bg)",
      "call-hold-mark": "var(--call-hold-mark)",
      "call-wrapup-fg": "var(--call-wrapup-fg)",
      "call-wrapup-bg": "var(--call-wrapup-bg)",
      "call-wrapup-mark": "var(--call-wrapup-mark)",
      "call-ended-fg": "var(--call-ended-fg)",
      "call-ended-bg": "var(--call-ended-bg)",
      "call-ended-mark": "var(--call-ended-mark)",
      "call-failed-fg": "var(--call-failed-fg)",
      "call-failed-bg": "var(--call-failed-bg)",
      "call-failed-mark": "var(--call-failed-mark)",
      "chart-highlight": "var(--chart-highlight)",
      "diff-added-bg": "var(--diff-added-bg)",
      "diff-added-fg": "var(--diff-added-fg)",
      "diff-removed-bg": "var(--diff-removed-bg)",
      "diff-removed-fg": "var(--diff-removed-fg)",
      "diff-changed-bg": "var(--diff-changed-bg)",
      "diff-changed-bar": "var(--diff-changed-bar)",
      "variable-bg": "var(--variable-bg)",
      "variable-fg": "var(--variable-fg)",
      "nav-hover-bg": "var(--nav-hover-bg)",
      "nav-active-bg": "var(--nav-active-bg)",
      "nav-active-line": "var(--nav-active-border)",
      "danger-hover": "var(--danger-hover)",
      "qr-fg": "var(--qr-fg)",
      "qr-bg": "var(--qr-bg)",
      "edge-hover": "var(--edge-hover)"
    },
    "spacing": {
      "0": "var(--space-0)",
      "1": "var(--space-4)",
      "2": "var(--space-8)",
      "3": "var(--space-12)",
      "4": "var(--space-16)",
      "5": "var(--space-20)",
      "6": "var(--space-24)",
      "7": "var(--space-28)",
      "8": "var(--space-32)",
      "10": "var(--space-40)",
      "12": "var(--space-48)",
      "14": "var(--space-56)",
      "16": "var(--space-64)",
      "20": "var(--space-80)",
      "24": "var(--space-96)",
      "px": "var(--space-1)",
      "0.5": "var(--space-2)",
      "1.5": "var(--space-6)",
      "2.5": "var(--space-10)"
    },
    "fontFamily": {
      "sans": "var(--font-sans)",
      "mono": "var(--font-mono)"
    },
    "fontWeight": {
      "regular": "var(--fw-regular)",
      "medium": "var(--fw-medium)",
      "semibold": "var(--fw-semibold)"
    },
    "fontSize": {
      "display-56": [
        "var(--type-display-56-size)",
        {
          "lineHeight": "var(--type-display-56-lh)",
          "letterSpacing": "var(--type-display-56-tracking)",
          "fontWeight": "var(--type-display-56-weight)"
        }
      ],
      "display-40": [
        "var(--type-display-40-size)",
        {
          "lineHeight": "var(--type-display-40-lh)",
          "letterSpacing": "var(--type-display-40-tracking)",
          "fontWeight": "var(--type-display-40-weight)"
        }
      ],
      "title-24": [
        "var(--type-title-24-size)",
        {
          "lineHeight": "var(--type-title-24-lh)",
          "letterSpacing": "var(--type-title-24-tracking)",
          "fontWeight": "var(--type-title-24-weight)"
        }
      ],
      "title-20": [
        "var(--type-title-20-size)",
        {
          "lineHeight": "var(--type-title-20-lh)",
          "letterSpacing": "var(--type-title-20-tracking)",
          "fontWeight": "var(--type-title-20-weight)"
        }
      ],
      "title-16": [
        "var(--type-title-16-size)",
        {
          "lineHeight": "var(--type-title-16-lh)",
          "letterSpacing": "var(--type-title-16-tracking)",
          "fontWeight": "var(--type-title-16-weight)"
        }
      ],
      "title-14": [
        "var(--type-title-14-size)",
        {
          "lineHeight": "var(--type-title-14-lh)",
          "letterSpacing": "var(--type-title-14-tracking)",
          "fontWeight": "var(--type-title-14-weight)"
        }
      ],
      "num-28": [
        "var(--type-num-28-size)",
        {
          "lineHeight": "var(--type-num-28-lh)",
          "letterSpacing": "var(--type-num-28-tracking)",
          "fontWeight": "var(--type-num-28-weight)"
        }
      ],
      "num-20": [
        "var(--type-num-20-size)",
        {
          "lineHeight": "var(--type-num-20-lh)",
          "letterSpacing": "var(--type-num-20-tracking)",
          "fontWeight": "var(--type-num-20-weight)"
        }
      ],
      "lead-16": [
        "var(--type-lead-16-size)",
        {
          "lineHeight": "var(--type-lead-16-lh)",
          "letterSpacing": "var(--type-lead-16-tracking)",
          "fontWeight": "var(--type-lead-16-weight)"
        }
      ],
      "body-16": [
        "var(--type-body-16-size)",
        {
          "lineHeight": "var(--type-body-16-lh)",
          "letterSpacing": "var(--type-body-16-tracking)",
          "fontWeight": "var(--type-body-16-weight)"
        }
      ],
      "read-15": [
        "var(--type-read-15-size)",
        {
          "lineHeight": "var(--type-read-15-lh)",
          "letterSpacing": "var(--type-read-15-tracking)",
          "fontWeight": "var(--type-read-15-weight)"
        }
      ],
      "read-15-deva": [
        "var(--type-read-15-deva-size)",
        {
          "lineHeight": "var(--type-read-15-deva-lh)",
          "letterSpacing": "var(--type-read-15-deva-tracking)",
          "fontWeight": "var(--type-read-15-deva-weight)"
        }
      ],
      "body-14": [
        "var(--type-body-14-size)",
        {
          "lineHeight": "var(--type-body-14-lh)",
          "letterSpacing": "var(--type-body-14-tracking)",
          "fontWeight": "var(--type-body-14-weight)"
        }
      ],
      "button-14": [
        "var(--type-button-14-size)",
        {
          "lineHeight": "var(--type-button-14-lh)",
          "letterSpacing": "var(--type-button-14-tracking)",
          "fontWeight": "var(--type-button-14-weight)"
        }
      ],
      "label-13": [
        "var(--type-label-13-size)",
        {
          "lineHeight": "var(--type-label-13-lh)",
          "letterSpacing": "var(--type-label-13-tracking)",
          "fontWeight": "var(--type-label-13-weight)"
        }
      ],
      "data-13": [
        "var(--type-data-13-size)",
        {
          "lineHeight": "var(--type-data-13-lh)",
          "letterSpacing": "var(--type-data-13-tracking)",
          "fontWeight": "var(--type-data-13-weight)"
        }
      ],
      "meta-12": [
        "var(--type-meta-12-size)",
        {
          "lineHeight": "var(--type-meta-12-lh)",
          "letterSpacing": "var(--type-meta-12-tracking)",
          "fontWeight": "var(--type-meta-12-weight)"
        }
      ],
      "label-12": [
        "var(--type-label-12-size)",
        {
          "lineHeight": "var(--type-label-12-lh)",
          "letterSpacing": "var(--type-label-12-tracking)",
          "fontWeight": "var(--type-label-12-weight)"
        }
      ],
      "phase-12": [
        "var(--type-phase-12-size)",
        {
          "lineHeight": "var(--type-phase-12-lh)",
          "letterSpacing": "var(--type-phase-12-tracking)",
          "fontWeight": "var(--type-phase-12-weight)"
        }
      ],
      "mono-20": [
        "var(--type-mono-20-size)",
        {
          "lineHeight": "var(--type-mono-20-lh)",
          "letterSpacing": "var(--type-mono-20-tracking)",
          "fontWeight": "var(--type-mono-20-weight)"
        }
      ],
      "mono-13": [
        "var(--type-mono-13-size)",
        {
          "lineHeight": "var(--type-mono-13-lh)",
          "letterSpacing": "var(--type-mono-13-tracking)",
          "fontWeight": "var(--type-mono-13-weight)"
        }
      ],
      "mono-12": [
        "var(--type-mono-12-size)",
        {
          "lineHeight": "var(--type-mono-12-lh)",
          "letterSpacing": "var(--type-mono-12-tracking)",
          "fontWeight": "var(--type-mono-12-weight)"
        }
      ],
      "display-48": [
        "var(--type-display-48-size)",
        {
          "lineHeight": "var(--type-display-48-lh)",
          "letterSpacing": "var(--type-display-48-tracking)",
          "fontWeight": "var(--type-display-48-weight)"
        }
      ]
    },
    "borderRadius": {
      "2": "var(--radius-2)",
      "4": "var(--radius-4)",
      "6": "var(--radius-6)",
      "8": "var(--radius-8)",
      "12": "var(--radius-12)",
      "none": "0px",
      "full": "var(--radius-full)",
      "tag": "var(--radius-4)",
      "control": "var(--radius-6)",
      "panel": "var(--radius-8)",
      "dialog": "var(--radius-12)"
    },
    "borderWidth": {
      "0": "0px",
      "1": "var(--bw-hairline)",
      "2": "var(--bw-strong)",
      "DEFAULT": "var(--bw-hairline)"
    },
    "outlineWidth": {
      "2": "var(--focus-width)"
    },
    "outlineOffset": {
      "2": "var(--focus-offset)",
      "3": "var(--focus-offset-node)",
      "-2": "var(--focus-offset-inset)"
    },
    "boxShadow": {
      "e0": "var(--e0)",
      "e1": "var(--e1)",
      "e2": "var(--e2)",
      "e3": "var(--e3)"
    },
    "zIndex": {
      "base": "var(--z-base)",
      "raised": "var(--z-raised)",
      "sticky": "var(--z-sticky)",
      "chrome": "var(--z-chrome)",
      "float": "var(--z-float)",
      "overlay": "var(--z-overlay)",
      "scrim": "var(--z-scrim)",
      "modal": "var(--z-modal)",
      "popover": "var(--z-popover)",
      "toast": "var(--z-toast)",
      "tooltip": "var(--z-tooltip)",
      "skiplink": "var(--z-skiplink)"
    },
    "opacity": {
      "0": "0",
      "100": "1",
      "dim": "var(--opacity-dim)",
      "partial": "var(--opacity-partial)",
      "unreachable": "var(--opacity-unreachable)",
      "drag": "var(--opacity-drag)"
    },
    "transitionDuration": {
      "0": "0ms",
      "fast": "var(--dur-fast)",
      "DEFAULT": "var(--dur-base)",
      "base": "var(--dur-base)",
      "slow": "var(--dur-slow)"
    },
    "transitionTimingFunction": {
      "DEFAULT": "var(--ease-standard)",
      "standard": "var(--ease-standard)"
    },
    "extend": {
      "width": {
        "sidebar": "var(--size-sidebar)",
        "rail": "var(--size-rail)",
        "inspector": "var(--size-inspector)",
        "sheet-record": "var(--size-sheet-record)",
        "sheet-detail": "var(--size-sheet-detail)",
        "sheet-gate": "var(--size-sheet-gate)",
        "settings-nav": "var(--size-settings-nav)"
      },
      "height": {
        "header": "var(--size-header)",
        "baseline": "var(--size-baseline)",
        "topbar": "var(--size-topbar)",
        "bottombar": "var(--size-bottombar)",
        "row": "var(--row-h)",
        "control": "var(--control-h)",
        "control-sm": "var(--control-h-sm)",
        "tag": "var(--tag-h)"
      },
      "minHeight": {
        "hit": "var(--size-hit-min)",
        "touch": "var(--size-hit-touch)"
      },
      "maxWidth": {
        "narrow": "var(--size-container-narrow)",
        "form": "var(--size-container-form)",
        "page": "var(--size-container-page)",
        "measure": "var(--size-measure)"
      },
      "size": {
        "icon-xs": "var(--icon-xs)",
        "icon-sm": "var(--icon-sm)",
        "icon": "var(--icon-md)",
        "icon-lg": "var(--icon-lg)",
        "icon-xl": "var(--icon-xl)"
      }
    }
  }
};
