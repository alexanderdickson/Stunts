#!/usr/bin/env node
/**
 * Generates DOS VGA-style track editor tile icons (32×32) as SVG.
 * Inspired by the original Stunts/4D Sports Driving in-game editor palette.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/texs/editor/tiles');
mkdirSync(outDir, { recursive: true });

// Classic DOS VGA palette (approximate)
const C = {
  black: '#000000',
  dkGray: '#404040',
  gray: '#808080',
  ltGray: '#C0C0C0',
  white: '#FFFFFF',
  dkGreen: '#005800',
  green: '#00A800',
  ltGreen: '#58FC58',
  dkBrown: '#804000',
  brown: '#FCA800',
  yellow: '#FCFC54',
  red: '#FC0000',
  blue: '#0000FC',
  cyan: '#00FCFC',
  magenta: '#FC00FC',
  dkBlue: '#000084',
  water: '#0058FC',
  sand: '#FCFCA8',
  asphalt: '#686868',
  roadLine: '#E8E8E8',
  checkA: '#FCFCFC',
  checkB: '#202020',
};

function svg(pixels, size = 32) {
  const rects = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const color = pixels[y]?.[x];
      if (color && color !== '.') {
        rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`);
      }
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
  <rect width="${size}" height="${size}" fill="${C.dkGray}"/>
  ${rects.join('\n  ')}
</svg>`;
}

function fill(size, color) {
  return Array.from({ length: size }, () => Array(size).fill(color));
}

function grass(size = 32) {
  const g = fill(size, C.green);
  for (let y = 0; y < size; y += 4) {
    for (let x = (y % 8); x < size; x += 8) {
      g[y][x] = C.ltGreen;
    }
  }
  return g;
}

function roadNS(size = 32) {
  const p = grass(size);
  for (let y = 0; y < size; y++) {
    for (let x = 11; x <= 20; x++) {
      p[y][x] = C.asphalt;
    }
    p[y][16] = C.roadLine;
  }
  return p;
}

function roadEW(size = 32) {
  const p = grass(size);
  for (let x = 0; x < size; x++) {
    for (let y = 11; y <= 20; y++) {
      p[y][x] = C.asphalt;
    }
    p[16][x] = C.roadLine;
  }
  return p;
}

function finish(size = 32) {
  const p = roadNS(size);
  for (let y = 4; y < 28; y++) {
    for (let x = 11; x <= 20; x++) {
      const check = ((x + y) % 2 === 0);
      p[y][x] = check ? C.checkA : C.checkB;
    }
  }
  return p;
}

function erase(size = 32) {
  const p = grass(size);
  for (let i = 8; i < 24; i++) {
    p[16][i] = C.red;
    p[i][16] = C.red;
  }
  return p;
}

function ramp(dir, size = 32) {
  const p = grass(size);
  for (let y = 0; y < size; y++) {
    for (let x = 11; x <= 20; x++) {
      p[y][x] = C.asphalt;
    }
  }
  const slope = dir === 'n' ? (y) => 28 - y : dir === 's' ? (y) => y + 4 : dir === 'e' ? (x) => x + 4 : (x) => 28 - x;
  for (let y = 0; y < size; y++) {
    for (let x = 11; x <= 20; x++) {
      const h = dir === 'n' || dir === 's' ? slope(y) : slope(x);
      if (h > 14 && h < 26) {
        p[Math.floor(h)][x] = C.ltGray;
        p[Math.floor(h)][x - 1] = C.gray;
      }
    }
  }
  return p;
}

function bank(side, dir, size = 32) {
  const p = roadNS(size);
  const tilt = side === 'l' ? C.brown : C.dkBrown;
  for (let y = 4; y < 28; y++) {
    const edge = side === 'l' ? 10 : 21;
    for (let d = 0; d < 4; d++) {
      p[y][edge + (side === 'l' ? -d : d)] = tilt;
    }
  }
  return p;
}

function loop(dir, size = 32) {
  const p = grass(size);
  for (let y = 6; y < 26; y++) {
    for (let x = 12; x < 20; x++) {
      p[y][x] = C.asphalt;
    }
  }
  for (let a = 0; a < 360; a += 15) {
    const rad = (a * Math.PI) / 180;
    const cx = 16, cy = 10, r = 8;
    const x = Math.round(cx + r * Math.cos(rad));
    const y = Math.round(cy + r * Math.sin(rad));
    if (x >= 0 && x < size && y >= 0 && y < size) p[y][x] = C.asphalt;
  }
  return p;
}

function pipe(dir, size = 32) {
  const p = grass(size);
  for (let y = 8; y < 24; y++) {
    for (let x = 10; x < 22; x++) {
      const dist = Math.abs(x - 16);
      if (dist >= 4 && dist <= 5) p[y][x] = C.gray;
      if (dist <= 3) p[y][x] = C.dkGray;
    }
  }
  return p;
}

function bridge(dir, size = 32) {
  const p = grass(size);
  for (let x = 0; x < size; x++) {
    p[14][x] = C.ltGray;
    p[15][x] = C.gray;
    p[16][x] = C.ltGray;
  }
  for (let y = 10; y < 22; y++) {
    p[y][4] = C.dkGray;
    p[y][27] = C.dkGray;
  }
  return p;
}

function scenery(type, size = 32) {
  const p = grass(size);
  const cx = 16, cy = 20;
  if (type === 'palm') {
    for (let y = cy - 10; y < cy; y++) p[y][cx] = C.dkBrown;
    for (let a = 0; a < 360; a += 60) {
      const rad = (a * Math.PI) / 180;
      for (let r = 1; r <= 6; r++) {
        const x = Math.round(cx + r * Math.cos(rad));
        const y = Math.round(cy - 10 + r * Math.sin(rad) * 0.5);
        if (x >= 0 && x < size && y >= 0 && y < size) p[y][x] = C.green;
      }
    }
  } else if (type === 'cactus') {
    for (let y = cy - 8; y < cy; y++) p[y][cx] = C.green;
    p[cy - 5][cx - 2] = C.green;
    p[cy - 6][cx - 3] = C.green;
    p[cy - 4][cx + 2] = C.green;
  } else if (type === 'tree') {
    for (let y = cy - 3; y < cy; y++) p[y][cx] = C.dkBrown;
    for (let y = cy - 12; y < cy - 3; y++) {
      for (let x = cx - 4; x <= cx + 4; x++) {
        if (Math.abs(x - cx) + Math.abs(y - (cy - 8)) < 6) p[y][x] = C.dkGreen;
      }
    }
  } else if (type === 'barn') {
    for (let y = cy - 8; y < cy; y++) {
      for (let x = cx - 6; x <= cx + 6; x++) p[y][x] = C.red;
    }
    for (let y = cy - 12; y < cy - 8; y++) {
      const w = 12 - (cy - 8 - y);
      for (let x = cx - w / 2; x <= cx + w / 2; x++) p[y][Math.round(x)] = C.red;
    }
  } else if (type === 'gas') {
    for (let y = cy - 6; y < cy; y++) {
      for (let x = cx - 5; x <= cx + 5; x++) p[y][x] = C.white;
    }
    p[cy - 8][cx] = C.blue;
    p[cy - 7][cx] = C.red;
  }
  return p;
}

function terrain(type, size = 32) {
  const p = grass(size);
  if (type === 'high') {
    for (let y = 8; y < 24; y++) {
      for (let x = 8; x < 24; x++) {
        p[y][x] = C.dkGreen;
        if (y === 8 || y === 23 || x === 8 || x === 23) p[y][x] = C.brown;
      }
    }
  } else if (type.startsWith('up-')) {
    const dir = type.split('-')[1];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let h = 0;
        if (dir === 'n') h = (28 - y) / 28;
        if (dir === 's') h = y / 28;
        if (dir === 'e') h = x / 28;
        if (dir === 'w') h = (28 - x) / 28;
        if (h > 0.3) p[y][x] = h > 0.6 ? C.dkGreen : C.ltGreen;
      }
    }
  } else if (type === 'out-n') {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (y > 16) p[y][x] = C.dkGreen;
        else p[y][x] = C.green;
      }
    }
  } else if (type === 'in-n') {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (y < 16) p[y][x] = C.dkGreen;
      }
    }
  }
  return p;
}

const ICONS = {
  erase: () => erase(),
  start: () => finish(),
  'road-ns': () => roadNS(),
  'road-ew': () => roadEW(),
  straight: () => roadNS(),
  stadium: () => {
    const p = roadNS();
    for (let x = 4; x < 28; x++) { p[4][x] = C.gray; p[27][x] = C.gray; }
    return p;
  },
  'ramp-n': () => ramp('n'),
  'ramp-e': () => ramp('e'),
  'ramp-s': () => ramp('s'),
  'ramp-w': () => ramp('w'),
  'l-bank-n': () => bank('l', 'n'),
  'l-bank-e': () => bank('l', 'e'),
  'r-bank-n': () => bank('r', 'n'),
  'r-bank-e': () => bank('r', 'e'),
  'bank-n': () => bank('l', 'n'),
  'bank-e': () => bank('r', 'e'),
  'bridge-n': () => bridge('n'),
  'bridge-e': () => bridge('e'),
  'loop-n': () => loop('n'),
  'loop-e': () => loop('e'),
  'pipe-n': () => pipe('n'),
  'pipe-e': () => pipe('e'),
  'half-pipe': () => pipe('n'),
  cork: () => loop('e'),
  espresso: () => {
    const p = roadEW();
    for (let y = 8; y < 24; y++) p[y][8] = C.yellow;
    return p;
  },
  palm: () => scenery('palm'),
  cactus: () => scenery('cactus'),
  tree: () => scenery('tree'),
  barn: () => scenery('barn'),
  gas: () => scenery('gas'),
  't-flat': () => grass(),
  't-high': () => terrain('high'),
  't-up-n': () => terrain('up-n'),
  't-up-e': () => terrain('up-e'),
  't-up-s': () => terrain('up-s'),
  't-up-w': () => terrain('up-w'),
  't-out-n': () => terrain('out-n'),
  't-in-n': () => terrain('in-n'),
};

for (const [id, draw] of Object.entries(ICONS)) {
  writeFileSync(join(outDir, `${id}.svg`), svg(draw()));
}

console.log(`Generated ${Object.keys(ICONS).length} tile icons in ${outDir}`);
