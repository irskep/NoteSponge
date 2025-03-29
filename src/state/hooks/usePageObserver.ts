import type { PageData } from "@/types";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { useMemo } from "use-memo-one";
import { loadedPagesAtom, pageIdsEverRequestedAtom } from "../pageState";

export function usePageObserver(pageId: number) {
  const [pageIdsEverRequested, setPageIdsEverRequested] = useAtom(pageIdsEverRequestedAtom);

  useEffect(() => {
    if (pageIdsEverRequested[pageId]) return;
    setPageIdsEverRequested({ ...pageIdsEverRequested, [pageId]: true });
  }, [pageId, setPageIdsEverRequested, pageIdsEverRequested]);
}

export function usePage(pageId: number): PageData | null {
  const loadedPages = useAtomValue(loadedPagesAtom);
  usePageObserver(pageId);
  return useMemo(() => loadedPages[pageId], [loadedPages, pageId]);
}
