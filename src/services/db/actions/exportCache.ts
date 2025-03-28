import { select } from "@/services/db/actions/db";
import { getDB } from "@/services/db/index";
import { pageExportCache } from "@/services/db/pageExportCache";
import type { DBPage } from "@/services/db/types";
import { getLinkedInternalPageIds } from "@/utils/editor";
import type { EditorState } from "lexical";

export async function populatePageExportCache(editorState: EditorState): Promise<void> {
  const pageIds = getLinkedInternalPageIds(editorState);

  if (pageIds.size === 0) {
    return;
  }

  const idArray = Array.from(pageIds);
  const placeholders = idArray.map((_, i) => `$${i + 1}`).join(", ");

  const db = await getDB();
  const pages = await select<Pick<DBPage, "id" | "title" | "filename">[]>(
    db,
    `SELECT id, title, filename FROM pages WHERE id IN (${placeholders})`,
    idArray,
  );

  pageExportCache.clear();
  for (const { id, title, filename } of pages) {
    pageExportCache.set(id, {
      title,
      filename,
    });
  }
}
