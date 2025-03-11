use tauri::Manager;
use tauri_plugin_store::StoreExt;

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

// Command to sync to a directory
#[tauri::command]
pub fn sync_to_directory(app_handle: tauri::AppHandle) -> Result<(), String> {
    // Load the store
    let store = app_handle.get_store("settings.json")
        .ok_or("Failed to get store".to_string())?;

    // Get the sync path value
    let sync_path = store.get("sync_path")
        .ok_or("No sync path")?;

    println!("Syncing to directory: {:?}", sync_path);

    /*
    1. Get all pages from the database as Markdown
    2. Ensure the given directory exists
    3. Write each page to the given directory in the form `{page_id}_{page_title}.md`
    4. Write all images to the given directory in the form `{page_id}_{image_id}.png`
     */
    Ok(())
}