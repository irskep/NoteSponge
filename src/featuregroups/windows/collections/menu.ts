import { listenToMenuItem } from "@/bridge/tauri2ts/listenToMenuItem";
import { useDisableEditorMenuOnFocus } from "@/menu/windowFocusHooks";
import { createNewPage } from "@/services/page";
import { handleSyncMenu } from "@/services/sync";
import { openRecentPagesWindow, openSettingsWindow } from "@/services/window";
import { openPageSearchModal } from "@/state/actions/openPageSearchModal";
import { mergeRegister } from "@lexical/utils";
import { useEffect } from "react";

export function useAppMenu() {
  useDisableEditorMenuOnFocus();

  useEffect(() => {
    return mergeRegister(
      listenToMenuItem("menu_recent_pages", () => openRecentPagesWindow()),
      listenToMenuItem("menu_settings", () => openSettingsWindow()),
      listenToMenuItem("menu_new_page", () => createNewPage()),
      listenToMenuItem("menu_search", () => openPageSearchModal("navigate")),
      listenToMenuItem("menu_sync", () => handleSyncMenu()),
    );
  }, []);
}
