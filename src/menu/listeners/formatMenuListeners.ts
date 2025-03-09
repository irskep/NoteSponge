import { LexicalEditor } from "lexical";
import { $isLinkNode, LinkNode } from "@lexical/link";
import {
  LinkEditorState,
  linkEditorStateAtom,
  toolbarStateAtom,
} from "../../state/atoms";
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
} from "../../components/editor/editorActions";
import { editorStateStore } from "../../components/editor/state/editorStore";
import { listenToMenuItem } from "../../utils/menuEvents";

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

  const cleanupFunctions: Array<() => void> = [];

  // Font formatting
  listenToMenuItem("format_bold", () => {
    toggleBold(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  listenToMenuItem("format_italic", () => {
    toggleItalic(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  listenToMenuItem("format_underline", () => {
    toggleUnderline(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  listenToMenuItem("format_strikethrough", () => {
    toggleStrikethrough(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  listenToMenuItem("format_code", () => {
    toggleCode(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  // Text alignment
  listenToMenuItem("format_align_left", () => {
    alignLeft(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  listenToMenuItem("format_align_center", () => {
    alignCenter(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  listenToMenuItem("format_align_right", () => {
    alignRight(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  listenToMenuItem("format_align_justify", () => {
    alignJustify(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  // Undo/Redo
  listenToMenuItem("edit_undo", () => {
    undo(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  listenToMenuItem("edit_redo", () => {
    redo(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  // Lists
  listenToMenuItem("format_bullet_list", () => {
    editor.getEditorState().read(() => {
      const toolbarState = editorStateStore.get(toolbarStateAtom);
      const isActive = toolbarState.listType === "bullet";
      toggleBulletList(editor, isActive);
    });
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  listenToMenuItem("format_numbered_list", () => {
    editor.getEditorState().read(() => {
      const toolbarState = editorStateStore.get(toolbarStateAtom);
      const isActive = toolbarState.listType === "number";
      toggleNumberedList(editor, isActive);
    });
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  // Link
  listenToMenuItem("format_link", () => {
    openLinkDialog(editor);
  }).then((unlisten) => cleanupFunctions.push(unlisten));

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
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
