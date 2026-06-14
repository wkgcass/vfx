//! Native input simulation + screen capture, exposed to the frontend as
//! Tauri commands. This backs the TS `RobotWrapper` (the JavaFX→TS port of
//! `io.vproxy.vfx.robot.RobotWrapper`), which the browser cannot implement
//! directly, so the work is delegated here to the `enigo`/`xcap` crates.
//!
//! Key identity is transported from the frontend as a DOM `KeyboardEvent.code`
//! string (e.g. `KeyA`, `ShiftRight`, `ArrowUp`, `Digit1`, `F1`), because that
//! is physical-key based, distinguishes left/right modifiers, and maps cleanly
//! onto enigo's key model. Letters/digits/punctuation are mapped to
//! `Key::Unicode(char)` for cross-platform uniformity (the per-letter `Key`
//! variants are Windows-only in enigo); function/navigation/modifier keys use
//! the dedicated variants.

use std::sync::Mutex;

use base64::{engine::general_purpose, Engine as _};
use enigo::{
    Axis, Button, Coordinate, Direction::{self, Press, Release},
    Enigo, Key, Keyboard, Mouse, Settings,
};
use image::DynamicImage;
use serde::Serialize;
use tauri::State;

/// Serialized mouse position returned to the frontend.
#[derive(Serialize)]
pub struct MousePosition {
    pub x: f64,
    pub y: f64,
}

/// Map a DOM `KeyboardEvent.code` to an enigo `Key`. Returns `None` for codes
/// the framework does not model. The left/right side is already encoded in the
/// code itself (e.g. `ShiftLeft` vs `ShiftRight`), so no separate flag is
/// needed.
fn dom_code_to_key(dom_code: &str) -> Option<Key> {
    // Modifier keys: the code carries the side, mapping to the dedicated
    // L*/R* variants where enigo provides them.
    let key = match dom_code {
        "ShiftLeft" => Key::LShift,
        "ShiftRight" => Key::RShift,
        "ControlLeft" => Key::LControl,
        "ControlRight" => Key::RControl,
        // enigo exposes no cross-platform right-Alt variant, so both sides use
        // the generic Alt (on macOS this is the Option key). The left/right
        // distinction is preserved for Shift/Control which do have variants.
        "AltLeft" | "AltRight" => Key::Alt,
        "MetaLeft" | "MetaRight" => Key::Meta,
        // Letters → Unicode (cross-platform; enigo's A-Z variants are
        // Windows-only). Lowercase is used because a bare key event should
        // not imply Shift.
        "KeyA" => Key::Unicode('a'),
        "KeyB" => Key::Unicode('b'),
        "KeyC" => Key::Unicode('c'),
        "KeyD" => Key::Unicode('d'),
        "KeyE" => Key::Unicode('e'),
        "KeyF" => Key::Unicode('f'),
        "KeyG" => Key::Unicode('g'),
        "KeyH" => Key::Unicode('h'),
        "KeyI" => Key::Unicode('i'),
        "KeyJ" => Key::Unicode('j'),
        "KeyK" => Key::Unicode('k'),
        "KeyL" => Key::Unicode('l'),
        "KeyM" => Key::Unicode('m'),
        "KeyN" => Key::Unicode('n'),
        "KeyO" => Key::Unicode('o'),
        "KeyP" => Key::Unicode('p'),
        "KeyQ" => Key::Unicode('q'),
        "KeyR" => Key::Unicode('r'),
        "KeyS" => Key::Unicode('s'),
        "KeyT" => Key::Unicode('t'),
        "KeyU" => Key::Unicode('u'),
        "KeyV" => Key::Unicode('v'),
        "KeyW" => Key::Unicode('w'),
        "KeyX" => Key::Unicode('x'),
        "KeyY" => Key::Unicode('y'),
        "KeyZ" => Key::Unicode('z'),
        // Digits
        "Digit0" => Key::Unicode('0'),
        "Digit1" => Key::Unicode('1'),
        "Digit2" => Key::Unicode('2'),
        "Digit3" => Key::Unicode('3'),
        "Digit4" => Key::Unicode('4'),
        "Digit5" => Key::Unicode('5'),
        "Digit6" => Key::Unicode('6'),
        "Digit7" => Key::Unicode('7'),
        "Digit8" => Key::Unicode('8'),
        "Digit9" => Key::Unicode('9'),
        // Punctuation (US layout physical keys)
        "Minus" => Key::Unicode('-'),
        "Equal" => Key::Unicode('='),
        "BracketLeft" => Key::Unicode('['),
        "BracketRight" => Key::Unicode(']'),
        "Backslash" => Key::Unicode('\\'),
        "Semicolon" => Key::Unicode(';'),
        "Quote" => Key::Unicode('\''),
        "Backquote" => Key::Unicode('`'),
        "Comma" => Key::Unicode(','),
        "Period" => Key::Unicode('.'),
        "Slash" => Key::Unicode('/'),
        "Space" => Key::Space,
        // Editing / navigation
        "Enter" => Key::Return,
        "Escape" => Key::Escape,
        "Backspace" => Key::Backspace,
        "Tab" => Key::Tab,
        "CapsLock" => Key::CapsLock,
        "Insert" => {
            // Insert exists on Windows and Linux, not macOS.
            #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
            {
                Key::Insert
            }
            #[cfg(target_os = "macos")]
            {
                return None;
            }
        }
        "Delete" => Key::Delete,
        "Home" => Key::Home,
        "End" => Key::End,
        "PageUp" => Key::PageUp,
        "PageDown" => Key::PageDown,
        "ArrowUp" => Key::UpArrow,
        "ArrowDown" => Key::DownArrow,
        "ArrowLeft" => Key::LeftArrow,
        "ArrowRight" => Key::RightArrow,
        // Function keys
        "F1" => Key::F1,
        "F2" => Key::F2,
        "F3" => Key::F3,
        "F4" => Key::F4,
        "F5" => Key::F5,
        "F6" => Key::F6,
        "F7" => Key::F7,
        "F8" => Key::F8,
        "F9" => Key::F9,
        "F10" => Key::F10,
        "F11" => Key::F11,
        "F12" => Key::F12,
        // Control keys — names differ by platform (ScrollLock is Linux-only,
        // Scroll is Windows-only; PrintScr/Pause exist on both Windows and
        // Linux but not macOS), so gate them per platform.
        "PrintScreen" => {
            #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
            {
                Key::PrintScr
            }
            #[cfg(target_os = "macos")]
            {
                return None;
            }
        }
        "ScrollLock" => {
            #[cfg(all(unix, not(target_os = "macos")))]
            {
                Key::ScrollLock
            }
            #[cfg(target_os = "windows")]
            {
                Key::Scroll
            }
            #[cfg(target_os = "macos")]
            {
                return None;
            }
        }
        "Pause" => {
            #[cfg(any(target_os = "windows", all(unix, not(target_os = "macos"))))]
            {
                Key::Pause
            }
            #[cfg(target_os = "macos")]
            {
                return None;
            }
        }
        _ => return None,
    };
    Some(key)
}

