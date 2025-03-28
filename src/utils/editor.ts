import { $isInternalLinkNode } from "@/components/editor/lexicalplugins/internallink/InternalLinkNode.tsx";
import { editorAtom } from "@/components/editor/state/editorAtoms";
import { $convertToMarkdownString } from "@lexical/markdown";
import { truncateEnd } from "friendly-truncate";
import { getDefaultStore } from "jotai";
import {
  $createNodeSelection,
  $createRangeSelection,
  $getNodeByKey,
  $getRoot,
  $setSelection,
  type EditorState,
  type SerializedEditorState,
} from "lexical";
import { NOTESPONGE_TRANSFORMS, createConfiguredEditor } from "./editorConfig";
/**
 * Creates an editor state, optionally from a serialized state.
 */
export function createEditorState(serializedState?: SerializedEditorState): EditorState {
  const editor = createConfiguredEditor();
  return serializedState ? editor.parseEditorState(serializedState) : editor.getEditorState();
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
 * Navigates to a node in the editor by its key
 */
export function navigateToNode(nodeKey: string, n = 1): void {
  if (n < 0) return;

  const editor = getDefaultStore().get(editorAtom);
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
            navigateToNode(nodeKey, n - 1);
          }
        },
      },
    );
  });
}

export function getMarkdownFromEditorState(editorState: EditorState): string {
  return editorState.read(() => $convertToMarkdownString(NOTESPONGE_TRANSFORMS));
}
