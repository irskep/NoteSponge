import { getPageTags } from "@/services/db/actions/tags";
import { getDefaultStore } from "jotai";
import { pageIdAtom, pageTagAtoms } from "../pageState";

export async function loadPageTags(pageId: number) {
  const store = getDefaultStore();
  const tags = await getPageTags(pageId);
  store.set(pageTagAtoms.tags, (prev) => ({ ...prev, [pageId]: tags }));
  if (pageId === store.get(pageIdAtom)) {
    store.set(pageTagAtoms.activeTagsWrittenToDatabase, tags);
  }
}
