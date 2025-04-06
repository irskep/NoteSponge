import { setWindowTitle } from "@/bridge/ts2tauri/window";
import { loadPageTags } from "@/jankysync/loadPageTags";
import { fetchPage } from "@/services/db/pages";
import { getDB } from "@/services/foundation/db";
import { activePageAtom, isBootedAtom, pageIdAtom } from "@/state/pageState";
import type { PageData } from "@/types";
import { getDefaultStore } from "jotai";

export default async function boot() {
  await getDB();
  const store = getDefaultStore();
  const pageId = store.get(pageIdAtom);

  const pageData: PageData | null = await fetchPage(pageId);
  if (!pageData) {
    store.set(isBootedAtom, true);
    setWindowTitle(`#${pageId} New page`);
    return;
  }

  store.set(activePageAtom, pageData);
  loadPageTags(pageId); // don't await

  store.set(isBootedAtom, true);
}
