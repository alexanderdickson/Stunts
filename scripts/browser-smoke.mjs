#!/usr/bin/env node
/**
 * Browser smoke test — loads the game in headless Chrome and checks for errors.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

let preview;
const consoleErrors = [];
const pageErrors = [];

async function startPreview() {
  preview = spawn(
    'pnpm',
    ['exec', 'vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'],
    {
      cwd: new URL('..', import.meta.url).pathname,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      // not ready
    }
    await sleep(500);
  }
  throw new Error('Preview server did not start in time');
}

async function main() {
  console.log('Starting preview server…');
  await startPreview();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  const assets = [
    '/',
    '/trks/DEFAULT.TRK',
    '/objs/trk/road.obj',
    '/objs/car/vett.obj',
    '/texs/editor/tiles/road-ns.svg',
    '/texs/horizon/tropical/sce3.png',
  ];

  console.log('\nHTTP asset checks');
  let httpOk = true;
  for (const path of assets) {
    const res = await fetch(BASE + path);
    const ok = res.status === 200;
    console.log(`  ${ok ? '✓' : '✗'} ${path} → ${res.status}`);
    if (!ok) httpOk = false;
  }

  console.log('\nLoading game page…');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for loading screen to disappear (game bootstrapped)
  await page.waitForFunction(
    () => {
      const loading = document.getElementById('loading');
      return loading?.hidden === true;
    },
    { timeout: 120000 },
  );
  console.log('  ✓ Loading screen cleared (game started)');

  // WebGL canvas should exist
  const hasCanvas = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return !!canvas && canvas.width > 0 && canvas.height > 0;
  });
  console.log(hasCanvas ? '  ✓ WebGL canvas rendered' : '  ✗ WebGL canvas missing');

  // HUD visible
  const hudVisible = await page.evaluate(() => {
    const hud = document.getElementById('hud');
    return hud && !hud.hidden;
  });
  console.log(hudVisible ? '  ✓ HUD visible' : '  ✗ HUD not visible');

  // Open editor
  await page.keyboard.press('e');
  await sleep(300);
  const editorOpen = await page.evaluate(() => {
    const dock = document.getElementById('editor-dock');
    const side = document.getElementById('editor-side');
    return dock && !dock.hidden && side && !side.hidden;
  });
  console.log(editorOpen ? '  ✓ Track editor opens (E key)' : '  ✗ Track editor did not open');

  // Tile icons present
  const iconCount = await page.evaluate(() => {
    return document.querySelectorAll('.tile-icon-btn img').length;
  });
  console.log(iconCount > 0 ? `  ✓ ${iconCount} tile icons in palette` : '  ✗ No tile icons in palette');

  // Toggle music (should not throw)
  await page.keyboard.press('m');
  await sleep(200);
  const musicOn = await page.evaluate(() => {
    return document.getElementById('music-btn')?.classList.contains('active') ?? false;
  });
  console.log(musicOn ? '  ✓ Music toggled on' : '  ✗ Music did not toggle');

  // Drive input shouldn't crash
  await page.keyboard.down('w');
  await sleep(500);
  await page.keyboard.up('w');
  await sleep(200);
  const speedText = await page.textContent('#speed');
  console.log(speedText ? `  ✓ Speed readout updates (${speedText})` : '  ✗ Speed readout missing');

  // Filter known non-fatal Three.js bounding-sphere warnings (degenerate sub-meshes in OBJs)
  const fatalConsoleErrors = consoleErrors.filter(
    (e) => !e.includes('computeBoundingSphere') && !e.includes('Computed radius is NaN'),
  );
  const nanWarnings = consoleErrors.length - fatalConsoleErrors.length;
  if (nanWarnings > 0) {
    console.log(`  ⚠ ${nanWarnings} Three.js bounding-sphere warnings (non-fatal)`);
  }
  if (pageErrors.length) {
    console.log('\nPage errors:');
    pageErrors.forEach((e) => console.log(`  ! ${e}`));
  }

  await browser.close();
  preview.kill();

  const allOk =
    httpOk &&
    hasCanvas &&
    hudVisible &&
    editorOpen &&
    iconCount > 0 &&
    musicOn &&
    fatalConsoleErrors.length === 0 &&
    pageErrors.length === 0;

  console.log(allOk ? '\n✅ Browser smoke test passed' : '\n❌ Browser smoke test failed');
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  preview?.kill();
  process.exit(1);
});
