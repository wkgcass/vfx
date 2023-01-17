#!/usr/bin/env python

import os
import sys

base_dir = sys.argv[1]
base_dir = os.path.abspath(base_dir)
if base_dir.endswith('/') or base_dir.endswith('\\'):
    base_dir = base_dir[0:-1]

def build(ls, prefix, base):
    base += '/'
    files = os.listdir(base)
    files.sort()
    has_java = False
    for f in files:
        if (f.endswith('.java') or f.endswith('.kt')) and f != 'module-info.java' and f != 'package-info.java':
            has_java = True
            break
    if prefix != '':
        if has_java:
            ls.append(prefix)
        prefix += '.'
    for f in files:
        if os.path.isdir(base + f):
            build(ls, prefix + f, base + f)

ls = []
build(ls, '', base_dir)
for f in ls:
    print 'exports ' + f + ';'
