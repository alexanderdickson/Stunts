#!/usr/bin/env node
/** Find OBJ files with degenerate or missing face data */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function checkObj(path) {
  const text = readFileSync(path, 'utf8');
  const verts = [];
  const issues = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('v ')) {
      const [, x, y, z] = line.split(/\s+/);
      const vx = parseFloat(x), vy = parseFloat(y), vz = parseFloat(z);
      if (![vx, vy, vz].every(Number.isFinite)) issues.push(`NaN vertex: ${line}`);
      verts.push([vx, vy, vz]);
    }
    if (line.startsWith('f ')) {
      const idxs = line.split(/\s+/).slice(1).map((t) => parseInt(t.split('/')[0], 10));
      for (const i of idxs) {
        if (!Number.isFinite(i) || i < 1 || i > verts.length) issues.push(`Bad face index ${i}: ${line}`);
      }
    }
  }
  if (verts.length && !text.includes('f ')) issues.push('vertices but no faces');
  return issues;
}

for (const dir of ['objs/trk', 'objs/car']) {
  for (const f of readdirSync(join(root, dir)).filter((f) => f.endsWith('.obj'))) {
    const issues = checkObj(join(root, dir, f));
    if (issues.length) console.log(`${dir}/${f}:`, issues.slice(0, 3));
  }
}
