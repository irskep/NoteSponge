import { getDB } from "@/services/db";
import { fetchPage } from "@/services/db/actions/pages";
import { loadPageTags } from "@/state/actions/loadPageTags";
import { activePageAtom, isBootedAtom, pageIdAtom } from "@/state/pageState";
import type { PageData } from "@/types";
import { getDefaultStore } from "jotai";

export async function boot() {
  await getDB();
  const store = getDefaultStore();
  const pageId = store.get(pageIdAtom);

  const pageData: PageData | null = await fetchPage(pageId);
  if (!pageData) {
    store.set(isBootedAtom, true);
    return;
  }

  store.set(activePageAtom, pageData);
  loadPageTags(pageId); // don't await

  store.set(isBootedAtom, true);
}
