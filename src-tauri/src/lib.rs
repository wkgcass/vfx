use std::sync::Mutex;
use tauri::Manager;

mod robot;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            // The main window is declared `visible: false` in tauri.conf.json
            // so the OS doesn't paint an empty/transparent frame before the
            // JS has had a chance to build the VStage content. The JS side
            // (IntroFXMain.start → VStage.show) calls `show()` once content
            // is ready — do NOT pre-show here, that would re-introduce the
            // startup flash.
            //
            // Auto-open devtools in debug builds. The window itself stays
            // hidden until the JS shows it; devtools can still attach.
            if let Some(window) = app.get_webview_window("main") {
                #[cfg(debug_assertions)]
                window.open_devtools();
                let _ = window; // suppress unused warning in release builds
            }

            // Construct the single Enigo instance used by the robot commands.
            // Enigo is not Sync, so it is wrapped in a Mutex and shared across
            // command invocations as managed state.
            match robot::new_enigo() {
                Ok(enigo) => {
                    app.manage(Mutex::new(enigo));
                }
                Err(e) => {
                    // Robot input simulation is best-effort: if the native
                    // backend cannot be initialized (e.g. missing permissions
                    // at startup), surface the error but keep the app running.
                    eprintln!("warning: Enigo init failed, robot commands disabled: {e}");
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            robot::robot_key_press,
            robot::robot_key_release,
            robot::robot_mouse_press,
            robot::robot_mouse_release,
            robot::robot_mouse_move,
            robot::robot_mouse_wheel,
            robot::robot_get_mouse_position,
            robot::robot_capture_screen,
            robot::robot_capture,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
