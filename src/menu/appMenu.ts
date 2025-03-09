import { useEffect } from "react";
import { useAtom } from "jotai";
import { modalStateAtom } from "../state/atoms";
import { listenToMenuItem } from "../utils/menuEvents";
import { openRecentPagesWindow, openSettingsWindow } from "../services/window";
import { createNewPage } from "../services/page";
import { useDisableEditorMenus } from "./state";

export function useAppMenu() {
  const [, setModalState] = useAtom(modalStateAtom);

  // Disable editor menus when app window is focused
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

    // App-specific menu items
    const newPageCleanup = listenToMenuItem("menu_new_page", async () => {
      await createNewPage();
    });
    cleanupFunctions.push(newPageCleanup);

    const viewPagesCleanup = listenToMenuItem("menu_view_pages", () => {
      setModalState((prev) => ({ ...prev, isPageListOpen: true }));
    });
    cleanupFunctions.push(viewPagesCleanup);

    const searchCleanup = listenToMenuItem("menu_search", () => {
      setModalState((prev) => ({ ...prev, isSearchOpen: true }));
    });
    cleanupFunctions.push(searchCleanup);

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [setModalState]);
}
