import invoke from "@/bridge/ts2tauri/typedInvoke";
import type { FormattingState } from "@/state/editorState";

/**
 * Sends the current editor state to the Rust backend to update the native menu
 */
export async function sendEditorState(formattingState: FormattingState): Promise<void> {
  try {
    await invoke("update_formatting_menu_state", {
      bold: formattingState.isBold,
      italic: formattingState.isItalic,
      underline: formattingState.isUnderline,
      strikethrough: formattingState.isStrikethrough,
      code: formattingState.isCode,
      alignLeft: true, // We don't track alignment in toolbar state yet
      alignCenter: false,
      alignRight: false,
      alignJustify: false,
      bulletList: formattingState.listType === "bullet",
      numberedList: formattingState.listType === "number",
      canUndo: formattingState.canUndo,
      canRedo: formattingState.canRedo,
    });
  } catch (error) {
    console.error("Failed to update native menu state:", error);
  }
}

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
