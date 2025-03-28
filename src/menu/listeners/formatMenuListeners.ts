import { LexicalEditor } from "lexical";
import { $isLinkNode, LinkNode } from "@lexical/link";
import {
  editorStateStore,
  LinkEditorState,
  linkEditorStateAtom,
  toolbarStateAtom,
  editorAtom,
} from "@/components/editor/state/editorStore";
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
} from "@/components/editor/editorActions";
import { listenToMenuItem } from "@/utils/listenToMenuItem";
import { $getSelection, $isRangeSelection } from "lexical";

/**
 * Function to register Format menu event listeners
 * and return a cleanup function
 * @returns A function to remove the listeners
 */
export const registerFormatMenuListeners = (): (() => void) => {
  const cleanupFunctions: Array<() => void> = [];

  // Font formatting
  const boldCleanup = listenToMenuItem("format_bold", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    toggleBold(editor);
  });
  cleanupFunctions.push(boldCleanup);

  const italicCleanup = listenToMenuItem("format_italic", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    toggleItalic(editor);
  });
  cleanupFunctions.push(italicCleanup);

  const underlineCleanup = listenToMenuItem("format_underline", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    toggleUnderline(editor);
  });
  cleanupFunctions.push(underlineCleanup);

  const strikethroughCleanup = listenToMenuItem("format_strikethrough", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    toggleStrikethrough(editor);
  });
  cleanupFunctions.push(strikethroughCleanup);

  const codeCleanup = listenToMenuItem("format_code", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    toggleCode(editor);
  });
  cleanupFunctions.push(codeCleanup);

  // Text alignment
  const alignLeftCleanup = listenToMenuItem("format_align_left", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    alignLeft(editor);
  });
  cleanupFunctions.push(alignLeftCleanup);

  const alignCenterCleanup = listenToMenuItem("format_align_center", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    alignCenter(editor);
  });
  cleanupFunctions.push(alignCenterCleanup);

  const alignRightCleanup = listenToMenuItem("format_align_right", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    alignRight(editor);
  });
  cleanupFunctions.push(alignRightCleanup);

  const alignJustifyCleanup = listenToMenuItem("format_align_justify", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    alignJustify(editor);
  });
  cleanupFunctions.push(alignJustifyCleanup);

  // Undo/Redo
  const undoCleanup = listenToMenuItem("edit_undo", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    undo(editor);
  });
  cleanupFunctions.push(undoCleanup);

  const redoCleanup = listenToMenuItem("edit_redo", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    redo(editor);
  });
  cleanupFunctions.push(redoCleanup);

  // Lists
  const bulletListCleanup = listenToMenuItem("format_bullet_list", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    editor.getEditorState().read(() => {
      const toolbarState = editorStateStore.get(toolbarStateAtom);
      const isActive = toolbarState.listType === "bullet";
      toggleBulletList(editor, isActive);
    });
  });
  cleanupFunctions.push(bulletListCleanup);

  const numberedListCleanup = listenToMenuItem("format_numbered_list", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    editor.getEditorState().read(() => {
      const toolbarState = editorStateStore.get(toolbarStateAtom);
      const isActive = toolbarState.listType === "number";
      toggleNumberedList(editor, isActive);
    });
  });
  cleanupFunctions.push(numberedListCleanup);

  // Link
  const linkCleanup = listenToMenuItem("format_link", () => {
    const editor = editorStateStore.get(editorAtom);
    if (!editor) return;
    openLinkDialog(editor);
  });
  cleanupFunctions.push(linkCleanup);

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

    const selection = $getSelection();
    if (
      !selection ||
      (selection && $isRangeSelection(selection) && selection.isCollapsed())
    ) {
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
