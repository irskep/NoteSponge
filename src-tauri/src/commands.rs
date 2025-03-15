use tauri::Manager;
use tauri_plugin_store::StoreExt;
use std::fs;
use std::path::Path;
use std::io::Write;
use base64::prelude::*;

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
    // Load the store
    let store = app_handle.get_store("settings.json")
        .ok_or("Failed to get store".to_string())?;

    // Get the sync path value
    let sync_path = store.get("sync_path")
        .ok_or("No sync path")?;

    println!("Syncing to directory: {:?}", sync_path);

    // Extract sync_path as a string
    let sync_path = sync_path.as_str().ok_or("Sync path is not a string")?;
    let sync_dir = Path::new(sync_path);

    // Ensure the directory exists
    fs::create_dir_all(sync_dir).map_err(|e| format!("Failed to create directory: {}", e))?;

    // Get the database connection from app state
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    let db_path = app_data_dir.join("notesponge.db");
    let db_url = format!("sqlite:{}", db_path.display());
    
    // Since we can't access the managed pool directly, create a new connection
    let pool = sqlx::sqlite::SqlitePool::connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    // Set required PRAGMAs for this connection
    sqlx::query("PRAGMA foreign_keys = true;")
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to set PRAGMA: {}", e))?;

    // 1. Get all non-archived pages from the database
    let pages = sqlx::query!(
        "SELECT id, title, markdown_text FROM pages WHERE archived_at IS NULL"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch pages: {}", e))?;

    // 2. Write each page to the given directory
    for page in pages {
        let page_id = page.id;
        let title = page.title;
        let markdown = page.markdown_text;
        
        let sanitized_title = sanitize_filename(&title);
        let filename = format!("{}_{}.md", page_id, sanitized_title);
        let file_path = sync_dir.join(filename);
        
        fs::write(file_path, markdown)
            .map_err(|e| format!("Failed to write page {}: {}", page_id, e))?;
    }

    // 3. Get all images from the database
    let images = sqlx::query!(
        "SELECT ia.id, ia.page_id, ia.data, ia.mime_type 
         FROM image_attachments ia 
         JOIN pages p ON ia.page_id = p.id 
         WHERE p.archived_at IS NULL"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch images: {}", e))?;

    // 4. Write each image to the given directory
    for image in images {
        let image_id = image.id;
        let page_id = image.page_id;
        let image_data_base64 = image.data;
        let mime_type = image.mime_type;
        
        // Decode the base64 string to binary data
        let image_data = BASE64_STANDARD.decode(image_data_base64)
            .map_err(|e| format!("Failed to decode base64 for image {}_{}: {}", page_id, image_id, e))?;
        
        // Determine file extension based on mime_type
        let extension = match mime_type.as_str() {
            "image/png" => "png",
            "image/jpeg" => "jpg",
            "image/jpg" => "jpg",
            "image/gif" => "gif",
            "image/webp" => "webp",
            _ => "bin", // Default extension for unknown types
        };
        
        let filename = format!("{}_{}.{}", page_id, image_id, extension);
        let file_path = sync_dir.join(filename);
        
        let mut file = fs::File::create(file_path)
            .map_err(|e| format!("Failed to create image file {}_{}: {}", page_id, image_id, e))?;
        
        file.write_all(&image_data)
            .map_err(|e| format!("Failed to write image data {}_{}: {}", page_id, image_id, e))?;
    }

    // Close the pool
    pool.close().await;

    println!("Sync completed successfully to: {}", sync_path);
    Ok(())
}