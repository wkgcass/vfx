import { Node } from '../javafx/Node.js';

export interface JavaFXNode {
  getNode(): Node;
}

// Region in JavaFX is a Node with size/background/border.
// In the TS port, all Parents are Regions.
export interface JavaFXRegion extends JavaFXNode {
}
