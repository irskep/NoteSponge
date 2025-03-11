import { LexicalNode, TextNode } from "lexical";
import { Transformer } from "@lexical/markdown";
import {
  ImageNode,
  $isImageNode,
  $createImageNode,
} from "../../components/editor/lexicalplugins/ImageNode";

export const IMAGE_TRANSFORMER: Transformer = {
  dependencies: [ImageNode],
  export: (node: LexicalNode) => {
    if (!$isImageNode(node)) return null;
    const imageId = node.getId();
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
