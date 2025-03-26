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
import { ImageNode } from "../components/editor/lexicalplugins/image/ImageNode";
import { $isElementNode } from "lexical";
import { $isImageNode } from "../components/editor/lexicalplugins/image/ImageNode";
import {
  InternalLinkNode,
  INTERNAL_LINK_TRANSFORMER,
  $isInternalLinkNode,
} from "../components/editor/lexicalplugins/internallink/InternalLinkNode.tsx";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { IMAGE_TRANSFORMER } from "../components/editor/lexicalplugins/image/ImageNode";
import { $dfs } from "@lexical/utils";

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
      InternalLinkNode,
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

/**
 * Extracts all image IDs from a Lexical editor state
 */
export function extractImageIdsFromEditorState(
  editorState: EditorState
): number[] {
  const imageIds: number[] = [];

  editorState.read(() => {
    const root = $getRoot();

    // Recursive function to traverse the editor tree
    const traverseNodes = (node: any) => {
      if ($isImageNode(node)) {
        imageIds.push(node.getId());
      }

      if ($isElementNode(node)) {
        const children = node.getChildren();
        for (const child of children) {
          traverseNodes(child);
        }
      }
    };

    traverseNodes(root);
  });

  return imageIds;
}

export const NOTESPONGE_TRANSFORMS = [
  ...TRANSFORMERS,
  IMAGE_TRANSFORMER,
  INTERNAL_LINK_TRANSFORMER,
];

export function getLinkedInternalPageIds(
  editorState: EditorState
): Set<number> {
  return new Set(
    editorState.read(() =>
      $dfs()
        .map(({ node }) => node)
        .filter($isInternalLinkNode)
        .map((node) => node.__pageId)
    )
  );
}

export function getMarkdownFromEditorState(editorState: EditorState): string {
  return editorState.read(() =>
    $convertToMarkdownString(NOTESPONGE_TRANSFORMS)
  );
}
