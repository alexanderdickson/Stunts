import * as THREE from 'three';
import { TILE_SIZE } from '../track/TrackConstants';
import type { StartPosition } from '../track/TrackParser';
import type { InputManager } from '../game/Input';

export interface CarState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  heading: number;
  speed: number;
  airborne: boolean;
}

const MAX_SPEED = 220;
const ACCELERATION = 90;
const BRAKE_FORCE = 140;
const FRICTION = 35;
const STEER_SPEED = 2.4;
const GRAVITY = 28;
const GROUND_CLEARANCE = 1.2;

export class Car {
  readonly mesh: THREE.Group;
  state: CarState;
  private start: StartPosition;

  constructor(start: StartPosition) {
    this.start = start;
    this.mesh = this.createMesh();
    this.state = this.createInitialState();
    this.syncMesh();
  }

  private createMesh(): THREE.Group {
    const group = new THREE.Group();

    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xe63946 });
    const trimMaterial = new THREE.MeshLambertMaterial({ color: 0x1d3557 });
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 4.4), bodyMaterial);
    body.position.y = 0.9;
    group.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 2.0), trimMaterial);
    cabin.position.set(0, 1.35, -0.2);
    group.add(cabin);

    const wheelGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 12);
    const wheelPositions: Array<[number, number, number]> = [
      [-1.0, 0.38, 1.4],
      [1.0, 0.38, 1.4],
      [-1.0, 0.38, -1.4],
      [1.0, 0.38, -1.4],
    ];

    for (const [x, y, z] of wheelPositions) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      group.add(wheel);
    }

    return group;
  }

  private createInitialState(): CarState {
    const position = this.startToWorld(this.start);
    return {
      position,
      velocity: new THREE.Vector3(),
      heading: this.start.rotY,
      speed: 0,
      airborne: false,
    };
  }

  private startToWorld(start: StartPosition): THREE.Vector3 {
    return new THREE.Vector3(
      start.x * TILE_SIZE + TILE_SIZE / 2,
      GROUND_CLEARANCE,
      -(start.z * TILE_SIZE + TILE_SIZE / 2),
    );
  }

  reset(): void {
    this.state = this.createInitialState();
    this.syncMesh();
  }

  update(delta: number, input: InputManager, groundHeight: number): void {
    const { state } = this;

    if (input.accelerate) {
      state.speed += ACCELERATION * delta;
    }
    if (input.brake) {
      state.speed -= BRAKE_FORCE * delta;
    }

    if (!input.accelerate && !input.brake) {
      const friction = FRICTION * delta;
      if (state.speed > friction) {
        state.speed -= friction;
      } else if (state.speed < -friction) {
        state.speed += friction;
      } else {
        state.speed = 0;
      }
    }

    state.speed = THREE.MathUtils.clamp(state.speed, -40, MAX_SPEED);

    const steerInput = (input.steerRight ? 1 : 0) - (input.steerLeft ? 1 : 0);
    const steerFactor = THREE.MathUtils.clamp(Math.abs(state.speed) / 60, 0.15, 1);
    state.heading -= steerInput * STEER_SPEED * steerFactor * delta * Math.sign(state.speed || 1);

    const forward = new THREE.Vector3(Math.sin(state.heading), 0, Math.cos(state.heading));
    state.velocity.copy(forward).multiplyScalar(state.speed * 0.12);

    state.position.x += state.velocity.x * delta;
    state.position.z += state.velocity.z * delta;

    const targetY = groundHeight + GROUND_CLEARANCE;
    if (state.position.y > targetY + 0.05) {
      state.velocity.y -= GRAVITY * delta;
      state.position.y += state.velocity.y * delta;
      state.airborne = true;
    } else {
      state.position.y = targetY;
      state.velocity.y = 0;
      state.airborne = false;
    }

    this.syncMesh();
  }

  get speedKmh(): number {
    return Math.round(Math.abs(this.state.speed));
  }

  private syncMesh(): void {
    this.mesh.position.copy(this.state.position);
    this.mesh.rotation.y = this.state.heading;
  }
}
