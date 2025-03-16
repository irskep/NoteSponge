use tauri::Manager;
use tauri_plugin_sql::{DbInstances, DbPool};
use tauri_plugin_store::StoreExt;
use std::fs;
use std::path::Path;
use std::io::Write;
use base64::prelude::*;
use sqlx::Row;
use crate::db_wrapper::DbPoolExt;

// Command to update editor state
#[tauri::command]
pub fn update_editor_state(
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
    has_selection: bool,
) -> Result<(), String> {
    // Construct the EditorState object
    let editor_state = crate::menu::EditorState {
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
    println!("Updating menu with editor state: bold={}, italic={}, underline={}, strikethrough={}, code={}, align_left={}, align_center={}, align_right={}, align_justify={}, bullet_list={}, numbered_list={}, can_undo={}, can_redo={}, has_selection={}",
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
        editor_state.can_redo,
        has_selection
    );

    // Get menu items from state
    let menu_items = app_handle.state::<crate::menu::MenuItems<tauri::Wry>>();

    menu_items
        .format_bold
        .set_enabled(true)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_italic
        .set_enabled(true)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_underline
        .set_enabled(true)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_strikethrough
        .set_enabled(true)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_code
        .set_enabled(true)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_left
        .set_enabled(true)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_center
        .set_enabled(true)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_right
        .set_enabled(true)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_justify
        .set_enabled(true)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_bullet_list
        .set_enabled(true)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_numbered_list
        .set_enabled(true)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_link
        .set_enabled(has_selection)
        .map_err(|e| e.to_string())?;

    // Update menu items directly
    menu_items
        .format_bold
        .set_checked(bold)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_italic
        .set_checked(italic)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_underline
        .set_checked(underline)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_strikethrough
        .set_checked(strikethrough)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_code
        .set_checked(code)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_left
        .set_checked(align_left)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_center
        .set_checked(align_center)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_right
        .set_checked(align_right)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_justify
        .set_checked(align_justify)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_bullet_list
        .set_checked(bullet_list)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_numbered_list
        .set_checked(numbered_list)
        .map_err(|e| e.to_string())?;

    // Update undo/redo menu items
    menu_items
        .edit_undo
        .set_enabled(can_undo)
        .map_err(|e| e.to_string())?;
    menu_items
        .edit_redo
        .set_enabled(can_redo)
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Command to disable editor menus
#[tauri::command]
pub fn disable_editor_menus(app_handle: tauri::AppHandle) -> Result<(), String> {
    // Get menu items from state
    let menu_items = app_handle.state::<crate::menu::MenuItems<tauri::Wry>>();

    // Disable all format menu items
    menu_items
        .format_bold
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_italic
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_underline
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_strikethrough
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_code
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_left
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_center
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_right
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_align_justify
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_bullet_list
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_numbered_list
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .format_link
        .set_enabled(false)
        .map_err(|e| e.to_string())?;

    // Disable undo/redo menu items
    menu_items
        .edit_undo
        .set_enabled(false)
        .map_err(|e| e.to_string())?;
    menu_items
        .edit_redo
        .set_enabled(false)
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Function to sanitize filenames by removing invalid characters
fn sanitize_filename(filename: &str) -> String {
    let invalid_chars = r#"/\:"#;
    let mut result = filename.to_string();
    for c in invalid_chars.chars() {
        result = result.replace(c, "_");
    }
    result
}

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
    
    println!("Available DB connections: {:?}", db_lock.keys().collect::<Vec<_>>());
    
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
        Ok(rows) => println!("Test query successful, returned {} rows: {:?}", rows.len(), rows),
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
        },
        Err(e) => {
            println!("Direct query failed: {}", e);
            return Err(format!("Direct query failed: {}", e));
        }
    }

    println!("About to fetch pages");

    // 1. Get all non-archived pages from the database
    let pages = match db.select_query(
        "SELECT id, title, markdown_text FROM pages WHERE archived_at IS NULL",
        vec![]
    ).await {
        Ok(p) => {
            println!("Successfully fetched pages");
            p
        },
        Err(e) => {
            println!("Failed to fetch pages: {}", e);
            return Err(format!("Failed to fetch pages: {}", e));
        }
    };

    println!("Found {} pages to export", pages.len());

    // 2. Write each page to the given directory
    for page in pages {
        println!("Processing page: {:?}", page);
        
        let page_id = page.get("id").and_then(|v| v.as_i64()).ok_or_else(|| format!("Invalid page ID in: {:?}", page))?;
        let title = page.get("title").and_then(|v| v.as_str()).ok_or_else(|| format!("Invalid title in page {}: {:?}", page_id, page))?;
        let markdown = page.get("markdown_text").and_then(|v| v.as_str()).ok_or_else(|| format!("Invalid markdown in page {}: {:?}", page_id, page))?;
        
        println!("Page {}: title='{}', markdown length={}", page_id, title, markdown.len());
        
        let sanitized_title = sanitize_filename(title);
        let filename = format!("{}_{}.md", page_id, sanitized_title);
        let file_path = sync_dir.join(filename);
        
        fs::write(&file_path, markdown)
            .map_err(|e| format!("Failed to write page {}: {}", page_id, e))?;
        
        println!("Created markdown file: {}", file_path.display());
    }

    // 3. Get all images from the database
    let images = db.select_query(
        "SELECT ia.id, ia.page_id, ia.data, ia.mime_type 
         FROM image_attachments ia 
         JOIN pages p ON ia.page_id = p.id 
         WHERE p.archived_at IS NULL",
        vec![]
    )
    .await
    .map_err(|e| format!("Failed to fetch images: {}", e))?;

    // 4. Write each image to the given directory
    for image in images {
        let image_id = image.get("id").and_then(|v| v.as_i64()).ok_or("Invalid image ID")?;
        let page_id = image.get("page_id").and_then(|v| v.as_i64()).ok_or("Invalid page ID")?;
        let image_data_base64 = image.get("data").and_then(|v| v.as_str()).ok_or("Invalid image data")?;
        let mime_type = image.get("mime_type").and_then(|v| v.as_str()).ok_or("Invalid mime type")?;
        
        // Decode the base64 string to binary data
        let image_data = BASE64_STANDARD.decode(image_data_base64)
            .map_err(|e| format!("Failed to decode base64 for image {}_{}: {}", page_id, image_id, e))?;
        
        // Determine file extension based on mime_type
        let extension = match mime_type {
            "image/png" => "png",
            "image/jpeg" => "jpg",
            "image/jpg" => "jpg",
            "image/gif" => "gif",
            "image/webp" => "webp",
            "image/svg+xml" => "svg",
            _ => "bin", // Default extension for unknown types
        };
        
        let filename = format!("{}_{}.{}", page_id, image_id, extension);
        let file_path = sync_dir.join(filename);
        
        let mut file = fs::File::create(&file_path)
            .map_err(|e| format!("Failed to create image file {}_{}: {}", page_id, image_id, e))?;
        
        file.write_all(&image_data)
            .map_err(|e| format!("Failed to write image data {}_{}: {}", page_id, image_id, e))?;
            
        println!("Created image file: {}", file_path.display());
    }

    println!("Sync completed successfully to: {}", sync_path);
    Ok(())
}