import { pageCacheAtoms } from "@/state/pageState";
import type { PageData } from "@/types";
import { getDefaultStore, useAtomValue } from "jotai";
import { useEffect } from "react";
import { useMemo } from "use-memo-one";

function usePageObserver(pageId: number) {
  useEffect(() => {
    const store = getDefaultStore();
    const pageIdsEverRequested = store.get(pageCacheAtoms.pageIdsEverRequested);
    if (pageIdsEverRequested[pageId]) return;
    console.log("Setting page ID as requested:", pageId);
    store.set(pageCacheAtoms.pageIdsEverRequested, { ...pageIdsEverRequested, [pageId]: true });
  }, [pageId]);
}

export default function usePage(pageId: number): PageData | null {
  const loadedPages = useAtomValue(pageCacheAtoms.loadedPages);
  usePageObserver(pageId);
  return useMemo(() => loadedPages[pageId], [loadedPages, pageId]);
}
