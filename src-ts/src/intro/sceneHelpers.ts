// TS VBox does not support setAlignment(Pos.CENTER), so we emulate it
// with alignItems/justifyContent. observeWidthHeightCenter requires
// Parent but only uses Node-level APIs at runtime, so Labels are cast
// through `unknown as Parent`.

import { VBox } from '../javafx/VBox.js';
import { VPadding } from '../ui/layout/VPadding.js';
import { ThemeLabel } from '../ui/wrapper/ThemeLabel.js';
import { FontManager } from '../manager/font/FontManager.js';
import { FXUtils } from '../util/FXUtils.js';
import { Parent } from '../javafx/Parent.js';
import type { Node } from '../javafx/Node.js';
import type { DemoVScene } from './DemoVScene.js';

export function centeredVBox(...children: Node[]): VBox {
  const v = new VBox(...children);
  v.el.style.alignItems = 'center';
  v.el.style.justifyContent = 'center';
  return v;
}

export function buildTitleDesc(scene: DemoVScene, title: string, description: string): void {
  scene.enableAutoContentWidthHeight();
  const titleLabel = new ThemeLabel(title);
  FontManager.get().setFont(titleLabel, (s) => s.setSize(40));
  const pane = centeredVBox(titleLabel, new VPadding(30), new ThemeLabel(description));
  scene.getContentPane().getChildren().add(pane);
  FXUtils.observeWidthHeightCenter(scene.getContentPane(), pane);
}

export function centerNode(scene: DemoVScene, node: Node): void {
  scene.getContentPane().getChildren().add(node);
  FXUtils.observeWidthHeightCenter(scene.getContentPane(), node as unknown as Parent);
}

export function centerNodeAtY(scene: DemoVScene, node: Node, y: number): void {
  node.setLayoutY(y);
  scene.getContentPane().getChildren().add(node);
  FXUtils.observeWidthCenter(scene.getContentPane(), node as unknown as Parent);
}
