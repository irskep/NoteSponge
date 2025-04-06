import { $isInternalLinkNode } from "@/featuregroups/texteditor/plugins/internallink/InternalLinkNode";
import { $createNodeSelection, $createRangeSelection, $getNodeByKey, $setSelection, type LexicalEditor } from "lexical";

/**
 * Navigates to a node in the editor by its key
 */

export default function navigateToNode(editor: LexicalEditor, nodeKey: string, n = 1): void {
  if (n < 0) return;

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
      },
    );
  });
}
