import * as THREE from 'three';
import { GRID_SIZE, TILE_SIZE } from '../track/TrackConstants';
import { buildTrackScene, getHorizonBackground, updateTrackCell } from '../track/TrackBuilder';
import type { TrackObjectMap } from '../track/ModelLoader';
import type { TrackData } from '../track/TrackParser';
import { downloadTrackFile } from '../track/TrackSerializer';
import {
  EDITOR_CATEGORIES,
  getCategoryByFKey,
  getPaletteByCategory,
  HORIZON_OPTIONS,
  TILE_PALETTE,
  type TilePaletteEntry,
} from './TilePalette';

export type EditorLayer = 'track' | 'terrain';

export interface TrackEditorCallbacks {
  onTrackChanged: (data: TrackData, changedCell?: { x: number; z: number }) => void;
  onModeChanged: (editing: boolean) => void;
}

export class TrackEditor {
  private dock: HTMLElement;
  private sidePanel: HTMLElement;
  private gridOverlay: THREE.Group | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private editing = false;
  private activeCategory = EDITOR_CATEGORIES[1];
  private selectedTile: TilePaletteEntry;
  private isPainting = false;
  private trackObjects: TrackObjectMap | null = null;
  private onKeyDown: (e: KeyboardEvent) => void;

  constructor(
    private scene: THREE.Scene,
    private camera: THREE.Camera,
    private domElement: HTMLElement,
    private getTrackData: () => TrackData,
    private callbacks: TrackEditorCallbacks,
    private trackGroup: THREE.Group,
  ) {
    this.selectedTile = getPaletteByCategory('track', 'Road')[0];
    this.dock = this.buildDock();
    this.sidePanel = this.buildSidePanel();
    document.body.appendChild(this.dock);
    document.body.appendChild(this.sidePanel);
    this.bindEvents();

    this.onKeyDown = (e: KeyboardEvent) => {
      if (!this.editing) return;
      const match = e.code.match(/^F(\d+)$/);
      if (match) {
        const cat = getCategoryByFKey(`F${match[1]}`);
        if (cat) {
          e.preventDefault();
          this.setCategory(cat.key);
        }
      }
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  setTrackObjects(objects: TrackObjectMap): void {
    this.trackObjects = objects;
  }

  isEditing(): boolean {
    return this.editing;
  }

  toggle(): void {
    this.editing = !this.editing;
    this.dock.hidden = !this.editing;
    this.sidePanel.hidden = !this.editing;
    this.callbacks.onModeChanged(this.editing);
    if (this.editing) {
      this.showGridOverlay();
    } else {
      this.hideGridOverlay();
    }
  }

  private buildDock(): HTMLElement {
    const dock = document.createElement('div');
    dock.id = 'editor-dock';
    dock.hidden = true;
    dock.innerHTML = `
      <div class="editor-titlebar">
        <span class="editor-title">TRACK EDITOR</span>
        <span class="editor-subtitle">4D Sports Driving</span>
      </div>
      <div class="category-tabs" id="category-tabs"></div>
      <div class="tile-icon-strip" id="tile-icon-strip"></div>
      <div class="editor-toolbar">
        <button id="editor-save" title="Save track">💾 Save</button>
        <button id="editor-load" title="Load track">📂 Load</button>
        <button id="editor-new" title="New track">📄 New</button>
        <label class="horizon-label">Sky
          <select id="horizon-select"></select>
        </label>
        <span class="editor-hint">F1–F7 categories · Click/drag to paint · Drive with WASD · E close</span>
      </div>
    `;
    return dock;
  }

  private buildSidePanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'editor-side';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="side-label">Selected</div>
      <img id="selected-tile-icon" class="selected-tile-icon" alt="" />
      <div id="selected-tile-name" class="selected-tile-name">Road N-S</div>
      <div id="selected-tile-hex" class="selected-tile-hex">0x04</div>
    `;
    return panel;
  }

  private bindEvents(): void {
    this.renderCategoryTabs();
    this.renderTileStrip();

    this.dock.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tab = target.closest('[data-fkey]') as HTMLElement | null;
      if (tab?.dataset.fkey) {
        this.setCategory(tab.dataset.fkey);
      }
      if (target.dataset.tileId) {
        const found = TILE_PALETTE.find((t) => t.id === target.dataset.tileId);
        if (found) {
          this.selectedTile = found;
          this.renderTileStrip();
          this.updateSelectedPreview();
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

    this.dock.querySelector('#editor-load')?.addEventListener('click', () => loadInput.click());
    loadInput.addEventListener('change', async () => {
      const file = loadInput.files?.[0];
      if (!file) return;
      const { loadTrackFromFile } = await import('../track/TrackSerializer');
      this.callbacks.onTrackChanged(await loadTrackFromFile(file));
      loadInput.value = '';
    });

    const horizonSelect = () => this.dock.querySelector('#horizon-select') as HTMLSelectElement;
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
      if ((e.target as HTMLElement).closest('#editor-dock, #editor-side')) return;
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

    this.updateSelectedPreview();
  }

  private setCategory(fKey: string): void {
    const cat = getCategoryByFKey(fKey);
    if (!cat) return;
    this.activeCategory = cat;
    const tiles = getPaletteByCategory(cat.layer, cat.category);
    if (tiles.length > 0 && !tiles.find((t) => t.id === this.selectedTile.id)) {
      this.selectedTile = tiles[0];
    }
    this.renderCategoryTabs();
    this.renderTileStrip();
    this.updateSelectedPreview();
  }

  private renderCategoryTabs(): void {
    const container = this.dock.querySelector('#category-tabs');
    if (!container) return;
    container.innerHTML = '';
    for (const cat of EDITOR_CATEGORIES) {
      const btn = document.createElement('button');
      btn.className = 'category-tab';
      btn.dataset.fkey = cat.key;
      btn.innerHTML = `<kbd>${cat.key}</kbd> ${cat.label}`;
      if (cat.key === this.activeCategory.key) {
        btn.classList.add('active');
      }
      container.appendChild(btn);
    }
  }

  private renderTileStrip(): void {
    const container = this.dock.querySelector('#tile-icon-strip');
    if (!container) return;
    container.innerHTML = '';

    const tiles = getPaletteByCategory(this.activeCategory.layer, this.activeCategory.category);
    for (const tile of tiles) {
      const btn = document.createElement('button');
      btn.className = 'tile-icon-btn';
      btn.dataset.tileId = tile.id;
      btn.title = `${tile.label} (0x${tile.byte.toString(16).toUpperCase()})`;
      if (tile.id === this.selectedTile.id) {
        btn.classList.add('selected');
      }

      const img = document.createElement('img');
      img.src = tile.icon;
      img.alt = tile.label;
      img.width = 32;
      img.height = 32;
      img.draggable = false;

      btn.appendChild(img);
      container.appendChild(btn);
    }
  }

  private updateSelectedPreview(): void {
    const img = this.sidePanel.querySelector('#selected-tile-icon') as HTMLImageElement;
    const name = this.sidePanel.querySelector('#selected-tile-name');
    const hex = this.sidePanel.querySelector('#selected-tile-hex');
    if (img) {
      img.src = this.selectedTile.icon;
      img.alt = this.selectedTile.label;
    }
    if (name) name.textContent = this.selectedTile.label;
    if (hex) hex.textContent = `0x${this.selectedTile.byte.toString(16).toUpperCase().padStart(2, '0')}`;
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
    const grid = this.activeCategory.layer === 'terrain' ? data.terrain : data.track;
    if (grid[gz][gx] === this.selectedTile.byte) return;

    grid[gz][gx] = this.selectedTile.byte;
    this.callbacks.onTrackChanged(data, { x: gx, z: gz });
  }

  updateCell(data: TrackData, x: number, z: number): void {
    if (!this.trackObjects) return;
    updateTrackCell(this.trackGroup, data, this.trackObjects, x, z);
  }

  rebuildAll(data: TrackData): void {
    if (!this.trackObjects) return;

    this.scene.remove(this.trackGroup);
    const newGroup = buildTrackScene(data, this.trackObjects);
    this.scene.add(newGroup);
    this.trackGroup = newGroup;

    const horizon = getHorizonBackground(data.horizon);
    document.body.style.background = `#888 url("${horizon}") no-repeat fixed center`;
    document.body.style.backgroundSize = '100% auto';
    document.body.style.backgroundPosition = '50% 25%';

    const horizonSelect = this.dock.querySelector('#horizon-select') as HTMLSelectElement;
    if (horizonSelect) {
      horizonSelect.value = String(data.horizon);
    }

    if (this.editing) {
      this.showGridOverlay();
    }
  }

  getTrackGroup(): THREE.Group {
    return this.trackGroup;
  }

  private showGridOverlay(): void {
    this.hideGridOverlay();
    this.gridOverlay = new THREE.Group();
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });

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
    window.removeEventListener('keydown', this.onKeyDown);
    this.dock.remove();
    this.sidePanel.remove();
    this.hideGridOverlay();
  }
}
