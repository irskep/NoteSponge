import { invoke } from "@tauri-apps/api/core";
import { listenToWindowFocus } from "../utils/listenToWindowFocus";
import { useEffect } from "react";
import { useAtomValue } from "jotai";
import {
  editorStateStore,
  ToolbarState,
  toolbarStateAtom,
} from "../components/editor/state/editorStore";

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

  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    // Update menu when window gains focus
    listenToWindowFocus(() => {
      // When window gains focus, update the menu with the current toolbar state
      updateMenuState(toolbarState);
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    // Also update menu state when the component mounts
    updateMenuState(toolbarState);

    // Clean up listener on unmount
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [toolbarState]);
}

/**
 * Hook to disable editor menus when window gains focus for non-editor windows
 */
export function useDisableEditorMenus() {
  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    // Update menu when window gains focus
    listenToWindowFocus(() => {
      // When App window gains focus, disable all format menu items
      disableEditorMenus();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    // Also disable menu items when the component mounts
    disableEditorMenus();

    // Clean up listener on unmount
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);
}
