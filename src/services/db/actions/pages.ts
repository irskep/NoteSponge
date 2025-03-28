import { getDB } from "@/services/db/index";
import { EditorState } from "lexical";
import { PageData } from "@/types";
import { DBPage } from "@/services/db/types";
import { select, execute } from "@/services/db/actions/db";
import { sanitizeFilename } from "@/services/db/actions/utils";
import {
  getLexicalPlainText,
  getMarkdownFromEditorState,
} from "@/utils/editor";
import { cleanupOrphanedTags } from "@/services/db/actions/tags";
import { populatePageExportCache } from "@/services/db/actions/exportCache";

export async function updatePageViewedAt(id: number): Promise<void> {
  const db = await getDB();
  await execute(
    db,
    "UPDATE pages SET last_viewed_at = CURRENT_TIMESTAMP, view_count = view_count + 1 WHERE id = $1",
    [id]
  );
}

export async function fetchPage(id: number): Promise<PageData | null> {
  const db = await getDB();
  const result = await select<DBPage[]>(
    db,
    "SELECT id, title, filename, lexical_json, markdown_text, view_count, last_viewed_at, created_at, archived_at FROM pages WHERE id = $1",
    [id]
  );

  if (result.length > 0) {
    const dbPage = result[0];
    return {
      id: dbPage.id,
      title: dbPage.title,
      filename: dbPage.filename,
      lexicalState: JSON.parse(dbPage.lexical_json),
      markdownText: dbPage.markdown_text,
      viewCount: dbPage.view_count,
      lastViewedAt: dbPage.last_viewed_at,
      createdAt: dbPage.created_at,
      archivedAt: dbPage.archived_at,
    };
  }
  return null;
}

export async function upsertPage(
  page: PageData,
  editorState: EditorState,
  title: string
): Promise<PageData> {
  const db = await getDB();
  const plainText = getLexicalPlainText(editorState);
  const serializedState = JSON.stringify(editorState.toJSON());

  await populatePageExportCache(editorState);
  const markdownText = getMarkdownFromEditorState(editorState);

  const filename = `${page.id}_${sanitizeFilename(title)}.md`;

  // First check if the page exists
  const exists =
    page.id !== undefined &&
    (
      await select<[{ count: number }]>(
        db,
        "SELECT COUNT(*) as count FROM pages WHERE id = $1",
        [page.id]
      )
    )[0].count > 0;

  let result;
  if (!exists) {
    // For new or non-existent pages, do a simple insert
    result = await execute(
      db,
      `INSERT INTO pages (id, title, filename, lexical_json, plain_text, markdown_text)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [page.id, title, filename, serializedState, plainText, markdownText]
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
      [page.id, title, filename, serializedState, plainText, markdownText]
    );

    if (!result.rowsAffected) {
      throw new Error("Failed to update page: " + page.id);
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

export async function queryNextPageID(): Promise<number> {
  const db = await getDB();
  const result = await select<[{ max_id: number }]>(
    db,
    "SELECT COALESCE(MAX(id), -1) as max_id FROM pages"
  );
  return result[0].max_id + 1;
}

export async function listPages(): Promise<PageData[]> {
  const db = await getDB();
  const result = await select<DBPage[]>(
    db,
    "SELECT * FROM pages WHERE archived_at IS NULL ORDER BY id ASC LIMIT 100"
  );

  return result.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    filename: dbPage.filename,
    lexicalState: JSON.parse(dbPage.lexical_json),
  }));
}

export async function getRecentPages(): Promise<PageData[]> {
  const db = await getDB();
  const result = await select<DBPage[]>(
    db,
    "SELECT * FROM pages WHERE archived_at IS NULL AND last_viewed_at IS NOT NULL ORDER BY last_viewed_at DESC"
  );

  return result.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    filename: dbPage.filename,
    lexicalState: JSON.parse(dbPage.lexical_json),
    viewCount: dbPage.view_count,
    lastViewedAt: dbPage.last_viewed_at,
    createdAt: dbPage.created_at,
  }));
}

export async function getPageTitlesByIds(
  ids: number[]
): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map();

  const db = await getDB();
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");

  const results = await select<{ id: number; title: string }[]>(
    db,
    `SELECT id, title FROM pages WHERE id IN (${placeholders})`,
    ids
  );

  const titleMap = new Map<number, string>();
  results.forEach((page) => {
    titleMap.set(page.id, page.title || `Untitled Page ${page.id}`);
  });

  return titleMap;
}

export async function deletePage(id: number): Promise<void> {
  const db = await getDB();

  // The page's tags will be automatically cleaned up due to ON DELETE CASCADE
  // The FTS index will be automatically updated due to the pages_ad trigger
  await execute(db, "DELETE FROM pages WHERE id = $1", [id]);

  // Clean up any orphaned tags that might have been created
  await cleanupOrphanedTags();
}
