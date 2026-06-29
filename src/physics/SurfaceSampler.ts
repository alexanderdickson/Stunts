import * as THREE from 'three';
import {
  GRID_SIZE,
  HTILE_SIZE,
  TILE_SIZE,
  Y_RATIO,
} from '../track/TrackConstants';
import type { TrackData } from '../track/TrackParser';

export interface SurfaceSample {
  height: number;
  normal: THREE.Vector3;
  grip: number;
  onTrack: boolean;
  isRamp: boolean;
  rampAngle: number;
}

const _normal = new THREE.Vector3();
const _edge1 = new THREE.Vector3();
const _edge2 = new THREE.Vector3();

const TRACK_GRIP = 1.0;
const GRASS_GRIP = 0.45;
const ROAD_TILES = new Set([
  0x01, 0x04, 0x05, 0x0a, 0x0b, 0x0c, 0x0d,
  0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b,
  0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33,
  0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b,
  0x3c, 0x3d, 0x3e, 0x3f, 0x40, 0x41, 0x44, 0x45,
  0x46, 0x47, 0x48, 0x49, 0x53, 0x54, 0x55, 0x56,
  0x57, 0x58, 0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e,
  0x5f, 0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66,
  0x67, 0x68, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72,
  0x73, 0x74, 0xb3, 0xb4, 0xb5,
]);

const RAMP_ANGLES: Record<number, number> = {
  0x24: Math.PI / 2,
  0x25: -Math.PI / 2,
  0x26: Math.PI,
  0x27: 0,
};

export class SurfaceSampler {
  constructor(private data: TrackData) {}

  setTrackData(data: TrackData): void {
    this.data = data;
  }

  sample(worldX: number, worldZ: number): SurfaceSample {
    const gx = worldX / TILE_SIZE;
    const gz = -worldZ / TILE_SIZE;
    const x0 = Math.floor(gx);
    const z0 = Math.floor(gz);

    if (x0 < 0 || z0 < 0 || x0 >= GRID_SIZE || z0 >= GRID_SIZE) {
      return {
        height: 0,
        normal: new THREE.Vector3(0, 1, 0),
        grip: GRASS_GRIP,
        onTrack: false,
        isRamp: false,
        rampAngle: 0,
      };
    }

    const h00 = this.heightAt(x0, z0);
    const h10 = this.heightAt(x0 + 1, z0);
    const h01 = this.heightAt(x0, z0 + 1);
    const h11 = this.heightAt(x0 + 1, z0 + 1);

    const tx = gx - x0;
    const tz = gz - z0;
    const hx0 = THREE.MathUtils.lerp(h00, h10, tx);
    const hx1 = THREE.MathUtils.lerp(h01, h11, tx);
    const height = THREE.MathUtils.lerp(hx0, hx1, tz);

    _edge1.set(TILE_SIZE, h10 - h00, 0);
    _edge2.set(0, h01 - h00, TILE_SIZE);
    _normal.crossVectors(_edge2, _edge1).normalize();
    if (_normal.y < 0) {
      _normal.negate();
    }

    const trackTile = this.data.track[z0][x0];
    const onTrack = ROAD_TILES.has(trackTile);
    const isRamp = trackTile in RAMP_ANGLES;

    if (isRamp) {
      const rampDir = RAMP_ANGLES[trackTile];
      const rampNormal = new THREE.Vector3(
        Math.sin(rampDir) * 0.55,
        0.85,
        Math.cos(rampDir) * 0.55,
      ).normalize();
      _normal.lerp(rampNormal, 0.7).normalize();
    }

    return {
      height,
      normal: _normal.clone(),
      grip: onTrack ? TRACK_GRIP : GRASS_GRIP,
      onTrack,
      isRamp,
      rampAngle: RAMP_ANGLES[trackTile] ?? 0,
    };
  }

  sampleWheel(worldX: number, worldZ: number): SurfaceSample {
    return this.sample(worldX, worldZ);
  }

  private heightAt(gx: number, gz: number): number {
    if (gx < 0 || gz < 0 || gx >= GRID_SIZE || gz >= GRID_SIZE) {
      return 0;
    }

    const terrain = this.data.terrain[gz][gx];
    const track = this.data.track[gz][gx];
    let h = this.terrainHeight(terrain, gx, gz);

    if (track in RAMP_ANGLES) {
      const localX = 0.5;
      const localZ = 0.5;
      const rampH = HTILE_SIZE * Y_RATIO * 0.85;
      const angle = RAMP_ANGLES[track];
      const along = Math.cos(angle) * localX + Math.sin(angle) * localZ;
      h += rampH * along;
    }

    return h;
  }

  private terrainHeight(terrain: number, gx: number, gz: number): number {
    const flatHigh = HTILE_SIZE * Y_RATIO;

    switch (terrain) {
      case 0x06:
        return flatHigh;
      case 0x07:
      case 0x08:
      case 0x09:
      case 0x0a:
        return this.slopeHeight(terrain, gx, gz, flatHigh);
      case 0x0b:
      case 0x0c:
      case 0x0d:
      case 0x0e:
        return flatHigh * 0.5;
      case 0x0f:
      case 0x10:
      case 0x11:
      case 0x12:
        return flatHigh * 0.75;
      default:
        return 0;
    }
  }

  private slopeHeight(terrain: number, gx: number, gz: number, maxH: number): number {
    const fx = (gx % 1 + 1) % 1 || 0.5;
    const fz = (gz % 1 + 1) % 1 || 0.5;

    switch (terrain) {
      case 0x07:
        return maxH * (1 - fz);
      case 0x08:
        return maxH * fx;
      case 0x09:
        return maxH * fz;
      case 0x0a:
        return maxH * (1 - fx);
      default:
        return 0;
    }
  }
}
