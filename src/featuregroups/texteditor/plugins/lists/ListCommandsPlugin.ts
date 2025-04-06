import { dispatchEditorCommand } from "@/state/editorState";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { COMMAND_PRIORITY_HIGH } from "lexical";
// Partly based on https://raw.githubusercontent.com/facebook/lexical/refs/heads/main/packages/lexical-react/src/LexicalLinkPlugin.ts
import { useEffect } from "react";
import { TOGGLE_BULLET_LIST_COMMAND, TOGGLE_NUMBERED_LIST_COMMAND } from "./commands";
import { getSelectionListType } from "./utils";

export default function CustomLinkPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      // Handle link toggling (creation/removal)
      editor.registerCommand(
        TOGGLE_BULLET_LIST_COMMAND,
        () => {
          editor.update(() => {
            const listType = getSelectionListType();
            if (listType === "bullet") {
              dispatchEditorCommand(REMOVE_LIST_COMMAND, undefined);
            } else if (listType === "number") {
              dispatchEditorCommand(REMOVE_LIST_COMMAND, undefined);
              dispatchEditorCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            } else {
              dispatchEditorCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            }
          });
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),

      editor.registerCommand(
        TOGGLE_NUMBERED_LIST_COMMAND,
        () => {
          editor.update(() => {
            const listType = getSelectionListType();
            if (listType === "bullet") {
              dispatchEditorCommand(REMOVE_LIST_COMMAND, undefined);
            } else if (listType === "number") {
              dispatchEditorCommand(REMOVE_LIST_COMMAND, undefined);
              dispatchEditorCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            } else {
              dispatchEditorCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            }
          });
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor]);

  return null;
}
