"""Add a visible 'superseded sketch' notice to spec mocks that still use pre-consolidation CSS.

Run from anywhere:  python spec/_tools/mark_superseded.py
Only mocks that fail components/check-mocks.mjs are marked; the notice points to the
canonical prototype page(s).
"""
import os
import re
import subprocess

SPEC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP = {
    '00-direction-specimen.html': ['components.html'],
    '05-responsive-flow.html': ['flow-designer.html'],
    '05-responsive-shell.html': ['index.html'],
    '06-accessibility.html': ['components.html'],
    '07-motion-microinteractions.html': ['components.html'],
    '03-pages/00-app-shell-ia.html': ['index.html'],
    '03-pages/01-agent-cockpit.html': ['cockpit.html'],
    '03-pages/02-assistant.html': ['assistant.html'],
    '03-pages/03-leads.html': ['leads.html'],
    '03-pages/04-call-reports-analytics.html': ['call-reports.html', 'analytics.html'],
    '03-pages/05-knowledge-billing.html': ['knowledge.html', 'billing.html'],
    '03-pages/06-settings.html': ['settings.html'],
    '03-pages/07-meeting-personal-agents.html': ['agents.html'],
    '03-pages/08-public-auth.html': ['login.html'],
    '04-flow-designer/02-config-validation-lifecycle.html': ['flow-designer.html'],
}


def main():
    out = subprocess.run(['node', os.path.join(SPEC, 'components', 'check-mocks.mjs')], cwd=SPEC,
                         capture_output=True, text=True, encoding='utf-8').stdout
    failing = {m.group(1).strip() for m in re.finditer(r'^FAIL (.+)$', out, re.M)}
    for rel, targets in MAP.items():
        if rel not in failing:
            print('skip (passes check-mocks):', rel)
            continue
        path = os.path.join(SPEC, rel)
        with open(path, encoding='utf-8') as f:
            html = f.read()
        if 'data-superseded-note' in html:
            print('already marked:', rel)
            continue
        up = '../' * (rel.count('/') + 1)
        links = ' · '.join(
            '<a href="{0}prototype/{1}" style="color:inherit;font-weight:600">prototype/{1}</a>'.format(up, t)
            for t in targets)
        note = ('<div data-superseded-note role="note" style="position:sticky;top:0;z-index:9999;margin:0;'
                'padding:8px 16px;font:13px/1.4 system-ui,sans-serif;background:#FFF4D6;color:#5A3E00;'
                'border-bottom:1px solid #E5C77A">Spec sketch drawn before the component layer was '
                'consolidated. Its styling is illustrative only. The canonical implementation is '
                + links + ', built on spec/components/components.css.</div>')
        m = re.search(r'<body\b[^>]*>', html)
        if not m:
            print('NO <body> found:', rel)
            continue
        new = html[:m.end()] + note + html[m.end():]
        with open(path, 'w', encoding='utf-8', newline='') as f:
            f.write(new)
        print('marked:', rel)


if __name__ == '__main__':
    main()
