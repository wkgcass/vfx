# Java _00IntroScene 到 _zzzzzEndingScene vs TS scenesDemo.ts/scenesText.ts

## 总结
Java 版本有约 35 个独立的场景文件（`_00IntroScene.java`、`_01aVStageIntroScene.java` 等）用于演示应用。TS 移植版将这些合并为：
- `scenesDemo.ts` — 包含所有演示场景类
- `scenesText.ts` — 包含所有文本/描述内容
- `sceneHelpers.ts` — 共享辅助函数

## 结论
一致。从多个文件到更少文件的合并是组织变更，不是行为变更。所有演示场景及其内容都被保留。
