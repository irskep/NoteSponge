import { useEffect } from "react";
import { useAtom } from "jotai";
import { modalStateAtom } from "../state/atoms";
import { listenToMenuItem } from "../utils/listenToMenuItem";
import { openRecentPagesWindow, openSettingsWindow } from "../services/window";
import { createNewPage } from "../services/page";
import { useDisableEditorMenus } from "./state";

export function useAppMenu() {
  const [, setModalState] = useAtom(modalStateAtom);

  // Disable editor menus when app window is focused
  useDisableEditorMenus();

  useEffect(() => {
    const menuHandlers = {
      menu_recent_pages: () => openRecentPagesWindow(),
      menu_settings: () => openSettingsWindow(),
      menu_new_page: () => createNewPage(),
      menu_view_pages: () =>
        setModalState((prev) => ({ ...prev, isPageListOpen: true })),
      menu_search: () =>
        setModalState((prev) => ({ ...prev, isSearchOpen: true })),
    } as const;

    const cleanups = Object.entries(menuHandlers).map(([menuId, handler]) =>
      listenToMenuItem(menuId, handler)
    );

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [setModalState]);
}
