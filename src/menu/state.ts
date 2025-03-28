import { type ToolbarState, editorStateStore, toolbarStateAtom } from "@/components/editor/state/editorStore";
import { useWindowFocus } from "@/utils/listenToWindowFocus";
import { invoke } from "@tauri-apps/api/core";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

/**
 * Sends the current editor state to the Rust backend to update the native menu
 */
export async function updateMenuState(toolbarState: ToolbarState): Promise<void> {
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
      hasSelection: toolbarState.hasSelection,
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

/**
 * Hook to update menu state when window gains focus for editor windows
 */
export function useEditorMenuState() {
  const toolbarState = useAtomValue(toolbarStateAtom, {
    store: editorStateStore,
  });

  useWindowFocus(() => {
    updateMenuState(toolbarState);
  }, [toolbarState]);

  useEffect(() => {
    // Update menu state when the component mounts
    updateMenuState(toolbarState);
  }, [toolbarState]);
}

/**
 * Hook to disable editor menus when window gains focus for non-editor windows
 */
export function useDisableEditorMenus() {
  useWindowFocus(() => {
    disableEditorMenus();
  });
  useEffect(() => {
    // Also disable menu items when the component mounts
    disableEditorMenus();
  }, []);
}
