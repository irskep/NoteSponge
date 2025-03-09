import { useEffect } from "react";
import { listenToMenuItem } from "../utils/menuEvents";
import { openRecentPagesWindow, openSettingsWindow } from "../services/window";
import { useDisableEditorMenus } from "./state";

export function useSettingsMenu() {
  // Disable editor menus when settings window is focused
  useDisableEditorMenus();

  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    // Common menu items
    listenToMenuItem("menu_recent_pages", async () => {
      await openRecentPagesWindow();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_settings", async () => {
      await openSettingsWindow();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);
}
