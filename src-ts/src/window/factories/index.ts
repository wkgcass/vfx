import { registerStageFactory } from '../factory.js';
import { onChildCustom, childEmitCustom } from '../childComms.js';
import { VDialog } from '../../control/dialog/VDialog.js';
import { VDialogButton } from '../../control/dialog/VDialogButton.js';
import { VConfirmDialog } from '../../control/dialog/VConfirmDialog.js';
import { KeyChooser } from '../../component/keychooser/KeyChooser.js';
import { Key } from '../../entity/input/Key.js';
import { keyCodeByDomCode } from '../../entity/input/KeyCode.js';
import { LoadingStage } from '../../ui/loading/LoadingStage.js';
import { LoadingItem } from '../../ui/loading/LoadingItem.js';
import { SimpleAlert } from '../../ui/alert/SimpleAlert.js';
import { StackTraceAlert } from '../../ui/alert/StackTraceAlert.js';
import { VStage } from '../../ui/stage/VStage.js';
import { VStageInitParams } from '../../ui/stage/VStageInitParams.js';
import { ThemeLabel } from '../../ui/wrapper/ThemeLabel.js';
import { Theme } from '../../theme/Theme.js';
import { Pane } from '../../javafx/Pane.js';
import { Parent } from '../../javafx/Parent.js';
import { FusionButton } from '../../ui/button/FusionButton.js';
import { FXUtils } from '../../util/FXUtils.js';
import { BrokenLine } from '../../ui/shapes/BrokenLine.js';
import { Point } from '../../entity/Point.js';
import { EndpointStyle } from '../../ui/shapes/EndpointStyle.js';
import { Intro00Scene } from '../../intro/scenesText.js';
import { fontUsageFromKey } from '../../manager/font/FontUsages.js';

registerStageFactory('vdialog', async (spec, ctx) => {
  const params = spec.params as {
    message: string;
    buttons: { name: string; value: unknown }[];
  };
  const dialog = new VDialog<unknown>();
  dialog.onResult = (v: unknown | null) => { void ctx.emitResult(v); };
  dialog.setText(params.message);
  dialog.setButtons(
    params.buttons.map((b) => new VDialogButton<unknown>(b.name, b.value)),
  );
  if (typeof spec.width === 'number') {
    void dialog.getStage().getStage().setWidth(spec.width);
  }
  await dialog.getStage().show();
  void dialog.getStage().temporaryOnTop();
});

registerStageFactory('confirm', async (spec, ctx) => {
  const params = spec.params as { message?: string };
  const dialog = new VConfirmDialog();
  dialog.onResult = (v: VConfirmDialog.Result | null) => { void ctx.emitResult(v); };
  if (params.message) dialog.setText(params.message);
  await dialog.getStage().show();
  void dialog.getStage().temporaryOnTop();
});

registerStageFactory('keychooser', async (spec, ctx) => {
  const params = spec.params as { flags: number };
  const chooser = new KeyChooser(params.flags);
  chooser.onResult = (v: Key | null) => {
    void ctx.emitResult(v === null ? null : v.toString());
  };

  // Capture keyboard input directly — the dialog accepts either a button
  // click or a real keypress.
  const handler = (e: KeyboardEvent): void => {
    if (e.code.startsWith('Numpad')) return;
    const keyCode = keyCodeByDomCode(e.code);
    if (keyCode === undefined) return;
    const key = keyCode.requireLeftRight
      ? new Key(keyCode, e.code.endsWith('Left'))
      : new Key(keyCode);
    window.removeEventListener('keydown', handler);
    void ctx.emitResult(key.toString());
  };
  window.addEventListener('keydown', handler);

  await chooser.getStage().show();
  void chooser.getStage().temporaryOnTop();
});

