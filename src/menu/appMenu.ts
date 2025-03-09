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
    listenToMenuItem("menu_recent_pages", async () => {
      await openRecentPagesWindow();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_settings", async () => {
      await openSettingsWindow();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    // App-specific menu items
    listenToMenuItem("menu_new_page", async () => {
      await createNewPage();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_view_pages", () => {
      setModalState((prev) => ({ ...prev, isPageListOpen: true }));
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_search", () => {
      setModalState((prev) => ({ ...prev, isSearchOpen: true }));
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [setModalState]);
}
