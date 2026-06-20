# TS/Rust-Only Files (No Java Counterpart)

## TypeScript Files

### commons-graph/ (Graph Library)
- **Graph.ts**: Dijkstra graph library (GraphNode/GraphEdge/GraphPath/Graph/GraphBuilder) — ports the external `io.vproxy.commons.graph` dependency that `AnimationGraph` relies on for shortest-path computation

### javafx/ (JavaFX Abstraction Layer)
- **Node.ts**: DOM element wrapper mimicking JavaFX Node API (layout, style, properties)
- **Pane.ts**: Container element (equivalent to JavaFX Pane/Group)
- **Parent.ts**: Base class for containers with children
- **Label.ts**: Text display element
- **HBox.ts / VBox.ts**: Horizontal/vertical layout containers
- **GridPane.ts**: Grid layout
- **ImageView.ts**: Image display (FXImage wrapper)
- **TextField.ts**: Text input
- **CheckBox.ts**: Checkbox input
- **Property.ts**: Observable property system (mimics JavaFX properties)
- **color.ts**: Color/LinearGradient/Paint implementations
- **layout.ts**: Background, Border, Insets, CornerRadii CSS abstractions
- **shapes.ts**: Circle, Rectangle, Line shape primitives
- **scene.ts**: Scene container
- **stage.ts**: Window/stage management (Tauri window API wrapper)

### window/ (Multi-Window Support)
- **WindowManager.ts**: Manages multiple OS windows via Tauri
- **WindowHandle.ts**: Handle for communicating with child windows
- **StageSpec.ts**: Window specification types
- **childComms.ts**: Child window communication
- **events.ts**: Window event types
- **factory.ts / factories/index.ts**: Window content factories for different window kinds

### vproxy-base/ (Base Utilities)
- **Logger.ts**: Logging system (ports vproxy Logger)
- **LogType.ts**: Log type constants
- **Callback.ts**: Callback abstraction
- **OS.ts**: OS detection
- **log/LogDispatcher.ts**: Log dispatch system
- **log/LogHandler.ts**: Log handler interface
- **log/LogLevel.ts**: Log level enum
- **log/LogRecord.ts**: Log record data

### Other
- **bootstrap-utils.ts**: Bootstrap/initialization utilities
- **child.ts**: Child window entry point
- **index.ts**: Main module entry/exports (window bootstrap dispatch: main window vs. child window)
- **util/types.ts**: Shared TypeScript type definitions
- **sceneHelpers.ts**: Helper functions for demo scene construction
- **scenesDemo.ts**: Consolidated demo scenes (from 30 Java files)
- **scenesText.ts**: Consolidated scene text content

## Rust Files

### src-tauri/
- **src/main.rs**: Tauri application entry point
- **src/lib.rs**: Tauri library configuration and command handlers
- **src/robot.rs**: Native input simulation + screen capture exposed as Tauri commands (enigo for key/mouse input, xcap for screen capture) — backs the TS `RobotWrapper`, which the browser cannot implement directly
- **build.rs**: Standard Tauri build script (`tauri_build::build()`)

## Purpose
These files provide the platform abstraction layer that makes the JavaFX vfx library work in a Tauri web environment. The javafx/ directory reimplements JavaFX primitives using DOM/CSS, the window/ directory adds multi-window support via Tauri, vproxy-base/ ports the base utility library, commons-graph/ ports the graph/Dijkstra dependency, and the Rust files expose native capabilities (window management, input simulation, screen capture) that the browser cannot provide directly.
