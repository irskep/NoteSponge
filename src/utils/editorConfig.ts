import { ImageNode } from "@/featuregroups/texteditor/plugins/images/ImageNode";
import { IMAGE_TRANSFORMER } from "@/featuregroups/texteditor/plugins/images/ImageNode";
import {
  INTERNAL_LINK_TRANSFORMER,
  InternalLinkNode,
} from "@/featuregroups/texteditor/plugins/internallink/InternalLinkNode";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { createEditor } from "lexical";

export const editorConfig = {
  namespace: "NoteSpongeEditor",
  // Handling of errors during update
  onError(error: unknown) {
    console.error("Editor error:", error);
  },
  // The editor theme
  theme: {
    // Theme styling goes here
    paragraph: "LexicalTextEditor__paragraph",
    text: {
      bold: "LexicalTextEditor__text--bold",
      italic: "LexicalTextEditor__text--italic",
      underline: "LexicalTextEditor__text--underline",
      strikethrough: "LexicalTextEditor__text--strikethrough",
    },
  },
  // Handling of nodes
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
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
};

/**
 * Creates a configured Lexical editor with all required node types.
 */
export function createConfiguredEditor() {
  return createEditor(editorConfig);
}

export const NOTESPONGE_TRANSFORMS = [...TRANSFORMERS, IMAGE_TRANSFORMER, INTERNAL_LINK_TRANSFORMER];
