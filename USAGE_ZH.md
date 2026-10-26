# vfx 使用说明

本文介绍如何使用 [vfx](https://github.com/wkgcass/vfx)（`io.vproxy:vfx`，写作时版本 1.4.0）搭建 JavaFX 桌面应用：窗口骨架、场景导航、主题定制以及常用组件。

本文是 README 的补充：依赖坐标、intro 演示等 README 已说明的内容不再重复。

---

## 1. vfx 是什么

vfx 是一个 JavaFX UI 框架/组件库。它不给原生控件换皮肤，而是自己绘制控件，一个依赖提供：

| 能力 | 组件 | 免去的手写工作 |
|------|------|---------------|
| 无系统边框窗口（自绘标题栏） | `VStage` | `StageStyle.TRANSPARENT` + 手写拖拽/缩放/最大化 |
| 带动画的场景切换 | `VSceneGroup` / `VScene` | 手写 `TranslateTransition` 页面滑入滑出 |
| 统一深/浅配色 | `Theme` | 到处硬编码 `Color` |
| 常用控件 | `FusionButton`、`FusionPane`、`VTableView`、`VScrollPane`、`VSlider` 等 | CSS 皮肤 |
| 字体/图片/后台任务管理 | `FontManager`、`ImageManager`、`TaskManager` | 各自造轮子 |

适合「单窗口 + 多页面切换」型桌面工具（管理端、控制台、客户端）。

---

## 2. 依赖注意事项

依赖坐标与 Kotlin/vjson 的说明见 README；本节只讲 README 没覆盖的、引入依赖之后需要知道的事：

1. **JavaFX 模块要自己声明**。vfx 不会替你引入 openjfx——所需的 JavaFX 模块请自行声明（如 Gradle 的 `org.openjfx.javafxplugin` 插件或 Maven 的 `org.openjfx` 构件）。`javafx-controls` 覆盖基础；vfx 内部图片处理用到 `javafx.embed.swing`，需另补 `javafx-swing`（与既有 JavaFX 模块同版本）。`javafx-media` 仅音视频功能需要。

2. **传递依赖**：vfx 以 `api` 依赖传递引入 `com.github.kwhat:jnativehook`（全局键鼠监听，`GlobalScreenUtils` 使用）和 `io.vproxy:commons`。打 fat jar 时 jnativehook 会带上各平台原生库，体积会增大。

---

## 3. 核心概念：五分钟理解窗口模型

一个 vfx 应用的结构：

```
VStage（javafx.stage.Stage 的包装，自绘 28px 标题栏）
 ├── WindowControlButton × 3（最小化 / 最大化还原 / 关闭）
 └── root scene group（ROOT 层场景组）
      └── scene group（MAIN 层场景组，业务页面在这里切换）
           ├── HomeScene      (VScene, role=MAIN)
           ├── LoginScene     (VScene, role=MAIN)
           ├── PanelScene     (VScene, role=MAIN)
           └── ...
 抽屉/弹层场景（role=DRAWER_VERTICAL、POPUP 等）挂在 root scene group，
 滑入时盖在 MAIN 层上
```

三个关键类：

- **`VStage`** — 窗口。构造时可传 `VStageInitParams` 定制初始场景、显示哪些窗口按钮。`getStage()` 拿原生 `Stage`（图标、尺寸仍走原生 API）；`getSceneGroup()` 拿 MAIN 场景组；`getRootSceneGroup()` 拿 ROOT 场景组。
- **`VSceneGroup`** — 场景组，负责带动画的 `show`/`hide`。`addScene(scene)` 注册（仅限 MAIN 场景）；**非 MAIN 场景必须**用 `addScene(scene, VSceneHideMethod)` 指定默认滑出方向，否则抛 `IllegalArgumentException`。`show(scene, VSceneShowMethod.FROM_RIGHT)` 从右侧滑入；show 一个 MAIN 场景时，原 MAIN 场景会自动朝**相反方向**滑出（新页面从右进、旧页面往左出，像推卡片），无需手动 hide。方向枚举：`VSceneShowMethod.FROM_LEFT/RIGHT/TOP/BOTTOM、FADE_IN`，`VSceneHideMethod.TO_LEFT/RIGHT/TOP/BOTTOM、FADE_OUT`。
- **`VScene`** — 一个页面。构造时指定 `VSceneRole`：

| VSceneRole | 用途 | 尺寸行为 |
|------------|------|---------|
| `MAIN` | 业务主页面，在 scene group 中互斥显示 | 自动管理宽高，铺满窗口 |
| `TEMPORARY` | 临时全屏页 | 自动管理宽高 |
| `DRAWER_VERTICAL` | 竖直抽屉（从左/右滑出，盖在内容上） | 只管理高度，宽度自定 |
| `DRAWER_HORIZONTAL` | 水平抽屉（从上/下滑出） | 只管理宽度 |
| `POPUP` | 居中弹层 | 内容居中 |

页面内容放进 `scene.getContentPane()`（一个 `Pane`），不要直接操作 `getNode()`。

---

## 4. 应用骨架

典型骨架：

```java
public class App extends Application {

    private VStage vStage;
    private VSceneGroup sceneGroup;
    private MenuScene menuScene;   // 抽屉菜单（DRAWER_VERTICAL）
    private HomeScene homeScene;   // 主页（MAIN）

    @Override
    public void start(Stage primaryStage) {
        // ① 主题注入：必须早于任何 vfx 组件创建（Theme 全进程只能 set 一次）
        Theme.setTheme(new DarkTheme());

        homeScene = new HomeScene();
        menuScene = new MenuScene(this);

        // ② 创建窗口，指定初始场景
        vStage = new VStage(primaryStage, new VStageInitParams().setInitialScene(homeScene)) {
            @Override
            public void close() {
                TaskManager.get().terminate();      // 停掉 vfx 后台任务线程
                GlobalScreenUtils.unregister();     // 注销全局键鼠监听（jnativehook）
                super.close();
            }
        };
        sceneGroup = vStage.getSceneGroup();

        // ③ 抽屉菜单挂 ROOT 场景组，从左侧滑出
        vStage.getRootSceneGroup().addScene(menuScene, VSceneHideMethod.TO_LEFT);

        // ④ 在标题栏旁放一个按钮唤出抽屉
        FusionButton menuBtn = new FusionButton("菜单");
        menuBtn.setPrefSize(64, VStage.TITLE_BAR_HEIGHT + 1);
        menuBtn.setLayoutX(-2);
        menuBtn.setLayoutY(-1);
        menuBtn.setOnAction(e ->
            vStage.getRootSceneGroup().show(menuScene, VSceneShowMethod.FROM_LEFT));
        vStage.getRoot().getContentPane().getChildren().add(menuBtn);

        // ⑤ 常规窗口属性走原生 Stage
        vStage.setTitle("我的应用");
        vStage.getStage().setWidth(1000);
        vStage.getStage().setHeight(680);
        vStage.getStage().centerOnScreen();
        vStage.show();
    }
}
```

要点：

- **主题注入是第一行 UI 代码**，原因见 §5。
- **退出清理**：vfx 启动了后台任务线程（`TaskManager`）和可能的 jnativehook 全局监听。规范做法是覆写 `VStage.close()`，先 `terminate()` 再 `super.close()`。
- `VStage.TITLE_BAR_HEIGHT`（= 28）是标题栏高度常量，往标题栏区域贴控件时用它对齐。

### MAIN 页面之间如何切换

```java
// 登录 → 主页：从右滑入
sceneGroup.show(homeScene, VSceneShowMethod.FROM_RIGHT);

// 主页 → 某业务面板：先 addScene 再 show
VScene scene = new PanelScene("panel-a");
sceneGroup.addScene(scene);
sceneGroup.show(scene, VSceneShowMethod.FROM_RIGHT);
```

`show` 会自动把当前 MAIN 场景朝相反方向滑出，无需手动 hide。

### 抽屉菜单（DRAWER_VERTICAL）

```java
public final class MenuScene extends VScene {

    public MenuScene(App app) {
        super(VSceneRole.DRAWER_VERTICAL);   // 竖直抽屉：宽度自管、高度自适应
        getNode().setPrefWidth(300);         // 抽屉宽度
        enableAutoContentWidth();            // 内容宽度跟随抽屉

        VBox box = new VBox();
        // ...往 box 里塞菜单按钮...
        VScrollPane scroll = new VScrollPane();
        scroll.setContent(box);
        getContentPane().getChildren().add(scroll.getNode());
        FXUtils.observeWidthHeight(getContentPane(), scroll.getNode());  // 让滚动区铺满
    }
}
```

`FXUtils.observeWidthHeight/observeWidthCenter/observeHeightCenter` 把子节点的尺寸/居中绑定到父容器。vfx 场景内部是绝对布局：要么手动 `setLayoutX/Y`，要么用这些工具——没有内置 LayoutManager。

### 场景生命周期的坑：不能移除正在显示的场景

`sceneGroup.removeScene(scene)` 对当前正在显示（或切换动画未完成）的场景会抛异常。如果导航采用「每次进入都重建场景」（页面需要新鲜数据时的常见选择），用「退役队列」延迟清理：

```java
private final Map<String, VScene> sceneCache = new HashMap<>();
private final List<VScene> retiredScenes = new ArrayList<>();

public void showPanel(String name) {
    purgeRetiredScenes();                       // 先清上一批退役场景
    VScene old = sceneCache.remove(name);
    if (old != null) {
        if (old == sceneGroup.getCurrentMainScene()) {
            retiredScenes.add(old);             // 正在显示 → 先退役，下次再清
        } else {
            sceneGroup.removeScene(old);        // 不在显示 → 立即移除
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

### 与既有 FXML 页面共存（渐进迁移）

vfx 不强制重写页面。把 FXML 页面包进 `VScene`，逐步替换：

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

只换骨架（窗口、导航、主题）、页面不动，是侵入最小的集成路径。

---

## 5. 主题系统

### Theme 只能注入一次

```java
Theme.setTheme(new DarkTheme());   // 进程内第一次、也是唯一一次
Theme.current().sceneBackgroundColor();  // 之后到处取色
```

vfx 组件在**构造时**读取 `Theme.current()` 固定颜色，没有运行时热切换机制；`setTheme` 第二次调用抛 `IllegalStateException`。让用户切换主题的标准做法是：**偏好落盘 → 确认弹窗 → 重启应用**，在 `Application.start` 的第一行读偏好并 `setTheme`。

### 自定义浅色主题

1.4.x 只内置 `DarkTheme`。需要浅色时继承它、覆写颜色方法：

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
    // ...按需覆写，完整颜色清单见 Theme 类
}
```

### 窗口控制按钮换色（ImageManager）

标题栏的关闭/最大化/最小化图标是库内置的白色 PNG，浅色背景下不可见。用 `ImageManager.loadBlackAndChangeColor` 生成着色变体：

```java
private static final String DARK_ICON = "dark";

static {
    // 把库内黑白图标按指定 ARGB 生成「dark」变体并缓存
    ImageManager.get().loadBlackAndChangeColor("io/vproxy/vfx/res/image/close.png",
            Map.of(DARK_ICON, 0xff3a3a3c));
    // maximize.png / reset-window-size.png / iconify.png 同理
}

@Override
public Image windowCloseButtonNormalImage() {
    return ImageManager.get().load("io/vproxy/vfx/res/image/close.png:" + DARK_ICON);
}
```

`ImageManager.load(path)` 带缓存；`path:variant` 语法取着色变体。业务自己的图片资源也可走它统一管理。

### vfx 主题与原生 JavaFX 控件混用

`Theme` 只影响 vfx 自绘组件；原生控件（`TextField`、`ComboBox`、`TableView`……）仍走 JavaFX CSS。实践经验：

- **不要动 User-Agent stylesheet**：`Application.setUserAgentStylesheet` 是替换语义，会丢 Modena 控件皮肤，保持默认即可。
- **页面级样式表**：给页面根节点挂自己的 `styles.css` / `styles-dark.css`（类名同套、值各配），两套模式共用一套结构。
- **Dialog 是独立 Stage**，拿不到页面级样式表，须单独给 `dialogPane` 挂样式表。
- **Popup 类浮层**（ComboBox 下拉、右键菜单）经 `PopupControl.getStyleableParent()` 自动继承 owner 场景的样式表，无需处理。

---

## 6. 常用组件速查

| 组件 | 包 | 说明 |
|------|-----|------|
| `FusionButton` | `io.vproxy.vfx.ui.button` | 主按钮；`setDisableAnimation(true)` 关闭 hover 动画 |
| `TransparentFusionButton` | `ui.button` | 透明按钮，hover 才显底色 |
| `FusionImageButton` / `TransparentFusionImageButton` | `ui.button` | 图标按钮 |
| `FusionPane` / `TransparentFusionPane` / `ClickableFusionPane` | `ui.pane` | 圆角卡片容器（hover 变色），macOS 风格分组卡片 |
| `ThemeLabel` | `ui.wrapper` | 自动跟主题文字色的 `Label` |
| `FusionW` | `ui.wrapper` | 把任意控件包进 Fusion 视觉（如 Fusion 风格的 `TextField`） |
| `VScrollPane` | `io.vproxy.vfx.control.scroll` | 自绘滚动条（颜色走主题） |
| `VTableView` | `ui.table` | 自绘表格，见 §7 |
| `VSlider` / `VRangeSlider` | `ui.slider` | 滑块 / 双柄区间滑块 |
| `VProgressBar` | `ui.loading` | 进度条 |
| `LoadingPane` / `LoadingStage` | `ui.loading` | 加载遮罩 / 加载窗口（多步骤 `LoadingItem`） |
| `SimpleAlert` / `StackTraceAlert` | `ui.alert` | 主题化弹窗 |
| `VPadding` / `HPadding` | `ui.layout` | 垂直/水平占位 |
| `Arrow` / `BrokenLine` / `VLine` / `MovablePoint` | `ui.shapes` | 画拓扑图/流程图的形状 |
| `LogConsole` | `io.vproxy.vfx.component.logconsole` | 内嵌日志控制台 |
| `KeyChooser` | `io.vproxy.vfx.component.keychooser` | 快捷键选择控件 |

通用规律：**取布局节点统一用 `getNode()`**；放内容两种入口：`VScene`/`FusionPane` 用 `getContentPane().getChildren().add(...)`，`VScrollPane` 用 `setContent(node)`。

---

## 7. VTableView：自绘表格

vfx 表格不基于 `TableView`，是纯自绘实现（虚拟化、列排序、自定义单元格渲染）。典型用法（取自 intro demo `src/test/java/io/vproxy/vfx/intro/_06bVTableViewDemoScene.java`）：

```java
var table = new VTableView<Data>();
table.getNode().setPrefWidth(1000);
table.getNode().setPrefHeight(580);

// 列 = 标题 + 取值函数；泛型为 <行类型, 单元格值类型>
var idCol   = new VTableColumn<Data, String>("id", data -> data.id);
var nameCol = new VTableColumn<Data, Data>("name", data -> data);
var addrCol = new VTableColumn<Data, String>("address", data -> data.address);

idCol.setMinWidth(300);
addrCol.setAlignment(Pos.CENTER);
addrCol.setComparator(String::compareTo);          // 可排序列必须设 comparator

// 单元格值 → 显示文本（默认 toString）
createTimeCol.setTextBuilder(t -> formatter.format(t));

// 单元格值 → 任意 JavaFX 节点（编辑、按钮、进度条都行）
nameCol.setNodeBuilder(data -> {
    var textField = new TextField();
    return new FusionW(textField);   // 包一层 Fusion 视觉
});

table.getColumns().addAll(idCol, nameCol, addrCol);
table.setItems(dataList);            // 直接传 List<Data>
```

要点：

- 点列头排序（支持多列叠加排序）；没设 `comparator` 的列不可排。
- `setNodeBuilder` 每个可见单元格都实例化节点，大表注意节制。
- 颜色全部走主题（`tableCellBackgroundColor2`、`tableCellSelectedBackgroundColor`、`tableHeaderTop/BottomBackgroundColor`），自定义主题后自动跟随。

---

## 8. 字体：FontManager

vfx 内置并注册了三套字体：

```java
FontManager.FONT_NAME_Default              // 系统默认
FontManager.FONT_NAME_SmileySansOblique    // 得意黑
FontManager.FONT_NAME_NotoSansSCRegular    // 思源黑体
FontManager.FONT_NAME_JetBrainsMono        // 等宽（代码/日志）

// 设置字体：lambda 改 FontSettings（链式）
FontManager.get().setFont(title, s -> s.setSize(28));
FontManager.get().setFont(label, s ->
    s.setFamily(FontManager.FONT_NAME_SmileySansOblique).setSize(16));
```

`FontSettings` 可链式设 `family / size / weight / posture`。

---

## 9. 线程与任务

### TaskManager（vfx 自带）

```java
TaskManager.get().execute(runnable);   // 提交到 vfx 共享后台线程
TaskManager.get().terminate();         // 应用退出时调用（VStage.close 里）
```

适合短小的后台杂务。

### JavaFX Task（UI 回写的标准姿势）

涉及 UI 更新的异步工作（如网络请求）用 JavaFX `Task`——`onSucceeded`/`onFailed` 保证在 FX 线程执行：

```java
Task<T> task = new Task<>() {
    @Override protected T call() throws Exception { return doRequest(); }
};
task.setOnSucceeded(e -> updateUi(task.getValue()));   // FX 线程，无需 runLater
task.setOnFailed(e -> handleError(task.getException()));
Thread t = new Thread(task, "my-task");
t.setDaemon(true);   // 关窗即退，不僵住进程
t.start();
```

---

## 10. 常见坑与最佳实践

1. **`Theme.setTheme` 必须是第一行 UI 代码**——组件构造时固色，先建组件再换主题无效，且第二次 set 抛异常。
2. **不要移除正在显示/动画中的场景**——用「退役队列」延迟清理（§4）。
3. **JavaFX 模块自己声明**，至少补 `javafx-swing`（§2）。
4. **窗口关闭记得清理**：`TaskManager.terminate()` + `GlobalScreenUtils.unregister()`。
5. **主题无热切换**：切换 = 落盘偏好 + 重启；UA stylesheet 保持 Modena 不动（§5）。
6. **Dialog 弹窗拿不到页面样式表**，要单独挂；popup 浮层自动继承，不用管。
7. **场景内容不会自动布局**：绝对布局 + `FXUtils.observe*` 工具，从 LayoutPane 思维切换过来需要适应。
