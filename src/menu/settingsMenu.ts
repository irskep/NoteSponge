import { useDisableEditorMenuOnFocus } from "@/menu/state";
import { handleSyncMenu } from "@/services/sync";
import { openRecentPagesWindow, openSettingsWindow } from "@/services/window";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { useEffect } from "react";

export function useSettingsMenu() {
  // Disable editor menus when settings window is focused
  useDisableEditorMenuOnFocus();

  useEffect(() => {
    const menuHandlers = {
      menu_recent_pages: () => openRecentPagesWindow(),
      menu_settings: () => openSettingsWindow(),
      menu_sync: () => handleSyncMenu(),
    } as const;

    const cleanups = Object.entries(menuHandlers).map(([menuId, handler]) => listenToMenuItem(menuId, handler));

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, []);
}