/// Map the framework's mouse-button wire value ("PRIMARY"/"SECONDARY"/"MIDDLE")
/// to an enigo `Button`.
fn mouse_button(name: &str) -> Option<Button> {
    Some(match name {
        "PRIMARY" => Button::Left,
        "SECONDARY" => Button::Right,
        "MIDDLE" => Button::Middle,
        _ => return None,
    })
}

fn run_key(
    enigo: &mut Enigo,
    dom_code: &str,
    direction: Direction,
) -> Result<(), String> {
    let key = dom_code_to_key(dom_code).ok_or_else(|| format!("unknown domCode: {dom_code}"))?;
    enigo
        .key(key, direction)
        .map_err(|e| format!("key event failed: {e}"))
}

fn run_button(enigo: &mut Enigo, button: &str, direction: Direction) -> Result<(), String> {
    let btn = mouse_button(button).ok_or_else(|| format!("unknown mouse button: {button}"))?;
    enigo
        .button(btn, direction)
        .map_err(|e| format!("mouse button event failed: {e}"))
}

/// Encode an RGBA image to a PNG `data:` URL (base64) for the frontend.
fn rgba_to_data_url(img: image::RgbaImage) -> Result<String, String> {
    let mut buf = std::io::Cursor::new(Vec::new());
    DynamicImage::ImageRgba8(img)
        .write_to(&mut buf, image::ImageFormat::Png)
        .map_err(|e| format!("png encode failed: {e}"))?;
    let b64 = general_purpose::STANDARD.encode(buf.into_inner());
    Ok(format!("data:image/png;base64,{b64}"))
}

