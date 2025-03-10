use tauri::{Manager, Emitter};

/// Handles menu events and emits appropriate events to the frontend
pub fn handle_menu_event(app: &tauri::AppHandle, event: tauri::menu::MenuEvent) {
    if let Some(window) = app.get_webview_window("main") {
        let id = event.id().0.as_str();

        println!("Menu event: {}", id);
        
        // Handle standard menu items
        let event_payload = match id {
            "new_page" => Some("menu_new_page"),
            "view_all_pages" => Some("menu_view_pages"),
            "search" => Some("menu_search"),
            "settings" => Some("menu_settings"),
            "focus_tags" => Some("menu_focus_tags"),
            "recent_pages" => Some("menu_recent_pages"),
            // Format menu items - pass through the ID directly
            id if id.starts_with("format_") => Some(id),
            // Edit menu items
            "edit_undo" => Some("edit_undo"),
            "edit_redo" => Some("edit_redo"),
            _ => None,
        };
        
        // Emit the event if we have a payload
        if let Some(payload) = event_payload {
            let _ = window.emit("tauri://menu", payload);
        }
    }
} 