import { updateMenuState } from "@/menu/state";
import type { FormattingState } from "@/state/editorState";
import { $isCodeNode } from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import { $isListNode } from "@lexical/list";
import { mergeRegister } from "@lexical/utils";
import type { SetStateAction } from "jotai";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";

/**
 * Updates the toolbar state based on the current editor selection
 */
export function updateFormattingState(
  editor: LexicalEditor,
  setFormattingState: (update: SetStateAction<FormattingState>) => void,
): void {
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setFormattingState((prevState) => {
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
      setFormattingState((prevState) => {
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
export function registerFormattingStateListeners(
  editor: LexicalEditor | null,
  setFormattingState: (update: SetStateAction<FormattingState>) => void,
): () => void {
  if (!editor) return () => {};
  return mergeRegister(
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateFormattingState(editor, setFormattingState);
      });
    }),

    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateFormattingState(editor, setFormattingState);
        return false;
      },
      1, // LowPriority
    ),

    editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload: boolean) => {
        setFormattingState((prevState) => {
          const newState = {
            ...prevState,
            canUndo: payload,
          };
          updateMenuState(newState);
          return newState;
        });
        return false;
      },
      1, // LowPriority
    ),

    editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload: boolean) => {
        setFormattingState((prevState) => {
          const newState = {
            ...prevState,
            canRedo: payload,
          };
          updateMenuState(newState);
          return newState;
        });
        return false;
      },
      1, // LowPriority
    ),
  );
}

/**
 * Updates the stored selection in toolbar state
 */
export function updateStoredSelection(
  editor: LexicalEditor,
  setFormattingState: (update: SetStateAction<FormattingState>) => void,
): void {
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    setFormattingState((prevState) => ({
      ...prevState,
      storedSelection: selection,
    }));
  });
}
