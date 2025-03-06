use tauri::{
    menu::{AboutMetadata, MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    Runtime,
};

pub fn create_app_menu<R: Runtime>(app: &tauri::App<R>) -> tauri::menu::Menu<R> {
    // Create menu items for File menu
    let new_page = MenuItemBuilder::new("New Page")
        .id("new_page")
        .accelerator("CmdOrCtrl+N")
        .build(app)
        .expect("failed to create new page menu item");
    let view_all_pages = MenuItemBuilder::new("View All Pages")
        .id("view_all_pages")
        .accelerator("CmdOrCtrl+L")
        .build(app)
        .expect("failed to create view all pages menu item");
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
        .separator()
        .item(&view_all_pages)
        .item(&search)
        .separator()
        .close_window()
        .build()
        .expect("failed to create file submenu");

    // Edit submenu with native functionality
    let edit_submenu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()
        .expect("failed to create edit submenu");
        
    // Format menu items for text formatting
    let format_bold = MenuItemBuilder::new("Bold")
        .id("format_bold")
        .accelerator("CmdOrCtrl+B")
        .build(app)
        .expect("failed to create bold menu item");
    let format_italic = MenuItemBuilder::new("Italic")
        .id("format_italic")
        .accelerator("CmdOrCtrl+I")
        .build(app)
        .expect("failed to create italic menu item");
    let format_underline = MenuItemBuilder::new("Underline")
        .id("format_underline")
        .accelerator("CmdOrCtrl+U")
        .build(app)
        .expect("failed to create underline menu item");
    let format_strikethrough = MenuItemBuilder::new("Strikethrough")
        .id("format_strikethrough")
        .accelerator("Shift+CmdOrCtrl+X")
        .build(app)
        .expect("failed to create strikethrough menu item");
    let format_code = MenuItemBuilder::new("Code")
        .id("format_code")
        .accelerator("CmdOrCtrl+E")
        .build(app)
        .expect("failed to create code menu item");
    
    // Format menu items for alignment
    let format_align_left = MenuItemBuilder::new("Align Left")
        .id("format_align_left")
        .accelerator("Shift+CmdOrCtrl+[")
        .build(app)
        .expect("failed to create align left menu item");
    let format_align_center = MenuItemBuilder::new("Center")
        .id("format_align_center")
        .accelerator("Shift+CmdOrCtrl+|")
        .build(app)
        .expect("failed to create align center menu item");
    let format_align_right = MenuItemBuilder::new("Align Right")
        .id("format_align_right")
        .accelerator("Shift+CmdOrCtrl+]")
        .build(app)
        .expect("failed to create align right menu item");
    let format_align_justify = MenuItemBuilder::new("Justify")
        .id("format_align_justify")
        .accelerator("Shift+CmdOrCtrl+J")
        .build(app)
        .expect("failed to create align justify menu item");
    
    // Format menu items for lists
    let format_bullet_list = MenuItemBuilder::new("Bullet List")
        .id("format_bullet_list")
        .accelerator("Shift+CmdOrCtrl+B")
        .build(app)
        .expect("failed to create bullet list menu item");
    let format_numbered_list = MenuItemBuilder::new("Numbered List")
        .id("format_numbered_list")
        .accelerator("Shift+CmdOrCtrl+N")
        .build(app)
        .expect("failed to create numbered list menu item");
    
    // Format menu item for links
    let format_link = MenuItemBuilder::new("Link…")
        .id("format_link")
        .accelerator("CmdOrCtrl+K")
        .build(app)
        .expect("failed to create link menu item");
        
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
        .item(&font_submenu)  // Add the font submenu as an item
        .item(&text_submenu)  // Add the text submenu as an item
        .item(&list_submenu)  // Add the list submenu as an item
        .separator()
        .item(&format_link)
        .build()
        .expect("failed to create format submenu");

    let window_submenu = SubmenuBuilder::new(app, "Window")
        .minimize()
        .build()
        .expect("failed to create window submenu");

    // Build the complete menu
    MenuBuilder::new(app)
        .items(&[&app_submenu, &file_submenu, &edit_submenu, &format_submenu, &window_submenu])
        .build()
        .expect("failed to create menu")
}
