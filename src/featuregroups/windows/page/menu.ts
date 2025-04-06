import { focusTagInput } from "@/featuregroups/tags/TagPanel";
import registerFormatMenuListeners from "@/menu/registerFormatMenuListeners";
import { updateMenuState } from "@/menu/state";
import { copyLinkToPage } from "@/services/clipboard";
import { createNewPage } from "@/services/page";
import { handleSyncMenu } from "@/services/sync";
import { openRecentPagesWindow, openSettingsWindow } from "@/services/window";
import { openPageSearchModal } from "@/state/actions/openPageSearchModal";
import { formattingStateAtom } from "@/state/editorState";
import { tagSearchAtoms } from "@/state/pageState";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { listenToWindowFocus } from "@/utils/listenToWindowFocus";
import { mergeRegister } from "@lexical/utils";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";

export function useEditorMenu() {
  const [, setInputValue] = useAtom(tagSearchAtoms.inputValue);

  // Update menu state based on editor state
  useRefreshEditorMenuOnFocus();

  useEffect(() => {
    return mergeRegister(
      listenToMenuItem("menu_recent_pages", () => openRecentPagesWindow()),
      listenToMenuItem("menu_settings", () => openSettingsWindow()),
      listenToMenuItem("menu_new_page", () => createNewPage()),
      listenToMenuItem("menu_search", () => openPageSearchModal("navigate")),
      listenToMenuItem("menu_focus_tags", () => {
        setInputValue("");
        focusTagInput();
      }),
      listenToMenuItem("menu_sync", () => handleSyncMenu()),
      listenToMenuItem("copy_link_to_page", () => copyLinkToPage()),
      listenToMenuItem("insert_page_link", () => openPageSearchModal("insertLink")),
      registerFormatMenuListeners(),
    );
  }, [setInputValue]);
}

export function useRefreshEditorMenuOnFocus() {
  const formattingState = useAtomValue(formattingStateAtom);

  useEffect(() => {
    return listenToWindowFocus(() => {
      updateMenuState(formattingState);
    });
  }, [formattingState]);

  useEffect(() => {
    // Update menu state when the component mounts
    updateMenuState(formattingState);
  }, [formattingState]);
}
