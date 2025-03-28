import { focusTagInput } from "@/components/tags/TagPanel";
import { registerFormatMenuListeners } from "@/menu/listeners/formatMenuListeners";
import { useEditorMenuState } from "@/menu/state";
import { copyLinkToPage } from "@/services/clipboard";
import { createNewPage } from "@/services/page";
import { handleSyncMenu } from "@/services/sync";
import { openRecentPagesWindow, openSettingsWindow } from "@/services/window";
import { openInsertPageLinkModal } from "@/state/actions/openInsertPageLinkModal";
import { modalStateAtom, tagInputValueAtom } from "@/state/atoms";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { useAtom } from "jotai";
import { useEffect } from "react";

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
      menu_search: () => setModalState((prev) => ({ ...prev, isSearchOpen: true })),
      menu_focus_tags: () => {
        setInputValue("");
        focusTagInput();
      },
      menu_sync: () => handleSyncMenu(),
      copy_link_to_page: () => copyLinkToPage(),
      insert_page_link: () => openInsertPageLinkModal(),
    } as const;

    const cleanups = Object.entries(menuHandlers).map(([menuId, handler]) => listenToMenuItem(menuId, handler));

    // Format menu listeners
    cleanups.push(registerFormatMenuListeners());

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [setModalState, setInputValue]);
}
