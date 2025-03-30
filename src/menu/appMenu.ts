import { useDisableEditorMenus } from "@/menu/state";
import { createNewPage } from "@/services/page";
import { handleSyncMenu } from "@/services/sync";
import { openRecentPagesWindow, openSettingsWindow } from "@/services/window";
import { openPageSearchModal } from "@/state/actions/openPageSearchModal";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { useEffect } from "react";

export function useAppMenu() {
  useDisableEditorMenus();

  useEffect(() => {
    const menuHandlers = {
      menu_recent_pages: () => openRecentPagesWindow(),
      menu_settings: () => openSettingsWindow(),
      menu_new_page: () => createNewPage(),
      menu_search: () => openPageSearchModal("navigate"),
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
