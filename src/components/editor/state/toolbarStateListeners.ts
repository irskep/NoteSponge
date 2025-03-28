import type { LexicalEditor } from "lexical";
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
} from "lexical";
import { updateMenuState } from "@/menu/state";
import { $isLinkNode } from "@lexical/link";
import { $isCodeNode } from "@lexical/code";
import { $isListNode } from "@lexical/list";
import { mergeRegister } from "@lexical/utils";
import type { SetStateAction } from "jotai";
import type { ToolbarState } from "@/components/editor/state/editorStore";

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
      setToolbarState((prevState) => {
        const newState = {
          ...prevState,
          isBold: selection.hasFormat("bold"),
          isItalic: selection.hasFormat("italic"),
          isUnderline: selection.hasFormat("underline"),
          isStrikethrough: selection.hasFormat("strikethrough"),
          hasSelection: true,
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
            // Get all nodes in the selection
            const nodes = selection.getNodes();

            // Check if any node is in a list
            for (const node of nodes) {
              let parent = node.getParent();

              // Check the node's parent and ancestors for list nodes
              while (parent !== null) {
                if ($isListNode(parent)) {
                  return parent.getListType();
                }
                parent = parent.getParent();
              }
            }

            return null;
          })(),
        };

        // Update the native menu state with the new toolbar state
        updateMenuState(newState);

        return newState;
      });
    } else {
      // No valid selection, update hasSelection to false
      setToolbarState((prevState) => {
        const newState = {
          ...prevState,
          hasSelection: false,
        };

        // Update the native menu state with the new toolbar state
        updateMenuState(newState);

        return newState;
      });
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
        setToolbarState((prevState) => {
          const newState = {
            ...prevState,
            canUndo: payload,
          };
          updateMenuState(newState);
          return newState;
        });
        return false;
      },
      1 // LowPriority
    ),

    editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload: boolean) => {
        setToolbarState((prevState) => {
          const newState = {
            ...prevState,
            canRedo: payload,
          };
          updateMenuState(newState);
          return newState;
        });
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
