import { InternalI18n } from '../../manager/internal_i18n/InternalI18n.js';
import { Windows } from '../../window/WindowManager.js';
import { VDialog } from './VDialog.js';
import { VDialogButton } from './VDialogButton.js';

export class VConfirmDialog extends VDialog<VConfirmDialog.Result> {
  constructor() {
    super();
    this.setButtons([
      new VDialogButton<VConfirmDialog.Result>(
        InternalI18n.get().confirmationYesButton(),
        VConfirmDialog.Result.YES,
      ),
      new VDialogButton<VConfirmDialog.Result>(
        InternalI18n.get().confirmationNoButton(),
        VConfirmDialog.Result.NO,
      ),
    ]);
  }

  static async ask(message?: string): Promise<VConfirmDialog.Result | null> {
    const handle = await Windows.open({
      kind: 'confirm',
      title: 'VFX',
      width: 900,
      height: 200,
      params: { message },
    });
    return handle.result<VConfirmDialog.Result>();
  }
}

export namespace VConfirmDialog {
  export enum Result {
    YES,
    NO,
  }
}