#[tauri::command]
pub fn robot_key_press(
    dom_code: String,
    is_left: bool,
    state: State<'_, Mutex<Enigo>>,
) -> Result<(), String> {
    // `is_left` is informational only: the left/right side is already encoded
    // in `dom_code` (e.g. ShiftLeft/ShiftRight). Kept in the signature to match
    // the frontend's Key shape and for forward compatibility.
    let _ = is_left;
    let mut enigo = state.lock().map_err(|e| format!("lock failed: {e}"))?;
    run_key(&mut enigo, &dom_code, Press)
}

#[tauri::command]
pub fn robot_key_release(
    dom_code: String,
    is_left: bool,
    state: State<'_, Mutex<Enigo>>,
) -> Result<(), String> {
    let _ = is_left;
    let mut enigo = state.lock().map_err(|e| format!("lock failed: {e}"))?;
    run_key(&mut enigo, &dom_code, Release)
}

#[tauri::command]
pub fn robot_mouse_press(button: String, state: State<'_, Mutex<Enigo>>) -> Result<(), String> {
    let mut enigo = state.lock().map_err(|e| format!("lock failed: {e}"))?;
    run_button(&mut enigo, &button, Press)
}

#[tauri::command]
pub fn robot_mouse_release(button: String, state: State<'_, Mutex<Enigo>>) -> Result<(), String> {
    let mut enigo = state.lock().map_err(|e| format!("lock failed: {e}"))?;
    run_button(&mut enigo, &button, Release)
}

/// Move the mouse to absolute screen coordinates.
#[tauri::command]
pub fn robot_mouse_move(
    x: f64,
    y: f64,
    state: State<'_, Mutex<Enigo>>,
) -> Result<(), String> {
    let mut enigo = state.lock().map_err(|e| format!("lock failed: {e}"))?;
    enigo
        .move_mouse(x as i32, y as i32, Coordinate::Abs)
        .map_err(|e| format!("mouse move failed: {e}"))
}

/// Scroll the vertical mouse wheel. Negative = up, positive = down (AWT
/// convention, matching the Java RobotWrapper).
#[tauri::command]
pub fn robot_mouse_wheel(amount: i32, state: State<'_, Mutex<Enigo>>) -> Result<(), String> {
    let mut enigo = state.lock().map_err(|e| format!("lock failed: {e}"))?;
    enigo
        .scroll(amount, Axis::Vertical)
        .map_err(|e| format!("mouse wheel failed: {e}"))
}

/// Current mouse cursor position in absolute screen pixels.
#[tauri::command]
pub fn robot_get_mouse_position(
    state: State<'_, Mutex<Enigo>>,
) -> Result<MousePosition, String> {
    let enigo = state.lock().map_err(|e| format!("lock failed: {e}"))?;
    let (x, y) = enigo
        .location()
        .map_err(|e| format!("mouse location failed: {e}"))?;
    Ok(MousePosition {
        x: x as f64,
        y: y as f64,
    })
}

/// Capture the entire primary monitor as a PNG data URL.
#[tauri::command]
pub fn robot_capture_screen() -> Result<String, String> {
    let monitors = xcap::Monitor::all().map_err(|e| format!("enumerate monitors failed: {e}"))?;
    let primary = monitors
        .iter()
        .find(|m| m.is_primary().unwrap_or(false))
        .or_else(|| monitors.first())
        .ok_or_else(|| "no monitor available".to_string())?;
    let img = primary
        .capture_image()
        .map_err(|e| format!("screen capture failed: {e}"))?;
    rgba_to_data_url(img)
}

/// Capture a sub-rectangle of the primary monitor (in screen pixels) as a PNG
/// data URL. Coordinates are relative to the monitor's top-left corner.
#[tauri::command]
pub fn robot_capture(x: i64, y: i64, width: u32, height: u32) -> Result<String, String> {
    let monitors = xcap::Monitor::all().map_err(|e| format!("enumerate monitors failed: {e}"))?;
    let primary = monitors
        .iter()
        .find(|m| m.is_primary().unwrap_or(false))
        .or_else(|| monitors.first())
        .ok_or_else(|| "no monitor available".to_string())?;
    let img = primary
        .capture_region(x as u32, y as u32, width, height)
        .map_err(|e| format!("region capture failed: {e}"))?;
    rgba_to_data_url(img)
}

/// Construct the shared Enigo instance. Called once from the Tauri `setup`
/// hook and stored as managed state.
pub fn new_enigo() -> Result<Enigo, String> {
    Enigo::new(&Settings::default()).map_err(|e| format!("failed to create Enigo: {e}"))
}
