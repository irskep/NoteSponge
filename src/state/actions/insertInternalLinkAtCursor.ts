import { dispatchInsertInternalLinkCommand } from "@/featuregroups/texteditor/plugins/internallink/InternalLinkPlugin";
import { getDefaultStore } from "jotai";
import { editorAtom } from "../editorState";

export function insertInternalLinkAtCursor(pageId: number) {
  const store = getDefaultStore();
  const editor = store.get(editorAtom);
  if (editor) {
    dispatchInsertInternalLinkCommand(editor, pageId);
  }
}
