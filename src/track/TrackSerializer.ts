import {
  GRID_SIZE,
  HORIZON_OFFSET,
  TERRAIN_OFFSET,
  TRACK_FILE_SIZE,
} from './TrackConstants';
import type { TrackData } from './TrackParser';

export function serializeTrackFile(data: TrackData): ArrayBuffer {
  const bytes = new Uint8Array(TRACK_FILE_SIZE);

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      bytes[y * GRID_SIZE + x] = data.track[y][x];
    }
  }

  bytes[HORIZON_OFFSET] = data.horizon;

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const flippedY = GRID_SIZE - 1 - y;
      bytes[TERRAIN_OFFSET + flippedY * GRID_SIZE + x] = data.terrain[y][x];
    }
  }

  return bytes.buffer;
}

export function createEmptyTrack(horizon = 0x18): TrackData {
  const track: number[][] = [];
  const terrain: number[][] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    track[y] = new Array(GRID_SIZE).fill(0x00);
    terrain[y] = new Array(GRID_SIZE).fill(0x00);
  }

  track[15][14] = 0x01;
  track[15][15] = 0x04;
  track[15][16] = 0x04;
  track[15][17] = 0xb3;

  return { track, terrain, horizon };
}

export function downloadTrackFile(data: TrackData, filename = 'CUSTOM.TRK'): void {
  const buffer = serializeTrackFile(data);
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function loadTrackFromFile(file: File): Promise<TrackData> {
  const { parseTrackFile } = await import('./TrackParser');
  return parseTrackFile(await file.arrayBuffer());
}
