# vfx Usage Guide

This guide explains how to build a JavaFX desktop application with [vfx](https://github.com/wkgcass/vfx) (`io.vproxy:vfx`, version 1.4.0 at the time of writing): how to set up the window skeleton, navigate between scenes, customize themes, and use the most common components.

This guide complements the README: dependency coordinates, the intro demo, and everything else the README already explains are not repeated here.

---

## 1. What is vfx

vfx is a JavaFX UI framework/component library. Instead of skinning native controls, it draws its own, giving you in one dependency:

| Capability | Components | What you no longer hand-write |
|------------|-----------|-------------------------------|
| Frameless window with custom title bar | `VStage` | `StageStyle.TRANSPARENT` + manual drag/resize/maximize |
| Animated scene switching | `VSceneGroup` / `VScene` | manual `TranslateTransition` page sliding |
| Consistent dark/light colors | `Theme` | hard-coded `Color`s everywhere |
| Everyday controls | `FusionButton`, `FusionPane`, `VTableView`, `VScrollPane`, `VSlider`, ... | CSS skins |
| Font / image / background-task management | `FontManager`, `ImageManager`, `TaskManager` | one-off utilities |

It fits "single window + multiple pages" desktop tools (admin consoles, dashboards, clients).

---

## 2. Dependency notes

The dependency coordinates and the Kotlin/vjson note are in the README; this section covers what the README does not — what to know after adding the dependency:

1. **Declare your own JavaFX modules.** vfx does not pull openjfx into your build — bring the JavaFX modules you need yourself (e.g. via the `org.openjfx.javafxplugin` Gradle plugin or `org.openjfx` Maven artifacts). `javafx-controls` covers the basics; vfx also uses `javafx.embed.swing` internally for image processing, so add `javafx-swing` as well (same OpenJFX version as the rest of your modules). `javafx-media` is only needed for the audio/video features.

2. **Transitive dependencies.** vfx brings in `com.github.kwhat:jnativehook` (global key/mouse hooks, used by `GlobalScreenUtils`) and `io.vproxy:commons` as `api` dependencies. If you build a fat jar, jnativehook ships native libraries for all platforms, which increases the jar size.

---

## 3. Core concepts: the window model in five minutes

A vfx application is structured like this:

```
VStage (wrapper of javafx.stage.Stage, draws its own 28px title bar)
 ├── WindowControlButton x3 (iconify / maximize-reset / close)
 └── root scene group (ROOT layer)
      └── scene group (MAIN layer, your business pages switch here)
           ├── HomeScene      (VScene, role=MAIN)
           ├── LoginScene     (VScene, role=MAIN)
           ├── PanelScene     (VScene, role=MAIN)
           └── ...
 Drawer/popup scenes (role=DRAWER_VERTICAL, POPUP, ...) are added to the
 root scene group and slide over the MAIN layer
```

The three key classes:

- **`VStage`** — the window. Pass `VStageInitParams` to pick the initial scene and which window buttons are shown. `getStage()` returns the native `Stage` (icons, size still use the native API); `getSceneGroup()` returns the MAIN scene group; `getRootSceneGroup()` the ROOT one.
- **`VSceneGroup`** — manages scenes and plays `show`/`hide` animations. `addScene(scene)` registers a scene (MAIN scenes only); **non-MAIN scenes must** use `addScene(scene, VSceneHideMethod)` to declare their default hide direction, otherwise an `IllegalArgumentException` is thrown. `show(scene, VSceneShowMethod.FROM_RIGHT)` slides the scene in from the right; when you `show` a MAIN scene, the previous MAIN scene automatically slides out in the **opposite direction** (new page enters from the right, old page exits to the left — like pushing cards), no manual `hide` needed. Enums: `VSceneShowMethod.FROM_LEFT/RIGHT/TOP/BOTTOM, FADE_IN`; `VSceneHideMethod.TO_LEFT/RIGHT/TOP/BOTTOM, FADE_OUT`.
- **`VScene`** — one page. Its role is fixed at construction:

| VSceneRole | Purpose | Sizing |
|------------|---------|--------|
| `MAIN` | business pages, shown exclusively in the scene group | width & height managed, fills the window |
| `TEMPORARY` | temporary full-screen page | width & height managed |
| `DRAWER_VERTICAL` | vertical drawer (slides from left/right, covers content) | height managed, you set the width |
| `DRAWER_HORIZONTAL` | horizontal drawer (slides from top/bottom) | width managed |
| `POPUP` | centered popup layer | content centered |

Put page content into `scene.getContentPane()` (a `Pane`), not into `getNode()` directly.

---

## 4. Building the application skeleton

A typical skeleton:

```java
public class App extends Application {

    private VStage vStage;
    private VSceneGroup sceneGroup;
    private MenuScene menuScene;   // drawer menu (DRAWER_VERTICAL)
    private HomeScene homeScene;   // home page (MAIN)

    @Override
    public void start(Stage primaryStage) {
        // 1. Theme injection: must happen BEFORE any vfx component is created
        //    (Theme can only be set once per process)
        Theme.setTheme(new DarkTheme());

        homeScene = new HomeScene();
        menuScene = new MenuScene(this);

        // 2. Create the window with an initial scene
        vStage = new VStage(primaryStage, new VStageInitParams().setInitialScene(homeScene)) {
            @Override
            public void close() {
                TaskManager.get().terminate();   // stop vfx background task threads
                GlobalScreenUtils.unregister();  // release the jnativehook global hooks
                super.close();
            }
        };
        sceneGroup = vStage.getSceneGroup();

        // 3. Drawer menu goes to the ROOT scene group, slides out to the left
        vStage.getRootSceneGroup().addScene(menuScene, VSceneHideMethod.TO_LEFT);

        // 4. Put a button next to the title bar to open the drawer
        FusionButton menuBtn = new FusionButton("Menu");
        menuBtn.setPrefSize(64, VStage.TITLE_BAR_HEIGHT + 1);
        menuBtn.setLayoutX(-2);
        menuBtn.setLayoutY(-1);
        menuBtn.setOnAction(e ->
            vStage.getRootSceneGroup().show(menuScene, VSceneShowMethod.FROM_LEFT));
        vStage.getRoot().getContentPane().getChildren().add(menuBtn);

        // 5. Regular window properties go through the native Stage
        vStage.setTitle("My App");
        vStage.getStage().setWidth(1000);
        vStage.getStage().setHeight(680);
        vStage.getStage().centerOnScreen();
        vStage.show();
    }
}
```

Notes:

- **Theme injection is the first UI statement** — see §5 for why.
- **Cleanup on exit**: vfx starts background task threads (`TaskManager`) and possibly jnativehook global hooks. The tidy way to shut down is to override `VStage.close()`, call `terminate()` first, then `super.close()`.
- `VStage.TITLE_BAR_HEIGHT` (= 28) is the title bar height constant; use it to align controls you place in the title bar area.

### Switching between MAIN scenes

```java
// login -> home: slide in from the right
sceneGroup.show(homeScene, VSceneShowMethod.FROM_RIGHT);

// home -> some business panel: addScene first, then show
VScene scene = new PanelScene(this, "panel-a");
sceneGroup.addScene(scene);
sceneGroup.show(scene, VSceneShowMethod.FROM_RIGHT);
```

`show` automatically slides the current MAIN scene out in the opposite direction; you never hide it manually.

### A drawer menu (DRAWER_VERTICAL)

```java
public final class MenuScene extends VScene {

    public MenuScene(App app) {
        super(VSceneRole.DRAWER_VERTICAL);   // vertical drawer: you manage width
        getNode().setPrefWidth(300);         // drawer width
        enableAutoContentWidth();            // content follows the drawer width

        VBox box = new VBox();
        // ... add menu buttons to box ...
        VScrollPane scroll = new VScrollPane();
        scroll.setContent(box);
        getContentPane().getChildren().add(scroll.getNode());
        FXUtils.observeWidthHeight(getContentPane(), scroll.getNode());  // fill the pane
    }
}
```

`FXUtils.observeWidthHeight / observeWidthCenter / observeHeightCenter` bind a child's size or centering to its parent. vfx scenes use absolute layout internally: either set `layoutX/Y` yourself or use these helpers — there is no built-in layout manager.

### Scene lifecycle pitfall: you cannot remove the scene being shown

`sceneGroup.removeScene(scene)` throws if the scene is currently shown or its transition animation has not finished. If your navigation rebuilds scenes on every visit (a common choice when pages need fresh data), keep a "retire list" and purge later:

```java
private final Map<String, VScene> sceneCache = new HashMap<>();
private final List<VScene> retiredScenes = new ArrayList<>();

public void showPanel(String name) {
    purgeRetiredScenes();                       // clean up the previous batch first
    VScene old = sceneCache.remove(name);
    if (old != null) {
        if (old == sceneGroup.getCurrentMainScene()) {
            retiredScenes.add(old);             // being shown -> retire, clean later
        } else {
            sceneGroup.removeScene(old);        // not shown -> remove immediately
        }
    }
    VScene scene = new PanelScene(name);
    sceneCache.put(name, scene);
    sceneGroup.addScene(scene);
    sceneGroup.show(scene, VSceneShowMethod.FROM_RIGHT);
}

private void purgeRetiredScenes() {
    for (Iterator<VScene> it = retiredScenes.iterator(); it.hasNext(); ) {
        VScene retired = it.next();
        if (retired != sceneGroup.getCurrentMainScene()) {
            sceneGroup.removeScene(retired);
            it.remove();
        }
    }
}
```

### Living with existing FXML pages (gradual migration)

vfx does not force you to rewrite pages. Wrap an FXML page in a `VScene` and migrate step by step:

```java
public final class PanelScene extends VScene {

    public PanelScene(String fxmlName) throws IOException {
        super(VSceneRole.MAIN);
        enableAutoContentWidthHeight();

        Region root = FXMLLoader.load(Objects.requireNonNull(
            getClass().getResource("/fxml/" + fxmlName + ".fxml")));
        getContentPane().getChildren().add(root);
        FXUtils.observeWidthHeight(getContentPane(), root);
    }
}
```

Replacing only the skeleton (window, navigation, theme) while keeping FXML pages untouched is the least invasive integration path.

---

## 5. Theming

### The theme is injected exactly once

```java
Theme.setTheme(new DarkTheme());          // the first and only time in the process
Theme.current().sceneBackgroundColor();   // read colors everywhere afterwards
```

vfx components read `Theme.current()` **at construction time** and fix their colors — there is no runtime theme switching. Calling `setTheme` a second time throws `IllegalStateException`. The standard pattern for letting users switch themes is therefore: **persist the preference -> confirm dialog -> restart the app**, reading the preference and calling `setTheme` as the very first statement of `Application.start`.

### Custom light theme

1.4.x ships only `DarkTheme`. To go light, subclass it and override the color methods:

```java
public final class LightTheme extends DarkTheme {

    @Override
    public Color normalTextColor()          { return Color.web("#333336"); }
    @Override
    public Color sceneBackgroundColor()     { return Color.web("#f2f2f4"); }
    @Override
    public Color subSceneBackgroundColor()  { return Color.web("#e4e4e7"); }
    @Override
    public Color tableCellSelectedBackgroundColor() { return Color.web("#c9d4e8"); }
    // ... override what you need; see the Theme class for the full color list
}
```

### Recoloring the window control buttons (ImageManager)

The title bar icons are built-in white PNGs, invisible on light backgrounds. Use `ImageManager.loadBlackAndChangeColor` to generate tinted variants:

```java
private static final String DARK_ICON = "dark";

static {
    // generate and cache a "dark" variant of the built-in black-and-white icons
    ImageManager.get().loadBlackAndChangeColor("io/vproxy/vfx/res/image/close.png",
            Map.of(DARK_ICON, 0xff3a3a3c));
    // maximize.png / reset-window-size.png / iconify.png likewise
}

@Override
public Image windowCloseButtonNormalImage() {
    return ImageManager.get().load("io/vproxy/vfx/res/image/close.png:" + DARK_ICON);
}
```

`ImageManager.load(path)` caches images; the `path:variant` syntax fetches a tinted variant. Use it for your own image assets as well.

### vfx theming vs native JavaFX controls

`Theme` only affects vfx-drawn components; native controls (`TextField`, `ComboBox`, `TableView`, ...) still follow JavaFX CSS. Rules of thumb learned in practice:

- **Do not touch the user-agent stylesheet**: `Application.setUserAgentStylesheet` replaces Modena and breaks control skins. Keep the default.
- **Per-page stylesheets**: attach your own `styles.css` / `styles-dark.css` to page roots; derive both modes from the same class names with different values.
- **Dialogs are separate Stages** and cannot see page-level stylesheets — attach the stylesheet to each `dialogPane` explicitly.
- **Popup layers** (combo dropdowns, context menus) inherit the owner scene's stylesheet automatically via `PopupControl.getStyleableParent()`; nothing to do there.

---

## 6. Component cheat sheet

| Component | Package | Notes |
|-----------|---------|-------|
| `FusionButton` | `io.vproxy.vfx.ui.button` | primary button; `setDisableAnimation(true)` turns off the hover animation |
| `TransparentFusionButton` | `ui.button` | transparent until hovered |
| `FusionImageButton` / `TransparentFusionImageButton` | `ui.button` | icon buttons |
| `FusionPane` / `TransparentFusionPane` / `ClickableFusionPane` | `ui.pane` | rounded card containers (hover highlight), macOS-style group cards |
| `ThemeLabel` | `ui.wrapper` | `Label` that follows the theme text color |
| `FusionW` | `ui.wrapper` | wraps any control in the Fusion look (e.g. a Fusion-styled `TextField`) |
| `VScrollPane` | `ui.control.scroll` | custom-drawn scrollbar (color from the theme) |
| `VTableView` | `ui.table` | custom-drawn table, see §7 |
| `VSlider` / `VRangeSlider` | `ui.slider` | slider / two-handle range slider |
| `VProgressBar` | `ui.loading` | progress bar |
| `LoadingPane` / `LoadingStage` | `ui.loading` | loading overlay / loading window (multi-step `LoadingItem`s) |
| `SimpleAlert` / `StackTraceAlert` | `ui.alert` | themed alert dialogs |
| `VPadding` / `HPadding` | `ui.layout` | vertical / horizontal spacers |
| `Arrow` / `BrokenLine` / `VLine` / `MovablePoint` | `ui.shapes` | shapes for topology/flow diagrams |
| `LogConsole` | `io.vproxy.vfx.component.logconsole` | embedded log console |
| `KeyChooser` | `io.vproxy.vfx.component.keychooser` | hotkey picker |

Common convention: **always get the layout node via `getNode()`**; content goes in one of two ways — `VScene`/`FusionPane` via `getContentPane().getChildren().add(...)`, `VScrollPane` via `setContent(node)`.

---

## 7. VTableView: the custom table

The vfx table is not built on `TableView`; it is drawn from scratch (virtualized, sortable, custom cell rendering). Typical usage (adapted from the intro demo, `src/test/java/io/vproxy/vfx/intro/_06bVTableViewDemoScene.java`):

```java
var table = new VTableView<Data>();
table.getNode().setPrefWidth(1000);
table.getNode().setPrefHeight(580);

// a column = title + value extractor; generics are <row type, cell value type>
var idCol   = new VTableColumn<Data, String>("id", data -> data.id);
var nameCol = new VTableColumn<Data, Data>("name", data -> data);
var addrCol = new VTableColumn<Data, String>("address", data -> data.address);

idCol.setMinWidth(300);
addrCol.setAlignment(Pos.CENTER);
addrCol.setComparator(String::compareTo);          // sortable columns need a comparator

// cell value -> display text (defaults to toString)
createTimeCol.setTextBuilder(t -> formatter.format(t));

// cell value -> arbitrary JavaFX node (editing, buttons, progress bars, ...)
nameCol.setNodeBuilder(data -> {
    var textField = new TextField();
    return new FusionW(textField);   // wrap in the Fusion look
});

table.getColumns().addAll(idCol, nameCol, addrCol);
table.setItems(dataList);            // a plain List<Data>
```

Notes:

- Clicking column headers sorts (multi-column sort is supported); columns without a `comparator` are not sortable.
- `setNodeBuilder` instantiates a node per visible cell — use restraint on very large tables.
- All colors come from the theme (`tableCellBackgroundColor2`, `tableCellSelectedBackgroundColor`, `tableHeaderTop/BottomBackgroundColor`), so a custom theme is picked up automatically.

---

## 8. Fonts: FontManager

vfx bundles and registers three fonts:

```java
FontManager.FONT_NAME_Default              // system default
FontManager.FONT_NAME_SmileySansOblique    // Smiley Sans
FontManager.FONT_NAME_NotoSansSCRegular    // Noto Sans SC
FontManager.FONT_NAME_JetBrainsMono        // monospace, good for code/logs

// set a font: tweak FontSettings in a lambda (chainable)
FontManager.get().setFont(title, s -> s.setSize(28));
FontManager.get().setFont(label, s ->
    s.setFamily(FontManager.FONT_NAME_SmileySansOblique).setSize(16));
```

`FontSettings` chains `family / size / weight / posture`.

---

## 9. Threads and tasks

### TaskManager (built in)

```java
TaskManager.get().execute(runnable);   // run on the shared vfx background thread
TaskManager.get().terminate();         // call on application exit (in VStage.close())
```

Good for small background chores.

### JavaFX Task (the standard way for UI-bound async work)

For network requests whose results update the UI, prefer a JavaFX `Task` — its `onSucceeded`/`onFailed` callbacks are guaranteed to run on the FX thread:

```java
Task<T> task = new Task<>() {
    @Override protected T call() throws Exception { return doRequest(); }
};
task.setOnSucceeded(e -> updateUi(task.getValue()));   // FX thread, no runLater needed
task.setOnFailed(e -> handleError(task.getException()));
Thread t = new Thread(task, "my-task");
t.setDaemon(true);   // don't keep the process alive on window close
t.start();
```

---

## 10. Pitfalls and best practices

1. **`Theme.setTheme` must be the first UI statement** — components fix their colors at construction; setting a theme after components exist has no effect, and a second `setTheme` throws.
2. **Never remove the scene being shown** (or mid-animation) — use the retire-list pattern from §4.
3. **Declare JavaFX modules yourself**, at minimum add `javafx-swing` (§2).
4. **Clean up on window close**: `TaskManager.terminate()` + `GlobalScreenUtils.unregister()`.
5. **No theme hot-swap**: switching themes means persisting the preference and restarting; leave the user-agent stylesheet at Modena (§5).
6. **Dialogs cannot see page stylesheets** — attach per dialog; popup layers inherit automatically.
7. **Scene content is not auto-laid-out**: vfx scenes are absolutely laid out plus `FXUtils.observe*` helpers — a mindset shift if you come from layout panes.
