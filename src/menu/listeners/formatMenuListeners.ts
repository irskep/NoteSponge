import { type LinkEditorState, formattingStateAtom, linkEditorStateAtom } from "@/components/editor/state/editorAtoms";
import { editorAtom } from "@/state/editorState";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { $isLinkNode, type LinkNode } from "@lexical/link";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from "@lexical/list";
import { getDefaultStore } from "jotai";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";

/**
 * Function to register Format menu event listeners
 * and return a cleanup function
 * @returns A function to remove the listeners
 */
export const registerFormatMenuListeners = (): (() => void) => {
  const cleanupFunctions: Array<() => void> = [
    // Font formatting
    listenToMenuItem("format_bold", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
    }),

    listenToMenuItem("format_italic", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
    }),

    listenToMenuItem("format_underline", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
    }),

    listenToMenuItem("format_strikethrough", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
    }),

    listenToMenuItem("format_code", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor?.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
    }),

    // Text alignment
    listenToMenuItem("format_align_left", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor?.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
    }),

    listenToMenuItem("format_align_center", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor?.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
    }),

    listenToMenuItem("format_align_right", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor?.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
    }),

    listenToMenuItem("format_align_justify", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor?.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
    }),

    // Undo/Redo
    listenToMenuItem("edit_undo", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor?.dispatchCommand(UNDO_COMMAND, undefined);
    }),

    listenToMenuItem("edit_redo", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor?.dispatchCommand(REDO_COMMAND, undefined);
    }),

    // Lists
    listenToMenuItem("format_bullet_list", () => {
      const editor = getDefaultStore().get(editorAtom);
      if (!editor) return;
      editor.getEditorState().read(() => {
        const formattingState = getDefaultStore().get(formattingStateAtom);
        const isActive = formattingState.listType === "bullet";
        editor.dispatchCommand(isActive ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND, undefined);
      });
    }),

    listenToMenuItem("format_numbered_list", () => {
      const editor = getDefaultStore().get(editorAtom);
      if (!editor) return;
      editor.getEditorState().read(() => {
        const formattingState = getDefaultStore().get(formattingStateAtom);
        const isActive = formattingState.listType === "number";
        editor.dispatchCommand(isActive ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND, undefined);
      });
    }),

    // Link
    listenToMenuItem("format_link", () => {
      const editor = getDefaultStore().get(editorAtom);
      editor && openLinkDialog(editor);
    }),
  ];

  // Return cleanup function
  return () => {
    for (const cleanup of cleanupFunctions) {
      cleanup();
    }
  };
};

function openLinkDialog(editor: LexicalEditor) {
  editor.update(() => {
    const setLinkEditorState = (val: LinkEditorState) => {
      getDefaultStore().set(linkEditorStateAtom, val);
    };

    const selection = $getSelection();
    if (!selection || (selection && $isRangeSelection(selection) && selection.isCollapsed())) {
      setLinkEditorState({ isOpen: true, url: "", text: "" });
      return;
    }

    if (!$isRangeSelection(selection)) {
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
