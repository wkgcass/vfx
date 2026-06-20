# DoubleDoubleFunction.java 与 DoubleDoubleFunction.ts 对比

## 摘要
double -> double 函数的函数式接口。TS 使用 (x: number) => number 类型。

## 备注
虽然 `AnimationEdge.function` 的类型为 `DoubleDoubleFunction`，但 `AnimationGraph` **实际上并未使用**该字段 — 线性插值在 Java 和 TS 中都是硬编码的。TS 文件包含注释：*"Not used by AnimationGraph (linear interpolation is hardcoded); kept for API parity."*

## 结论
一致。
