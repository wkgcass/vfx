import { ThemeLabel } from '../ui/wrapper/ThemeLabel.js';
import { FontManager } from '../manager/font/FontManager.js';
import { VSceneRole } from '../ui/scene/VSceneRole.js';
import { DemoVScene } from './DemoVScene.js';
import { buildTitleDesc, centerNode } from './sceneHelpers.js';

export class Intro00Scene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    this.enableAutoContentWidthHeight();
    const label = new ThemeLabel('Welcome to VFX');
    FontManager.get().setFont(label, (s) => s.setSize(40));
    centerNode(this, label);
  }
  title(): string { return 'Intro'; }
}

export class VStage01aIntroScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, '01. VStage', 'VStage is the VFX version Stage.');
  }
  title(): string { return 'VStage Intro'; }
}

export class VStage01cStructureScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, 'VStage Internal Structure',
      'VStage contains a rootContainer pane, which defines the border and the invisible bottom-right corner resize button.\n' +
      'A VSceneGroup called \'rootSceneGroup\' is contained in the rootContainer pane. It ensures the content won\'t exceed\n' +
      'the stage bounds.\n' +
      'When the VStage is created, it automatically creates a VScene called \'rootContent\' inside the rootSceneGroup.\n' +
      '\n' +
      'The window control buttons (close/max/iconify) and the title pane are contained in the rootContent.\n' +
      'In the rootContent, it also contains a VSceneGroup simply called \'sceneGroup\'.\n' +
      'When the VStage is created, it automatically creates a VScene called \'content\' inside the sceneGroup,\n' +
      'which is used as the content of the stage.\n' +
      '\n' +
      'Use stage.getRoot() to retrieve rootContent.\n' +
      'Use stage.getInitialScene() to retrieve content.\n' +
      'Use stage.getRootSceneGroup() to retrieve rootSceneGroup.\n' +
      'Use stage.getSceneGroup() to retrieve sceneGroup.\n' +
      '\n' +
      'Details about the VSceneGroups and VScenes are described in the following sections.\n' +
      '\n' +
      'When modifying the stage width or height, all above described elements will be automatically resized\n' +
      'by setting their prefWidth and prefHeight.');
  }
  title(): string { return 'VStage Internal Structure'; }
}

export class VSceneGroup02aIntroScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, '02. VSceneGroup', 'VSceneGroup handles scene switching.');
  }
  title(): string { return 'VSceneGroup Intro'; }
}

export class VSceneGroup02eStructureScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, 'VSceneGroup Internal Structure',
      'VSceneGroup uses a root pane to manage all contents.\n' +
      'The VScenes are not added to the pane until show(...) is called.\n' +
      '\n' +
      'When a scene is added to the group, the group might manage scenes\' width or height based on their roles.\n' +
      'Each role\'s behavior is described in VSceneRole,\n' +
      'for example both width and height will be managed by the group for scenes with \'MAIN\' role.');
  }
  title(): string { return 'VSceneGroup Internal Structure'; }
}

export class VScene03aIntroScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, '03. VScene', 'VScene contains your ui elements.');
  }
  title(): string { return 'VScene Intro'; }
}

export class VScene03bStructureScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, 'VScene Internal Structure',
      'VScene contains a root pane.\n' +
      'A VScrollPane is contained in the root pane,\n' +
      'UI elements should be added to the \'contentPane\' of the VScrollPane.\n' +
      '\n' +
      'Width and height of the VScrollPane stay the same as the the root pane,\n' +
      'but the contentPane inside VScrollPane will not be modified by default.\n' +
      '\n' +
      'When the contentPane exceeds the height of the VScrollPane, a scroll bar\n' +
      'will show to indicate the current vertical position.\n' +
      '\n' +
      'You may call the following methods to make the contentPane\'s width/height\n' +
      'correspond to the VScrollPane:\n' +
      '    scene.enableAutoContentWidthHeight()\n' +
      '    scene.enableAutoContentWidth()\n' +
      '    scene.enableAutoContentHeight()\n' +
      '\n' +
      'Details about the VScrollPane will be described in the following sections.');
  }
  title(): string { return 'VScene Internal Structure'; }
}

export class VScrollPane04aIntroScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, '04. VScrollPane', 'VScrollPane is the VFX version ScrollPane.');
  }
  title(): string { return 'VScrollPane Intro'; }
}

export class VScrollPane04cStructureScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, 'VScrollPane Internal Structure',
      'VScrollPane uses a root pane to contain the Viewport and the scrollbars.\n' +
      'The Viewport is simply a pane which uses \'setClip\' to show only ui within the pane.\n' +
      'Inside the viewport, there is a jfx Group which manages the content position.\n' +
      '\n' +
      'The VScrollPane width/height is synchronizing to the Viewport, but the content is not managed.\n' +
      'You may use FXUtils.observe...(...) methods to bind your content pane to the VScrollPane.');
  }
  title(): string { return 'VScrollPane Internal Structure'; }
}

export class FusionPane05aIntroScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, '05. FusionPane', 'FusionPane is the VFX version Pane with VFX ui design pattern.');
  }
  title(): string { return 'FusionPane Intro'; }
}

