import { Key, MouseButton } from './Key.js';
import { KeyCode, keyCodeByUeText } from './KeyCode.js';

export class InputData {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  key: Key | null;

  constructor();
  constructor(data: InputData);
  constructor(key: Key);
  constructor(ctrl: boolean, alt: boolean, shift: boolean, key: Key);
  constructor(...args: unknown[]) {
    if (args.length === 0) {
      this.ctrl = false;
      this.alt = false;
      this.shift = false;
      this.key = null;
    } else if (args.length === 1 && args[0] instanceof InputData) {
      const d = args[0] as InputData;
      this.ctrl = d.ctrl;
      this.alt = d.alt;
      this.shift = d.shift;
      this.key = d.key;
    } else if (args.length === 1 && args[0] instanceof Key) {
      this.ctrl = false;
      this.alt = false;
      this.shift = false;
      this.key = args[0];
    } else {
      this.ctrl = args[0] as boolean;
      this.alt = args[1] as boolean;
      this.shift = args[2] as boolean;
      this.key = args[3] as Key;
    }
  }

  matches(
    keys: Set<KeyCode>,
    buttons: Set<MouseButton>,
    currentKey: KeyCode | null,
    currentMouse: MouseButton | null,
  ): boolean {
    const ctrlCode = keyCodeByUeText('control');
    const altCode = keyCodeByUeText('alt');
    const shiftCode = keyCodeByUeText('shift');
    if (this.ctrl && !(ctrlCode && keys.has(ctrlCode))) return false;
    if (this.alt && !(altCode && keys.has(altCode))) return false;
    if (this.shift && !(shiftCode && keys.has(shiftCode))) return false;
    // Java's matches() assumes `key` is non-null when invoked; we keep the
    // same assumption but guard for the null no-arg-ctor case.
    if (this.key !== null && this.key.key !== null) return this.key.key === currentKey;
    if (this.key !== null && this.key.button !== null) return this.key.button === currentMouse;
    if (currentKey && ctrlCode && currentKey === ctrlCode) return this.ctrl;
    if (currentKey && altCode && currentKey === altCode) return this.alt;
    if (currentKey && shiftCode && currentKey === shiftCode) return this.shift;
    return false;
  }

  toJson(): Record<string, unknown> {
    const obj: Record<string, unknown> = {
      ctrl: this.ctrl,
      alt: this.alt,
      shift: this.shift,
    };
    if (this.key !== null) obj.key = this.key.toString();
    return obj;
  }
}
