import { getPageTags, setPageTags } from "@/dbcalls/tags";
import { isBootedAtom, pageIdAtom, pageTagAtoms } from "@/state/pageState";
import { getDefaultStore } from "jotai";
import { useEffect } from "react";

export default function useSyncTags() {
  // Load tags
  useEffect(() => {
    const store = getDefaultStore();
    const pageId = store.get(pageIdAtom);
    getPageTags(pageId).then((tags) => {
      store.set(pageTagAtoms.tags, (prev) => ({ ...prev, [pageId]: tags }));
    });
  }, []);

  // Save tags to the database when they change
  useEffect(() => {
    const store = getDefaultStore();

    return store.sub(pageTagAtoms.tags, () => {
      if (!store.get(isBootedAtom)) return;
      const pageId = store.get(pageIdAtom);
      const tags = store.get(pageTagAtoms.tags)[pageId];
      if (!tags) return;

      const activePageTagsWrittenToDatabase = store.get(pageTagAtoms.activeTagsWrittenToDatabase);
      if (JSON.stringify(activePageTagsWrittenToDatabase) === JSON.stringify(tags)) return;

      console.log("Saving tags to the database:", tags);

      setPageTags(pageId, tags).then(() => {
        store.set(pageTagAtoms.activeTagsWrittenToDatabase, tags);
      });
    });
  }, []);
}
