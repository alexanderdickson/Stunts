import * as THREE from 'three';
import { TILE_SIZE } from '../track/TrackConstants';
import type { StartPosition } from '../track/TrackParser';
import type { InputManager } from '../game/Input';
import type { CarDefinition, CarId } from './CarDefinitions';
import { getCarDefinition } from './CarDefinitions';
import { loadCarModel } from './CarModelLoader';
import { CarPhysics } from '../physics/CarPhysics';
import type { SurfaceSampler } from '../physics/SurfaceSampler';

const GROUND_CLEARANCE = 0.5;

export class Car {
  readonly mesh: THREE.Group;
  readonly physics: CarPhysics;
  readonly definition: CarDefinition;
  private wheelMeshes: THREE.Object3D[] = [];
  private start: StartPosition;

  private constructor(
    definition: CarDefinition,
    model: THREE.Object3D,
    start: StartPosition,
  ) {
    this.definition = definition;
    this.start = start;
    this.mesh = new THREE.Group();
    this.mesh.add(model);

    const startPos = this.startToWorld(start);
    this.physics = new CarPhysics(definition, startPos, start.rotY);
    this.collectWheelMeshes(model);
    this.syncMesh();
  }

  static async create(id: CarId, start: StartPosition): Promise<Car> {
    const definition = getCarDefinition(id);
    const model = await loadCarModel(id);
    return new Car(definition, model, start);
  }

  private collectWheelMeshes(model: THREE.Object3D): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of mats) {
          if ('name' in mat && mat.name === 'CarWheel') {
            this.wheelMeshes.push(child);
          }
        }
      }
    });
  }

  private startToWorld(start: StartPosition): THREE.Vector3 {
    return new THREE.Vector3(
      start.x * TILE_SIZE + TILE_SIZE / 2,
      GROUND_CLEARANCE,
      -(start.z * TILE_SIZE + TILE_SIZE / 2),
    );
  }

  reset(): void {
    const pos = this.startToWorld(this.start);
    this.physics.reset(pos, this.start.rotY);
    this.syncMesh();
  }

  setStart(start: StartPosition): void {
    this.start = start;
    this.reset();
  }

  update(delta: number, input: InputManager, surface: SurfaceSampler): void {
    const throttle = input.accelerate ? 1 : 0;
    const brake = input.brake ? 1 : 0;
    const steer = (input.steerRight ? 1 : 0) - (input.steerLeft ? 1 : 0);

    this.physics.update(delta, throttle, brake, steer, (x, z) => surface.sampleWheel(x, z));
    this.syncMesh();
    this.animateWheels(delta);
  }

  get speedKmh(): number {
    return this.physics.speedKmh;
  }

  get rpm(): number {
    return Math.round(this.physics.state.rpm);
  }

  get gear(): number {
    return this.physics.state.gear;
  }

  private syncMesh(): void {
    const { position, quaternion } = this.physics.state;
    this.mesh.position.copy(position);
    this.mesh.quaternion.copy(quaternion);
  }

  private animateWheels(delta: number): void {
    const speed = this.physics.state.speed;
    for (let i = 0; i < this.wheelMeshes.length; i++) {
      const wheel = this.wheelMeshes[i];
      wheel.rotation.x += speed * delta * 0.08;
      if (i < 2) {
        wheel.rotation.y = this.physics.state.wheels[i]?.steerAngle ?? 0;
      }
    }
  }
}
