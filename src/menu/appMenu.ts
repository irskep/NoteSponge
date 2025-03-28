import { useDisableEditorMenus } from "@/menu/state";
import { createNewPage } from "@/services/page";
import { handleSyncMenu } from "@/services/sync";
import { openRecentPagesWindow, openSettingsWindow } from "@/services/window";
import { modalStateAtom } from "@/state/atoms";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { useAtom } from "jotai";
import { useEffect } from "react";

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
