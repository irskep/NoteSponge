use tauri::Manager;

// Command to update editor state
#[tauri::command]
pub fn update_formatting_menu_state(
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