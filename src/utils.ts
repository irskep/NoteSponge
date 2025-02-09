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
