import { focusTagInput } from "@/components/tags/TagPanel";
import { registerFormatMenuListeners } from "@/menu/listeners/formatMenuListeners";
import { useRefreshEditorMenuOnFocus } from "@/menu/state";
import { copyLinkToPage } from "@/services/clipboard";
import { createNewPage } from "@/services/page";
import { handleSyncMenu } from "@/services/sync";
import { openRecentPagesWindow, openSettingsWindow } from "@/services/window";
import { openPageSearchModal } from "@/state/actions/openPageSearchModal";
import { tagSearchAtoms } from "@/state/pageState";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { useAtom } from "jotai";
import { useEffect } from "react";

export function useEditorMenu() {
  const [, setInputValue] = useAtom(tagSearchAtoms.inputValue);

  // Update menu state based on editor state
  useRefreshEditorMenuOnFocus();

  useEffect(() => {
    const menuHandlers = {
      menu_recent_pages: () => openRecentPagesWindow(),
      menu_settings: () => openSettingsWindow(),
      menu_new_page: () => createNewPage(),
      menu_search: () => openPageSearchModal("navigate"),
      menu_focus_tags: () => {
        setInputValue("");
        focusTagInput();
      },
      menu_sync: () => handleSyncMenu(),
      copy_link_to_page: () => copyLinkToPage(),
      insert_page_link: () => openPageSearchModal("insertLink"),
    } as const;

    const cleanups = Object.entries(menuHandlers).map(([menuId, handler]) => listenToMenuItem(menuId, handler));

    // Format menu listeners
    cleanups.push(registerFormatMenuListeners());

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [setInputValue]);
}
