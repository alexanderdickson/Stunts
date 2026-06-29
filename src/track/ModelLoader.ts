import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import {
  MODEL_SCALE,
  TRACK_OBJECT_NAMES,
  type TrackObjectName,
} from './TrackConstants';

const MTL_PATH = '/objs/trk/stunts.mtl';
const OBJ_BASE_PATH = '/objs/trk/';

export type TrackObjectMap = Record<string, THREE.Object3D>;

export async function loadTrackObjects(): Promise<TrackObjectMap> {
  const materials = await new MTLLoader().loadAsync(MTL_PATH);
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);

  const entries = await Promise.all(
    TRACK_OBJECT_NAMES.map(async (name) => {
      const object = await objLoader.loadAsync(`${OBJ_BASE_PATH}${name}.obj`);
      object.scale.setScalar(MODEL_SCALE);
      return [name, object] as const;
    }),
  );

  const trackObjects: TrackObjectMap = Object.fromEntries(entries);

  const highMesh = trackObjects.high.children[0] as THREE.Mesh;
  const geometry = (highMesh.geometry as THREE.BufferGeometry).clone();
  const material = new THREE.MeshLambertMaterial({ color: 0x59aa59 });
  const plane = new THREE.Mesh(geometry, material);
  const terrain = new THREE.Object3D();
  terrain.scale.setScalar(MODEL_SCALE);
  terrain.add(plane);
  trackObjects.terr = terrain;

  return trackObjects;
}

export function cloneTrackObject(
  trackObjects: TrackObjectMap,
  name: string | null,
): THREE.Object3D | null {
  if (!name || !trackObjects[name]) {
    return null;
  }
  return trackObjects[name].clone(true);
}

export function isTrackObjectName(name: string): name is TrackObjectName {
  return (TRACK_OBJECT_NAMES as readonly string[]).includes(name);
}
