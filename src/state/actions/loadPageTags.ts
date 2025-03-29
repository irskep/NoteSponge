import { getPageTags } from "@/services/db/actions/tags";
import { getDefaultStore } from "jotai";
import { activePageTagsWrittenToDatabaseAtom, pageTagsAtom } from "../pageState";

export async function loadPageTags(pageId: number) {
  const store = getDefaultStore();
  const tags = await getPageTags(pageId);
  store.set(pageTagsAtom, (prev) => ({ ...prev, [pageId]: tags }));
  store.set(activePageTagsWrittenToDatabaseAtom, tags);
}
