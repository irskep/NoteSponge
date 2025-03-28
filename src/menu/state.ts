import { type FormattingState, editorStateStore, formattingStateAtom } from "@/components/editor/state/editorStore";
import { useWindowFocus } from "@/utils/listenToWindowFocus";
import { invoke } from "@tauri-apps/api/core";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

/**
 * Sends the current editor state to the Rust backend to update the native menu
 */
export async function updateMenuState(formattingState: FormattingState): Promise<void> {
  try {
    await invoke("update_editor_state", {
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
      hasSelection: formattingState.hasSelection,
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
  const formattingState = useAtomValue(formattingStateAtom, {
    store: editorStateStore,
  });

  useWindowFocus(() => {
    updateMenuState(formattingState);
  }, [formattingState]);

  useEffect(() => {
    // Update menu state when the component mounts
    updateMenuState(formattingState);
  }, [formattingState]);
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
