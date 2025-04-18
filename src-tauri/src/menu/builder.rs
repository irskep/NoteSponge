use super::items::MenuItems;
use super::state::EditorState;
use tauri::{
    menu::{AboutMetadata, CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    Runtime,
};

pub fn create_app_menu<R: Runtime>(
    app: &tauri::App<R>,
    editor_state: Option<&EditorState>,
) -> (tauri::menu::Menu<R>, MenuItems<R>) {
    // Use provided editor state or default
    let state = match editor_state {
        Some(state) => *state,
        None => EditorState::default(),
    };
    // Create menu items for File menu
    let new_page = MenuItemBuilder::new("New Page")
        .id("new_page")
        .accelerator("CmdOrCtrl+N")
        .build(app)
        .expect("failed to create new page menu item");
    let search = MenuItemBuilder::new("Search")
        .id("search")
        .accelerator("CmdOrCtrl+/")
        .build(app)
        .expect("failed to create search menu item");
    let settings = MenuItemBuilder::new("Settings…")
        .id("settings")
        .accelerator("CmdOrCtrl+,")
        .build(app)
        .expect("failed to create settings menu item");

    let sync = MenuItemBuilder::new("Sync")
        .id("sync")
        .accelerator("CmdOrCtrl+S")
        .build(app)
        .expect("failed to create sync menu item");

    // App submenu with native functionality
    let app_submenu = SubmenuBuilder::new(app, "NoteSponge")
        .about(Some(AboutMetadata {
            ..Default::default()
        }))
        .separator()
        .item(&settings)
        .separator()
        .services()
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .quit()
        .build()
        .expect("failed to create app submenu");

    // File submenu
    let file_submenu = SubmenuBuilder::new(app, "File")
        .item(&new_page)
        .item(&sync)
        .separator()
        .item(&search)
        .separator()
        .close_window()
        .build()
        .expect("failed to create file submenu");

    // Edit submenu with native functionality
    let edit_submenu = SubmenuBuilder::new(app, "Edit");

    // Create custom undo/redo menu items
    let edit_undo = MenuItemBuilder::with_id("edit_undo", "Undo")
        .accelerator("CmdOrCtrl+Z")
        .enabled(state.can_undo)
        .build(app)
        .expect("failed to create undo menu item");

    let edit_redo = MenuItemBuilder::with_id("edit_redo", "Redo")
        .accelerator("CmdOrCtrl+Shift+Z")
        .enabled(state.can_redo)
        .build(app)
        .expect("failed to create redo menu item");

    // Create focus tags menu item
    let focus_tags = MenuItemBuilder::with_id("focus_tags", "Focus Tags")
        .accelerator("CmdOrCtrl+Shift+T")
        .build(app)
        .expect("failed to create focus tags menu item");

    // Create copy link to page menu item
    let copy_link_to_page = MenuItemBuilder::with_id("copy_link_to_page", "Copy Link to Page")
        .accelerator("CmdOrCtrl+Shift+C")
        .build(app)
        .expect("failed to create copy link to page menu item");

    // Build the edit submenu with our custom items
    let edit_submenu = edit_submenu
        .item(&edit_undo)
        .item(&edit_redo)
        .separator()
        .cut()
        .copy()
        .paste()
        .item(&copy_link_to_page)
        .select_all()
        .separator()
        .item(&focus_tags)
        .build()
        .expect("failed to create edit submenu");

    // Format menu items for text formatting
    let format_bold = CheckMenuItemBuilder::with_id("format_bold", "Bold")
        .accelerator("CmdOrCtrl+B")
        .checked(state.bold_active)
        .build(app)
        .expect("failed to create bold menu item");
    let format_italic = CheckMenuItemBuilder::with_id("format_italic", "Italic")
        .accelerator("CmdOrCtrl+I")
        .checked(state.italic_active)
        .build(app)
        .expect("failed to create italic menu item");
    let format_underline = CheckMenuItemBuilder::with_id("format_underline", "Underline")
        .accelerator("CmdOrCtrl+U")
        .checked(state.underline_active)
        .build(app)
        .expect("failed to create underline menu item");
    let format_strikethrough =
        CheckMenuItemBuilder::with_id("format_strikethrough", "Strikethrough")
            .accelerator("Shift+CmdOrCtrl+X")
            .checked(state.strikethrough_active)
            .build(app)
            .expect("failed to create strikethrough menu item");
    let format_code = CheckMenuItemBuilder::with_id("format_code", "Code")
        .accelerator("CmdOrCtrl+E")
        .checked(state.code_active)
        .build(app)
        .expect("failed to create code menu item");

    // Format menu items for alignment
    let format_align_left = CheckMenuItemBuilder::with_id("format_align_left", "Align Left")
        .accelerator("Shift+CmdOrCtrl+[")
        .checked(state.align_left_active)
        .build(app)
        .expect("failed to create align left menu item");
    let format_align_center = CheckMenuItemBuilder::with_id("format_align_center", "Center")
        .accelerator("Shift+CmdOrCtrl+\\")
        .checked(state.align_center_active)
        .build(app)
        .expect("failed to create align center menu item");
    let format_align_right = CheckMenuItemBuilder::with_id("format_align_right", "Align Right")
        .accelerator("Shift+CmdOrCtrl+]")
        .checked(state.align_right_active)
        .build(app)
        .expect("failed to create align right menu item");
    let format_align_justify = CheckMenuItemBuilder::with_id("format_align_justify", "Justify")
        .accelerator("Shift+CmdOrCtrl+J")
        .checked(state.align_justify_active)
        .build(app)
        .expect("failed to create align justify menu item");

    // Format menu items for lists
    let format_bullet_list = CheckMenuItemBuilder::with_id("format_bullet_list", "Bullet List")
        .accelerator("Shift+CmdOrCtrl+B")
        .checked(state.bullet_list_active)
        .build(app)
        .expect("failed to create bullet list menu item");
    let format_numbered_list =
        CheckMenuItemBuilder::with_id("format_numbered_list", "Numbered List")
            .accelerator("Shift+CmdOrCtrl+N")
            .checked(state.numbered_list_active)
            .build(app)
            .expect("failed to create numbered list menu item");

    // Format menu item for links
    let format_link = MenuItemBuilder::new("Link…")
        .id("format_link")
        .accelerator("CmdOrCtrl+K")
        .build(app)
        .expect("failed to create link menu item");
        
    // Insert page link menu item
    let insert_page_link = MenuItemBuilder::new("Insert Page Link…")
        .id("insert_page_link")
        .accelerator("CmdOrCtrl+Shift+K")
        .build(app)
        .expect("failed to create insert page link menu item");

    // Text submenu for alignment options
    let text_submenu = SubmenuBuilder::new(app, "Text")
        .item(&format_align_left)
        .item(&format_align_center)
        .item(&format_align_right)
        .item(&format_align_justify)
        .build()
        .expect("failed to create text submenu");

    // Font submenu for text formatting options
    let font_submenu = SubmenuBuilder::new(app, "Font")
        .item(&format_bold)
        .item(&format_italic)
        .item(&format_underline)
        .item(&format_strikethrough)
        .separator()
        .item(&format_code)
        .build()
        .expect("failed to create font submenu");

    // List submenu for list options
    let list_submenu = SubmenuBuilder::new(app, "List")
        .item(&format_bullet_list)
        .item(&format_numbered_list)
        .build()
        .expect("failed to create list submenu");

    // Format submenu with all formatting options
    let format_submenu = SubmenuBuilder::new(app, "Format")
        .item(&font_submenu) // Add the font submenu as an item
        .item(&text_submenu) // Add the text submenu as an item
        .item(&list_submenu) // Add the list submenu as an item
        .separator()
        .item(&format_link)
        .item(&insert_page_link)
        .build()
        .expect("failed to create format submenu");

    // Create Recent Pages menu item
    let recent_pages = MenuItemBuilder::with_id("recent_pages", "Recent Pages")
        .accelerator("CmdOrCtrl+0")
        .build(app)
        .expect("failed to create recent pages menu item");

    let window_submenu = SubmenuBuilder::new(app, "Window")
        .item(&recent_pages)
        .separator()
        .minimize()
        .build()
        .expect("failed to create window submenu");

    // Create MenuItems struct to hold references
    let menu_items = MenuItems {
        format_bold: format_bold.clone(),
        format_italic: format_italic.clone(),
        format_underline: format_underline.clone(),
        format_strikethrough: format_strikethrough.clone(),
        format_code: format_code.clone(),
        format_align_left: format_align_left.clone(),
        format_align_center: format_align_center.clone(),
        format_align_right: format_align_right.clone(),
        format_align_justify: format_align_justify.clone(),
        format_bullet_list: format_bullet_list.clone(),
        format_numbered_list: format_numbered_list.clone(),
        format_link: format_link.clone(),
        edit_undo: edit_undo.clone(),
        edit_redo: edit_redo.clone(),
        // sync: sync.clone(),
        // recent_pages: recent_pages.clone(),
        // focus_tags: focus_tags.clone(),
    };

    // Build the complete menu
    let menu = MenuBuilder::new(app)
        .items(&[
            &app_submenu,
            &file_submenu,
            &edit_submenu,
            &format_submenu,
            &window_submenu,
        ])
        .build()
        .expect("failed to create menu");

    (menu, menu_items)
}
