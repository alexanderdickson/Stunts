import { GRID_SIZE, TILE_SIZE } from '../track/TrackConstants';

export interface VisualTestOptions {
  trackPath: string;
  width: number;
  height: number;
}

export function parseVisualTestOptions(search: string): VisualTestOptions | null {
  const params = new URLSearchParams(search);
  if (params.get('visual') !== '1') {
    return null;
  }

  const track = params.get('track') ?? 'DEFAULT.TRK';
  const trackPath = track.startsWith('/') ? track : `/trks/${track}`;

  return {
    trackPath,
    width: parseInt(params.get('width') ?? '640', 10),
    height: parseInt(params.get('height') ?? '480', 10),
  };
}

export function getOverheadCameraBounds(): {
  centerX: number;
  centerZ: number;
  halfExtent: number;
} {
  const centerX = (GRID_SIZE / 2) * TILE_SIZE;
  const centerZ = -(GRID_SIZE / 2) * TILE_SIZE;
  const halfExtent = (GRID_SIZE * TILE_SIZE) / 2 + TILE_SIZE;
  return { centerX, centerZ, halfExtent };
}

declare global {
  interface Window {
    __STUNTS_TEST_READY__?: boolean;
    __STUNTS_TEST_META__?: {
      track: string;
      width: number;
      height: number;
      frames: number;
    };
  }
}

export function signalVisualTestReady(meta: Window['__STUNTS_TEST_META__']): void {
  window.__STUNTS_TEST_META__ = meta;
  window.__STUNTS_TEST_READY__ = true;
}
