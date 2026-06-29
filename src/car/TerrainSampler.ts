import * as THREE from 'three';
import { GRID_SIZE, TILE_SIZE } from '../track/TrackConstants';
import { getTerrainHeight } from '../track/TrackParser';
import type { TrackData } from '../track/TrackParser';

export class TerrainSampler {
  constructor(private readonly data: TrackData) {}

  getHeightAt(worldX: number, worldZ: number): number {
    const gridX = Math.floor(worldX / TILE_SIZE);
    const gridZ = Math.floor(-worldZ / TILE_SIZE);

    if (gridX < 0 || gridZ < 0 || gridX >= GRID_SIZE || gridZ >= GRID_SIZE) {
      return 0;
    }

    return getTerrainHeight(this.data.terrain[gridZ][gridX]);
  }

  sampleBilinear(worldX: number, worldZ: number): number {
    const fx = worldX / TILE_SIZE;
    const fz = -worldZ / TILE_SIZE;

    const x0 = Math.floor(fx);
    const z0 = Math.floor(fz);
    const x1 = x0 + 1;
    const z1 = z0 + 1;
    const tx = fx - x0;
    const tz = fz - z0;

    const h00 = this.getGridHeight(x0, z0);
    const h10 = this.getGridHeight(x1, z0);
    const h01 = this.getGridHeight(x0, z1);
    const h11 = this.getGridHeight(x1, z1);

    const hx0 = THREE.MathUtils.lerp(h00, h10, tx);
    const hx1 = THREE.MathUtils.lerp(h01, h11, tx);
    return THREE.MathUtils.lerp(hx0, hx1, tz);
  }

  private getGridHeight(x: number, z: number): number {
    if (x < 0 || z < 0 || x >= GRID_SIZE || z >= GRID_SIZE) {
      return 0;
    }
    return getTerrainHeight(this.data.terrain[z][x]);
  }
}
