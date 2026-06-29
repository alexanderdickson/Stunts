import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Car } from '../car/Car';
import { TerrainSampler } from '../car/TerrainSampler';
import { InputManager } from './Input';
import { buildTrackScene, getHorizonBackground } from '../track/TrackBuilder';
import { loadTrackObjects } from '../track/ModelLoader';
import { findStartPosition, parseTrackFile } from '../track/TrackParser';
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
  private terrain!: TerrainSampler;
  private cameraMode: CameraMode = 'chase';
  private resetLatch = false;
  private cameraLatch = false;

  constructor(
    private readonly loadingEl: HTMLElement,
    private readonly hudEl: HTMLElement,
    private readonly speedEl: HTMLElement,
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

    const trackData = parseTrackFile(await trackResponse.arrayBuffer());
    const start = findStartPosition(trackData);

    this.terrain = new TerrainSampler(trackData);
    this.car = new Car(start);
    this.scene.add(this.car.mesh);

    const trackGroup = buildTrackScene(trackData, trackObjects);
    this.scene.add(trackGroup);

    const horizon = getHorizonBackground(trackData.horizon);
    document.body.style.background = `#888 url("${horizon}") no-repeat fixed center`;
    document.body.style.backgroundSize = '100% auto';
    document.body.style.backgroundPosition = '50% 25%';

    const centerX = (GRID_SIZE / 2) * TILE_SIZE;
    const centerZ = -(GRID_SIZE / 2) * TILE_SIZE;
    this.camera.position.set(centerX, 40, centerZ + 80);
    this.camera.lookAt(centerX, 0, centerZ);

    this.loadingEl.hidden = true;
    this.hudEl.hidden = false;
  }

  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private handleInput(): void {
    if (this.input.reset) {
      if (!this.resetLatch) {
        this.car.reset();
        this.resetLatch = true;
      }
    } else {
      this.resetLatch = false;
    }

    if (this.input.toggleCamera) {
      if (!this.cameraLatch) {
        this.cameraMode = this.cameraMode === 'chase' ? 'hood' : 'chase';
        this.cameraLatch = true;
      }
    } else {
      this.cameraLatch = false;
    }
  }

  private updateCamera(): void {
    const { position, heading } = this.car.state;
    const forward = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));

    if (this.cameraMode === 'hood') {
      this.camera.position.copy(position).add(new THREE.Vector3(0, 2.0, 0));
      const lookTarget = position.clone().add(forward.clone().multiplyScalar(20));
      lookTarget.y = position.y + 1.0;
      this.camera.lookAt(lookTarget);
      return;
    }

    const chaseOffset = forward.clone().multiplyScalar(-14).add(new THREE.Vector3(0, 6.5, 0));
    const desired = position.clone().add(chaseOffset);
    this.camera.position.lerp(desired, 0.12);
    const lookAt = position.clone().add(new THREE.Vector3(0, 1.5, 0));
    this.camera.lookAt(lookAt);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.05);

    this.handleInput();

    const groundHeight = this.terrain.sampleBilinear(
      this.car.state.position.x,
      this.car.state.position.z,
    );
    this.car.update(delta, this.input, groundHeight);
    this.updateCamera();

    this.speedEl.textContent = `${this.car.speedKmh} km/h`;
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    window.removeEventListener('resize', this.onResize);
    this.input.dispose();
    this.renderer.dispose();
  }
}
