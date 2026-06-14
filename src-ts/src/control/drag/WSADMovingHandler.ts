export abstract class WSADMovingHandler {
  private readonly xSpeed: number;
  private readonly ySpeed: number;
  private time = 0;
  private w = false;
  private s = false;
  private wsIsW = false;
  private a = false;
  private d = false;
  private adIsA = false;
  private rafId = 0;
  private x = 0;
  private y = 0;

  constructor(xSpeed: number, ySpeed: number) {
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
  }

  readonly handleKeyDown = (e: KeyboardEvent): void => {
    this.onPressed(e.code);
  };

  readonly handleKeyUp = (e: KeyboardEvent): void => {
    this.onReleased(e.code);
  };

  private onPressed(code: string): void {
    switch (code) {
      case 'KeyW':
        if (!this.w) {
          this.w = true;
          this.wsIsW = true;
          this.record();
        }
        break;
      case 'KeyS':
        if (!this.s) {
          this.s = true;
          this.wsIsW = false;
          this.record();
        }
        break;
      case 'KeyA':
        if (!this.a) {
          this.a = true;
          this.adIsA = true;
          this.record();
        }
        break;
      case 'KeyD':
        if (!this.d) {
          this.d = true;
          this.adIsA = false;
          this.record();
        }
        break;
      default:
        return;
    }
    if (this.w || this.s || this.a || this.d) {
      if (this.rafId === 0) {
        this.rafId = requestAnimationFrame(this.tick);
      }
    }
  }

  private record(): void {
    this.time = performance.now() * 1_000_000;
    const xy = this.get();
    this.x = xy[0];
    this.y = xy[1];
  }

  private onReleased(code: string): void {
    switch (code) {
      case 'KeyW':
        if (this.w) {
          this.w = false;
          this.wsIsW = false;
          this.record();
        }
        break;
      case 'KeyS':
        if (this.s) {
          this.s = false;
          this.wsIsW = true;
          this.record();
        }
        break;
      case 'KeyA':
        if (this.a) {
          this.a = false;
          this.adIsA = false;
          this.record();
        }
        break;
      case 'KeyD':
        if (this.d) {
          this.d = false;
          this.adIsA = true;
          this.record();
        }
        break;
      default:
        return;
    }
    if (!this.w && !this.s && !this.a && !this.d) {
      if (this.rafId !== 0) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }
    }
    if (!this.w && !this.s && !this.a && !this.d) {
      this.time = 0;
    }
  }

  private readonly tick = (nowMs: number): void => {
    if (this.time === 0) {
      // Keep the loop armed while keys are held; record() will refresh
      // `time` on the next press.
      if (this.w || this.s || this.a || this.d) {
        this.rafId = requestAnimationFrame(this.tick);
      } else {
        this.rafId = 0;
      }
      return;
    }
    const now = nowMs * 1_000_000;
    const delta = now - this.time;
    if (delta >= 0) {
      let x = this.x;
      let y = this.y;
      if (this.w || this.s) {
        if (this.wsIsW) {
          y -= (this.ySpeed * delta) / 1_000_000;
        } else {
          y += (this.ySpeed * delta) / 1_000_000;
        }
      }
      if (this.a || this.d) {
        if (this.adIsA) {
          x -= (this.xSpeed * delta) / 1_000_000;
        } else {
          x += (this.xSpeed * delta) / 1_000_000;
        }
      }
      this.set(x, y);
    }
    if (this.w || this.s || this.a || this.d) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.rafId = 0;
    }
  };

  dispose(): void {
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    this.time = 0;
  }

  protected abstract set(x: number, y: number): void;
  protected abstract get(): [number, number];
}
