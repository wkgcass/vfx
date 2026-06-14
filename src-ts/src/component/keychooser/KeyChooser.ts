import { GlobalScreenUtils } from '../../control/globalscreen/GlobalScreenUtils.js';
import { VDialog } from '../../control/dialog/VDialog.js';
import { VDialogButton } from '../../control/dialog/VDialogButton.js';
import { Key, MouseButton } from '../../entity/input/Key.js';
import { KeyCode, keyCodeByDomCode } from '../../entity/input/KeyCode.js';
import { MouseWheelScroll, MouseWheelDirection } from '../../entity/input/MouseWheelScroll.js';
import { InternalI18n } from '../../manager/internal_i18n/InternalI18n.js';
import { Windows } from '../../window/WindowManager.js';

export class KeyChooser extends VDialog<Key> {
  public static readonly FLAG_WITH_MOUSE = 0x0001;
  public static readonly FLAG_WITH_WHEEL_SCROLL = 0x0002;

  constructor();
  constructor(flags: number);
  constructor(flags: number = KeyChooser.FLAG_WITH_MOUSE) {
    super();

    const buttons: VDialogButton<Key>[] = [];
    if ((flags & KeyChooser.FLAG_WITH_WHEEL_SCROLL) === KeyChooser.FLAG_WITH_WHEEL_SCROLL) {
      buttons.push(
        new VDialogButton<Key>(
          InternalI18n.get().keyChooserWheelScrollUpButton(),
          new Key(new MouseWheelScroll(MouseWheelDirection.UP)),
        ),
      );
      buttons.push(
        new VDialogButton<Key>(
          InternalI18n.get().keyChooserWheelScrollDownButton(),
          new Key(new MouseWheelScroll(MouseWheelDirection.DOWN)),
        ),
      );
    }
    if ((flags & KeyChooser.FLAG_WITH_MOUSE) === KeyChooser.FLAG_WITH_MOUSE) {
      buttons.push(
        new VDialogButton<Key>(
          InternalI18n.get().keyChooserLeftMouseButton(),
          new Key(MouseButton.PRIMARY),
        ),
      );
      buttons.push(
        new VDialogButton<Key>(
          InternalI18n.get().keyChooserMiddleMouseButton(),
          new Key(MouseButton.MIDDLE),
        ),
      );
      buttons.push(
        new VDialogButton<Key>(
          InternalI18n.get().keyChooserRightMouseButton(),
          new Key(MouseButton.SECONDARY),
        ),
      );
    }
    buttons.push(new VDialogButton<Key>(InternalI18n.get().cancelButton(), () => null));
    this.setButtons(buttons);

    const withMouse =
      (flags & (KeyChooser.FLAG_WITH_WHEEL_SCROLL | KeyChooser.FLAG_WITH_MOUSE)) !== 0;
    this
      .getMessageNode()
      .setText(
        withMouse
          ? InternalI18n.get().keyChooserDesc()
          : InternalI18n.get().keyChooserDescWithoutMouse(),
      );

    if (buttons.length > 4) {
      this.getStage().getStage().setWidth(1200);
    }
  }

  async choose(): Promise<Key | null> {
    GlobalScreenUtils.enable(this);

    const handler = (e: KeyboardEvent): void => {
      if (e.code.startsWith('Numpad')) return;

      const keyCode = keyCodeByDomCode(e.code);
      if (keyCode === undefined) return;

      let key: Key;
      if (keyCode.requireLeftRight) {
        const isLeft = e.code.endsWith('Left');
        key = new Key(keyCode, isLeft);
      } else {
        key = new Key(keyCode);
      }

      this.returnValue = key;
      window.removeEventListener('keydown', handler);
      void this.getStage().close();
    };
    window.addEventListener('keydown', handler);

    try {
      return await this.showAndWait();
    } finally {
      window.removeEventListener('keydown', handler);
      GlobalScreenUtils.disable(this);
    }
  }

  /**
   * Open a KeyChooser in a new OS window. Resolves with the chosen key
   * (from either a button click or a real keypress captured by the child)
   * or null if the window was closed without a choice.
   *
   * The result is serialized via `Key.toString()` in the child and
   * reconstructed via the `Key(string)` constructor here; the round-trip
   * is lossless for all values KeyChooser can produce.
   */
  static async askKey(flags: number = KeyChooser.FLAG_WITH_MOUSE): Promise<Key | null> {
    const withWheelScroll =
      (flags & KeyChooser.FLAG_WITH_WHEEL_SCROLL) === KeyChooser.FLAG_WITH_WHEEL_SCROLL;
    const withMouse =
      (flags & KeyChooser.FLAG_WITH_MOUSE) === KeyChooser.FLAG_WITH_MOUSE;
    // +1 for the implicit Cancel button added by the constructor.
    const buttonCount = (withWheelScroll ? 2 : 0) + (withMouse ? 3 : 0) + 1;

    const handle = await Windows.open({
      kind: 'keychooser',
      title: 'KeyChooser',
      width: buttonCount > 4 ? 1200 : 900,
      height: 200,
      params: { flags },
    });
    const serialized = await handle.result<string>();
    if (serialized === null) return null;
    return new Key(serialized);
  }
}
