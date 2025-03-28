import type { DOMExportOutput, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical";

import { DatabaseImage } from "@/components/editor/lexicalplugins/image/DatabaseImage";
import type { Transformer } from "@lexical/markdown";
import { DecoratorNode, type TextNode } from "lexical";
import "@/components/editor/lexicalplugins/image/ImageNode.css";

export interface ImagePayload {
  id: number;
  pageId: number;
  fileExtension: string;
}

export type SerializedImageNode = Spread<
  {
    id: number;
    pageId: number;
    fileExtension: string;
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __id: number;
  __pageId: number;
  __fileExtension: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__id, node.__pageId, node.__fileExtension, node.__key);
  }

  constructor(id: number, pageId: number, fileExtension: string, key?: NodeKey) {
    super(key);
    this.__id = id;
    this.__pageId = pageId;
    this.__fileExtension = fileExtension;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const node = $createImageNode(serializedNode.id, serializedNode.pageId, serializedNode.fileExtension);
    return node;
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      id: this.__id,
      pageId: this.__pageId,
      fileExtension: this.__fileExtension,
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    // Use data attributes to store the IDs
    element.setAttribute("data-lexical-image-id", String(this.__id));
    element.setAttribute("data-lexical-page-id", String(this.__pageId));
    element.setAttribute("data-lexical-file-extension", this.__fileExtension);
    // Use the same format as in the markdown transformer
    element.setAttribute("src", `${this.__pageId}_${this.__id}.${this.__fileExtension}`);
    element.setAttribute("alt", `Image ${this.__id}`);
    return { element };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.classList.add("ImageNode");
    return div;
  }

  updateDOM(): false {
    return false;
  }

  getId(): number {
    return this.__id;
  }

  getPageId(): number {
    return this.__pageId;
  }

  getFileExtension(): string {
    return this.__fileExtension;
  }

  decorate(): JSX.Element {
    return (
      <div className="ImageNode__wrapper" contentEditable={false} data-lexical-decorator="true">
        <DatabaseImage id={this.__id} />
      </div>
    );
  }
}

export function $createImageNode(id: number, pageId: number, fileExtension: string): ImageNode {
  return new ImageNode(id, pageId, fileExtension);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

export const IMAGE_TRANSFORMER: Transformer = {
  dependencies: [ImageNode],
  export: (node: LexicalNode) => {
    if (!$isImageNode(node)) return null;
    const imageId = node.getId();
    const pageId = node.getPageId();
    const fileExtension = node.getFileExtension();

    // Format: ![alt text](pageId_imageId.extension)
    return `![Image ${imageId}](${pageId}_${imageId}.${fileExtension})`;
  },
  importRegExp: /!\[Image ([0-9]+)\]\(([0-9]+)_([0-9]+)\.([a-zA-Z0-9]+)\)/,
  regExp: /!\[Image ([0-9]+)\]\(([0-9]+)_([0-9]+)\.([a-zA-Z0-9]+)\)$/,
  replace: (textNode: TextNode, match: RegExpMatchArray) => {
    // Extract page ID, image ID, and file extension
    const [, , pageId, imageId, fileExtension] = match;
    const imageNode = $createImageNode(Number.parseInt(imageId, 10), Number.parseInt(pageId, 10), fileExtension);
    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match",
};
