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
    let app_submenu = SubmenuBuilder::new(app, "DeckyWiki")
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

    let window_submenu = SubmenuBuilder::new(app, "Window")
        .minimize()
        .build()
        .expect("failed to create window submenu");

    // Build the complete menu
    MenuBuilder::new(app)
        .items(&[&app_submenu, &file_submenu, &edit_submenu, &window_submenu])
        .build()
        .expect("failed to create menu")
}
