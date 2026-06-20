# VDialogButton.java 与 VDialogButton.ts 对比

## 摘要
表示 VDialog 中按钮的数据类，持有名称、可选值提供者和实际按钮控件的引用。

## 结论
一致 — 构造函数分发逻辑正确复制了 Java 的重载行为。三种调用模式（值、提供者函数、无提供者）都被保留。
