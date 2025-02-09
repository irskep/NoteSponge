import { RemirrorJSON } from "remirror";

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
