import { useEffect } from "react";
import { listenToMenuItem } from "../utils/listenToMenuItem";
import { openRecentPagesWindow, openSettingsWindow } from "../services/window";
import { useDisableEditorMenus } from "./state";

export function useSettingsMenu() {
  // Disable editor menus when settings window is focused
  useDisableEditorMenus();

  useEffect(() => {
    const menuHandlers = {
      menu_recent_pages: () => openRecentPagesWindow(),
      menu_settings: () => openSettingsWindow(),
    } as const;

    const cleanups = Object.entries(menuHandlers).map(([menuId, handler]) =>
      listenToMenuItem(menuId, handler)
    );

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
}
