import type { ExternalLinkInfo } from "@/state/editorState";
import { $isLinkNode } from "@lexical/link";
import { $dfs } from "@lexical/utils";
import type { EditorState } from "lexical";

/**
 * Extracts external links from the editor state, grouped by URL
 */
export function extractExternalLinks(editorState: EditorState): ExternalLinkInfo[] {
  const externalLinks = new Map<string, { instances: { text: string; nodeKey: string }[] }>();

  editorState.read(() => {
    const nodes = $dfs().map(({ node }) => node);

    // Find all link nodes (that are not internal links)
    for (const node of nodes) {
      if ($isLinkNode(node)) {
        const url = node.getURL();
        const text = node.getTextContent() || url;
        const nodeKey = node.getKey();

        if (!externalLinks.has(url)) {
          externalLinks.set(url, { instances: [] });
        }

        // biome-ignore lint/style/noNonNullAssertion: stfu
        externalLinks.get(url)!.instances.push({ text, nodeKey });
      }
    }
  });

  return Array.from(externalLinks.entries()).map(([url, data]) => ({
    url,
    instances: data.instances,
  }));
}
