import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MODEL_SCALE } from '../track/TrackConstants';
import type { CarId } from './CarDefinitions';

const MTL_PATH = '/objs/car/cars.mtl';
const OBJ_BASE = '/objs/car/';

const cache = new Map<CarId, THREE.Object3D>();

export async function loadCarModel(id: CarId): Promise<THREE.Object3D> {
  const cached = cache.get(id);
  if (cached) {
    return cached.clone(true);
  }

  const materials = await new MTLLoader().loadAsync(MTL_PATH);
  materials.preload();

  const loader = new OBJLoader();
  loader.setMaterials(materials);
  const object = await loader.loadAsync(`${OBJ_BASE}${id}.obj`);
  object.scale.setScalar(MODEL_SCALE);
  object.rotation.y = Math.PI;
  cache.set(id, object);
  return object.clone(true);
}

export function clearCarModelCache(): void {
  cache.clear();
}
