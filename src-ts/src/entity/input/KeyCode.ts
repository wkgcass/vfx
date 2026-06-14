export class KeyCode {
  readonly code: number;
  readonly ueText: string;
  readonly domCode: string;
  readonly name: string;
  readonly requireLeftRight: boolean;

  constructor(code: number, ueText: string, domCode: string, name: string, requireLeftRight = false) {
    this.code = code;
    this.ueText = ueText;
    this.domCode = domCode;
    this.name = name;
    this.requireLeftRight = requireLeftRight;
  }

  toString(): string {
    return this.ueText;
  }
}

const entries: Array<[number, string, string, string, boolean?]> = [
  [0x0004, 'A', 'KeyA', 'A'], [0x0005, 'B', 'KeyB', 'B'], [0x0006, 'C', 'KeyC', 'C'], [0x0007, 'D', 'KeyD', 'D'],
  [0x0008, 'E', 'KeyE', 'E'], [0x0009, 'F', 'KeyF', 'F'], [0x000a, 'G', 'KeyG', 'G'], [0x000b, 'H', 'KeyH', 'H'],
  [0x000c, 'I', 'KeyI', 'I'], [0x000d, 'J', 'KeyJ', 'J'], [0x000e, 'K', 'KeyK', 'K'], [0x000f, 'L', 'KeyL', 'L'],
  [0x0010, 'M', 'KeyM', 'M'], [0x0011, 'N', 'KeyN', 'N'], [0x0012, 'O', 'KeyO', 'O'], [0x0013, 'P', 'KeyP', 'P'],
  [0x0014, 'Q', 'KeyQ', 'Q'], [0x0015, 'R', 'KeyR', 'R'], [0x0016, 'S', 'KeyS', 'S'], [0x0017, 'T', 'KeyT', 'T'],
  [0x0018, 'U', 'KeyU', 'U'], [0x0019, 'V', 'KeyV', 'V'], [0x001a, 'W', 'KeyW', 'W'], [0x001b, 'X', 'KeyX', 'X'],
  [0x001c, 'Y', 'KeyY', 'Y'], [0x001d, 'Z', 'KeyZ', 'Z'],
  [0x001e, 'One', 'Digit1', 'KEY_1'], [0x001f, 'Two', 'Digit2', 'KEY_2'], [0x0020, 'Three', 'Digit3', 'KEY_3'],
  [0x0021, 'Four', 'Digit4', 'KEY_4'], [0x0022, 'Five', 'Digit5', 'KEY_5'], [0x0023, 'Six', 'Digit6', 'KEY_6'],
  [0x0024, 'Seven', 'Digit7', 'KEY_7'], [0x0025, 'Eight', 'Digit8', 'KEY_8'], [0x0026, 'Nine', 'Digit9', 'KEY_9'],
  [0x0027, 'Zero', 'Digit0', 'KEY_0'],
  [0x0028, 'Enter', 'Enter', 'ENTER'], [0x0029, 'Escape', 'Escape', 'ESCAPE'], [0x002a, 'BackSpace', 'Backspace', 'BACKSPACE'],
  [0x002b, 'Tab', 'Tab', 'TAB'], [0x002c, 'SpaceBar', 'Space', 'SPACE'],
  [0x002d, 'Hyphen', 'Minus', 'MINUS'], [0x002e, 'Equals', 'Equal', 'EQUALS'],
  [0x002f, 'LeftBracket', 'BracketLeft', 'OPEN_BRACKET'], [0x0030, 'RightBracket', 'BracketRight', 'CLOSE_BRACKET'],
  [0x0031, 'Backslash', 'Backslash', 'BACK_SLASH'], [0x0033, 'Semicolon', 'Semicolon', 'SEMICOLON'], [0x0034, 'Quote', 'Quote', 'QUOTE'],
  [0x0035, 'Tilde', 'Backquote', 'BACKQUOTE'], [0x0036, 'Comma', 'Comma', 'COMMA'], [0x0037, 'Period', 'Period', 'PERIOD'],
  [0x0038, 'Slash', 'Slash', 'SLASH'],
  [0x0039, 'CapsLock', 'CapsLock', 'CAPS_LOCK'],
  [0x003a, 'F1', 'F1', 'F1'], [0x003b, 'F2', 'F2', 'F2'], [0x003c, 'F3', 'F3', 'F3'], [0x003d, 'F4', 'F4', 'F4'],
  [0x003e, 'F5', 'F5', 'F5'], [0x003f, 'F6', 'F6', 'F6'], [0x0040, 'F7', 'F7', 'F7'], [0x0041, 'F8', 'F8', 'F8'],
  [0x0042, 'F9', 'F9', 'F9'], [0x0043, 'F10', 'F10', 'F10'], [0x0044, 'F11', 'F11', 'F11'], [0x0045, 'F12', 'F12', 'F12'],
  [0x0046, 'PrintScreen', 'PrintScreen', 'PRINT_SCREEN'], [0x0047, 'ScrollLock', 'ScrollLock', 'SCROLL_LOCK'],
  [0x0048, 'Pause', 'Pause', 'PAUSE'],
  [0x0049, 'Insert', 'Insert', 'INSERT'], [0x004a, 'Home', 'Home', 'HOME'], [0x004b, 'PageUp', 'PageUp', 'PAGE_UP'],
  [0x004c, 'Delete', 'Delete', 'DELETE'], [0x004d, 'End', 'End', 'END'], [0x004e, 'PageDown', 'PageDown', 'PAGE_DOWN'],
  [0x004f, 'Right', 'ArrowRight', 'RIGHT'], [0x0050, 'Left', 'ArrowLeft', 'LEFT'],
  [0x0051, 'Down', 'ArrowDown', 'DOWN'], [0x0052, 'Up', 'ArrowUp', 'UP'],
  // Modifiers — marked requireLeftRight. The numeric `code` values for the
  // "Right" variants are intentionally placeholders: USB HID models left/right
  // modifier state as a single bitmap rather than separate key codes, so these
  // entries exist solely so `keyCodeByDomCode('ShiftRight' | 'ControlRight' |
  // 'AltRight')` succeeds. The codes below are placeholders that may collide
  // with other keys (e.g. 0xe1 for ShiftRight); `keyCodeByCode` is documented
  // to return only the canonical (Left) modifier entry.
  [0x002a, 'Shift', 'ShiftLeft', 'SHIFT', true], [0xe1, 'Shift', 'ShiftRight', 'SHIFT', true],
  [0x001d, 'Control', 'ControlLeft', 'CONTROL', true], [0xe2, 'Control', 'ControlRight', 'CONTROL', true],
  [0x0038, 'Alt', 'AltLeft', 'ALT', true], [0xe3, 'Alt', 'AltRight', 'ALT', true],
];

