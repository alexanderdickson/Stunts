#!/usr/bin/env node
/**
 * Visual regression tests — overhead camera screenshots of the 12 3D test
 * tracks, pixel-diffed against committed baseline images (no colour
 * heuristics; the baseline render is the source of truth).
 *
 * Usage:
 *   pnpm test:visual              # pixel-diff against baselines
 *   pnpm test:visual:update       # regenerate baseline PNGs
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { createHash } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const PORT = 4174;
const BASE = `http://127.0.0.1:${PORT}`;
const BASELINE_DIR = join(root, 'tests/visual/baselines');
const OUTPUT_DIR = join(root, 'tests/visual/output');
const MANIFEST = join(root, 'trks/test/manifest.json');
const UPDATE_BASELINES = process.env.UPDATE_BASELINES === '1';
const WIDTH = 640;
const HEIGHT = 480;
// A rendered track may differ from its baseline by at most this fraction of
// pixels before the visual regression is considered a failure.
const MAX_DIFF_RATIO = 0.02;

let preview;

function buildApp() {
  // The preview server serves dist/, so a stale build would silently render
  // old code (e.g. an unhidden loading overlay). Always build first.
  return new Promise((resolve, reject) => {
    console.log('Building app (vite build)…');
    const build = spawn('pnpm', ['build'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    build.stdout?.on('data', (c) => (out += c.toString()));
    build.stderr?.on('data', (c) => (out += c.toString()));
    build.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`vite build failed (exit ${code})\n${out}`));
    });
  });
}

async function startPreview() {
  preview = spawn(
    'pnpm',
    ['exec', 'vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'],
    { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] },
  );

  let stderr = '';
  preview.stderr?.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      // not ready
    }
    await sleep(500);
  }
  throw new Error(`Preview server did not start on port ${PORT}\n${stderr}`);
}

function comparePng(actualBuf, baselineBuf) {
  const actual = PNG.sync.read(actualBuf);
  const baseline = PNG.sync.read(baselineBuf);
  if (actual.width !== baseline.width || actual.height !== baseline.height) {
    return { match: false, ratio: 1, diffPixels: actual.width * actual.height };
  }
  const diff = new PNG({ width: actual.width, height: actual.height });
  const diffPixels = pixelmatch(actual.data, baseline.data, diff.data, actual.width, actual.height, {
    threshold: 0.15,
    includeAA: false,
  });
  return {
    match: diffPixels / (actual.width * actual.height) <= MAX_DIFF_RATIO,
    ratio: diffPixels / (actual.width * actual.height),
    diffPixels,
    diffPng: PNG.sync.write(diff),
  };
}

async function main() {
  mkdirSync(BASELINE_DIR, { recursive: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const tracks = manifest.tracks;

  if (tracks.length < 12) {
    throw new Error(`Expected 12 test tracks, found ${tracks.length}`);
  }

  console.log(`Visual map tests (${tracks.length} tracks, ${WIDTH}x${HEIGHT} overhead)`);
  if (UPDATE_BASELINES) {
    console.log('Mode: UPDATE baselines\n');
  }

  await buildApp();
  await startPreview();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  let passed = 0;
  let failed = 0;
  const fingerprints = new Map();

  for (const { id, file } of tracks) {
    const page = await context.newPage();
    const trackParam = `test/${file}`;
    const url = `${BASE}/?visual=1&track=${encodeURIComponent(trackParam)}&width=${WIDTH}&height=${HEIGHT}`;

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
      await page.waitForFunction(() => window.__STUNTS_TEST_READY__ === true, { timeout: 120000 });
      await sleep(200);

      const screenshot = await page.locator('canvas').screenshot({ type: 'png' });
      const baselinePath = join(BASELINE_DIR, `${id}.png`);

      fingerprints.set(id, createHash('sha1').update(screenshot).digest('hex'));

      if (UPDATE_BASELINES || !existsSync(baselinePath)) {
        writeFileSync(baselinePath, screenshot);
        console.log(`  ✓ ${id}: baseline ${UPDATE_BASELINES ? 'updated' : 'created'}`);
        passed++;
        continue;
      }

      // Pure visual regression: pixel-diff the rendered 3D track against its
      // committed baseline image.
      const baseline = readFileSync(baselinePath);
      const { match, ratio, diffPng } = comparePng(screenshot, baseline);

      if (match) {
        console.log(`  ✓ ${id}: matches baseline (diff ${(ratio * 100).toFixed(2)}%)`);
        passed++;
      } else {
        console.log(`  ✗ ${id}: differs from baseline (diff ${(ratio * 100).toFixed(2)}%)`);
        writeFileSync(join(OUTPUT_DIR, `${id}-actual.png`), screenshot);
        writeFileSync(join(OUTPUT_DIR, `${id}-diff.png`), diffPng);
        failed++;
      }
    } catch (err) {
      console.log(`  ✗ ${id}: ${err instanceof Error ? err.message : err}`);
      writeFileSync(join(OUTPUT_DIR, `${id}-actual.png`), await page.locator('canvas').screenshot({ type: 'png' }).catch(() => Buffer.alloc(0)));
      failed++;
    } finally {
      await page.close();
    }
  }

  // Distinct maps must produce distinct frames; identical renders mean the
  // camera/track pipeline collapsed every map to the same image.
  const byFingerprint = new Map();
  for (const [id, fp] of fingerprints) {
    if (!byFingerprint.has(fp)) byFingerprint.set(fp, []);
    byFingerprint.get(fp).push(id);
  }
  for (const ids of byFingerprint.values()) {
    if (ids.length > 1) {
      console.log(`  ✗ identical renders across distinct maps: ${ids.join(', ')}`);
      failed++;
    }
  }

  await browser.close();
  preview.kill();

  console.log(`\n${passed}/${tracks.length} visual tests passed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  preview?.kill();
  process.exit(1);
});
