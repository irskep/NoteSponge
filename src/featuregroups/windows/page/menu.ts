import { listenToMenuItem } from "@/bridge/tauri2ts/listenToMenuItem";
import { listenToWindowFocus } from "@/bridge/tauri2ts/listenToWindowFocus";
import { sendEditorState } from "@/bridge/ts2tauri/menus";
import { focusTagInput } from "@/featuregroups/tags/TagPanel";
import { OPEN_LINK_EDITOR_COMMAND } from "@/featuregroups/texteditor/plugins/links/commands";
import {
  TOGGLE_BULLET_LIST_COMMAND,
  TOGGLE_NUMBERED_LIST_COMMAND,
} from "@/featuregroups/texteditor/plugins/lists/commands";
import { openPageSearchModal } from "@/flows/openPageSearchModal";
import { createNewPage } from "@/flows/pageCRUD";
import copyLinkToPage from "@/flows/performCopyLinkToPage";
import performSyncToDirectory from "@/flows/performSyncToDirectory";
import { openOrFocusWindow } from "@/services/windowRouting";
import { dispatchEditorCommand, formattingStateAtom } from "@/state/editorState";
import { tagSearchAtoms } from "@/state/pageState";
import { mergeRegister } from "@lexical/utils";
import { useAtom, useAtomValue } from "jotai";
import { FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from "lexical";
import { useEffect } from "react";

export function useEditorMenu() {
  const [, setInputValue] = useAtom(tagSearchAtoms.inputValue);

  // Update menu state based on editor state
  useRefreshEditorMenuOnFocus();

  useEffect(() => {
    return mergeRegister(
      listenToMenuItem("menu_recent_pages", () => openOrFocusWindow({ type: "main" })),
      listenToMenuItem("menu_settings", () => openOrFocusWindow({ type: "settings" })),
      listenToMenuItem("menu_new_page", () => createNewPage()),
      listenToMenuItem("menu_search", () => openPageSearchModal("navigate")),
      listenToMenuItem("menu_focus_tags", () => {
        setInputValue("");
        focusTagInput();
      }),
      listenToMenuItem("menu_sync", () => performSyncToDirectory()),
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
      sendEditorState(formattingState);
    });
  }, [formattingState]);

  useEffect(() => {
    // Update menu state when the component mounts
    sendEditorState(formattingState);
  }, [formattingState]);
}

function registerFormatMenuListeners(): () => void {
  return mergeRegister(
    listenToMenuItem("format_bold", () => dispatchEditorCommand(FORMAT_TEXT_COMMAND, "bold")),
    listenToMenuItem("format_italic", () => dispatchEditorCommand(FORMAT_TEXT_COMMAND, "italic")),
    listenToMenuItem("format_underline", () => dispatchEditorCommand(FORMAT_TEXT_COMMAND, "underline")),
    listenToMenuItem("format_strikethrough", () => dispatchEditorCommand(FORMAT_TEXT_COMMAND, "strikethrough")),
    listenToMenuItem("format_code", () => dispatchEditorCommand(FORMAT_TEXT_COMMAND, "code")),

    // Text alignment
    listenToMenuItem("format_align_left", () => dispatchEditorCommand(FORMAT_ELEMENT_COMMAND, "left")),
    listenToMenuItem("format_align_center", () => dispatchEditorCommand(FORMAT_ELEMENT_COMMAND, "center")),
    listenToMenuItem("format_align_right", () => dispatchEditorCommand(FORMAT_ELEMENT_COMMAND, "right")),
    listenToMenuItem("format_align_justify", () => dispatchEditorCommand(FORMAT_ELEMENT_COMMAND, "justify")),

    // Undo/Redo
    listenToMenuItem("edit_undo", () => dispatchEditorCommand(UNDO_COMMAND, undefined)),
    listenToMenuItem("edit_redo", () => dispatchEditorCommand(REDO_COMMAND, undefined)),

    // Lists
    listenToMenuItem("format_bullet_list", () => dispatchEditorCommand(TOGGLE_BULLET_LIST_COMMAND, undefined)),
    listenToMenuItem("format_numbered_list", () => dispatchEditorCommand(TOGGLE_NUMBERED_LIST_COMMAND, undefined)),

    // Link
    listenToMenuItem("format_link", () => dispatchEditorCommand(OPEN_LINK_EDITOR_COMMAND, undefined)),
  );
}
