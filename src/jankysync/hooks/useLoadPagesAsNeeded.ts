import { fetchPage } from "@/dbcalls/pages";
import { getPageTags } from "@/dbcalls/tags";
import { pageCacheAtoms } from "@/state/pageState";
import { atom, getDefaultStore } from "jotai";
import { useCallback, useEffect } from "react";

const pageIdsNeedingFetchAtom = atom((get) => {
  const dirtyPageIds = get(pageCacheAtoms.dirtyPageIds);
  const pageIdsEverRequested = get(pageCacheAtoms.pageIdsEverRequested);
  const loadedPages = get(pageCacheAtoms.loadedPages);

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
    const loadedPages = store.get(pageCacheAtoms.loadedPages);
    const loadedPagesTags = store.get(pageCacheAtoms.loadedPagesTags);
    const pageIdsNeedingFetch = store.get(pageIdsNeedingFetchAtom);

    if (!pageIdsNeedingFetch.length) {
      return;
    }

    console.log("Reload pages:", pageIdsNeedingFetch);

    // store.set(loadedPagesAtom, {
    //   ...Object.fromEntries(pageIdsNeedingFetch.map((pageId) => [pageId, { id: pageId }])),
    //   ...loadedPages,
    // });

    Promise.all(
      pageIdsNeedingFetch.map((pageId) =>
        fetchPage(pageId).then((page) => {
          if (!page) return;
          store.set(pageCacheAtoms.loadedPages, { ...loadedPages, [pageId]: page });
        }),
      ),
    );
    Promise.all(
      pageIdsNeedingFetch.map((pageId) =>
        getPageTags(pageId).then((tags) => {
          store.set(pageCacheAtoms.loadedPagesTags, { ...loadedPagesTags, [pageId]: tags });
        }),
      ),
    );

    // Clear dirty page IDs even while requests are in flight, because we don't
    // need to load them again
    if (store.get(pageCacheAtoms.dirtyPageIds).length > 0) {
      store.set(pageCacheAtoms.dirtyPageIds, []);
    }
  }, []);

  useEffect(() => getDefaultStore().sub(pageIdsNeedingFetchAtom, reloadPages), [reloadPages]);
}
