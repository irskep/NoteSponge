import { $isInternalLinkNode } from "@/components/editor/lexicalplugins/internallink/InternalLinkNode.tsx";
import type { ExternalLinkInfo, InternalLinkInfo } from "@/state/atoms";
import { $isLinkNode } from "@lexical/link";
import { $dfs } from "@lexical/utils";
import type { EditorState } from "lexical";

export function getLinkedInternalPageIds(editorState: EditorState): Set<number> {
  return new Set(
    editorState.read(() =>
      $dfs()
        .map(({ node }) => node)
        .filter($isInternalLinkNode)
        .map((node) => node.getPageId()),
    ),
  );
}

/**
 * Extracts internal links from the editor state, grouped by page ID
 */
export function extractInternalLinks(editorState: EditorState): InternalLinkInfo[] {
  const internalLinks = new Map<number, { title: string; instances: { text: string; nodeKey: string }[] }>();

  editorState.read(() => {
    const nodes = $dfs().map(({ node }) => node);

    // Find all internal link nodes
    nodes.filter($isInternalLinkNode).forEach((node, i) => {
      const pageId = node.getPageId();
      const text = `#${i + 1}`;
      const nodeKey = node.getKey();

      if (!internalLinks.has(pageId)) {
        // Use page ID as title for now, will be updated when we fetch real page titles
        internalLinks.set(pageId, {
          title: `${i + 1}`,
          instances: [],
        });
      }

      // biome-ignore lint/style/noNonNullAssertion: stfu
      internalLinks.get(pageId)!.instances.push({ text, nodeKey });
    });
  });

  return Array.from(internalLinks.entries()).map(([pageId, data]) => ({
    pageId,
    title: data.title,
    instances: data.instances,
  }));
}

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