// The child constructs a LoadingStage for display only. The parent drives
// the actual loading loop (item.loadFunc closures cannot cross windows)
// and emits progress events; the child listens and updates its VProgressBar.
registerStageFactory('loading', async (spec, ctx) => {
  const params = spec.params as { title: string };
  const stage = new LoadingStage(params.title);

  // The child's LoadingStage.setItems/setInterval expect LoadingItem[], but
  // we only get serializable {name,weight} descriptors from the parent.
  // Reconstruct inert LoadingItem shells for the progress bar's bookkeeping.
  void onChildCustom(ctx.specId, 'set-items', (data) => {
    const rawItems = data as { name: string; weight: number }[];
    type LoadItemCtorArgs = ConstructorParameters<typeof LoadingItem>;
    const items = rawItems.map((d) => new LoadingItem(
      d.weight as LoadItemCtorArgs[0],
      d.name as LoadItemCtorArgs[1],
      (() => true) as LoadItemCtorArgs[2],
    ));
    stage.setItems(items);
  });
  void onChildCustom(ctx.specId, 'set-interval', (data) => {
    stage.setInterval(data as number);
  });
  void onChildCustom(ctx.specId, 'current-item', (data) => {
    stage.setCurrentItemName(data as string);
  });
  void onChildCustom(ctx.specId, 'progress', (data) => {
    stage.setProgress(data as number);
  });

  // Override the close path: the child's LoadingStage.close() normally calls
  // terminate() on its (never-loaded) progress bar, which would throw because
  // no callback was registered. In the multi-window model the real load loop
  // lives in the parent, so on close we (1) signal "canceled" to the parent,
  // which fires cb.failed(loadingCanceled), and (2) close the window directly
  // via VStage.close() — skipping LoadingStage.terminate(). This matches the
  // Java semantics where closing the loading window surfaces a "loading
  // process canceled" failure.
  //
  // The `canceled` emit MUST be awaited before closing the window. If it is
  // fire-and-forget, the Tauri webview is torn down before the IPC event
  // reaches the parent, so the parent never learns about the cancel and the
  // load loop runs to `cb.succeeded()` — surfacing a "loading complete"
  // dialog even though the user clicked close.
  const stageEl = stage as unknown as { close: () => Promise<void> };
  stageEl.close = async (): Promise<void> => {
    await childEmitCustom(ctx.specId, 'canceled').catch(() => { /* window tearing down */ });
    return VStage.prototype.close.call(stage) as Promise<void>;
  };

  await stage.show();
});

registerStageFactory('simple-alert', async (spec) => {
  const params = spec.params as {
    title: string;
    message: string;
    fontUsage: string;
  };
  const fontUsage = fontUsageFromKey(params.fontUsage);
  const alert = new SimpleAlert(params.title, params.message, fontUsage);
  await alert.show();
});

registerStageFactory('stack-trace-alert', async (spec) => {
  const params = spec.params as { desc: string; stack: string };
  const err = new Error(params.desc);
  err.stack = params.stack;
  const alert = new StackTraceAlert(params.desc, err);
  await alert.show();
});

registerStageFactory('demo', async (spec) => {
  const params = spec.params as { demoKey: string };
  const key = params.demoKey;

  let stage: VStage;
  if (key === 'default') {
    stage = new VStage();
    const group = new Pane();
    const label = new ThemeLabel('Drag here to resize');
    group.getChildren().add(label as unknown as Parent);
    const line = new BrokenLine(2, new Point(120, 30), new Point(120, 75), new Point(200, 100));
    line.setStroke(Theme.current().normalTextColor());
    line.setEndStyle(EndpointStyle.ARROW);
    group.getChildren().add(line.getNode());
    const scene = stage.getInitialScene();
    scene.enableAutoContentWidthHeight();
    scene.getContentPane().getChildren().add(group);
    scene.getContentPane().widthProperty.addListener((_o: unknown, now: number | null) => {
      if (now === null) return;
      group.setLayoutX(now - 210);
    });
    scene.getContentPane().heightProperty.addListener((_o: unknown, now: number | null) => {
      if (now === null) return;
      group.setLayoutY(now - 110);
    });
  } else if (key === 'noIconify') {
    stage = new VStage(new VStageInitParams().setIconifyButton(false));
  } else if (key === 'noMax') {
    stage = new VStage(new VStageInitParams().setMaximizeAndResetButton(false));
  } else if (key === 'noClose') {
    stage = new VStage(new VStageInitParams().setCloseButton(false));
    const scene = stage.getInitialScene();
    scene.enableAutoContentWidthHeight();
    const closeBtn = new FusionButton('close');
    closeBtn.setPrefWidth(100);
    closeBtn.setPrefHeight(50);
    closeBtn.setOnAction(() => { void stage.close(); });
    scene.getContentPane().getChildren().add(closeBtn);
    FXUtils.observeWidthHeightCenter(
      scene.getContentPane(),
      closeBtn as unknown as Parent,
    );
  } else if (key === 'noResize') {
    stage = new VStage(new VStageInitParams().setResizable(false));
  } else if (key === 'initialScene') {
    stage = new VStage(new VStageInitParams().setInitialScene(new Intro00Scene()));
  } else {
    throw new Error(`Unknown demo key: ${key}`);
  }

  await stage.show();
});

export {};
