import { LexicalEditor } from "lexical";
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
} from "lexical";
import { $isLinkNode } from "@lexical/link";
import { $isCodeNode } from "@lexical/code";
import { $isListNode } from "@lexical/list";
import { mergeRegister } from "@lexical/utils";
import { SetStateAction } from "jotai";
import { ToolbarState } from "../../../state/atoms";

/**
 * Updates the toolbar state based on the current editor selection
 */
export function updateToolbarState(
  editor: LexicalEditor,
  setToolbarState: (update: SetStateAction<ToolbarState>) => void
): void {
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update toolbar state with all format information
      setToolbarState((prevState) => ({
        ...prevState,
        isBold: selection.hasFormat("bold"),
        isItalic: selection.hasFormat("italic"),
        isUnderline: selection.hasFormat("underline"),
        isStrikethrough: selection.hasFormat("strikethrough"),
        isLink: (() => {
          const nodes = selection.getNodes();
          const linkNode = nodes.find((node) => {
            const parent = node.getParent();
            return $isLinkNode(parent) || $isLinkNode(node);
          });
          return $isLinkNode(linkNode) || $isLinkNode(linkNode?.getParent());
        })(),
        isCode: (() => {
          const node = selection.getNodes()[0];
          const parent = node.getParent();
          return $isCodeNode(parent) || $isCodeNode(node);
        })(),
        listType: (() => {
          const node = selection.getNodes()[0];
          const parent = node.getParent();
          const listParent = $isListNode(parent) ? parent : null;
          return listParent?.getListType() || null;
        })(),
      }));
    }
  });
}

/**
 * Registers event listeners to update toolbar state when editor state changes
 */
export function registerToolbarStateListeners(
  editor: LexicalEditor | null,
  setToolbarState: (update: SetStateAction<ToolbarState>) => void
): () => void {
  if (!editor) return () => {};
  return mergeRegister(
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbarState(editor, setToolbarState);
      });
    }),

    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbarState(editor, setToolbarState);
        return false;
      },
      1 // LowPriority
    ),

    editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload: boolean) => {
        setToolbarState((prevState) => ({
          ...prevState,
          canUndo: payload,
        }));
        return false;
      },
      1 // LowPriority
    ),

    editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload: boolean) => {
        setToolbarState((prevState) => ({
          ...prevState,
          canRedo: payload,
        }));
        return false;
      },
      1 // LowPriority
    )
  );
}

/**
 * Updates the stored selection in toolbar state
 */
export function updateStoredSelection(
  editor: LexicalEditor,
  setToolbarState: (update: SetStateAction<ToolbarState>) => void
): void {
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    setToolbarState((prevState) => ({
      ...prevState,
      storedSelection: selection,
    }));
  });
}
