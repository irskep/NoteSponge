import type {
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";

import {
  DecoratorNode,
  TextNode,
  $createTextNode,
  $setSelection,
  $createRangeSelection,
} from "lexical";
import { Transformer } from "@lexical/markdown";
import { DatabasePageLink } from "./DatabasePageLink";
import { pageExportCache } from "../../../services/db/pageExportCache";

export interface InternalLinkPayload {
  pageId: number;
}

export type SerializedInternalLinkNode = Spread<
  {
    pageId: number;
    version: 1;
  },
  SerializedLexicalNode
>;

export class InternalLinkNode extends DecoratorNode<JSX.Element> {
  __pageId: number;

  static getType(): string {
    return "internal-link";
  }

  static clone(node: InternalLinkNode): InternalLinkNode {
    return new InternalLinkNode(node.__pageId, node.__key);
  }

  constructor(pageId: number, key?: NodeKey) {
    super(key);
    this.__pageId = pageId;
  }

  static importJSON(
    serializedNode: SerializedInternalLinkNode
  ): InternalLinkNode {
    const node = $createInternalLinkNode(serializedNode.pageId);
    return node;
  }

  exportJSON(): SerializedInternalLinkNode {
    return {
      ...super.exportJSON(),
      pageId: this.__pageId,
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("a");
    element.setAttribute("data-lexical-page-id", String(this.__pageId));
    element.setAttribute("href", `#${this.__pageId}`);
    element.setAttribute("class", "InternalLinkNode");
    return { element };
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    span.classList.add("InternalLinkNode");
    span.setAttribute("data-lexical-page-id", String(this.__pageId));
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getPageId(): number {
    return this.__pageId;
  }

  isInline(): true {
    return true;
  }

  isIsolated(): true {
    return true;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  decorate(): JSX.Element {
    return <DatabasePageLink id={this.__pageId} nodeKey={this.__key} />;
  }
}

export function $createInternalLinkNode(pageId: number): InternalLinkNode {
  return new InternalLinkNode(pageId);
}

export function $isInternalLinkNode(
  node: LexicalNode | null | undefined
): node is InternalLinkNode {
  return node instanceof InternalLinkNode;
}

export const INTERNAL_LINK_TRANSFORMER: Transformer = {
  dependencies: [InternalLinkNode],
  export: (node: LexicalNode) => {
    if (!$isInternalLinkNode(node)) return null;
    const pageId = node.getPageId();
    const title = pageExportCache.get(pageId)?.title ?? `Page ${pageId}`;
    const filename = pageExportCache.get(pageId)?.filename ?? `${pageId}.md`;
    return `[${title}](./${filename})`;
  },
  importRegExp: /\[\[([0-9]+)\]\]/,
  regExp: /\[\[([0-9]+)\]\]$/,
  replace: (textNode: TextNode, match: RegExpMatchArray) => {
    const [, pageId] = match;
    const emptyTextNode = $createTextNode(" ");
    const linkNode = $createInternalLinkNode(parseInt(pageId, 10));
    textNode.replace(emptyTextNode);

    const selection = $createRangeSelection();
    selection.anchor.set(emptyTextNode.getKey(), 1, "text");
    selection.focus.set(emptyTextNode.getKey(), 1, "text");
    selection.insertNodes([linkNode, emptyTextNode]);
    $setSelection(selection);
  },
  trigger: "]",
  type: "text-match",
};