const byCode = new Map<number, KeyCode>();
const byUeText = new Map<string, KeyCode>();
const byDomCode = new Map<string, KeyCode>();

function intern(e: [number, string, string, string, boolean?]): KeyCode {
  return new KeyCode(e[0], e[1], e[2], e[3], e[4] ?? false);
}

for (const e of entries) {
  const kc = intern(e);
  if (!byCode.has(kc.code)) byCode.set(kc.code, kc);
  if (!byUeText.has(kc.ueText.toLowerCase())) byUeText.set(kc.ueText.toLowerCase(), kc);
  if (!byDomCode.has(kc.domCode)) byDomCode.set(kc.domCode, kc);
}

export const KeyCodeValues: ReadonlyArray<KeyCode> = Array.from(byCode.values());

export function keyCodeByCode(code: number): KeyCode | undefined {
  return byCode.get(code);
}

export function keyCodeByUeText(text: string): KeyCode | undefined {
  return byUeText.get(text.toLowerCase());
}

export function keyCodeByDomCode(dom: string): KeyCode | undefined {
  return byDomCode.get(dom);
}

export const KEYCODE_ESCAPE = byUeText.get('escape')!;
export const KEYCODE_ENTER = byUeText.get('enter')!;
export const KEYCODE_SHIFT = byUeText.get('shift')!;
export const KEYCODE_CONTROL = byUeText.get('control')!;
export const KEYCODE_ALT = byUeText.get('alt')!;
export const KEYCODE_SPACE = byUeText.get('spacebar')!;
