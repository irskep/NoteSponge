import { listenToMenuItem } from "@/bridge/tauri2ts/listenToMenuItem";
import performSyncToDirectory from "@/flows/performSyncToDirectory";
import { useDisableEditorMenuOnFocus } from "@/menu/windowFocusHooks";
import { openOrFocusWindow } from "@/services/windowRouting";
import { mergeRegister } from "@lexical/utils";
import { useEffect } from "react";

export function useSettingsMenu() {
  // Disable editor menus when settings window is focused
  useDisableEditorMenuOnFocus();

  useEffect(() => {
    return mergeRegister(
      listenToMenuItem("menu_recent_pages", () => openOrFocusWindow({ type: "main" })),
      listenToMenuItem("menu_settings", () => openOrFocusWindow({ type: "settings" })),
      listenToMenuItem("menu_sync", () => performSyncToDirectory()),
    );
  }, []);
}
