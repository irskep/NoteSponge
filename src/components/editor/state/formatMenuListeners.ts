import { LexicalEditor } from "lexical";
import { $isLinkNode, LinkNode } from "@lexical/link";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  LinkEditorState,
  linkEditorStateAtom,
  toolbarStateAtom,
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
        openLinkDialog(editor);
        break;
    }
  });

  // Return cleanup function
  return () => {
    unlisten.then((fn) => fn());
  };
};

function openLinkDialog(editor: LexicalEditor) {
  editor.update(() => {
    const setLinkEditorState = (val: LinkEditorState) => {
      editorStateStore.set(linkEditorStateAtom, val);
    };
    const selection = editor.getEditorState()._selection;
    if (!selection || selection.isCollapsed()) {
      setLinkEditorState({ isOpen: true, url: "", text: "" });
      return;
    }

    const nodes = selection.getNodes();
    const isCollapsed = selection.isCollapsed();
    const linkNode = nodes.find((node) => {
      const parent = node.getParent();
      return $isLinkNode(parent) || $isLinkNode(node);
    });

    if ($isLinkNode(linkNode)) {
      setLinkEditorState({
        isOpen: true,
        url: linkNode.getURL(),
        text: linkNode.getTextContent(),
      });
    } else if ($isLinkNode(linkNode?.getParent())) {
      const parentLink = linkNode.getParent() as LinkNode;
      setLinkEditorState({
        isOpen: true,
        url: parentLink.getURL(),
        text: parentLink.getTextContent(),
      });
    } else {
      setLinkEditorState({
        isOpen: true,
        url: "",
        text: isCollapsed ? "" : selection.getTextContent(),
      });
    }
  });
}
