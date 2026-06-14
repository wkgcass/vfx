import { MouseWheelScroll, MouseWheelDirection } from './MouseWheelScroll.js';
import { KeyCode, keyCodeByUeText } from './KeyCode.js';

export type MouseButton = 'PRIMARY' | 'SECONDARY' | 'MIDDLE' | 'NONE';

export const MouseButton = {
  PRIMARY: 'PRIMARY' as MouseButton,
  SECONDARY: 'SECONDARY' as MouseButton,
  MIDDLE: 'MIDDLE' as MouseButton,
  NONE: 'NONE' as MouseButton,
};

const mouseButtonToString = new Map<MouseButton, string>([
  ['PRIMARY', 'LeftMouseButton'],
  ['SECONDARY', 'RightMouseButton'],
  ['MIDDLE', 'MiddleMouseButton'],
]);
const stringToMouseButton = new Map<string, MouseButton>();
for (const [k, v] of mouseButtonToString) stringToMouseButton.set(v.toLowerCase(), k);

const requireLeftRightUeTexts = new Set<string>(['shift', 'control', 'alt']);

export class Key {
  readonly button: MouseButton | null;
  readonly scroll: MouseWheelScroll | null;
  readonly key: KeyCode | null;
  readonly isLeftKey: boolean;
  readonly raw: string;

  constructor(raw: string);
  constructor(button: MouseButton, _marker?: undefined);
  constructor(scroll: MouseWheelScroll);
  constructor(key: KeyCode, isLeftKey?: boolean);
  constructor(arg0: string | MouseButton | MouseWheelScroll | KeyCode, isLeftKey?: boolean) {
    if (typeof arg0 === 'string') {
      this.raw = arg0;
      this.button = formatButton(arg0);
      this.scroll = formatScroll(arg0);
      this.key = formatKey(arg0);
      this.isLeftKey = checkIsLeftKey(arg0);
      return;
    }
    if (typeof arg0 === 'string' && (arg0 === 'PRIMARY' || arg0 === 'SECONDARY' || arg0 === 'MIDDLE' || arg0 === 'NONE')) {
      // unreachable due to TypeScript overload, but kept for runtime safety
      this.button = arg0 as MouseButton;
      this.scroll = null;
      this.key = null;
      this.isLeftKey = false;
      this.raw = render(null, null, null, false) ?? arg0;
      return;
    }
    if (arg0 instanceof MouseWheelScroll) {
      this.button = null;
      this.scroll = arg0;
      this.key = null;
      this.isLeftKey = false;
      this.raw = render(null, arg0, null, false) ?? 'Unknown';
      return;
    }
    const kc = arg0 as KeyCode;
    const left = isLeftKey ?? false;
    this.button = null;
    this.scroll = null;
    this.key = kc;
    this.isLeftKey = left;
    this.raw = render(null, null, kc, left) ?? 'Unknown';
  }

  isValid(): boolean {
    return render(this.button, this.scroll, this.key, this.isLeftKey) !== null;
  }

  toString(): string {
    const r = render(this.button, this.scroll, this.key, this.isLeftKey);
    return r ?? this.raw ?? 'Unknown';
  }

  equals(o: unknown): boolean {
    if (!(o instanceof Key)) return false;
    return (
      o.isLeftKey === this.isLeftKey &&
      o.button === this.button &&
      o.key === this.key &&
      o.raw === this.raw
    );
  }

  hashCode(): number {
    let h = 0;
    if (this.button) h = mix(h, hashStr(this.button));
    if (this.key) h = mix(h, hashStr(this.key.ueText));
    h = mix(h, this.isLeftKey ? 1 : 0);
    if (this.raw) h = mix(h, hashStr(this.raw));
    return h;
  }

  toJson(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    if (this.button) obj.button = this.button;
    if (this.scroll) obj.scroll = this.scroll.toJson();
    if (this.key) {
      obj.key = this.key.name;
      obj.isLeftKey = this.isLeftKey;
    }
    if (!this.button && !this.key && this.raw) obj.raw = this.raw;
    return obj;
  }
}

function formatButton(raw: string): MouseButton | null {
  return stringToMouseButton.get(raw.toLowerCase()) ?? null;
}

function formatScroll(raw: string): MouseWheelScroll | null {
  if (!raw.startsWith('scroll-')) return null;
  let r = raw.substring('scroll-'.length);
  let dir: string;
  let val: string;
  if (r.includes(':')) {
    const split = r.split(':');
    if (split.length !== 2) return null;
    dir = split[0]!;
    val = split[1]!;
  } else {
    dir = r;
    val = '0';
  }
  const d = dir.toUpperCase() as MouseWheelDirection;
  if (d !== MouseWheelDirection.UP && d !== MouseWheelDirection.DOWN) return null;
  const v = parseInt(val, 10);
  if (Number.isNaN(v)) return null;
  return new MouseWheelScroll(d, v);
}

function formatKey(raw: string): KeyCode | null {
  const direct = keyCodeByUeText(raw);
  if (direct) return direct;
  // Java's stringToKeyCodeMap maps both "leftshift" and "rightshift" to SHIFT
  // (and similarly for control/alt). Strip the Left/Right prefix for modifier keys.
  const lower = raw.toLowerCase();
  for (const prefix of ['left', 'right']) {
    if (lower.startsWith(prefix)) {
      const stripped = lower.substring(prefix.length);
      const kc = keyCodeByUeText(stripped);
      if (kc) return kc;
    }
  }
  return null;
}

function checkIsLeftKey(raw: string): boolean {
  const r = raw.toLowerCase();
  return (
    requireLeftRightUeTexts.has(r.replace(/^left|^right/, '')) ||
    (r.startsWith('left') && /left(shift|control|alt)/.test(r))
  ) && r.startsWith('left');
}

function render(
  button: MouseButton | null,
  scroll: MouseWheelScroll | null,
  key: KeyCode | null,
  isLeftKey: boolean,
): string | null {
  if (button !== null) return mouseButtonToString.get(button) ?? null;
  if (scroll !== null) return scroll.toString();
  if (key !== null) {
    let ret = key.ueText;
    if (requireLeftRightUeTexts.has(key.ueText.toLowerCase())) {
      ret = (isLeftKey ? 'Left' : 'Right') + ret;
    }
    return ret;
  }
  return null;
}

function mix(h: number, v: number): number {
  return ((31 * h) + v) | 0;
}
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (31 * h + s.charCodeAt(i)) | 0;
  return h;
}
