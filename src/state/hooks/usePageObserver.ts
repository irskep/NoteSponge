import type { PageData } from "@/types";
import { getDefaultStore, useAtomValue } from "jotai";
import { useEffect } from "react";
import { useMemo } from "use-memo-one";
import { loadedPagesAtom, pageIdsEverRequestedAtom } from "../pageState";

export function usePageObserver(pageId: number) {
  useEffect(() => {
    const store = getDefaultStore();
    const pageIdsEverRequested = store.get(pageIdsEverRequestedAtom);
    if (pageIdsEverRequested[pageId]) return;
    console.log("Setting page ID as requested:", pageId);
    store.set(pageIdsEverRequestedAtom, { ...pageIdsEverRequested, [pageId]: true });
  }, [pageId]);
}

export function usePage(pageId: number): PageData | null {
  const loadedPages = useAtomValue(loadedPagesAtom);

  usePageObserver(pageId);
  return useMemo(() => loadedPages[pageId], [loadedPages, pageId]);
}
