import { useEffect } from "react";
import { listenToMenuItem } from "../utils/listenToMenuItem";
import { openRecentPagesWindow, openSettingsWindow } from "../services/window";
import { useDisableEditorMenus } from "./state";

export function useSettingsMenu() {
  // Disable editor menus when settings window is focused
  useDisableEditorMenus();

  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    // Common menu items
    const recentPagesCleanup = listenToMenuItem(
      "menu_recent_pages",
      async () => {
        await openRecentPagesWindow();
      }
    );
    cleanupFunctions.push(recentPagesCleanup);

    const settingsCleanup = listenToMenuItem("menu_settings", async () => {
      await openSettingsWindow();
    });
    cleanupFunctions.push(settingsCleanup);

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);
}
