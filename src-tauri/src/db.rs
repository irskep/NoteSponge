use std::fs;
use std::path::Path;
use tauri_plugin_sql::{Migration, MigrationKind};
use tauri::Manager;
use tokio::sync::Mutex;
use std::sync::Arc;
use sqlx::SqlitePool;

/// Returns the database migrations for the application
pub fn get_migrations() -> Vec<Migration> {
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

/// Sets up SQLite PRAGMAs for optimal performance
pub fn get_sqlite_pragmas() -> &'static str {
    "PRAGMA journal_mode = WAL;
     PRAGMA busy_timeout = 5000;
     PRAGMA synchronous = NORMAL;
     PRAGMA cache_size = 1000000000;
     PRAGMA foreign_keys = true;
     PRAGMA temp_store = memory;"
}

/// Initializes the database and sets up the connection pool
pub async fn initialize_database(app: &tauri::App) -> Result<(), String> {
    let app_handle = app.handle();
    let app_data_dir = app_handle.path().app_data_dir()
        .expect("Failed to get app data directory");
    std::fs::create_dir_all(&app_data_dir)
        .expect("Failed to create app data directory");
    
    let db_path = app_data_dir.join("notesponge.db");
    let db_url = format!("sqlite:{}", db_path.display());
    
    match SqlitePool::connect(&db_url).await {
        Ok(pool) => {
            // Store the pool in app state
            let pool_mutex = Arc::new(Mutex::new(pool));
            app.manage(pool_mutex.clone());
            
            // Set PRAGMAs immediately
            let pool_guard = pool_mutex.lock().await;
            let _ = sqlx::query(get_sqlite_pragmas())
                .execute(&*pool_guard)
                .await
                .map_err(|e| e.to_string())?;
            // Release the lock
            drop(pool_guard);
            
            Ok(())
        },
        Err(e) => {
            eprintln!("Failed to connect to database: {}", e);
            Err(format!("Failed to connect to database: {}", e))
        }
    }
} 