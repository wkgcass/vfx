import { VScene } from '../ui/scene/VScene.js';
import { VSceneRole } from '../ui/scene/VSceneRole.js';

export abstract class DemoVScene extends VScene {
  constructor(role: VSceneRole) {
    super(role);
  }

  abstract title(): string;
}
