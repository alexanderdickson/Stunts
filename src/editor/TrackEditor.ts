import * as THREE from 'three';
import { GRID_SIZE, TILE_SIZE } from '../track/TrackConstants';
import { buildTrackScene, getHorizonBackground } from '../track/TrackBuilder';
import type { TrackObjectMap } from '../track/ModelLoader';
import type { TrackData } from '../track/TrackParser';
import { downloadTrackFile } from '../track/TrackSerializer';
import {
  getPaletteByCategory,
  getPaletteCategories,
  HORIZON_OPTIONS,
  TILE_PALETTE,
  type TilePaletteEntry,
} from './TilePalette';

export type EditorLayer = 'track' | 'terrain';

export interface TrackEditorCallbacks {
  onTrackChanged: (data: TrackData) => void;
  onModeChanged: (editing: boolean) => void;
}

export class TrackEditor {
  private panel: HTMLElement;
  private gridOverlay: THREE.Group | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private editing = false;
  private layer: EditorLayer = 'track';
  private selectedTile: TilePaletteEntry;
  private isPainting = false;
  private trackObjects: TrackObjectMap | null = null;

  constructor(
    private scene: THREE.Scene,
    private camera: THREE.Camera,
    private domElement: HTMLElement,
    private getTrackData: () => TrackData,
    private callbacks: TrackEditorCallbacks,
    private trackGroup: THREE.Group,
  ) {
    this.selectedTile = getPaletteByCategory('track', 'Road')[0];
    this.panel = this.buildPanel();
    document.body.appendChild(this.panel);
    this.bindEvents();
  }

  setTrackObjects(objects: TrackObjectMap): void {
    this.trackObjects = objects;
  }

  isEditing(): boolean {
    return this.editing;
  }

  toggle(): void {
    this.editing = !this.editing;
    this.panel.hidden = !this.editing;
    this.callbacks.onModeChanged(this.editing);
    if (this.editing) {
      this.showGridOverlay();
    } else {
      this.hideGridOverlay();
    }
  }

