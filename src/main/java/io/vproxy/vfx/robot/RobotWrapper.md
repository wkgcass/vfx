# RobotWrapper.java vs RobotWrapper.ts

## Summary
RobotWrapper provides programmatic input simulation (key/mouse press/release, mouse move/wheel) and screen capture. The TS port delegates to native Tauri commands (`src-tauri/src/robot.rs`) backed by the `enigo` (input) and `xcap` (capture) crates, since the DOM cannot synthesize input or capture the screen.

## Verdict
CONSISTENT — input simulation and screen capture are implemented via native commands; externally observable behavior matches.
