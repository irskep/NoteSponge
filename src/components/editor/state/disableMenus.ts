import { invoke } from "@tauri-apps/api/core";

/**
 * Disables all editor formatting menu items in the native menu
 * Used when a window without an editor (like the App window) is focused
 */
export async function disableEditorMenus(): Promise<void> {
  try {
    await invoke("disable_editor_menus");
  } catch (error) {
    console.error("Failed to disable native menu items:", error);
  }
}
