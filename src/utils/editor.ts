import {
  $getRoot,
  $isElementNode,
  EditorState,
  createEditor,
  SerializedEditorState,
  LexicalEditor,
  $getNodeByKey,
  $setSelection,
  $createRangeSelection,
  $createNodeSelection,
} from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { $dfs } from "@lexical/utils";
import { truncateEnd } from "friendly-truncate";
import { ImageNode } from "../components/editor/lexicalplugins/image/ImageNode";
import { $isImageNode } from "../components/editor/lexicalplugins/image/ImageNode";
import {
  InternalLinkNode,
  INTERNAL_LINK_TRANSFORMER,
  $isInternalLinkNode,
} from "../components/editor/lexicalplugins/internallink/InternalLinkNode.tsx";
import { IMAGE_TRANSFORMER } from "../components/editor/lexicalplugins/image/ImageNode";
import { $isLinkNode } from "@lexical/link";
import { InternalLinkInfo, ExternalLinkInfo } from "../state/atoms";

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
        .map((node) => node.getPageId())
    )
  );
}

/**
 * Extracts internal links from the editor state, grouped by page ID
 */
export function extractInternalLinks(
  editorState: EditorState
): InternalLinkInfo[] {
  const internalLinks = new Map<
    number,
    { title: string; instances: { text: string; nodeKey: string }[] }
  >();

  editorState.read(() => {
    const nodes = $dfs().map(({ node }) => node);

    // Find all internal link nodes
    nodes.filter($isInternalLinkNode).forEach((node, i) => {
      const pageId = node.getPageId();
      const text = `#${i + 1}`;
      const nodeKey = node.getKey();

      if (!internalLinks.has(pageId)) {
        // Use page ID as title for now, will be updated when we fetch real page titles
        internalLinks.set(pageId, {
          title: `${i + 1}`,
          instances: [],
        });
      }

      internalLinks.get(pageId)!.instances.push({ text, nodeKey });
    });
  });

  return Array.from(internalLinks.entries()).map(([pageId, data]) => ({
    pageId,
    title: data.title,
    instances: data.instances,
  }));
}

/**
 * Extracts external links from the editor state, grouped by URL
 */
export function extractExternalLinks(
  editorState: EditorState
): ExternalLinkInfo[] {
  const externalLinks = new Map<
    string,
    { instances: { text: string; nodeKey: string }[] }
  >();

  editorState.read(() => {
    const nodes = $dfs().map(({ node }) => node);

    // Find all link nodes (that are not internal links)
    for (const node of nodes) {
      if ($isLinkNode(node)) {
        const url = node.getURL();
        const text = node.getTextContent() || url;
        const nodeKey = node.getKey();

        if (!externalLinks.has(url)) {
          externalLinks.set(url, { instances: [] });
        }

        externalLinks.get(url)!.instances.push({ text, nodeKey });
      }
    }
  });

  return Array.from(externalLinks.entries()).map(([url, data]) => ({
    url,
    instances: data.instances,
  }));
}

/**
 * Navigates to a node in the editor by its key
 */
export function navigateToNode(
  editor: LexicalEditor,
  nodeKey: string,
  n = 1
): void {
  if (n < 0) return;
  if (!editor) return;

  let needsScroll = false;

  editor.focus(() => {
    editor.update(
      () => {
        const node = $getNodeByKey(nodeKey);
        if (!node) {
          console.error("Node not found:", nodeKey);
          return;
        }
        if ($isInternalLinkNode(node)) {
          needsScroll = true;
          const nodeSelection = $createNodeSelection();
          nodeSelection.add(nodeKey);
          $setSelection(nodeSelection);
        } else {
          const rangeSelection = $createRangeSelection();
          rangeSelection.anchor.set(nodeKey, 0, "element");
          rangeSelection.focus.set(nodeKey, 0, "element");
          $setSelection(rangeSelection);
        }
      },
      {
        onUpdate: () => {
          // The above selection code looks correct but doesn't
          // work, so just brute force it
          if (needsScroll) {
            editor.getElementByKey(nodeKey)?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          } else {
            // Bug: two clicks required w/o this bandaid
            navigateToNode(editor, nodeKey, n - 1);
          }
        },
      }
    );
  });
}

export function getMarkdownFromEditorState(editorState: EditorState): string {
  return editorState.read(() =>
    $convertToMarkdownString(NOTESPONGE_TRANSFORMS)
  );
}
