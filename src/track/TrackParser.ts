import {
  GRID_SIZE,
  HORIZON_OFFSET,
  TERRAIN_OFFSET,
  TRACK_FILE_SIZE,
} from './TrackConstants';

export interface TrackData {
  track: number[][];
  terrain: number[][];
  horizon: number;
}

export function parseTrackFile(buffer: ArrayBuffer): TrackData {
  if (buffer.byteLength !== TRACK_FILE_SIZE) {
    throw new Error(`Invalid track size: expected ${TRACK_FILE_SIZE}, got ${buffer.byteLength}`);
  }

  const bytes = new Uint8Array(buffer);
  const track: number[][] = [];
  const terrain: number[][] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    track[y] = [];
    terrain[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      track[y][x] = bytes[y * GRID_SIZE + x];
      terrain[y][x] = bytes[TERRAIN_OFFSET + (GRID_SIZE - 1 - y) * GRID_SIZE + x];
    }
  }

  return {
    track,
    terrain,
    horizon: bytes[HORIZON_OFFSET],
  };
}

export interface StartPosition {
  x: number;
  z: number;
  rotY: number;
}

const FINISH_TILES: Record<number, number> = {
  0x01: 0,
  0xb5: 90,
  0xb3: 180,
  0xb4: 270,
};

export function findStartPosition(data: TrackData): StartPosition {
  for (let z = 0; z < GRID_SIZE; z++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const tile = data.track[z][x];
      if (tile in FINISH_TILES) {
        return {
          x,
          z,
          rotY: FINISH_TILES[tile] * (Math.PI / 180),
        };
      }
    }
  }

  return { x: 15, z: 15, rotY: 0 };
}

export function getTerrainHeight(terrainTile: number): number {
  if (terrainTile === 0x06) {
    return 5.12 * 0.87890625;
  }
  return 0;
}
