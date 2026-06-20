# IntroTheme.java vs IntroTheme.ts
## Summary
Custom theme for the intro demo. Both extend DarkTheme and override `fontProvider()` to set JetBrainsMono font family. In TS, IntroFontProvider is a separate exported class rather than a static inner class.
## Verdict
CONSISTENT. Same logic, slightly different class structure.