export class FusionPane05cStructureScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, 'FusionPane Internal Structure',
      'FusionPane has an outer pane and an inner pane.\n' +
      'The outer pane defines border and background. The inner pane contains your ui elements.\n' +
      '\n' +
      'Sometimes you may want to specify the pane\'s width and height, and sometimes you may want the\n' +
      'width and height to be automatically calculated based on the content.\n' +
      'As a result, for different scenarios, you can instantiate the FusionPane in two ways:\n' +
      '    1. Using \'new FusionPane()\' or `new FusionPane(true)`, you can set the prefWidth/prefHeight\n' +
      '       of the outer pane, the inner one will be automatically calculated based on your settings.\n' +
      '    2. Using \'new FusionPane(false)\', the width and height are automatically calculated by the layout system.');
  }
  title(): string { return 'FusionPane Internal Structure'; }
}

export class VTableView06aIntroScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, '06. VTableView',
      'VTableView is a full rework of the TableView, based on simple layout objects.');
  }
  title(): string { return 'VTableView Intro'; }
}

export class VTableView06dStructureScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, 'VTableView Internal Structure',
      'VTableView is a full rework of the TableView, based on simple layout objects.\n' +
      'The table columns are constructed using VBoxes.\n' +
      'The rows are built using small StackPanes with the same height, their height properties\n' +
      'are linked together using ChangeListener on heightProperty, and modified using prefHeight\n' +
      'property.');
  }
  title(): string { return 'VTableView Internal Structure'; }
}

export class VTableView06eSpecialUsageScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, 'VTableView Special Usage',
      'The VTableView provides some special interfaces to give you more choices to interact with the table:\n' +
      '    CellAware\n' +
      '        Implement this interface on your entity class, then every time a related cell is constructed,\n' +
      '        the cell will be feed into your entity object, you can do anything you want on the cell.\n' +
      '        One entity object will receive column count cells, each cell for one column.\n' +
      '    RowInformerAware\n' +
      '        Implement this interface on your entity class, then when the row is constructed,\n' +
      '        an informer of the certain row will be feed into your entity object.\n' +
      '        When you update your entity, you can call the informer to update the row.\n' +
      '        This is different from how the standard table view works.');
  }
  title(): string { return 'VTableView Special Usage'; }
}

export class Animation07aIntroScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, '07. Animation System', 'A powerful animation graph system.');
  }
  title(): string { return 'Animation System Intro'; }
}

export class Animation07cDescScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, 'Animation System Description',
      'VFX Animation System thinks animation as a graph,\n' +
      'as a result, the entry class is called AnimationGraph(Builder).\n' +
      'The graph nodes are animation states, and edges are the time cost for the state transfer.\n' +
      'Each node contains data which can be added, subtracted with each other, and can be multiplied\n' +
      'or divided by double values.\n' +
      'With all these information, the system can calculate the shortest path from one state to another,\n' +
      'as well as the data to be applied to animated objects in every frame.\n' +
      '\n' +
      'The system allows you to play an animation even when it is animating. It automatically finds the\n' +
      'best solution for the new animation to play, and runs the new animation when the current one is\n' +
      'finished or reverted.\n' +
      'You can see the fluent revertible animation on the background color of a button when you quickly\n' +
      'move mouse in and out.\n' +
      '\n' +
      'All the animation effects you see in VFX are based on this animation system.\n' +
      'There is a complex usage of this system in VScene and VSceneGroup.');
  }
  title(): string { return 'Animation System Description'; }
}

export class Loading08aIntroScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, '08. ProgressBar & LoadingStage',
      'A useful tool for visualizing loading process.');
  }
  title(): string { return 'ProgressBar & LoadingStage Intro'; }
}

export class Loading08cStructureScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, 'LoadingStage Internal Structure',
      'LoadingStage contains a LoadingPane, and the LoadingPane contains a VProgressBar.\n' +
      'The VProgressBar is an encapsulation of VLine, which provides rounded endpoints.\n' +
      'The LoadingPane is simply a VProgressBar with a Label showing name of the current loading item.\n' +
      'The LoadingStage is simply a LoadingPane inside a VStage.\n' +
      '\n' +
      'The progress bar has loading logic, but you can also ignore the loading function and only\n' +
      'use it as a simple ProgressBar.');
  }
  title(): string { return 'LoadingStage Internal Structure'; }
}

export class LogConsole09aIntroScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, '09. LogConsole', 'Display logs in the UI.');
  }
  title(): string { return 'LogConsole Intro'; }
}

export class ComponentsXxaIntroScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, 'Other Components', 'VFX provides so many useful components.');
  }
  title(): string { return 'Other Components'; }
}

export class EndingScene extends DemoVScene {
  constructor() {
    super(VSceneRole.MAIN);
    buildTitleDesc(this, 'This is the end of this demo',
      'This demo only shows how the UI elements work,\n' +
      'but VFX also provides many useful tools for managing your application.\n' +
      'Check the module-info to have a general view of what VFX provides,\n' +
      'and try them for yourself.\n' +
      '\n' +
      'Hope you can enjoy it.');
  }
  title(): string { return 'Ending'; }
}
