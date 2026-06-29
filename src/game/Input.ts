export class InputManager {
  private keys = new Set<string>();
  private justPressed = new Set<string>();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (!this.keys.has(event.code)) {
      this.justPressed.add(event.code);
    }
    this.keys.add(event.code);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private onBlur = (): void => {
    this.keys.clear();
    this.justPressed.clear();
  };

  endFrame(): void {
    this.justPressed.clear();
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  wasPressed(code: string): boolean {
    return this.justPressed.has(code);
  }

  get accelerate(): boolean {
    return this.isDown('KeyW') || this.isDown('ArrowUp');
  }

  get brake(): boolean {
    return this.isDown('KeyS') || this.isDown('ArrowDown');
  }

  get steerLeft(): boolean {
    return this.isDown('KeyA') || this.isDown('ArrowLeft');
  }

  get steerRight(): boolean {
    return this.isDown('KeyD') || this.isDown('ArrowRight');
  }

  get reset(): boolean {
    return this.wasPressed('KeyR');
  }

  get toggleCamera(): boolean {
    return this.wasPressed('KeyC');
  }

  get toggleEditor(): boolean {
    return this.wasPressed('KeyE');
  }

  get toggleEditorCamera(): boolean {
    return this.wasPressed('KeyT');
  }

  get nextCar(): boolean {
    return this.wasPressed('KeyQ');
  }

  get prevCar(): boolean {
    return this.wasPressed('KeyZ');
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }
}
