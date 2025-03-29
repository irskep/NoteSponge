import { getPageTags } from "@/services/db/actions/tags";
import { getDefaultStore } from "jotai";
import { pageTagAtoms } from "../pageState";

export async function loadPageTags(pageId: number) {
  const store = getDefaultStore();
  const tags = await getPageTags(pageId);
  store.set(pageTagAtoms.tags, (prev) => ({ ...prev, [pageId]: tags }));
  store.set(pageTagAtoms.activeTagsWrittenToDatabase, tags);
}
