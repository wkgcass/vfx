export class InternalI18n {
  private static instance: InternalI18n = new InternalI18n();

  static get(): InternalI18n { return InternalI18n.instance; }
  static set(i18n: InternalI18n): void { InternalI18n.instance = i18n; }

  cancelButton(): string { return 'Cancel'; }
  alertInfoTitle(): string { return 'Info'; }
  alertWarningTitle(): string { return 'Warning'; }
  alertErrorTitle(): string { return 'Error'; }
  alertOkButton(): string { return 'Ok'; }
  confirmationYesButton(): string { return 'Yes'; }
  confirmationNoButton(): string { return 'No'; }
  cannotFindAnyDisplay(): string { return 'cannot find any display'; }
  stacktraceAlertTitle(): string { return 'Exception'; }
  stacktraceAlertHeaderText(): string { return 'Exception Thrown'; }
  stacktraceAlertLabel(): string { return 'The exception stacktrace was:'; }
  keyChooserLeftMouseButton(): string { return 'Left mouse button'; }
  keyChooserRightMouseButton(): string { return 'Right mouse button'; }
  keyChooserMiddleMouseButton(): string { return 'Middle mouse button'; }
  keyChooserWheelScrollUpButton(): string { return 'Wheel scroll up'; }
  keyChooserWheelScrollDownButton(): string { return 'Wheel scroll down'; }
  keyChooserDesc(): string {
    return 'Please press the key you want to use, or click the buttons to choose left or right mouse button.';
  }
  keyChooserDescWithoutMouse(): string {
    return 'Please press the key you want to use.';
  }
  emptyTableLabel(): string { return 'No Data'; }
  sceneGroupPreCheckShowSceneFailed(): string {
    return 'An exception occurred when trying to show the scene.';
  }
  sceneGroupPreCheckHideSceneFailed(): string {
    return 'An exception occurred when trying to hide the scene.';
  }
  loadingCanceled(): string { return 'loading process canceled'; }
  globalScreenRegisterFailed(): string { return 'Enabling GlobalScreen failed.'; }
}
