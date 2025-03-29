import { updatePageViewedAt } from "@/services/db/actions/pageWrites";
import { pageCacheAtoms, pageIdAtom } from "@/state/pageState";
import { getDefaultStore } from "jotai";
import { useEffect } from "react";
/**
 * Hook to update page metadata when a page is viewed
 */
export default function usePageViewed() {
  useEffect(() => {
    const store = getDefaultStore();
    const pageId = store.get(pageIdAtom);

    updatePageViewedAt(pageId).then(() => {
      store.set(pageCacheAtoms.dirtyPageIds, [...store.get(pageCacheAtoms.dirtyPageIds), pageId]);
    });
  }, []);
}
