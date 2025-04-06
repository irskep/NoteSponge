import { $isListNode, type ListType } from "@lexical/list";
import { $getSelection, $isRangeSelection } from "lexical";

export function getSelectionListType(): ListType | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;

  const nodes = selection.getNodes();

  // Check if any node is in a list
  for (const node of nodes) {
    let parent = node.getParent();

    // Check the node's parent and ancestors for list nodes
    while (parent !== null) {
      if ($isListNode(parent)) return parent.getListType();
      parent = parent.getParent();
    }
  }

  return null;
}
