import { listenToMenuItem } from "@/bridge/tauri2ts/listenToMenuItem";
import { useDisableEditorMenuOnFocus } from "@/flowHooks/windowFocusHooks";
import { openPageSearchModal } from "@/flows/openPageSearchModal";
import { createNewPage } from "@/flows/pageCRUD";
import performSyncToDirectory from "@/flows/performSyncToDirectory";
import { openOrFocusWindow } from "@/services/windowRouting";
import { mergeRegister } from "@lexical/utils";
import { useEffect } from "react";

export function useAppMenu() {
  useDisableEditorMenuOnFocus();

  useEffect(() => {
    return mergeRegister(
      listenToMenuItem("menu_recent_pages", () => openOrFocusWindow({ type: "main" })),
      listenToMenuItem("menu_settings", () => openOrFocusWindow({ type: "settings" })),
      listenToMenuItem("menu_new_page", () => createNewPage()),
      listenToMenuItem("menu_search", () => openPageSearchModal("navigate")),
      listenToMenuItem("menu_sync", () => performSyncToDirectory()),
    );
  }, []);
}
