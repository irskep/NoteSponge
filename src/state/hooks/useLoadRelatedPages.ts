import { getRelatedPages } from "@/services/db/actions/related";
import { activePageTagsWrittenToDatabaseAtom, pageIdAtom, relatedPagesAtom } from "@/state/pageState";
import { listenToWindowFocus } from "@/utils/listenToWindowFocus";
import { getDefaultStore, useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";

export default function useLoadRelatedPages() {
  const pageId = useAtomValue(pageIdAtom);

  const reloadRelatedPages = useCallback(() => {
    const store = getDefaultStore();
    getRelatedPages(pageId).then((relatedPages) => {
      store.set(
        relatedPagesAtom,
        relatedPages.map((p) => ({ id: p.id, sharedTags: p.sharedTags })),
      );
    });
  }, [pageId]);

  useEffect(() => {
    const store = getDefaultStore();
    return store.sub(activePageTagsWrittenToDatabaseAtom, reloadRelatedPages);
  }, [reloadRelatedPages]);

  useEffect(() => {
    return listenToWindowFocus(reloadRelatedPages);
  }, [reloadRelatedPages]);
}
