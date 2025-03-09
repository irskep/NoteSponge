import {
  $getRoot,
  EditorState,
  createEditor,
  SerializedEditorState,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { truncateEnd } from "friendly-truncate";
import { ImageNode } from "../components/editor/lexicalplugins/ImageNode";

/**
 * Creates a configured Lexical editor with all required node types.
 */
export function createConfiguredEditor() {
  const editor = createEditor({
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
      ImageNode,
    ],
  });
  return editor;
}

/**
 * Creates an editor state, optionally from a serialized state.
 */
export function createEditorState(
  serializedState?: SerializedEditorState
): EditorState {
  const editor = createConfiguredEditor();
  return serializedState
    ? editor.parseEditorState(serializedState)
    : editor.getEditorState();
}

/**
 * Checks if the editor state is empty.
 */
export function isLexicalEmpty(state: EditorState): boolean {
  let textContentSize = 0;
  state.read(() => {
    textContentSize = $getRoot().getTextContentSize();
  });
  return textContentSize === 0;
}

/**
 * Derives a title from the editor state.
 */
export function deriveLexicalTitle(state: EditorState): string | undefined {
  let title = "";
  state.read(() => {
    title = $getRoot().getTextContent() ?? "";
  });
  if (!title.length) return undefined;
  const trimmedFirstLine = title.split("\n")[0].trim();
  return truncateEnd(trimmedFirstLine, 100);
}

/**
 * Gets plain text from the editor state.
 */
export function getLexicalPlainText(state: EditorState): string {
  let text = "";
  state.read(() => {
    text = $getRoot().getTextContent() ?? "";
  });
  return text;
}
