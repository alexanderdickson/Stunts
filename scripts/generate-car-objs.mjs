#!/usr/bin/env node
/**
 * Generates stylized Stunts car OBJ meshes in original game scale.
 * Replace with stressed-exported originals when available.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../objs/car');
mkdirSync(outDir, { recursive: true });

const cars = {
  vett: { name: 'Corvette ZR1', color: 'CarRed', length: 440, width: 220, height: 68, cabin: 0.42 },
  coun: { name: 'Lamborghini Countach', color: 'CarYellow', length: 430, width: 210, height: 62, cabin: 0.28, wedge: true },
  fgto: { name: 'Ferrari GT', color: 'CarRed', length: 450, width: 215, height: 70, cabin: 0.38 },
  jagu: { name: 'Jaguar XJR-12', color: 'CarBlue', length: 460, width: 225, height: 72, cabin: 0.35 },
  lanc: { name: 'Lancia Delta', color: 'CarWhite', length: 400, width: 200, height: 78, cabin: 0.5 },
  lm02: { name: 'Porsche 962', color: 'CarWhite', length: 470, width: 230, height: 58, cabin: 0.22, race: true },
  p962: { name: 'Porsche Carrera 4', color: 'CarSilver', length: 430, width: 215, height: 72, cabin: 0.4 },
  pc04: { name: 'Porsche 924', color: 'CarRed', length: 420, width: 205, height: 74, cabin: 0.45 },
  pmin: { name: 'Porsche 962 IMSA', color: 'CarYellow', length: 475, width: 232, height: 56, cabin: 0.2, race: true },
  ansx: { name: 'Audi Quattro S1', color: 'CarWhite', length: 410, width: 208, height: 76, cabin: 0.44 },
  audi: { name: 'Audi Quattro', color: 'CarSilver', length: 415, width: 210, height: 76, cabin: 0.44 },
};

function boxVerts(l, w, h, y0 = 0) {
  const hl = l / 2, hw = w / 2;
  return [
    [-hl, y0, -hw], [hl, y0, -hw], [hl, y0, hw], [-hl, y0, hw],
    [-hl, y0 + h, -hw], [hl, y0 + h, -hw], [hl, y0 + h, hw], [-hl, y0 + h, hw],
  ];
}

function wedgeVerts(l, w, h) {
  const hl = l / 2, hw = w / 2;
  return [
    [-hl, 0, -hw], [hl * 0.3, 0, -hw], [hl * 0.3, 0, hw], [-hl, 0, hw],
    [-hl * 0.2, h, -hw * 0.7], [hl, h, -hw * 0.7], [hl, h, hw * 0.7], [-hl * 0.2, h, hw * 0.7],
  ];
}

function boxFaces(base) {
  const b = base;
  return [
    [b, b+1, b+2, b+3], [b+4, b+5, b+6, b+7], [b, b+1, b+5, b+4],
    [b+1, b+2, b+6, b+5], [b+2, b+3, b+7, b+6], [b+3, b, b+4, b+7],
  ];
}

function writeObj(id, spec) {
  const verts = spec.wedge ? wedgeVerts(spec.length, spec.width, spec.height) : boxVerts(spec.length, spec.width, spec.height);
  const cabinH = spec.height * 0.55;
  const cabinL = spec.length * spec.cabin;
  const cabinW = spec.width * 0.82;
  const cabinY = spec.height * 0.55;
  const cabinVerts = boxVerts(cabinL, cabinW, cabinH, cabinY).map(([x, y, z]) => [x * 0.85, y, z * 0.85]);
  const allVerts = [...verts, ...cabinVerts];

  const wheelR = spec.race ? 38 : 34;
  const wheelW = 22;
  const wheelY = wheelR;
  const wheelOffsets = [
    [spec.length * 0.28, wheelY, spec.width * 0.42],
    [spec.length * 0.28, wheelY, -spec.width * 0.42],
    [-spec.length * 0.28, wheelY, spec.width * 0.42],
    [-spec.length * 0.28, wheelY, -spec.width * 0.42],
  ];

  let lines = [
    `# Stunts car ${spec.name} (${id.toUpperCase()})`,
    'mtllib cars.mtl',
    `o ${id}`,
    `usemtl ${spec.color}`,
  ];

  for (const [x, y, z] of allVerts) {
    lines.push(`v ${x.toFixed(1)} ${y.toFixed(1)} ${z.toFixed(1)}`);
  }

  const bodyFaces = boxFaces(1);
  for (const f of bodyFaces) {
    lines.push(`f ${f.join(' ')}`);
  }
  const cabinFaces = boxFaces(9);
  for (const f of cabinFaces) {
    lines.push(`f ${f.join(' ')}`);
  }

  lines.push('usemtl CarWheel');
  let vi = allVerts.length + 1;
  for (const [wx, wy, wz] of wheelOffsets) {
    const hw = wheelW / 2, hr = wheelR;
    const wheelVerts = [
      [wx, wy - hr, wz - hw], [wx, wy - hr, wz + hw], [wx, wy + hr, wz + hw], [wx, wy + hr, wz - hw],
      [wx, wy - hr, wz - hw], [wx, wy - hr, wz + hw], [wx, wy + hr, wz + hw], [wx, wy + hr, wz - hw],
    ];
    for (const [x, y, z] of wheelVerts) {
      lines.push(`v ${x.toFixed(1)} ${y.toFixed(1)} ${z.toFixed(1)}`);
    }
    const b = vi;
    lines.push(`f ${b} ${b + 1} ${b + 2} ${b + 3}`);
    lines.push(`f ${b + 4} ${b + 5} ${b + 6} ${b + 7}`);
    vi += 8;
  }

  writeFileSync(join(outDir, `${id}.obj`), lines.join('\n') + '\n');
}

const mtl = `newmtl CarRed
Kd 0.80 0.12 0.10
d 1.0

newmtl CarYellow
Kd 0.90 0.75 0.10
d 1.0

newmtl CarBlue
Kd 0.10 0.25 0.70
d 1.0

newmtl CarWhite
Kd 0.92 0.92 0.90
d 1.0

newmtl CarSilver
Kd 0.70 0.72 0.75
d 1.0

newmtl CarWheel
Kd 0.12 0.12 0.12
d 1.0
`;

writeFileSync(join(outDir, 'cars.mtl'), mtl);

for (const [id, spec] of Object.entries(cars)) {
  writeObj(id, spec);
}

console.log(`Generated ${Object.keys(cars).length} car OBJ files in ${outDir}`);
