import { useEffect } from "react";
import { useAtom } from "jotai";
import {
  modalStateAtom,
  tagStateAtom,
  tagInputValueAtom,
  isTagPopoverOpenAtom,
} from "../state/atoms";
import { listenToMenuItem } from "../utils/listenToMenuItem";
import { openRecentPagesWindow, openSettingsWindow } from "../services/window";
import { createNewPage } from "../services/page";
import { focusTagInput } from "../components/tags/TagBar";
import { registerFormatMenuListeners } from "./listeners/formatMenuListeners";
import { useEditorMenuState } from "./state";

export function useEditorMenu() {
  const [, setModalState] = useAtom(modalStateAtom);
  const [, setTagState] = useAtom(tagStateAtom);
  const [, setInputValue] = useAtom(tagInputValueAtom);
  const [, setIsOpen] = useAtom(isTagPopoverOpenAtom);

  // Update menu state based on editor state
  useEditorMenuState();

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

    // Editor-specific menu items
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

    const focusTagsCleanup = listenToMenuItem("menu_focus_tags", () => {
      setTagState((prev) => ({ ...prev, focusedTagIndex: null }));
      setInputValue("");
      setIsOpen(true);
      setTimeout(() => {
        focusTagInput();
      }, 0);
    });
    cleanupFunctions.push(focusTagsCleanup);

    // Format menu listeners
    const cleanupFormatListeners = registerFormatMenuListeners();

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
      cleanupFormatListeners();
    };
  }, [setModalState, setTagState, setInputValue, setIsOpen]);
}
