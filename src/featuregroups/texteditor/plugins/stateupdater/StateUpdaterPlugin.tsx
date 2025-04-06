import { sendEditorState } from "@/bridge/ts2tauri/menus";
import { getSelectionListType } from "@/featuregroups/texteditor/plugins/lists/utils";
import { type FormattingState, formattingStateAtom } from "@/state/editorState";
import { $isCodeNode } from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { getDefaultStore } from "jotai";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useEffect } from "react";

const setFormattingState = (transform: (prevState: FormattingState) => FormattingState) => {
  getDefaultStore().set(formattingStateAtom, transform);
};

export default function StateUpdaterPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    mergeRegister(
      editor.registerUpdateListener(() => {
        applyEditorStateToAtoms();
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          applyEditorStateToAtoms();
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
            sendEditorState(newState);
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
            sendEditorState(newState);
            return newState;
          });
          return false;
        },
        1, // LowPriority
      ),
    );
  }, [editor]);

  return null;
}

function applyEditorStateToAtoms() {
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
        listType: getSelectionListType(),
        storedSelection: selection,
      };

      // Update the native menu state with the new toolbar state
      sendEditorState(newState);

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
      sendEditorState(newState);

      return newState;
    });
  }
}
