import { EditorState } from "lexical";
import { getDB } from "@/services/db/index";
import { DBPage } from "@/services/db/types";
import { select } from "@/services/db/actions/db";
import { pageExportCache } from "@/services/db/pageExportCache";
import { getLinkedInternalPageIds } from "@/utils/editor";

export async function populatePageExportCache(
  editorState: EditorState
): Promise<void> {
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
    idArray
  );

  pageExportCache.clear();
  pages.forEach(({ id, title, filename }) => {
    pageExportCache.set(id, {
      title,
      filename,
    });
  });
}
