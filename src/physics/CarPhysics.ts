import * as THREE from 'three';
import {
  type CarDefinition,
  engineTorqueAtRpm,
  rpmToSpeed,
  speedToRpm,
} from '../car/CarDefinitions';
import type { SurfaceSample } from './SurfaceSampler';

export interface WheelState {
  position: THREE.Vector3;
  compression: number;
  onGround: boolean;
  steerAngle: number;
  spin: number;
}

export interface CarPhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quaternion: THREE.Quaternion;
  angularVelocity: THREE.Vector3;
  rpm: number;
  gear: number;
  speed: number;
  airborne: boolean;
  wheels: WheelState[];
}

const GRAVITY = 9.81 * 3.2;
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _force = new THREE.Vector3();
const _temp = new THREE.Vector3();

export class CarPhysics {
  state: CarPhysicsState;
  private readonly wheelOffsets: THREE.Vector3[];

  constructor(
    private readonly def: CarDefinition,
    startPosition: THREE.Vector3,
    startHeading: number,
  ) {
    this.wheelOffsets = [
      new THREE.Vector3(this.def.wheelbase / 2, 0, this.def.trackWidth / 2),
      new THREE.Vector3(this.def.wheelbase / 2, 0, -this.def.trackWidth / 2),
      new THREE.Vector3(-this.def.wheelbase / 2, 0, this.def.trackWidth / 2),
      new THREE.Vector3(-this.def.wheelbase / 2, 0, -this.def.trackWidth / 2),
    ];

    this.state = {
      position: startPosition.clone(),
      velocity: new THREE.Vector3(),
      quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, startHeading, 0)),
      angularVelocity: new THREE.Vector3(),
      rpm: def.idleRpm,
      gear: 1,
      speed: 0,
      airborne: false,
      wheels: this.wheelOffsets.map((offset) => ({
        position: offset.clone(),
        compression: 0,
        onGround: false,
        steerAngle: 0,
        spin: 0,
      })),
    };
  }

  reset(position: THREE.Vector3, heading: number): void {
    this.state.position.copy(position);
    this.state.velocity.set(0, 0, 0);
    this.state.quaternion.setFromEuler(new THREE.Euler(0, heading, 0));
    this.state.angularVelocity.set(0, 0, 0);
    this.state.rpm = this.def.idleRpm;
    this.state.gear = 1;
    this.state.speed = 0;
    this.state.airborne = false;
  }

  update(
    dt: number,
    throttle: number,
    brake: number,
    steer: number,
    sampleSurface: (x: number, z: number) => SurfaceSample,
  ): void {
    const { state, def } = this;

    this.updateOrientationVectors();
    const forwardSpeed = state.velocity.dot(_forward);
    state.speed = forwardSpeed * 2.237;

    const gearRatio = def.gearRatios[state.gear - 1] ?? def.gearRatios[0];
    const wheelRpm = speedToRpm(Math.abs(forwardSpeed), gearRatio);
    state.rpm = THREE.MathUtils.lerp(state.rpm, Math.max(def.idleRpm, wheelRpm), dt * 8);

    if (throttle > 0) {
      const torque = engineTorqueAtRpm(def, state.rpm) * throttle;
      const driveForce = (torque * gearRatio) / (def.mass * 180);
      _force.copy(_forward).multiplyScalar(driveForce);
      state.velocity.addScaledVector(_force, dt);

      const targetRpm = Math.min(def.maxRpm, state.rpm + throttle * 1200 * dt);
      state.rpm = THREE.MathUtils.lerp(state.rpm, targetRpm, dt * 4);
      this.autoShift(forwardSpeed);
    } else if (brake > 0) {
      const brakeForce = (def.brakeForce / def.mass) * brake * 0.35;
      const brakeDir = Math.sign(forwardSpeed) || 1;
      state.velocity.addScaledVector(_forward, -brakeDir * brakeForce * dt);
      state.rpm = THREE.MathUtils.lerp(state.rpm, def.idleRpm, dt * 6);
    } else {
      state.rpm = THREE.MathUtils.lerp(state.rpm, def.idleRpm, dt * 2);
    }

    const drag = def.aeroDrag * 0.00008 * forwardSpeed * Math.abs(forwardSpeed);
    state.velocity.addScaledVector(_forward, -drag * dt / def.mass);

    const steerAngle = steer * def.steerAngle;
    state.wheels[0].steerAngle = steerAngle;
    state.wheels[1].steerAngle = steerAngle;

    if (Math.abs(forwardSpeed) > 0.5) {
      const turnRate = (forwardSpeed / def.wheelbase) * Math.tan(steerAngle);
      state.angularVelocity.y = -turnRate;
    } else {
      state.angularVelocity.y *= 0.9;
    }

    let groundedCount = 0;
    const avgNormal = new THREE.Vector3();
    let avgHeight = 0;

    for (let i = 0; i < 4; i++) {
      const wheel = state.wheels[i];
      const worldOffset = this.wheelOffsets[i].clone().applyQuaternion(state.quaternion);
      const wx = state.position.x + worldOffset.x;
      const wz = state.position.z + worldOffset.z;
      const surface = sampleSurface(wx, wz);

      const targetY = surface.height + def.wheelRadius;
      const rayLength = state.position.y + worldOffset.y - targetY;
      const onGround = rayLength < def.suspensionRest + def.suspensionTravel && rayLength > -0.5;

      wheel.onGround = onGround;
      wheel.position.set(wx, targetY, wz);

      if (onGround) {
        groundedCount++;
        wheel.compression = THREE.MathUtils.clamp(
          def.suspensionRest - rayLength,
          0,
          def.suspensionTravel,
        );
        const springForce = wheel.compression * def.suspensionStiffness;
        state.velocity.y += (springForce / def.mass - GRAVITY) * dt;

        avgNormal.add(surface.normal);
        avgHeight += surface.height;

        const grip = surface.onTrack ? def.grip : def.grassGrip;
        const lateral = state.velocity.dot(_right);
        const lateralGrip = grip * 8 * dt;
        state.velocity.addScaledVector(_right, -lateral * lateralGrip);

        if (!surface.onTrack) {
          state.velocity.multiplyScalar(1 - def.grassSlowdown * dt);
        }

        wheel.spin += forwardSpeed * dt * 3;
      } else {
        wheel.compression = 0;
      }
    }

    state.airborne = groundedCount < 2;

    if (groundedCount > 0) {
      avgNormal.divideScalar(groundedCount).normalize();
      const targetHeight = avgHeight / groundedCount + def.wheelRadius + def.suspensionRest * 0.5;
      if (!state.airborne) {
        state.position.y = THREE.MathUtils.lerp(state.position.y, targetHeight, dt * 12);
      }
      this.alignToNormal(avgNormal, dt);
    } else {
      state.velocity.y -= GRAVITY * dt;
    }

    state.position.addScaledVector(state.velocity, dt);

    const dq = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        state.angularVelocity.x * dt,
        state.angularVelocity.y * dt,
        state.angularVelocity.z * dt,
      ),
    );
    state.quaternion.multiply(dq).normalize();
    state.angularVelocity.multiplyScalar(0.98);

    const maxSpeed = rpmToSpeed(def.maxRpm, def.gearRatios[def.gears - 1]) * 0.12;
    if (state.velocity.length() > maxSpeed) {
      state.velocity.setLength(maxSpeed);
    }
  }

  get speedKmh(): number {
    return Math.round(Math.abs(this.state.speed) * 1.609);
  }

  get speedMph(): number {
    return Math.round(Math.abs(this.state.speed));
  }

  private autoShift(forwardSpeed: number): void {
    const { def, state } = this;
    const absSpeed = Math.abs(forwardSpeed);

    if (state.gear < def.gears && state.rpm > def.upshiftRpm) {
      state.gear++;
      state.rpm = def.downshiftRpm;
    } else if (state.gear > 1 && state.rpm < def.downshiftRpm && absSpeed < 5) {
      state.gear--;
      state.rpm = def.upshiftRpm * 0.7;
    }
  }

  private updateOrientationVectors(): void {
    _forward.set(0, 0, 1).applyQuaternion(this.state.quaternion);
    _right.set(1, 0, 0).applyQuaternion(this.state.quaternion);
    _up.set(0, 1, 0).applyQuaternion(this.state.quaternion);
  }

  private alignToNormal(normal: THREE.Vector3, dt: number): void {
    const { state } = this;
    this.updateOrientationVectors();

    const pitchAngle = Math.asin(THREE.MathUtils.clamp(_forward.y, -1, 1));
    const targetPitch = Math.asin(THREE.MathUtils.clamp(
      _forward.x * normal.z - _forward.z * normal.x,
      -0.6,
      0.6,
    ));

    const rollAngle = Math.asin(THREE.MathUtils.clamp(_right.y, -0.8, 0.8));
    const targetRoll = Math.asin(THREE.MathUtils.clamp(
      _right.dot(_temp.copy(normal).cross(_forward).normalize()),
      -0.5,
      0.5,
    ));

    state.angularVelocity.x = THREE.MathUtils.lerp(
      state.angularVelocity.x,
      (targetPitch - pitchAngle) * 4,
      dt * 6,
    );
    state.angularVelocity.z = THREE.MathUtils.lerp(
      state.angularVelocity.z,
      (targetRoll - rollAngle) * 3,
      dt * 6,
    );
  }
}
