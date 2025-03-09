import { LexicalEditor } from "lexical";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  toolbarStateAtom,
  linkEditorStateAtom,
  ToolbarState,
} from "../../../state/atoms";
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleCode,
  alignLeft,
  alignCenter,
  alignRight,
  alignJustify,
  toggleBulletList,
  toggleNumberedList,
  undo,
  redo,
} from "../editorActions";
import { editorStateStore } from "./editorStore";

/**
 * Function to register Format menu event listeners
 * and return a cleanup function
 * @param editor The LexicalEditor instance
 * @returns A function to remove the listeners
 */
export const registerFormatMenuListeners = (
  editor: LexicalEditor | null
): (() => void) => {
  if (!editor) return () => {};

  const currentWindow = getCurrentWindow();
  const unlisten = currentWindow.listen("tauri://menu", async (event) => {
    // Ignore menu events if window not focused
    if (!(await currentWindow.isFocused())) return;

    const { payload } = event;
    switch (payload) {
      // Font formatting
      case "format_bold":
        toggleBold(editor);
        break;
      case "format_italic":
        toggleItalic(editor);
        break;
      case "format_underline":
        toggleUnderline(editor);
        break;
      case "format_strikethrough":
        toggleStrikethrough(editor);
        break;
      case "format_code":
        toggleCode(editor);
        break;

      // Text alignment
      case "format_align_left":
        alignLeft(editor);
        break;
      case "format_align_center":
        alignCenter(editor);
        break;
      case "format_align_right":
        alignRight(editor);
        break;
      case "format_align_justify":
        alignJustify(editor);
        break;

      // Undo/Redo
      case "edit_undo":
        undo(editor);
        break;
      case "edit_redo":
        redo(editor);
        break;

      // Lists
      case "format_bullet_list":
        editor.getEditorState().read(() => {
          const toolbarState = editorStateStore.get(toolbarStateAtom);
          const isActive = toolbarState.listType === "bullet";
          toggleBulletList(editor, isActive);
        });
        break;
      case "format_numbered_list":
        editor.getEditorState().read(() => {
          const toolbarState = editorStateStore.get(toolbarStateAtom);
          const isActive = toolbarState.listType === "number";
          toggleNumberedList(editor, isActive);
        });
        break;

      // Link
      case "format_link":
        // Store the current selection before opening the link dialog
        const editorState = editor.getEditorState();
        editorState.read(() => {
          const selection = editorState._selection;

          // First ensure we have focus on the editor
          editor.focus();

          // Update stored selection in toolbar state
          editorStateStore.set(toolbarStateAtom, (prev: ToolbarState) => ({
            ...prev,
            storedSelection: selection,
          }));

          // Open the link dialog
          if (!selection || selection.isCollapsed()) {
            editorStateStore.set(linkEditorStateAtom, {
              isOpen: true,
              url: "",
              text: "",
            });
          } else {
            const text = selection.getTextContent();
            editorStateStore.set(linkEditorStateAtom, {
              isOpen: true,
              url: "",
              text: text,
            });
          }
        });
        break;
    }
  });

  // Return cleanup function
  return () => {
    unlisten.then((fn) => fn());
  };
};
