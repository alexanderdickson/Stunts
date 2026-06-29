import { Game } from './game/Game';

const loadingEl = document.getElementById('loading');
const hudEl = document.getElementById('hud');
const speedEl = document.getElementById('speed');

if (!loadingEl || !hudEl || !speedEl) {
  throw new Error('Missing required DOM elements');
}

const game = new Game(loadingEl, hudEl, speedEl);

game.start().catch((error: unknown) => {
  console.error(error);
  loadingEl.textContent =
    error instanceof Error ? error.message : 'Failed to load the game.';
});

window.addEventListener('beforeunload', () => game.dispose());
