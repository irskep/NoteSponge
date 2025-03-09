import { useEffect } from "react";
import { disableEditorMenus } from "./disableMenus";
import { listenToWindowFocus } from "../../../utils/menuEvents";

/**
 * Component that disables all format menu items when used in the App window
 * (the window that shows the list of pages, not an editor)
 */
export function AppWindowMenuUpdater() {
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

  // This is a utility component that doesn't render anything
  return null;
}
