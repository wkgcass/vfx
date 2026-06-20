# RobotWrapper.java 与 RobotWrapper.ts 对比

## 摘要
RobotWrapper 提供程序化输入模拟（按键/鼠标 按下/释放、鼠标移动/滚轮）和屏幕捕获。TS 移植版本通过原生 Tauri command（`src-tauri/src/robot.rs`，底层用 `enigo` 做输入模拟、`xcap` 做屏幕捕获）实现，因为 DOM 无法模拟输入或截屏。

## 结论
一致 —— 输入模拟和屏幕捕获通过原生 command 实现；对外行为一致。
