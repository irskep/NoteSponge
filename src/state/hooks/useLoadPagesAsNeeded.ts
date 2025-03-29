import { fetchPage } from "@/services/db/actions/pages";
import { getPageTags } from "@/services/db/actions/tags";
import { dirtyPageIdsAtom, loadedPagesAtom, loadedPagesTagsAtom, pageIdsEverRequestedAtom } from "@/state/pageState";
import { atom, getDefaultStore } from "jotai";
import { useCallback, useEffect } from "react";

const pageIdsNeedingFetchAtom = atom((get) => {
  const dirtyPageIds = get(dirtyPageIdsAtom);
  const pageIdsEverRequested = get(pageIdsEverRequestedAtom);
  const loadedPages = get(loadedPagesAtom);

  const pageIdsToLoad = new Set<number>();
  for (const pageId of dirtyPageIds) {
    pageIdsToLoad.add(pageId);
  }

  for (const pageIdString of Object.keys(pageIdsEverRequested)) {
    const pageId = Number.parseInt(pageIdString, 10);
    if (!loadedPages[pageId]) {
      pageIdsToLoad.add(pageId);
    }
  }

  return Array.from(pageIdsToLoad).sort();
});

export default function useLoadPagesAsNeeded() {
  const reloadPages = useCallback(() => {
    const store = getDefaultStore();
    const loadedPages = store.get(loadedPagesAtom);
    const loadedPagesTags = store.get(loadedPagesTagsAtom);
    const pageIdsNeedingFetch = store.get(pageIdsNeedingFetchAtom);

    if (!pageIdsNeedingFetch.length) {
      return;
    }

    console.log("Reload pages:", pageIdsNeedingFetch);

    Promise.all(
      pageIdsNeedingFetch.map((pageId) =>
        fetchPage(pageId).then((page) => {
          if (!page) return;
          store.set(loadedPagesAtom, { ...loadedPages, [pageId]: page });
        }),
      ),
    );
    Promise.all(
      pageIdsNeedingFetch.map((pageId) =>
        getPageTags(pageId).then((tags) => {
          store.set(loadedPagesTagsAtom, { ...loadedPagesTags, [pageId]: tags });
        }),
      ),
    );

    // Clear dirty page IDs even while requests are in flight, because we don't
    // need to load them again
    if (store.get(dirtyPageIdsAtom).length > 0) {
      store.set(dirtyPageIdsAtom, []);
    }
  }, []);

  useEffect(() => getDefaultStore().sub(pageIdsNeedingFetchAtom, reloadPages), [reloadPages]);
}
