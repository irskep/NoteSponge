use tauri::{menu::CheckMenuItem, Runtime};

// Struct to hold menu item references for dynamic updates
pub struct MenuItems<R: Runtime> {
    pub format_bold: CheckMenuItem<R>,
    pub format_italic: CheckMenuItem<R>,
    pub format_underline: CheckMenuItem<R>,
    pub format_strikethrough: CheckMenuItem<R>,
    pub format_code: CheckMenuItem<R>,
    pub format_align_left: CheckMenuItem<R>,
    pub format_align_center: CheckMenuItem<R>,
    pub format_align_right: CheckMenuItem<R>,
    pub format_align_justify: CheckMenuItem<R>,
    pub format_bullet_list: CheckMenuItem<R>,
    pub format_numbered_list: CheckMenuItem<R>,
    pub format_link: tauri::menu::MenuItem<R>,
    pub edit_undo: tauri::menu::MenuItem<R>,
    pub edit_redo: tauri::menu::MenuItem<R>,
    // pub sync: tauri::menu::MenuItem<R>,
    // pub recent_pages: tauri::menu::MenuItem<R>,
    // pub focus_tags: tauri::menu::MenuItem<R>,
}
