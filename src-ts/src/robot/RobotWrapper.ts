import { invoke } from '@tauri-apps/api/core';
import { Logger } from '../vproxy-base/Logger.js';
import { Key, MouseButton } from '../entity/input/Key.js';
import { MouseWheelScroll, MouseWheelDirection } from '../entity/input/MouseWheelScroll.js';

/**
 * Mirrors `io.vproxy.vfx.robot.RobotWrapper`.
 *
 * The JavaFX original drives `javafx.scene.robot.Robot` (with an `awt.Robot`
 * fallback for screen capture). The DOM cannot synthesize input or capture
 * the screen, so each operation is delegated to a native Tauri command
 * implemented in Rust (`src-tauri/src/robot.rs`) backed by the `enigo` (input
 * simulation) and `xcap` (screen capture) crates.
 *
 * Key identity is transported as the DOM `KeyboardEvent.code` of the pressed
 * key, which the Rust side maps to the native key. Mouse buttons use the
 * framework wire values "PRIMARY"/"SECONDARY"/"MIDDLE". Screen captures
 * resolve to a PNG `data:` URL (base64) since the DOM has no direct pixel
 * buffer type.
 *
 * Unlike the synchronous Java API, every method here is async (invoke returns
 * a Promise). Callers must `await` results.
 */
export class RobotWrapper {
  /**
   * Press a key/mouse-button/wheel according to which field of `key` is set,
   * matching Java's `RobotWrapper.press(Key)`.
   */
  async press(key: Key): Promise<void> {
    try {
      if (key.button !== null) {
        await invoke('robot_mouse_press', { button: key.button });
        return;
      }
      if (key.scroll !== null) {
        await invoke('robot_mouse_wheel', { amount: scrollAmount(key.scroll) });
        return;
      }
      if (key.key !== null) {
        await invoke('robot_key_press', { domCode: key.key.domCode, isLeft: key.isLeftKey });
        return;
      }
    } catch (e) {
      Logger.warn('SYS_ERROR', `RobotWrapper.press failed: ${(e as Error).message ?? e}`);
    }
  }

  /** Release a key/mouse-button, matching Java's `RobotWrapper.release(Key)`. */
  async release(key: Key): Promise<void> {
    try {
      if (key.button !== null) {
        await invoke('robot_mouse_release', { button: key.button });
        return;
      }
      if (key.key !== null) {
        await invoke('robot_key_release', { domCode: key.key.domCode, isLeft: key.isLeftKey });
        return;
      }
    } catch (e) {
      Logger.warn('SYS_ERROR', `RobotWrapper.release failed: ${(e as Error).message ?? e}`);
    }
  }

  /** Move the mouse cursor to absolute screen coordinates. */
  async mouseMove(x: number, y: number): Promise<void> {
    try {
      await invoke('robot_mouse_move', { x, y });
    } catch (e) {
      Logger.warn('SYS_ERROR', `RobotWrapper.mouseMove failed: ${(e as Error).message ?? e}`);
    }
  }

  /**
   * Scroll the vertical mouse wheel. Negative = up, positive = down (AWT
   * convention, matching Java's `Robot.mouseWheel`).
   */
  async mouseWheel(wheelAmt: number): Promise<void> {
    try {
      await invoke('robot_mouse_wheel', { amount: wheelAmt });
    } catch (e) {
      Logger.warn('SYS_ERROR', `RobotWrapper.mouseWheel failed: ${(e as Error).message ?? e}`);
    }
  }

  /** Current mouse cursor position in absolute screen pixels. */
  async getMousePosition(): Promise<{ x: number; y: number }> {
    try {
      return await invoke<{ x: number; y: number }>('robot_get_mouse_position');
    } catch (e) {
      Logger.warn('SYS_ERROR', `RobotWrapper.getMousePosition failed: ${(e as Error).message ?? e}`);
      return { x: 0, y: 0 };
    }
  }

  /** Capture the entire primary monitor as a PNG data URL. */
  async captureScreen(): Promise<string> {
    return invoke<string>('robot_capture_screen');
  }

  /**
   * Capture a sub-rectangle of the primary monitor (screen pixels, relative to
   * the monitor's top-left) as a PNG data URL.
   */
  async capture(x: number, y: number, width: number, height: number): Promise<string> {
    return invoke<string>('robot_capture', { x, y, width, height });
  }
}

/**
 * Convert a `MouseWheelScroll` to the signed AWT-style wheel amount Java's
 * `RobotWrapper` computes: magnitude defaults to 1 when 0, and UP negates the
 * value.
 */
function scrollAmount(scroll: MouseWheelScroll): number {
  let n = scroll.value;
  if (n === 0) n = 1;
  if (scroll.direction === MouseWheelDirection.UP) {
    n = -n;
  }
  return n;
}

// Re-export so callers importing from RobotWrapper still get the input types,
// matching the Java package surface.
export { Key, MouseButton, MouseWheelScroll, MouseWheelDirection };
