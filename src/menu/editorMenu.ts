import { useEffect } from "react";
import { useAtom } from "jotai";
import { modalStateAtom, tagInputValueAtom } from "../state/atoms";
import { listenToMenuItem } from "../utils/listenToMenuItem";
import { openRecentPagesWindow, openSettingsWindow } from "../services/window";
import { createNewPage } from "../services/page";
import { focusTagInput } from "../components/tags/TagPanel";
import { registerFormatMenuListeners } from "./listeners/formatMenuListeners";
import { useEditorMenuState } from "./state";
import { handleSyncMenu } from "../services/sync";

export function useEditorMenu() {
  const [, setModalState] = useAtom(modalStateAtom);
  const [, setInputValue] = useAtom(tagInputValueAtom);

  // Update menu state based on editor state
  useEditorMenuState();

  useEffect(() => {
    const menuHandlers = {
      menu_recent_pages: () => openRecentPagesWindow(),
      menu_settings: () => openSettingsWindow(),
      menu_new_page: () => createNewPage(),
      menu_search: () =>
        setModalState((prev) => ({ ...prev, isSearchOpen: true })),
      menu_focus_tags: () => {
        setInputValue("");
        focusTagInput();
      },
      menu_sync: () => handleSyncMenu(),
    } as const;

    const cleanups = Object.entries(menuHandlers).map(([menuId, handler]) =>
      listenToMenuItem(menuId, handler)
    );

    // Format menu listeners
    const formatCleanup = registerFormatMenuListeners();

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      formatCleanup();
    };
  }, [setModalState, setInputValue]);
}
