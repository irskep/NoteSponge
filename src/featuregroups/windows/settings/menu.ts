import { listenToMenuItem } from "@/bridge/tauri2ts/listenToMenuItem";
import { useDisableEditorMenuOnFocus } from "@/menu/windowFocusHooks";
import { handleSyncMenu } from "@/services/sync";
import { openRecentPagesWindow, openSettingsWindow } from "@/services/window";
import { mergeRegister } from "@lexical/utils";
import { useEffect } from "react";

export function useSettingsMenu() {
  // Disable editor menus when settings window is focused
  useDisableEditorMenuOnFocus();

  useEffect(() => {
    return mergeRegister(
      listenToMenuItem("menu_recent_pages", () => openRecentPagesWindow()),
      listenToMenuItem("menu_settings", () => openSettingsWindow()),
      listenToMenuItem("menu_sync", () => handleSyncMenu()),
    );
  }, []);
}
