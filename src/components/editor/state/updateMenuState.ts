import { invoke } from "@tauri-apps/api/core";
import { ToolbarState } from "../../../state/atoms";

/**
 * Sends the current editor state to the Rust backend to update the native menu
 */
export async function updateMenuState(
  toolbarState: ToolbarState
): Promise<void> {
  try {
    await invoke("update_editor_state", {
      bold: toolbarState.isBold,
      italic: toolbarState.isItalic,
      underline: toolbarState.isUnderline,
      strikethrough: toolbarState.isStrikethrough,
      code: toolbarState.isCode,
      alignLeft: true, // We don't track alignment in toolbar state yet
      alignCenter: false,
      alignRight: false,
      alignJustify: false,
      bulletList: toolbarState.listType === "bullet",
      numberedList: toolbarState.listType === "number",
      canUndo: toolbarState.canUndo,
      canRedo: toolbarState.canRedo,
    });
  } catch (error) {
    console.error("Failed to update native menu state:", error);
  }
}
