mod menu;

use tauri::{Emitter, Manager};
use tauri_plugin_sql::{Migration, MigrationKind};
use std::fs;
use std::path::Path;
use tokio::sync::Mutex;
use std::sync::Arc;
use sqlx::{Pool, Sqlite, SqlitePool};

// Command to update editor state
#[tauri::command]
fn update_editor_state(
    app_handle: tauri::AppHandle,
    bold: bool,
    italic: bool,
    underline: bool,
    strikethrough: bool,
    code: bool,
    align_left: bool,
    align_center: bool,
    align_right: bool,
    align_justify: bool,
    bullet_list: bool,
    numbered_list: bool,
    can_undo: bool,
    can_redo: bool,
) -> Result<(), String> {
    // Construct the EditorState object
    let editor_state = menu::EditorState {
        bold_active: bold,
        italic_active: italic,
        underline_active: underline,
        strikethrough_active: strikethrough,
        code_active: code,
        align_left_active: align_left,
        align_center_active: align_center,
        align_right_active: align_right,
        align_justify_active: align_justify,
        bullet_list_active: bullet_list,
        numbered_list_active: numbered_list,
        can_undo,
        can_redo,
    };
    
    // Log the state for debugging
    println!("Updating menu with editor state: bold={}, italic={}, underline={}, strikethrough={}, code={}, align_left={}, align_center={}, align_right={}, align_justify={}, bullet_list={}, numbered_list={}, can_undo={}, can_redo={}",
        editor_state.bold_active,
        editor_state.italic_active,
        editor_state.underline_active,
        editor_state.strikethrough_active,
        editor_state.code_active,
        editor_state.align_left_active,
        editor_state.align_center_active,
        editor_state.align_right_active,
        editor_state.align_justify_active,
        editor_state.bullet_list_active,
        editor_state.numbered_list_active,
        editor_state.can_undo,
        editor_state.can_redo
    );
    
    // Get menu items from state
    let menu_items = app_handle.state::<menu::MenuItems<tauri::Wry>>();

    menu_items.format_bold.set_enabled(true).map_err(|e| e.to_string())?;
    menu_items.format_italic.set_enabled(true).map_err(|e| e.to_string())?;
    menu_items.format_underline.set_enabled(true).map_err(|e| e.to_string())?;
    menu_items.format_strikethrough.set_enabled(true).map_err(|e| e.to_string())?;
    menu_items.format_code.set_enabled(true).map_err(|e| e.to_string())?;
    menu_items.format_align_left.set_enabled(true).map_err(|e| e.to_string())?;
    menu_items.format_align_center.set_enabled(true).map_err(|e| e.to_string())?;
    menu_items.format_align_right.set_enabled(true).map_err(|e| e.to_string())?;
    menu_items.format_align_justify.set_enabled(true).map_err(|e| e.to_string())?;
    menu_items.format_bullet_list.set_enabled(true).map_err(|e| e.to_string())?;
    menu_items.format_numbered_list.set_enabled(true).map_err(|e| e.to_string())?;

    // Update menu items directly
    menu_items.format_bold.set_checked(bold).map_err(|e| e.to_string())?;
    menu_items.format_italic.set_checked(italic).map_err(|e| e.to_string())?;
    menu_items.format_underline.set_checked(underline).map_err(|e| e.to_string())?;
    menu_items.format_strikethrough.set_checked(strikethrough).map_err(|e| e.to_string())?;
    menu_items.format_code.set_checked(code).map_err(|e| e.to_string())?;
    menu_items.format_align_left.set_checked(align_left).map_err(|e| e.to_string())?;
    menu_items.format_align_center.set_checked(align_center).map_err(|e| e.to_string())?;
    menu_items.format_align_right.set_checked(align_right).map_err(|e| e.to_string())?;
    menu_items.format_align_justify.set_checked(align_justify).map_err(|e| e.to_string())?;
    menu_items.format_bullet_list.set_checked(bullet_list).map_err(|e| e.to_string())?;
    menu_items.format_numbered_list.set_checked(numbered_list).map_err(|e| e.to_string())?;
    
    // Update undo/redo menu items
    menu_items.edit_undo.set_enabled(can_undo).map_err(|e| e.to_string())?;
    menu_items.edit_redo.set_enabled(can_redo).map_err(|e| e.to_string())?;
    
    Ok(())
}

// Command to disable editor menus
#[tauri::command]
fn disable_editor_menus(app_handle: tauri::AppHandle) -> Result<(), String> {
    // Get menu items from state
    let menu_items = app_handle.state::<menu::MenuItems<tauri::Wry>>();

    // Disable all format menu items
    menu_items.format_bold.set_enabled(false).map_err(|e| e.to_string())?;
    menu_items.format_italic.set_enabled(false).map_err(|e| e.to_string())?;
    menu_items.format_underline.set_enabled(false).map_err(|e| e.to_string())?;
    menu_items.format_strikethrough.set_enabled(false).map_err(|e| e.to_string())?;
    menu_items.format_code.set_enabled(false).map_err(|e| e.to_string())?;
    menu_items.format_align_left.set_enabled(false).map_err(|e| e.to_string())?;
    menu_items.format_align_center.set_enabled(false).map_err(|e| e.to_string())?;
    menu_items.format_align_right.set_enabled(false).map_err(|e| e.to_string())?;
    menu_items.format_align_justify.set_enabled(false).map_err(|e| e.to_string())?;
    menu_items.format_bullet_list.set_enabled(false).map_err(|e| e.to_string())?;
    menu_items.format_numbered_list.set_enabled(false).map_err(|e| e.to_string())?;
    
    // Disable undo/redo menu items
    menu_items.edit_undo.set_enabled(false).map_err(|e| e.to_string())?;
    menu_items.edit_redo.set_enabled(false).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default()
            .add_migrations("sqlite:$APP_DATA_DIR/notesponge.db", get_migrations())
            .build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![update_editor_state, disable_editor_menus])
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

            // Initialize the database and set up the connection pool
            tauri::async_runtime::block_on(async {
                let app_handle = app.handle();
                let app_data_dir = app_handle.path().app_data_dir().expect("Failed to get app data directory");
                std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");
                
                let db_path = app_data_dir.join("notesponge.db");
                let db_url = format!("sqlite:{}", db_path.display());
                
                match SqlitePool::connect(&db_url).await {
                    Ok(pool) => {
                        // Store the pool in app state
                        let pool_mutex = Arc::new(Mutex::new(pool));
                        app.manage(pool_mutex.clone());
                        
                        // Set PRAGMAs immediately
                        let pool_guard = pool_mutex.lock().await;
                        let _ = sqlx::query(
                            "PRAGMA journal_mode = WAL;
                             PRAGMA busy_timeout = 5000;
                             PRAGMA synchronous = NORMAL;
                             PRAGMA cache_size = 1000000000;
                             PRAGMA foreign_keys = true;
                             PRAGMA temp_store = memory;"
                        )
                        .execute(&*pool_guard)
                        .await;
                        // Release the lock
                        drop(pool_guard);
                    },
                    Err(e) => {
                        eprintln!("Failed to connect to database: {}", e);
                    }
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

fn get_migrations() -> Vec<Migration> {
    let migration_path = Path::new("migrations/01-initial-schema.sql");
    let sql = fs::read_to_string(migration_path)
        .expect("Failed to read migration file");
    
    vec![
        Migration {
            version: 1,
            description: "initial_schema",
            sql: Box::leak(sql.into_boxed_str()),
            kind: MigrationKind::Up,
        }
    ]
}
