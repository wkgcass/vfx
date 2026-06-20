# IntroTheme.java 与 IntroTheme.ts 对比

## 摘要
intro 演示的自定义主题。两者都继承 DarkTheme 并覆盖 fontProvider() 方法，设置 JetBrainsMono 字体族。TS 中 IntroFontProvider 是独立的导出类而非静态内部类。

## 结论
一致。逻辑相同，类结构略有不同。
