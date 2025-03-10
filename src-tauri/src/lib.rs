mod menu;
mod commands;
mod db;

use tauri::{Emitter, Manager};

// Command handlers have been moved to commands.rs
// Database initialization has been moved to db.rs

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default()
            .add_migrations("sqlite:$APP_DATA_DIR/notesponge.db", db::get_migrations())
            .build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![commands::update_editor_state, commands::disable_editor_menus])
        .on_window_event(|window, event| {
            // Prevent fully closing the main window because it messes up
            // our ability to receive menu events.
            
            if window.label() != "main" {
                return;
            }
            
            match event {
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    window.hide().unwrap();
                    api.prevent_close();
                }
                _ => {}
            }
        })
        .setup(|app| {
            let (menu, menu_items) = menu::create_app_menu(app, None);
            app.manage(menu_items);
            app.set_menu(menu)?;

            // Initialize the database
            tauri::async_runtime::block_on(async {
                if let Err(e) = db::initialize_database(app).await {
                    eprintln!("Database initialization error: {}", e);
                }
            });
            
            app.on_menu_event(move |app, event| {
                if let Some(window) = app.get_webview_window("main") {
                    let id = event.id().0.as_str();

                    println!("Menu event: {}", id);
                    
                    // Handle standard menu items
                    let event_payload = match id {
                        "new_page" => Some("menu_new_page"),
                        "view_all_pages" => Some("menu_view_pages"),
                        "search" => Some("menu_search"),
                        "settings" => Some("menu_settings"),
                        "focus_tags" => Some("menu_focus_tags"),
                        "recent_pages" => Some("menu_recent_pages"),
                        // Format menu items - pass through the ID directly
                        id if id.starts_with("format_") => Some(id),
                        // Edit menu items
                        "edit_undo" => Some("edit_undo"),
                        "edit_redo" => Some("edit_redo"),
                        _ => None,
                    };
                    
                    // Emit the event if we have a payload
                    if let Some(payload) = event_payload {
                        let _ = window.emit("tauri://menu", payload);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
