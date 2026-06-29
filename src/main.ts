import { Game } from './game/Game';

const loadingEl = document.getElementById('loading');
const hudEl = document.getElementById('hud');
const speedEl = document.getElementById('speed');
const rpmEl = document.getElementById('rpm');
const gearEl = document.getElementById('gear');
const carNameEl = document.getElementById('car-name');
const musicBtn = document.getElementById('music-btn');

if (!loadingEl || !hudEl || !speedEl || !rpmEl || !gearEl || !carNameEl || !musicBtn) {
  throw new Error('Missing required DOM elements');
}

const game = new Game(
  loadingEl,
  hudEl,
  speedEl,
  rpmEl,
  gearEl,
  carNameEl,
  musicBtn as HTMLButtonElement,
);

game.start().catch((error: unknown) => {
  console.error(error);
  loadingEl.textContent =
    error instanceof Error ? error.message : 'Failed to load the game.';
});

window.addEventListener('beforeunload', () => game.dispose());
