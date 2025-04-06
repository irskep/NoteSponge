import { $convertToMarkdownString } from "@lexical/markdown";
import { truncateEnd } from "friendly-truncate";
import { $getRoot, type EditorState, type SerializedEditorState } from "lexical";
import { NOTESPONGE_TRANSFORMS, createConfiguredEditor } from "./editorConfig";
/**
 * Creates an editor state, optionally from a serialized state.
 */
export function createEditorState(serializedState?: SerializedEditorState): EditorState {
  const editor = createConfiguredEditor();
  return serializedState ? editor.parseEditorState(serializedState) : editor.getEditorState();
}

/**
 * Derives a title from the editor state.
 */
export function deriveLexicalTitle(): string | undefined {
  let title = "";
  title = $getRoot().getTextContent() ?? "";
  if (!title.length) return undefined;
  const trimmedFirstLine = title.split("\n")[0].trim();
  return truncateEnd(trimmedFirstLine, 100);
}

export function getMarkdownFromEditorState(editorState: EditorState): string {
  return editorState.read(() => $convertToMarkdownString(NOTESPONGE_TRANSFORMS));
}
