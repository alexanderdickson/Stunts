#!/usr/bin/env node
/**
 * Node-side smoke tests for track binary format and assets on disk.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const GRID_SIZE = 30;
const TRACK_FILE_SIZE = 1802;
const TERRAIN_OFFSET = 0x385;
const HORIZON_OFFSET = 0x384;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function parseTrackFile(buffer) {
  const bytes = new Uint8Array(buffer);
  const track = [];
  const terrain = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    track[y] = [];
    terrain[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      track[y][x] = bytes[y * GRID_SIZE + x];
      terrain[y][x] = bytes[TERRAIN_OFFSET + (GRID_SIZE - 1 - y) * GRID_SIZE + x];
    }
  }
  return { track, terrain, horizon: bytes[HORIZON_OFFSET] };
}

function serializeTrackFile(data) {
  const bytes = new Uint8Array(TRACK_FILE_SIZE);
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      bytes[y * GRID_SIZE + x] = data.track[y][x];
    }
  }
  bytes[HORIZON_OFFSET] = data.horizon;
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      bytes[TERRAIN_OFFSET + (GRID_SIZE - 1 - y) * GRID_SIZE + x] = data.terrain[y][x];
    }
  }
  return bytes.buffer;
}

console.log('Asset files on disk');
const required = [
  'trks/DEFAULT.TRK',
  'trks/test/manifest.json',
  'objs/trk/road.obj',
  'objs/trk/stunts.mtl',
  'objs/car/vett.obj',
  'objs/car/cars.mtl',
  'texs/horizon/tropical/sce3.png',
  'texs/editor/tiles/road-ns.svg',
  'texs/editor/tiles/start.svg',
  'texs/editor/editor-titlebar.png',
];
for (const p of required) {
  assert(existsSync(join(root, p)), `${p} exists`);
}

const tileIcons = readdirSync(join(root, 'texs/editor/tiles')).filter((f) => f.endsWith('.svg'));
assert(tileIcons.length >= 38, `at least 38 tile icons (${tileIcons.length} found)`);

const carObjs = readdirSync(join(root, 'objs/car')).filter((f) => f.endsWith('.obj'));
assert(carObjs.length === 11, `11 car OBJ files (${carObjs.length} found)`);

const testTracks = JSON.parse(readFileSync(join(root, 'trks/test/manifest.json'), 'utf8')).tracks;
assert(testTracks.length === 12, `12 visual test tracks (${testTracks.length} found)`);
for (const { file } of testTracks) {
  assert(existsSync(join(root, 'trks/test', file)), `trks/test/${file} exists`);
}

console.log('\nTrack file format');
const trk = readFileSync(join(root, 'trks/DEFAULT.TRK'));
assert(trk.byteLength === TRACK_FILE_SIZE, 'DEFAULT.TRK is 1802 bytes');
const data = parseTrackFile(trk.buffer.slice(trk.byteOffset, trk.byteOffset + trk.byteLength));
assert(data.track.length === 30 && data.terrain.length === 30, '30x30 grids parse');

let hasFinish = false;
for (let z = 0; z < GRID_SIZE; z++) {
  for (let x = 0; x < GRID_SIZE; x++) {
    if ([0x01, 0xb3, 0xb4, 0xb5].includes(data.track[z][x])) hasFinish = true;
  }
}
assert(hasFinish, 'track contains a start/finish tile');

console.log('\nSerializer round-trip');
const rt = new Uint8Array(serializeTrackFile(data));
const orig = new Uint8Array(trk.buffer, trk.byteOffset, trk.byteLength);
let same = orig.length === rt.length;
for (let i = 0; i < orig.length && same; i++) {
  if (orig[i] !== rt[i]) same = false;
}
assert(same, 'DEFAULT.TRK round-trips through serializer');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
