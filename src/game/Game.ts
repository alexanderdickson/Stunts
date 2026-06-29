import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Car } from '../car/Car';
import { CAR_IDS } from '../car/CarDefinitions';
import { TrackEditor } from '../editor/TrackEditor';
import { SurfaceSampler } from '../physics/SurfaceSampler';
import { InputManager } from './Input';
import { buildTrackScene, getHorizonBackground } from '../track/TrackBuilder';
import { loadTrackObjects } from '../track/ModelLoader';
import {
  findStartPosition,
  parseTrackFile,
  type TrackData,
} from '../track/TrackParser';
import { GRID_SIZE, TILE_SIZE } from '../track/TrackConstants';

type CameraMode = 'chase' | 'hood';

export class Game {
  private container!: HTMLDivElement;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private stats!: Stats;
  private clock = new THREE.Clock();
  private input = new InputManager();
  private car!: Car;
  private surface!: SurfaceSampler;
  private trackData!: TrackData;
  private trackGroup!: THREE.Group;
  private editor!: TrackEditor;
  private cameraMode: CameraMode = 'chase';
  private carIndex = 0;
  private editing = false;
  private editorTopDown = false;

  constructor(
    private readonly loadingEl: HTMLElement,
    private readonly hudEl: HTMLElement,
    private readonly speedEl: HTMLElement,
    private readonly rpmEl: HTMLElement,
    private readonly gearEl: HTMLElement,
    private readonly carNameEl: HTMLElement,
  ) {}

  async start(): Promise<void> {
    this.initRenderer();
    await this.loadWorld();
    this.animate();
  }

  private initRenderer(): void {
    this.container = document.createElement('div');
    document.body.appendChild(this.container);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87ceeb, 120, 520);

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.5,
      2000,
    );

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    const sun = new THREE.DirectionalLight(0xfff2d6, 1.1);
    sun.position.set(80, 140, 40);
    this.scene.add(ambient, sun);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x87ceeb);
    this.container.appendChild(this.renderer.domElement);

    this.stats = new Stats();
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.right = '0';
    this.stats.dom.style.left = 'auto';
    this.container.appendChild(this.stats.dom);

    window.addEventListener('resize', this.onResize);
  }

  private async loadWorld(): Promise<void> {
    const [trackObjects, trackResponse] = await Promise.all([
      loadTrackObjects(),
      fetch('/trks/DEFAULT.TRK'),
    ]);

    this.trackData = parseTrackFile(await trackResponse.arrayBuffer());
    this.surface = new SurfaceSampler(this.trackData);

    const start = findStartPosition(this.trackData);
    this.car = await Car.create(CAR_IDS[this.carIndex], start);
    this.scene.add(this.car.mesh);

    this.trackGroup = buildTrackScene(this.trackData, trackObjects);
    this.scene.add(this.trackGroup);

    this.applyHorizon(this.trackData.horizon);
    this.positionCameraOverview();

    this.editor = new TrackEditor(
      this.scene,
      this.camera,
      this.renderer.domElement,
      () => this.trackData,
      {
        onTrackChanged: (data) => this.onTrackChanged(data),
        onModeChanged: (editing) => this.setEditMode(editing),
      },
      this.trackGroup,
    );
    this.editor.setTrackObjects(trackObjects);

    this.loadingEl.hidden = true;
    this.hudEl.hidden = false;
    this.updateCarHud();
  }

  private onTrackChanged(data: TrackData, changedCell?: { x: number; z: number }): void {
    this.trackData = data;
    this.surface.setTrackData(data);

    if (changedCell) {
      this.editor.updateCell(data, changedCell.x, changedCell.z);
    } else {
      this.editor.rebuildAll(data);
      this.trackGroup = this.editor.getTrackGroup();
    }
  }

  private setEditMode(editing: boolean): void {
    this.editing = editing;
    this.editorTopDown = false;
  }

  private async switchCar(delta: number): Promise<void> {
    this.carIndex = (this.carIndex + delta + CAR_IDS.length) % CAR_IDS.length;
    const carId = CAR_IDS[this.carIndex];
    const start = findStartPosition(this.trackData);
    const pos = this.car.physics.state.position.clone();
    const heading = this.car.physics.state.quaternion;

    this.scene.remove(this.car.mesh);
    this.car = await Car.create(carId, start);
    this.car.physics.state.position.copy(pos);
    this.car.physics.state.quaternion.copy(heading);
    this.scene.add(this.car.mesh);
    this.updateCarHud();
  }

  private updateCarHud(): void {
    this.carNameEl.textContent = `${this.car.definition.name} (${this.car.definition.abbreviation})`;
  }

  private applyHorizon(horizonByte: number): void {
    const horizon = getHorizonBackground(horizonByte);
    document.body.style.background = `#888 url("${horizon}") no-repeat fixed center`;
    document.body.style.backgroundSize = '100% auto';
    document.body.style.backgroundPosition = '50% 25%';
  }

  private positionCameraOverview(): void {
    const centerX = (GRID_SIZE / 2) * TILE_SIZE;
    const centerZ = -(GRID_SIZE / 2) * TILE_SIZE;
    this.camera.position.set(centerX, 80, centerZ + 120);
    this.camera.lookAt(centerX, 0, centerZ);
  }

  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private handleInput(): void {
    if (this.input.toggleEditor) {
      this.editor.toggle();
    }

    if (this.editing && this.input.toggleEditorCamera) {
      this.editorTopDown = !this.editorTopDown;
    }

    if (this.input.reset) {
      this.car.reset();
    }

    if (this.input.toggleCamera) {
      this.cameraMode = this.cameraMode === 'chase' ? 'hood' : 'chase';
    }

    if (this.input.nextCar) {
      void this.switchCar(1);
    }
    if (this.input.prevCar) {
      void this.switchCar(-1);
    }
  }

  private updateCamera(): void {
    if (this.editing && this.editorTopDown) {
      const centerX = (GRID_SIZE / 2) * TILE_SIZE;
      const centerZ = -(GRID_SIZE / 2) * TILE_SIZE;
      const target = new THREE.Vector3(centerX, 0, centerZ);
      this.camera.position.lerp(new THREE.Vector3(centerX, 120, centerZ + 60), 0.08);
      this.camera.lookAt(target);
      return;
    }

    const { position, quaternion } = this.car.physics.state;
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    const forward = new THREE.Vector3(Math.sin(euler.y), 0, Math.cos(euler.y));

    if (this.cameraMode === 'hood') {
      this.camera.position.copy(position).add(new THREE.Vector3(0, 1.6, 0).applyQuaternion(quaternion));
      const lookTarget = position.clone().add(forward.clone().multiplyScalar(20));
      lookTarget.y = position.y + 1.0;
      this.camera.lookAt(lookTarget);
      return;
    }

    const chaseOffset = forward.clone().multiplyScalar(-14).add(new THREE.Vector3(0, 6.5, 0));
    const desired = position.clone().add(chaseOffset);
    this.camera.position.lerp(desired, 0.12);
    this.camera.lookAt(position.clone().add(new THREE.Vector3(0, 1.5, 0)));
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.05);

    this.handleInput();

    this.car.update(delta, this.input, this.surface);
    this.speedEl.textContent = `${this.car.speedKmh} km/h`;
    this.rpmEl.textContent = `${this.car.rpm} RPM`;
    this.gearEl.textContent = `Gear ${this.car.gear}`;

    this.updateCamera();
    this.input.endFrame();

    this.stats.update();
    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    window.removeEventListener('resize', this.onResize);
    this.input.dispose();
    this.editor.dispose();
    this.renderer.dispose();
  }
}
