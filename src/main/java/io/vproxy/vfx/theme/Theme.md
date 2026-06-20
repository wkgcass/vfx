# Theme.java vs Theme.ts

## Summary
Abstract theme class defining colors, images, and visual properties for all UI components. The TS version cannot lazily create a default DarkTheme due to ESM module system restrictions on static import cycles; callers must explicitly call setTheme() during bootstrap.

## Verdict
CONSISTENT - All theme property methods are identical.
