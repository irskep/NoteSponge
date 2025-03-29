import { updatePageViewedAt } from "@/services/db/actions/pageWrites";
import { boot } from "@/state/actions/boot";
import { pageCacheAtoms, pageIdAtom } from "@/state/pageState";
import { getDefaultStore } from "jotai";
import { useEffect } from "react";

/**
 * Hook to initialize the database and set the current page ID from URL parameters
 */
export const useLoadPage = () => {
  useEffect(() => {
    boot();
  }, []);
};

/**
 * Hook to update page metadata when a page is viewed
 */
export const usePageViewed = () => {
  useEffect(() => {
    const store = getDefaultStore();
    const pageId = store.get(pageIdAtom);

    updatePageViewedAt(pageId).then(() => {
      store.set(pageCacheAtoms.dirtyPageIds, [...store.get(pageCacheAtoms.dirtyPageIds), pageId]);
    });
  }, []);
};
