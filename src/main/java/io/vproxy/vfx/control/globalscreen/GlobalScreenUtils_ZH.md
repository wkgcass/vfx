# GlobalScreenUtils.java 与 GlobalScreenUtils.ts 对比

## 摘要
管理 jnativehook 全局屏幕钩子的工具类。TS 移植版本将整个 jnativehook 子系统存根化，因为浏览器中不可用；引用计数 API 被保留，因此调用者无需更改。

## 结论
一致 —— 引用计数 API 被保留。实际的全局钩子功能在浏览器中本质上不可用（必要的平台限制）。
