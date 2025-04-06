import { listenToWindowFocus } from "@/bridge/tauri2ts/listenToWindowFocus";
import { getRelatedPages } from "@/dbcalls/related";
import { pageIdAtom, pageTagAtoms, relatedPagesAtom } from "@/state/pageState";
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
    return store.sub(pageTagAtoms.activeTagsWrittenToDatabase, reloadRelatedPages);
  }, [reloadRelatedPages]);

  useEffect(() => {
    return listenToWindowFocus(reloadRelatedPages);
  }, [reloadRelatedPages]);
}
