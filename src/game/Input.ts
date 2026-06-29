export class InputManager {
  private keys = new Set<string>();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private onBlur = (): void => {
    this.keys.clear();
  };

  isDown(code: string): boolean {
    return this.keys.has(code);
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
    return this.isDown('KeyR');
  }

  get toggleCamera(): boolean {
    return this.isDown('KeyC');
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }
}
