# AGENTS.md

Guidance for AI coding agents working in this repository.

## Repository orientation

vfx is a JavaFX UI framework/library (`io.vproxy:vfx`). Read `module-info.java` first — it gives the best overview of what the library provides. The intro demo (`./gradlew runIntro`) demonstrates the main components; its code lives in `src/test/java/io/vproxy/vfx/intro`.

The TypeScript/Rust port under `src-ts/` and `src-tauri/` documents itself in `src-ts/TS_ONLY_FILES.md`.

## Keep the usage guide up to date

`USAGE.md` (English) and `USAGE_ZH.md` (Chinese) form a usage guide, written as a supplement to README.md. When your change is user-visible, update the guide in the same change:

1. Adding a new feature, or changing public API in a way visible to users → update **both** files: they mirror each other (same section structure and numbering), one in English, one in Chinese. Do not update only one side.
2. Internal refactors and private API changes need no doc update.
3. Prefer a short runnable example plus one or two sentences over long prose. Follow the style of existing sections.

## Commit messages

When a commit's content (code or docs) is written or co-written by an AI model, record the model in the commit message, as the last line, e.g.:

    Docs written with <model name>.
