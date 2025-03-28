import { useEffect } from "react";
import { useAtom } from "jotai";
import { modalStateAtom } from "@/state/atoms";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { openRecentPagesWindow, openSettingsWindow } from "@/services/window";
import { createNewPage } from "@/services/page";
import { useDisableEditorMenus } from "@/menu/state";
import { handleSyncMenu } from "@/services/sync";

export function useAppMenu() {
  const [, setModalState] = useAtom(modalStateAtom);

  // Disable editor menus when app window is focused
  useDisableEditorMenus();

  useEffect(() => {
    const menuHandlers = {
      menu_recent_pages: () => openRecentPagesWindow(),
      menu_settings: () => openSettingsWindow(),
      menu_new_page: () => createNewPage(),
      menu_search: () => setModalState((prev) => ({ ...prev, isSearchOpen: true })),
      menu_sync: () => handleSyncMenu(),
    } as const;

    const cleanups = Object.entries(menuHandlers).map(([menuId, handler]) => listenToMenuItem(menuId, handler));

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [setModalState]);
}
