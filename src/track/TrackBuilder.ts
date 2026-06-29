import * as THREE from 'three';
import {
  GRID_SIZE,
  ROT_90,
  TILE_SIZE,
  TRACK_Y_OFFSET,
} from './TrackConstants';
import { cloneTrackObject, type TrackObjectMap } from './ModelLoader';
import { resolveTile } from './TileDefinitions';
import type { TrackData } from './TrackParser';

function placeObject(
  scene: THREE.Object3D,
  trackObjects: TrackObjectMap,
  name: string | null,
  x: number,
  z: number,
  transX: number,
  transY: number,
  transZ: number,
  rotY: number,
): void {
  const object = cloneTrackObject(trackObjects, name);
  if (!object) {
    return;
  }

  object.position.set(
    x * TILE_SIZE + transX,
    transY + TRACK_Y_OFFSET,
    -z * TILE_SIZE + transZ,
  );
  object.rotation.y = rotY;
  scene.add(object);
}

function buildCellContents(
  group: THREE.Group,
  data: TrackData,
  trackObjects: TrackObjectMap,
  x: number,
  z: number,
): void {
  const tile = resolveTile(data.track[z][x], data.terrain[z][x]);

  placeObject(group, trackObjects, tile.trackObj, x, z, tile.transX, tile.transY, tile.transZ, tile.rotY);
  placeObject(
    group,
    trackObjects,
    tile.trackObj2,
    x,
    z,
    tile.transX,
    tile.transY,
    tile.transZ,
    tile.invertSecondObj ? ROT_90 - tile.rotY : tile.rotY,
  );
  placeObject(group, trackObjects, tile.terrObj, x, z, 0, tile.transY - TRACK_Y_OFFSET, 0, tile.rotY);
  placeObject(group, trackObjects, tile.terrObj2, x, z, 0, tile.transY - TRACK_Y_OFFSET, 0, tile.rotY);
}

export function cellGroupName(x: number, z: number): string {
  return `cell_${x}_${z}`;
}

export function buildCellGroup(
  data: TrackData,
  trackObjects: TrackObjectMap,
  x: number,
  z: number,
): THREE.Group {
  const cell = new THREE.Group();
  cell.name = cellGroupName(x, z);
  buildCellContents(cell, data, trackObjects, x, z);
  return cell;
}

export function updateTrackCell(
  trackGroup: THREE.Group,
  data: TrackData,
  trackObjects: TrackObjectMap,
  x: number,
  z: number,
): void {
  const existing = trackGroup.getObjectByName(cellGroupName(x, z));
  if (existing) {
    trackGroup.remove(existing);
  }
  trackGroup.add(buildCellGroup(data, trackObjects, x, z));
}

export function buildTrackScene(
  data: TrackData,
  trackObjects: TrackObjectMap,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'track';

  for (let z = 0; z < GRID_SIZE; z++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      group.add(buildCellGroup(data, trackObjects, x, z));
    }
  }

  return group;
}

export function getHorizonBackground(horizonByte: number): string {
  const themes = ['alpine', 'city', 'country', 'desert', 'tropical'] as const;
  const scenes = ['scen', 'sce2', 'sce3', 'sce4'] as const;
  const theme = themes[horizonByte & 0x07] ?? 'tropical';
  const scene = scenes[(horizonByte >> 3) & 0x03] ?? 'sce3';
  return `/texs/horizon/${theme}/${scene}.png`;
}
