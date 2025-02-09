import { RemirrorJSON } from "remirror";
import {
  $getRoot,
  $isElementNode,
  $isTextNode,
  EditorState,
  LexicalNode,
} from "lexical";

export function isRemirrorEmpty(json: RemirrorJSON | undefined): boolean {
  if (!json || !json.content || !json.content.length) {
    return true;
  }

  // Check if there's any actual content in the first node
  // This handles cases where there might be an empty paragraph
  const firstNode = json.content[0];
  if (!firstNode.content || !firstNode.content.length) {
    return true;
  }

  return false;
}

export function deriveTitle(data: RemirrorJSON): string | undefined {
  if (!data.content || !data.content.length) return undefined;
  const firstNode = data.content[0];
  if (!firstNode.content || !firstNode.content.length) return undefined;

  function getTextsOfChildren(node: RemirrorJSON, parts: string[]): string[] {
    if (node.text) parts.push(node.text);
    for (const child of node.content || []) {
      getTextsOfChildren(child, parts);
    }
    return parts;
  }

  return getTextsOfChildren(firstNode, []).join("");
}

export function isLexicalEmpty(editorState: EditorState | null): boolean {
  if (!editorState) {
    return true;
  }

  let isEmpty = true;
  editorState.read(() => {
    const root = $getRoot();
    const children = root.getChildren();

    // Check if there's any content
    if (children.length === 0) {
      return;
    }

    // Check if there's any actual content in the nodes
    for (const child of children) {
      if ($isTextNode(child) && child.getTextContent().trim()) {
        isEmpty = false;
        return;
      }
      if ($isElementNode(child) && child.getChildren().length > 0) {
        isEmpty = false;
        return;
      }
    }
  });

  return isEmpty;
}

export function deriveLexicalTitle(
  editorState: EditorState | null
): string | undefined {
  if (!editorState) return undefined;

  let title: string | undefined;
  editorState.read(() => {
    const root = $getRoot();
    const firstChild = root.getFirstChild();
    if (!firstChild) return;

    function getTextsOfChildren(node: LexicalNode, parts: string[]): string[] {
      if ($isTextNode(node)) {
        const text = node.getTextContent();
        if (text) parts.push(text);
      }
      if ($isElementNode(node)) {
        for (const child of node.getChildren()) {
          getTextsOfChildren(child, parts);
        }
      }
      return parts;
    }

    title = getTextsOfChildren(firstChild, []).join("");
  });

  return title && title.trim() ? title : undefined;
}
