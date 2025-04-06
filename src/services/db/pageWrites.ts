import { getMarkdownFromEditorState } from "@/featuregroups/texteditor/editorStateHelpers";
import populatePageExportCache from "@/services/db/populatePageExportCache";
import { sanitizeFilename } from "@/services/db/utils";
import { getDB } from "@/services/foundation/db";
import { type ExecuteResult, execute, select } from "@/services/foundation/db";
import type { PageData } from "@/types";
import { $getRoot, type EditorState } from "lexical";

export async function updatePageViewedAt(id: number): Promise<void> {
  const db = await getDB();
  await execute(db, "UPDATE pages SET last_viewed_at = CURRENT_TIMESTAMP, view_count = view_count + 1 WHERE id = $1", [
    id,
  ]);
}

export async function upsertPageContent(page: PageData, editorState: EditorState, title: string): Promise<PageData> {
  const db = await getDB();
  const plainText = editorState.read(() => $getRoot().getTextContent() ?? "");
  const serializedState = JSON.stringify(editorState.toJSON());

  await populatePageExportCache(editorState);
  const markdownText = getMarkdownFromEditorState(editorState);

  const filename = `${page.id}_${sanitizeFilename(title)}.md`;

  // First check if the page exists
  const exists =
    page.id !== undefined &&
    (await select<[{ count: number }]>(db, "SELECT COUNT(*) as count FROM pages WHERE id = $1", [page.id]))[0].count >
      0;

  let result: ExecuteResult;
  if (!exists) {
    // For new or non-existent pages, do a simple insert
    result = await execute(
      db,
      `INSERT INTO pages (id, title, filename, lexical_json, plain_text, markdown_text)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [page.id, title, filename, serializedState, plainText, markdownText],
    );
  } else {
    // For existing pages, do an explicit update
    result = await execute(
      db,
      `UPDATE pages 
       SET title = $2,
           filename = $3,
           lexical_json = $4,
           plain_text = $5,
           markdown_text = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [page.id, title, filename, serializedState, plainText, markdownText],
    );

    if (!result.rowsAffected) {
      throw new Error(`Failed to update page: ${page.id}`);
    }
  }

  return {
    ...page,
    title,
    filename,
    lexicalState: editorState.toJSON(),
    markdownText,
  };
}
