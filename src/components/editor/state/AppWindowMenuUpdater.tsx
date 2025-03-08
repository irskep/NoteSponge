import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { disableEditorMenus } from "./disableMenus";

/**
 * Component that disables all format menu items when used in the App window
 * (the window that shows the list of pages, not an editor)
 */
export function AppWindowMenuUpdater() {
  useEffect(() => {
    const currentWindow = getCurrentWindow();

    // Update menu when window gains focus
    const unlisten = currentWindow.listen("tauri://focus", () => {
      // When App window gains focus, disable all format menu items
      disableEditorMenus();
    });

    // Also disable menu items when the component mounts
    disableEditorMenus();

    // Clean up listener on unmount
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // This is a utility component that doesn't render anything
  return null;
}
