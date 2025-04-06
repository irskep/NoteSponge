import { getPageTags } from "@/dbcalls/tags";
import { pageIdAtom } from "@/state/pageState";
import { pageTagAtoms } from "@/state/pageState";
import { getDefaultStore } from "jotai";

export async function loadPageTags(pageId: number) {
  const store = getDefaultStore();
  const tags = await getPageTags(pageId);
  store.set(pageTagAtoms.tags, (prev) => ({ ...prev, [pageId]: tags }));
  if (pageId === store.get(pageIdAtom)) {
    store.set(pageTagAtoms.activeTagsWrittenToDatabase, tags);
  }
}
