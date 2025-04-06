import { cleanupOrphanedTags } from "@/services/db/tags";
import type { DBPage } from "@/services/db/types";
import { getDB } from "@/services/foundation/db";
import { execute, select } from "@/services/foundation/db";
import type { PageData } from "@/types";

export async function fetchPage(id: number): Promise<PageData | null> {
  const db = await getDB();
  const result = await select<DBPage[]>(
    db,
    "SELECT id, title, filename, lexical_json, markdown_text, view_count, last_viewed_at, created_at, archived_at FROM pages WHERE id = $1",
    [id],
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

export async function queryNextPageID(): Promise<number> {
  const db = await getDB();
  const result = await select<[{ max_id: number }]>(db, "SELECT COALESCE(MAX(id), -1) as max_id FROM pages");
  return result[0].max_id + 1;
}

export async function listPages(): Promise<PageData[]> {
  const db = await getDB();
  const result = await select<DBPage[]>(db, "SELECT * FROM pages WHERE archived_at IS NULL ORDER BY id ASC LIMIT 100");

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
    "SELECT * FROM pages WHERE archived_at IS NULL AND last_viewed_at IS NOT NULL ORDER BY last_viewed_at DESC",
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

export async function getPageTitlesByIds(ids: number[]): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map();

  const db = await getDB();
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");

  const results = await select<{ id: number; title: string }[]>(
    db,
    `SELECT id, title FROM pages WHERE id IN (${placeholders})`,
    ids,
  );

  const titleMap = new Map<number, string>();
  for (const page of results) {
    titleMap.set(page.id, page.title || `Untitled Page ${page.id}`);
  }

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
