mod menu;

use tauri::{Emitter, Manager};
use tauri_plugin_sql::{Migration, MigrationKind};
use std::fs;
use std::path::Path;
use tokio::sync::Mutex;
use std::sync::Arc;
use sqlx::{Pool, Sqlite, SqlitePool};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Command to set SQLite PRAGMAs
#[tauri::command]
async fn set_pragmas(pool: tauri::State<'_, Arc<Mutex<Pool<Sqlite>>>>) -> Result<(), String> {
    let pool = pool.lock().await;
    sqlx::query(
        "PRAGMA journal_mode = WAL;
         PRAGMA busy_timeout = 5000;
         PRAGMA synchronous = NORMAL;
         PRAGMA cache_size = 1000000000;
         PRAGMA foreign_keys = true;
         PRAGMA temp_store = memory;"
    )
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;
    
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
        .invoke_handler(tauri::generate_handler![greet, set_pragmas])
        .setup(|app| {
            let menu = menu::create_app_menu(app, None);
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
                    
                    // Handle standard menu items
                    let event_payload = match id {
                        "new_page" => Some("menu_new_page"),
                        "view_all_pages" => Some("menu_view_pages"),
                        "search" => Some("menu_search"),
                        "settings" => Some("menu_settings"),
                        // Format menu items - pass through the ID directly
                        id if id.starts_with("format_") => Some(id),
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
