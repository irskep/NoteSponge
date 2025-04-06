import { listenToWindowFocus } from "@/bridge/tauri2ts/listenToWindowFocus";
import { disableEditorMenus, sendEditorState } from "@/bridge/ts2tauri/menus";
import { formattingStateAtom } from "@/state/editorState";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

/**
 * Hook to update menu state when window gains focus for editor windows
 */
export function useRefreshEditorMenuOnFocus() {
  const formattingState = useAtomValue(formattingStateAtom);

  useEffect(() => {
    return listenToWindowFocus(() => {
      sendEditorState(formattingState);
    });
  }, [formattingState]);

  useEffect(() => {
    // Update menu state when the component mounts
    sendEditorState(formattingState);
  }, [formattingState]);
}

/**
 * Hook to disable editor menus when window gains focus for non-editor windows
 */
export function useDisableEditorMenuOnFocus() {
  useEffect(() => {
    return listenToWindowFocus(() => {
      disableEditorMenus();
    });
  }, []);
  useEffect(() => {
    // Also disable menu items when the component mounts
    disableEditorMenus();
  }, []);
}
