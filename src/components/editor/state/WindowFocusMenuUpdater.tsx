import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { toolbarStateAtom } from "../../../state/atoms";
import { updateMenuState } from "./updateMenuState";
import { listenToWindowFocus } from "../../../utils/menuEvents";

/**
 * Component that listens for window focus events and updates the menu state
 * when the window gains focus. This ensures the menu reflects the current
 * editor state even when switching between windows.
 */
export function WindowFocusMenuUpdater() {
  const toolbarState = useAtomValue(toolbarStateAtom);

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

  // This is a utility component that doesn't render anything
  return null;
}
