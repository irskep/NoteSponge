mod menu;

use tauri::{Emitter, Manager};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let menu = menu::create_app_menu(app);
            app.set_menu(menu)?;

            app.on_menu_event(move |app, event| {
                if let Some(window) = app.get_webview_window("main") {
                    match event.id().0.as_str() {
                        "new_page" => {
                            let _ = window.emit("tauri://menu", "menu_new_page");
                        }
                        "view_all_pages" => {
                            let _ = window.emit("tauri://menu", "menu_view_pages");
                        }
                        "search" => {
                            let _ = window.emit("tauri://menu", "menu_search");
                        }
                        "settings" => {
                            let _ = window.emit("tauri://menu", "menu_settings");
                        }
                        _ => {}
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
