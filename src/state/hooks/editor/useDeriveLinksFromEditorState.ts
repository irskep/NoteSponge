import { getPageTitlesByIds } from "@/services/db/actions/pages";
import { externalLinksAtom, internalLinksAtom } from "@/state/atoms";
import { debouncedEditorStateAtom } from "@/state/editorState";
import { extractExternalLinks, extractInternalLinks } from "@/utils/editorLinks";
import { getDefaultStore } from "jotai";
import { useEffect } from "react";

export default function useDeriveLinksFromEditorState() {
  useEffect(() => {
    const store = getDefaultStore();
    return store.sub(debouncedEditorStateAtom, () => {
      const editorState = store.get(debouncedEditorStateAtom);
      if (!editorState) return;

      // Extract internal and external links
      const internalLinks = extractInternalLinks(editorState);
      const externalLinks = extractExternalLinks(editorState);

      store.set(externalLinksAtom, externalLinks);

      // For internal links, fetch their titles
      if (internalLinks.length <= 0) {
        store.set(internalLinksAtom, []);
        return;
      }
      const pageIds = internalLinks.map((link) => link.pageId);
      getPageTitlesByIds(pageIds).then((titleMap) => {
        // Update titles in the links data
        const updatedInternalLinks = internalLinks.map((link) => ({
          ...link,
          title: titleMap.get(link.pageId) || `Page ${link.pageId}`,
        }));

        store.set(internalLinksAtom, updatedInternalLinks);
      });
    });
  });
}
