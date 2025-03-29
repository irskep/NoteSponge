import { deletePage as deletePageFromDB } from "@/services/db/actions/pages";
import { queryNextPageID } from "@/services/db/actions/pages";
import { getRelatedPages } from "@/services/db/actions/related";
import { getPageTags } from "@/services/db/actions/tags";
import { closePageWindow, openPageWindow } from "@/services/window";
import { relatedPagesAtom } from "@/state/pageState";
import { getDefaultStore } from "jotai";

/**
 * Creates a new page and opens it in a new window.
 */
export async function createNewPage(): Promise<number> {
  const nextId = await queryNextPageID();
  await openPageWindow(nextId);
  return nextId;
}

/**
 * Deletes a page and closes any windows associated with it.
 */
export async function deletePage(id: number): Promise<void> {
  // First close any windows showing this page
  await closePageWindow(id);

  // Then delete from database
  await deletePageFromDB(id);
}

export async function fetchRelatedPages(pageId: number) {
  const store = getDefaultStore();
  try {
    const pages = await getRelatedPages(pageId);
    const pagesWithTags = await Promise.all(
      pages.map(async (page) => ({
        ...page,
        tags: await getPageTags(page.id),
      })),
    );

    store.set(relatedPagesAtom, pagesWithTags);
  } catch (err) {
    store.set(relatedPagesAtom, []);
    console.error(err);
  }
}
