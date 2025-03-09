import { useEffect } from "react";
import { LexicalEditor } from "lexical";
import { useAtom } from "jotai";
import {
  modalStateAtom,
  tagStateAtom,
  tagInputValueAtom,
  isTagPopoverOpenAtom,
} from "../state/atoms";
import { listenToMenuItem } from "../utils/menuEvents";
import { openRecentPagesWindow, openSettingsWindow } from "../services/window";
import { createNewPage } from "../services/page";
import { focusTagInput } from "../components/tags/TagBar";
import { registerFormatMenuListeners } from "./listeners/formatMenuListeners";
import { useEditorMenuState } from "./state";

export function useEditorMenu(editor: LexicalEditor | null) {
  const [, setModalState] = useAtom(modalStateAtom);
  const [, setTagState] = useAtom(tagStateAtom);
  const [, setInputValue] = useAtom(tagInputValueAtom);
  const [, setIsOpen] = useAtom(isTagPopoverOpenAtom);

  // Update menu state based on editor state
  useEditorMenuState();

  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    // Common menu items
    listenToMenuItem("menu_recent_pages", async () => {
      await openRecentPagesWindow();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_settings", async () => {
      await openSettingsWindow();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    // Editor-specific menu items
    listenToMenuItem("menu_new_page", async () => {
      await createNewPage();
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_view_pages", () => {
      setModalState((prev) => ({ ...prev, isPageListOpen: true }));
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_search", () => {
      setModalState((prev) => ({ ...prev, isSearchOpen: true }));
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    listenToMenuItem("menu_focus_tags", () => {
      setTagState((prev) => ({ ...prev, focusedTagIndex: null }));
      setInputValue("");
      setIsOpen(true);
      setTimeout(() => {
        focusTagInput();
      }, 0);
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    // Format menu listeners
    const cleanupFormatListeners = registerFormatMenuListeners(editor);

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
      cleanupFormatListeners();
    };
  }, [editor, setModalState, setTagState, setInputValue, setIsOpen]);
}
