#!/usr/bin/env node
/**
 * Generates 12 test track files for visual regression testing.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../trks/test');
const GRID = 30;
const HORIZON = 0x384;
const TERRAIN = 0x385;
const SIZE = 1802;

mkdirSync(outDir, { recursive: true });

function empty(horizon = 0x18) {
  return {
    track: Array.from({ length: GRID }, () => Array(GRID).fill(0x00)),
    terrain: Array.from({ length: GRID }, () => Array(GRID).fill(0x00)),
    horizon,
  };
}

function serialize({ track, terrain, horizon }) {
  const bytes = new Uint8Array(SIZE);
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) bytes[y * GRID + x] = track[y][x];
  }
  bytes[HORIZON] = horizon;
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      bytes[TERRAIN + (GRID - 1 - y) * GRID + x] = terrain[y][x];
    }
  }
  return bytes;
}

function rect(track, x0, z0, w, h, tile) {
  for (let z = z0; z < z0 + h; z++) {
    for (let x = x0; x < x0 + w; x++) {
      if (z >= 0 && z < GRID && x >= 0 && x < GRID) track[z][x] = tile;
    }
  }
}

function finishLine(track, x, z, dir = 'e') {
  const tiles = { n: 0x01, e: 0xb5, s: 0xb3, w: 0xb4 };
  track[z][x] = tiles[dir];
}

const maps = {
  default: () => {
    // Simple closed loop
    const m = empty();
    rect(m.track, 10, 10, 10, 1, 0x05);
    rect(m.track, 19, 10, 1, 10, 0x04);
    rect(m.track, 10, 19, 10, 1, 0x05);
    rect(m.track, 10, 10, 1, 10, 0x04);
    finishLine(m.track, 10, 10, 'n');
    return m;
  },

  oval: () => {
    const m = empty();
    rect(m.track, 8, 8, 14, 1, 0x05);
    rect(m.track, 21, 8, 1, 14, 0x04);
    rect(m.track, 8, 21, 14, 1, 0x05);
    rect(m.track, 8, 8, 1, 14, 0x04);
    finishLine(m.track, 8, 8, 'n');
    return m;
  },

  straight: () => {
    const m = empty(0x10);
    rect(m.track, 12, 4, 6, 22, 0x04);
    finishLine(m.track, 12, 4, 'n');
    rect(m.track, 12, 25, 6, 1, 0xb3);
    return m;
  },

  ramps: () => {
    const m = empty(0x10);
    rect(m.track, 6, 14, 18, 2, 0x05);
    m.track[12][8] = 0x27;
    m.track[12][11] = 0x24;
    m.track[12][14] = 0x26;
    m.track[12][17] = 0x25;
    m.track[12][20] = 0x27;
    finishLine(m.track, 6, 14, 'n');
    return m;
  },

  loops: () => {
    const m = empty();
    rect(m.track, 8, 14, 14, 2, 0x05);
    m.track[14][12] = 0x40;
    m.track[14][16] = 0x41;
    finishLine(m.track, 8, 14, 'n');
    return m;
  },

  pipes: () => {
    const m = empty(0x00);
    rect(m.track, 6, 14, 18, 2, 0x05);
    m.track[14][10] = 0x44;
    m.track[14][14] = 0x45;
    m.track[14][18] = 0x53;
    finishLine(m.track, 6, 14, 'n');
    return m;
  },

  banks: () => {
    const m = empty();
    rect(m.track, 10, 12, 10, 6, 0x05);
    m.track[14][12] = 0x2a;
    m.track[14][14] = 0x30;
    m.track[14][16] = 0x2f;
    m.track[14][18] = 0x32;
    finishLine(m.track, 10, 12, 'n');
    return m;
  },

  bridge: () => {
    const m = empty(0x08);
    rect(m.track, 5, 14, 20, 2, 0x05);
    m.track[14][10] = 0x3a;
    m.track[14][13] = 0x38;
    m.track[14][16] = 0x3a;
    finishLine(m.track, 5, 14, 'n');
    return m;
  },

  scenery: () => {
    const m = empty(0x18);
    rect(m.track, 10, 14, 10, 2, 0x05);
    finishLine(m.track, 10, 14, 'n');
    m.track[10][8] = 0x97;
    m.track[12][20] = 0x99;
    m.track[16][8] = 0x9f;
    m.track[18][20] = 0x9c;
    m.track[8][18] = 0x98;
    return m;
  },

  hills: () => {
    const m = empty(0x00);
    rect(m.track, 8, 14, 14, 2, 0x05);
    finishLine(m.track, 8, 14, 'n');
    rect(m.terrain, 6, 6, 8, 8, 0x06);
    m.terrain[10][18] = 0x09;
    m.terrain[12][18] = 0x07;
    m.terrain[14][18] = 0x08;
    m.terrain[16][18] = 0x0a;
    m.terrain[20][10] = 0x10;
    m.terrain[20][12] = 0x0c;
    return m;
  },

  stadium: () => {
    const m = empty(0x18);
    rect(m.track, 9, 9, 12, 12, 0x05);
    m.track[9][9] = 0x0b;
    m.track[9][20] = 0x0b;
    m.track[20][9] = 0x0b;
    m.track[20][20] = 0x0b;
    m.track[14][9] = 0x0a;
    m.track[14][20] = 0x0a;
    finishLine(m.track, 14, 9, 'n');
    return m;
  },

  'stunt-mix': () => {
    const m = empty(0x18);
    rect(m.track, 6, 14, 18, 2, 0x05);
    finishLine(m.track, 6, 14, 'n');
    m.track[14][9] = 0x57;
    m.track[14][12] = 0x65;
    m.track[14][15] = 0x53;
    m.track[14][18] = 0x5f;
    m.track[14][21] = 0x34;
    return m;
  },
};

const manifest = Object.keys(maps).map((id) => ({ id, file: `${id.toUpperCase()}.TRK` }));

for (const [id, build] of Object.entries(maps)) {
  const data = build();
  const filename = `${id.toUpperCase()}.TRK`;
  writeFileSync(join(outDir, filename), serialize(data));
  console.log(`  wrote ${filename}`);
}

writeFileSync(
  join(outDir, 'manifest.json'),
  JSON.stringify({ tracks: manifest }, null, 2) + '\n',
);

console.log(`\nGenerated ${manifest.length} test tracks in ${outDir}`);
