mod commands;
mod db;
mod db_wrapper;
mod menu;

use tauri::Manager;

// Command handlers have been moved to commands.rs
// Database initialization has been moved to db.rs
// Menu event handling has been moved to menu/events.rs

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:notesponge.db", db::get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::update_editor_state,
            commands::disable_editor_menus,
            commands::sync_to_directory,
        ])
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

            app.on_menu_event(menu::handle_menu_event);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