  private buildPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'editor-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <h2>Track Editor</h2>
      <div class="editor-section">
        <label>Layer</label>
        <div class="btn-row">
          <button data-layer="track" class="active">Track</button>
          <button data-layer="terrain">Terrain</button>
        </div>
      </div>
      <div class="editor-section" id="palette-container"></div>
      <div class="editor-section">
        <label>Horizon</label>
        <select id="horizon-select"></select>
      </div>
      <div class="editor-section btn-row">
        <button id="editor-save">Save .TRK</button>
        <button id="editor-load">Load .TRK</button>
        <button id="editor-new">New Track</button>
      </div>
      <div class="editor-hint">Click/drag to paint · E to exit editor</div>
    `;
    return panel;
  }

  private bindEvents(): void {
    this.panel.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.layer) {
        this.layer = target.dataset.layer as EditorLayer;
        this.panel.querySelectorAll('[data-layer]').forEach((btn) => btn.classList.remove('active'));
        target.classList.add('active');
        this.renderPalette();
      }
      if (target.dataset.tileByte) {
        const byte = parseInt(target.dataset.tileByte, 10);
        const found = TILE_PALETTE.find(
          (t) => t.byte === byte && t.layer === this.layer && t.label === target.textContent,
        );
        if (found) {
          this.selectedTile = found;
          this.panel.querySelectorAll('[data-tile-byte]').forEach((el) => el.classList.remove('selected'));
          target.classList.add('selected');
        }
      }
      if (target.id === 'editor-save') {
        downloadTrackFile(this.getTrackData());
      }
      if (target.id === 'editor-new') {
        import('../track/TrackSerializer').then(({ createEmptyTrack }) => {
          this.callbacks.onTrackChanged(createEmptyTrack());
        });
      }
    });

    const loadInput = document.createElement('input');
    loadInput.type = 'file';
    loadInput.accept = '.trk,.TRK';
    loadInput.hidden = true;
    document.body.appendChild(loadInput);

    this.panel.querySelector('#editor-load')?.addEventListener('click', () => loadInput.click());
    loadInput.addEventListener('change', async () => {
      const file = loadInput.files?.[0];
      if (!file) return;
      const { loadTrackFromFile } = await import('../track/TrackSerializer');
      this.callbacks.onTrackChanged(await loadTrackFromFile(file));
      loadInput.value = '';
    });

    const horizonSelect = () => this.panel.querySelector('#horizon-select') as HTMLSelectElement;
    for (const opt of HORIZON_OPTIONS) {
      const option = document.createElement('option');
      option.value = String(opt.value);
      option.textContent = opt.label;
      horizonSelect().appendChild(option);
    }
    horizonSelect().addEventListener('change', () => {
      const data = this.getTrackData();
      data.horizon = parseInt(horizonSelect().value, 10);
      this.callbacks.onTrackChanged(data);
    });

    this.domElement.addEventListener('mousedown', (e) => {
      if (!this.editing || e.button !== 0) return;
      this.isPainting = true;
      this.paintAtMouse(e);
    });
    this.domElement.addEventListener('mousemove', (e) => {
      if (!this.editing || !this.isPainting) return;
      this.paintAtMouse(e);
    });
    window.addEventListener('mouseup', () => {
      this.isPainting = false;
    });

    this.renderPalette();
  }

  private renderPalette(): void {
    const container = this.panel.querySelector('#palette-container');
    if (!container) return;
    container.innerHTML = '';

    for (const category of getPaletteCategories(this.layer)) {
      const section = document.createElement('div');
      section.className = 'palette-category';
      section.innerHTML = `<label>${category}</label>`;
      const grid = document.createElement('div');
      grid.className = 'palette-grid';

      for (const tile of getPaletteByCategory(this.layer, category)) {
        const btn = document.createElement('button');
        btn.textContent = tile.label;
        btn.dataset.tileByte = String(tile.byte);
        btn.dataset.category = category;
        btn.title = `0x${tile.byte.toString(16).toUpperCase()}`;
        if (tile.byte === this.selectedTile.byte && tile.layer === this.layer) {
          btn.classList.add('selected');
        }
        grid.appendChild(btn);
      }
      section.appendChild(grid);
      container.appendChild(section);
    }
  }

  private paintAtMouse(event: MouseEvent): void {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hit = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.plane, hit)) return;

    const gx = Math.floor(hit.x / TILE_SIZE);
    const gz = Math.floor(-hit.z / TILE_SIZE);
    if (gx < 0 || gz < 0 || gx >= GRID_SIZE || gz >= GRID_SIZE) return;

    const data = this.getTrackData();
    const grid = this.layer === 'track' ? data.track : data.terrain;
    if (grid[gz][gx] === this.selectedTile.byte) return;

    grid[gz][gx] = this.selectedTile.byte;
    this.callbacks.onTrackChanged(data);
  }

  rebuildTrack(data: TrackData, trackGroup: THREE.Group): void {
    if (!this.trackObjects) return;

    this.scene.remove(trackGroup);
    const newGroup = buildTrackScene(data, this.trackObjects);
    this.scene.add(newGroup);
    this.trackGroup = newGroup;

    const horizon = getHorizonBackground(data.horizon);
    document.body.style.background = `#888 url("${horizon}") no-repeat fixed center`;
    document.body.style.backgroundSize = '100% auto';
    document.body.style.backgroundPosition = '50% 25%';

    const horizonSelect = this.panel.querySelector('#horizon-select') as HTMLSelectElement;
    if (horizonSelect) {
      horizonSelect.value = String(data.horizon);
    }

    this.showGridOverlay();
  }

  getTrackGroup(): THREE.Group {
    return this.trackGroup;
  }

  private showGridOverlay(): void {
    this.hideGridOverlay();
    this.gridOverlay = new THREE.Group();
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });

    for (let z = 0; z <= GRID_SIZE; z++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.2, -z * TILE_SIZE),
        new THREE.Vector3(GRID_SIZE * TILE_SIZE, 0.2, -z * TILE_SIZE),
      ]);
      this.gridOverlay.add(new THREE.Line(geometry, material));
    }
    for (let x = 0; x <= GRID_SIZE; x++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x * TILE_SIZE, 0.2, 0),
        new THREE.Vector3(x * TILE_SIZE, 0.2, -GRID_SIZE * TILE_SIZE),
      ]);
      this.gridOverlay.add(new THREE.Line(geometry, material));
    }

    this.scene.add(this.gridOverlay);
  }

  private hideGridOverlay(): void {
    if (this.gridOverlay) {
      this.scene.remove(this.gridOverlay);
      this.gridOverlay = null;
    }
  }

  dispose(): void {
    this.panel.remove();
    this.hideGridOverlay();
  }
}
