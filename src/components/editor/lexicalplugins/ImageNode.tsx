import type {
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";

import { DecoratorNode, TextNode } from "lexical";
import { Transformer } from "@lexical/markdown";
import { DatabaseImage } from "./DatabaseImage";
import "../ImageNode.css";

export interface ImagePayload {
  id: number;
}

export type SerializedImageNode = Spread<
  {
    id: number;
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __id: number;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__id, node.__key);
  }

  constructor(id: number, key?: NodeKey) {
    super(key);
    this.__id = id;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const node = $createImageNode(serializedNode.id);
    return node;
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      id: this.__id,
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    // Use data attributes to store the ID
    element.setAttribute("data-lexical-image-id", String(this.__id));
    // We'll use a placeholder src for export
    element.setAttribute("src", `image://${this.__id}`);
    element.setAttribute("alt", `Image ${this.__id}`);
    return { element };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.classList.add("editor-image-container");
    return div;
  }

  updateDOM(): false {
    return false;
  }

  getId(): number {
    return this.__id;
  }

  decorate(): JSX.Element {
    return (
      <div
        className="editor-image-wrapper"
        contentEditable={false}
        data-lexical-decorator="true"
      >
        <DatabaseImage id={this.__id} />
      </div>
    );
  }
}

export function $createImageNode(id: number): ImageNode {
  return new ImageNode(id);
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode;
}

export const IMAGE_TRANSFORMER: Transformer = {
  dependencies: [ImageNode],
  export: (node: LexicalNode) => {
    if (!$isImageNode(node)) return null;
    const imageId = node.getId();
    // TODO: This doesn't work
    // 1. it's the wrong format for markdown images
    // 2. images are saved as pageId_imageId.extension

    // so, we need to:
    // 1. include the pageId
    // 2. include the extension
    //    ...which will probably need to come from the original filename
    //    ...and be stored in the database
    return `![${imageId}]()`;
  },
  importRegExp: /!\[([0-9]+)\]\(\)/,
  regExp: /!\[([0-9]+)\]\(\)$/,
  replace: (textNode: TextNode, match: RegExpMatchArray) => {
    const [, imageId] = match;
    const imageNode = $createImageNode(parseInt(imageId, 10));
    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match",
};
