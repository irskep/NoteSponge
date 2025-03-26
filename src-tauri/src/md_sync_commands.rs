use base64::prelude::*;
use sqlx::Row;
use std::fs;
use std::io::Write;
use std::path::Path;
use tauri::Manager;
use tauri_plugin_sql::{DbInstances, DbPool};
use tauri_plugin_store::StoreExt;
use crate::db_wrapper::DbPoolExt;

// Command to sync to a directory
#[tauri::command]
pub async fn sync_to_directory(app_handle: tauri::AppHandle) -> Result<(), String> {
    println!("Starting sync_to_directory");

    // Load the store
    let store = match app_handle.get_store("settings.json") {
        Some(s) => s,
        None => {
            println!("Failed to get store");
            return Err("Failed to get store".to_string());
        }
    };

    // Get the sync path value
    let sync_path = match store.get("sync_path") {
        Some(p) => p,
        None => {
            println!("No sync path found in settings");
            return Err("No sync path".to_string());
        }
    };

    println!("Syncing to directory: {:?}", sync_path);

    // Extract sync_path as a string
    let sync_path = match sync_path.as_str() {
        Some(s) => s,
        None => {
            println!("Sync path is not a string");
            return Err("Sync path is not a string".to_string());
        }
    };
    let sync_dir = Path::new(sync_path);

    // Ensure the directory exists
    if let Err(e) = fs::create_dir_all(sync_dir) {
        println!("Failed to create directory: {}", e);
        return Err(format!("Failed to create directory: {}", e));
    }

    println!("Getting database instance");

    // Get the database instance
    let db_instances = app_handle.state::<DbInstances>();
    let db_lock = db_instances.0.read().await;

    println!(
        "Available DB connections: {:?}",
        db_lock.keys().collect::<Vec<_>>()
    );

    let db = match db_lock.get("sqlite:notesponge.db") {
        Some(db) => db,
        None => {
            println!("Failed to get database instance");
            return Err("Failed to get database instance".to_string());
        }
    };

    println!("Setting PRAGMA");

    // Set required PRAGMAs for this connection
    match db.select_query("PRAGMA foreign_keys = true;", vec![]).await {
        Ok(_) => println!("PRAGMA set successfully"),
        Err(e) => {
            println!("Failed to set PRAGMA: {}", e);
            return Err(format!("Failed to set PRAGMA: {}", e));
        }
    }

    // Try a simple test query first
    println!("Running test query");
    match db.select_query("SELECT 1 as test", vec![]).await {
        Ok(rows) => println!(
            "Test query successful, returned {} rows: {:?}",
            rows.len(),
            rows
        ),
        Err(e) => {
            println!("Test query failed: {}", e);
            return Err(format!("Test query failed: {}", e));
        }
    }

    // Try a direct query without using the trait
    println!("Running direct query");
    let DbPool::Sqlite(pool) = db;

    match sqlx::query("SELECT 1 as direct_test").fetch_all(pool).await {
        Ok(rows) => {
            println!("Direct query successful, returned {} rows", rows.len());
            if !rows.is_empty() {
                let value: i64 = rows[0].try_get("direct_test").unwrap_or(-1);
                println!("Direct test value: {}", value);
            }
        }
        Err(e) => {
            println!("Direct query failed: {}", e);
            return Err(format!("Direct query failed: {}", e));
        }
    }

    println!("About to fetch pages");

    // 1. Get all non-archived pages from the database
    let pages = match db
        .select_query(
            "SELECT id, title, filename, markdown_text FROM pages WHERE archived_at IS NULL",
            vec![],
        )
        .await
    {
        Ok(p) => {
            println!("Successfully fetched pages");
            p
        }
        Err(e) => {
            println!("Failed to fetch pages: {}", e);
            return Err(format!("Failed to fetch pages: {}", e));
        }
    };

    println!("Found {} pages to export", pages.len());

    // 2. Write each page to the given directory
    for page in pages {
        println!("Processing page: {:?}", page);

        let page_id = page
            .get("id")
            .and_then(|v| v.as_i64())
            .ok_or_else(|| format!("Invalid page ID in: {:?}", page))?;
        let title = page
            .get("title")
            .and_then(|v| v.as_str())
            .ok_or_else(|| format!("Invalid title in page {}: {:?}", page_id, page))?;
        let filename = page
            .get("filename")
            .and_then(|v| v.as_str())
            .ok_or_else(|| format!("Invalid filename in page {}: {:?}", page_id, page))?;
        let markdown = page
            .get("markdown_text")
            .and_then(|v| v.as_str())
            .ok_or_else(|| format!("Invalid markdown in page {}: {:?}", page_id, page))?;

        println!(
            "Page {}: title='{}', filename='{}', markdown length={}",
            page_id,
            title,
            filename,
            markdown.len()
        );

        // Use the filename column directly instead of sanitizing the title
        let file_path = sync_dir.join(filename);

        fs::write(&file_path, markdown)
            .map_err(|e| format!("Failed to write page {}: {}", page_id, e))?;

        println!("Created markdown file: {}", file_path.display());
    }

    // 3. Get all images from the database
    let images = db
        .select_query(
            "SELECT ia.id, ia.page_id, ia.data, ia.file_extension
         FROM image_attachments ia 
         JOIN pages p ON ia.page_id = p.id 
         WHERE p.archived_at IS NULL",
            vec![],
        )
        .await
        .map_err(|e| format!("Failed to fetch images: {}", e))?;

    // 4. Write each image to the given directory
    for image in images {
        let image_id = image
            .get("id")
            .and_then(|v| v.as_i64())
            .ok_or("Invalid image ID")?;
        let page_id = image
            .get("page_id")
            .and_then(|v| v.as_i64())
            .ok_or("Invalid page ID")?;
        let image_data_base64 = image
            .get("data")
            .and_then(|v| v.as_str())
            .ok_or("Invalid image data")?;
        let file_extension = image
            .get("file_extension")
            .and_then(|v| v.as_str())
            .ok_or("Invalid file extension")?;

        // Decode the base64 string to binary data
        let image_data = BASE64_STANDARD.decode(image_data_base64).map_err(|e| {
            format!(
                "Failed to decode base64 for image {}_{}: {}",
                page_id, image_id, e
            )
        })?;

        let filename = format!("{}_{}.{}", page_id, image_id, file_extension);
        let file_path = sync_dir.join(filename);

        let mut file = fs::File::create(&file_path).map_err(|e| {
            format!(
                "Failed to create image file {}_{}: {}",
                page_id, image_id, e
            )
        })?;

        file.write_all(&image_data)
            .map_err(|e| format!("Failed to write image data {}_{}: {}", page_id, image_id, e))?;

        println!("Created image file: {}", file_path.display());
    }

    println!("Sync completed successfully to: {}", sync_path);
    Ok(())
} 