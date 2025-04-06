import { OPEN_LINK_EDITOR_COMMAND } from "@/featuregroups/texteditor/plugins/links/commands";
import {
  TOGGLE_BULLET_LIST_COMMAND,
  TOGGLE_NUMBERED_LIST_COMMAND,
} from "@/featuregroups/texteditor/plugins/lists/commands";
import { dispatchEditorCommand } from "@/state/editorState";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { mergeRegister } from "@lexical/utils";
import { FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from "lexical";

export default function registerFormatMenuListeners(): () => void {
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
