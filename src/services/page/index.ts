import {
  deletePage as deletePageFromDB,
  getPageTags,
  getRelatedPages,
  queryNextPageID,
  upsertPage,
} from "../db/actions";
import { EditorState } from "lexical";
import { PageData } from "../../types";
import { openPageWindow, closePageWindow } from "../window";
import { getDefaultStore } from "jotai";
import { relatedPagesAtom, relatedPagesErrorAtom } from "../../state/atoms";

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

/**
 * Updates or creates a page with the given content.
 */
export async function updatePage(
  page: PageData,
  editorState: EditorState,
  title: string
): Promise<PageData> {
  return upsertPage(page, editorState, title);
}

export async function fetchRelatedPages(pageId: number) {
  const store = getDefaultStore();
  try {
    const pages = await getRelatedPages(pageId);
    const pagesWithTags = await Promise.all(
      pages.map(async (page) => ({
        ...page,
        tags: await getPageTags(page.id),
      }))
    );

    store.set(relatedPagesAtom, pagesWithTags);
    store.set(relatedPagesErrorAtom, null);
  } catch (err) {
    store.set(relatedPagesErrorAtom, "Failed to load related pages");
    console.error(err);
  }
}
