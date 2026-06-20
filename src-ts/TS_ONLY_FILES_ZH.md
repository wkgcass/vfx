# 仅 TS/Rust 文件（无 Java 对应文件）

## TypeScript 文件

### commons-graph/（图库）
- **Graph.ts**：Dijkstra 图库（GraphNode/GraphEdge/GraphPath/Graph/GraphBuilder）—— 移植外部依赖 `io.vproxy.commons.graph`，供 `AnimationGraph` 计算最短路径

### javafx/（JavaFX 抽象层）
- **Node.ts**：DOM 元素包装器，模拟 JavaFX Node API（布局、样式、属性）
- **Pane.ts**：容器元素（等同于 JavaFX Pane/Group）
- **Parent.ts**：带子元素的容器基类
- **Label.ts**：文本显示元素
- **HBox.ts / VBox.ts**：水平/垂直布局容器
- **GridPane.ts**：网格布局
- **ImageView.ts**：图片显示（FXImage 包装器）
- **TextField.ts**：文本输入框
- **CheckBox.ts**：复选框输入
- **Property.ts**：可观察属性系统（模拟 JavaFX 属性）
- **color.ts**：Color/LinearGradient/Paint 实现
- **layout.ts**：Background、Border、Insets、CornerRadii CSS 抽象
- **shapes.ts**：Circle、Rectangle、Line 形状基础元素
- **scene.ts**：Scene 容器
- **stage.ts**：窗口/stage 管理（Tauri window API 包装器）

### window/（多窗口支持）
- **WindowManager.ts**：通过 Tauri 管理多个操作系统窗口
- **WindowHandle.ts**：与子窗口通信的句柄
- **StageSpec.ts**：窗口规格类型
- **childComms.ts**：子窗口通信
- **events.ts**：窗口事件类型
- **factory.ts / factories/index.ts**：不同窗口类型的窗口内容工厂

### vproxy-base/（基础工具库）
- **Logger.ts**：日志系统（移植 vproxy Logger）
- **LogType.ts**：日志类型常量
- **Callback.ts**：回调抽象
- **OS.ts**：操作系统检测
- **log/LogDispatcher.ts**：日志分发系统
- **log/LogHandler.ts**：日志处理器接口
- **log/LogLevel.ts**：日志级别枚举
- **log/LogRecord.ts**：日志记录数据

### 其他
- **bootstrap-utils.ts**：引导/初始化工具
- **child.ts**：子窗口入口点
- **index.ts**：主模块入口/导出（窗口引导分发：主窗口与子窗口）
- **util/types.ts**：共享 TypeScript 类型定义
- **sceneHelpers.ts**：演示场景构建的辅助函数
- **scenesDemo.ts**：合并的演示场景（来自 30 个 Java 文件）
- **scenesText.ts**：合并的场景文本内容

## Rust 文件

### src-tauri/
- **src/main.rs**：Tauri 应用程序入口点
- **src/lib.rs**：Tauri 库配置和命令处理器
- **src/robot.rs**：以 Tauri 命令形式提供的原生输入模拟与屏幕截图（enigo 负责键鼠输入，xcap 负责屏幕截图）—— 为 TS 版 `RobotWrapper` 提供后端，浏览器无法直接实现
- **build.rs**：标准 Tauri 构建脚本（`tauri_build::build()`）

## 用途
这些文件提供了平台抽象层，使 JavaFX vfx 库能在 Tauri Web 环境中运行。javafx/ 目录使用 DOM/CSS 重新实现了 JavaFX 基础元素，window/ 目录通过 Tauri 添加了多窗口支持，vproxy-base/ 移植了基础工具库，commons-graph/ 移植了图/Dijkstra 依赖，Rust 文件则暴露浏览器无法直接提供的原生能力（窗口管理、输入模拟、屏幕截图）。
