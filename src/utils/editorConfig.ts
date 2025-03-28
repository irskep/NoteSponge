import { ImageNode } from "@/components/editor/lexicalplugins/image/ImageNode";
import { IMAGE_TRANSFORMER } from "@/components/editor/lexicalplugins/image/ImageNode";
import {
  INTERNAL_LINK_TRANSFORMER,
  InternalLinkNode,
} from "@/components/editor/lexicalplugins/internallink/InternalLinkNode.tsx";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { createEditor } from "lexical";

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

export const NOTESPONGE_TRANSFORMS = [...TRANSFORMERS, IMAGE_TRANSFORMER, INTERNAL_LINK_TRANSFORMER];
