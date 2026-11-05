#!/usr/bin/env python3
"""check_links.py: every local link and image on every page must point at a file that exists.
Run from anywhere: python3 _site-tools/check_links.py"""
import glob, os, re, sys
from urllib.parse import unquote
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
bad = []
pages = [p for p in glob.glob('**/*.html', recursive=True) if not p.startswith('_')]
for p in pages:
    s = open(p, encoding='utf-8').read()
    s = re.sub(r'<script\b[^>]*>.*?</script>', '', s, flags=re.S)
    s = re.sub(r'<base [^>]*>', '', s)
    base = '' if p == '404.html' else os.path.dirname(p)   # 404 uses <base href="/">
    for attr, url in re.findall(r'\b(href|src)="([^"]+)"', s):
        if re.match(r'^(https?:|mailto:|tel:|sms:|data:|#|javascript:|//)', url):
            continue
        path = unquote(url.split('#')[0].split('?')[0])
        if not path:
            continue
        target = os.path.normpath(os.path.join(base, path))
        if path.endswith('/'):
            target = os.path.join(target, 'index.html')
        if not os.path.exists(target):
            bad.append((p, url))
print('pages checked:', len(pages), ' broken local links:', len(bad))
for b in bad[:40]:
    print('  ', b[0], '->', b[1])
sys.exit(1 if bad else 0)
