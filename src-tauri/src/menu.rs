use tauri::{
    menu::{Menu, MenuItem, Submenu},
    Manager, Runtime,
};

pub fn create_app_menu<R: Runtime>(app: &impl Manager<R>) -> Menu<R> {
    let app_menu = Submenu::with_items(
        app,
        "DeckyWiki",
        true,
        &[
            &MenuItem::new(app, "About DeckyWiki", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "-", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "Services", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "-", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "Hide", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "Hide Others", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "Show All", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "-", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "Quit", true, None::<&str>).unwrap(),
        ],
    ).unwrap();

    let file_menu = Submenu::with_items(
        app,
        "File",
        true,
        &[
            &MenuItem::new(app, "New Page", true, Some("CmdOrCtrl+N")).unwrap(),
            &MenuItem::new(app, "-", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "View All Pages", true, Some("CmdOrCtrl+L")).unwrap(),
            &MenuItem::new(app, "Search", true, Some("CmdOrCtrl+/")).unwrap(),
        ],
    ).unwrap();

    let edit_menu = Submenu::with_items(
        app,
        "Edit",
        true,
        &[
            &MenuItem::new(app, "Undo", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "Redo", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "-", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "Cut", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "Copy", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "Paste", true, None::<&str>).unwrap(),
            &MenuItem::new(app, "Select All", true, None::<&str>).unwrap(),
        ],
    ).unwrap();

    Menu::with_items(
        app,
        &[
            &app_menu,
            &file_menu,
            &edit_menu,
        ],
    ).unwrap()
}
