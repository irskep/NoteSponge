import { EditorState } from "lexical";
import { PageData } from "../types";
import { getDB } from "../db";
import Database from "@tauri-apps/plugin-sql";
import { DBPage } from "./types";
import { getLexicalPlainText } from "../utils";

// Whenever working on this file, always check bootstrap_schema.ts!

const log = false;

async function select<T>(
  db: Database,
  ...args: Parameters<Database["select"]>
): Promise<T> {
  if (log) {
    console.group("SELECT", ...args);
    console.log("SELECT", ...args);
  }
  const results = await db.select<T>(...args);
  if (log) {
    console.log(results);
    console.groupEnd();
  }
  return results;
}

export function getPageKey(id: number): string {
  return `page-${id}`;
}

export async function updatePageViewedAt(id: number): Promise<void> {
  const db = await getDB();
  await db.execute(
    "UPDATE pages SET last_viewed_at = CURRENT_TIMESTAMP, view_count = view_count + 1 WHERE id = $1",
    [id]
  );
}

export async function fetchPage(id: number): Promise<PageData> {
  const db = await getDB();
  const result = await db.select<DBPage[]>(
    "SELECT id, title, lexical_json, view_count, last_viewed_at, created_at FROM pages WHERE id = $1",
    [id]
  );

  if (result.length > 0) {
    const dbPage = result[0];
    return {
      id: dbPage.id,
      title: dbPage.title,
      lexicalState: JSON.parse(dbPage.lexical_json),
      viewCount: dbPage.view_count,
      lastViewedAt: dbPage.last_viewed_at,
      createdAt: dbPage.created_at,
    };
  }
  return { id };
}

export async function upsertPage(
  page: PageData,
  editorState: EditorState,
  title: string
): Promise<PageData> {
  const db = await getDB();
  const plainText = getLexicalPlainText(editorState);
  const serializedState = JSON.stringify(editorState.toJSON());

  // First check if the page exists
  const exists =
    page.id !== undefined &&
    (
      await db.select<[{ count: number }]>(
        "SELECT COUNT(*) as count FROM pages WHERE id = $1",
        [page.id]
      )
    )[0].count > 0;

  let result;
  if (!exists) {
    // For new or non-existent pages, do a simple insert
    result = await db.execute(
      `INSERT INTO pages (id, title, lexical_json, plain_text)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [page.id, title, serializedState, plainText]
    );
  } else {
    // For existing pages, do an explicit update
    result = await db.execute(
      `UPDATE pages 
       SET title = $2,
           lexical_json = $3,
           plain_text = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [page.id, title, serializedState, plainText]
    );

    if (!result.rowsAffected) {
      throw new Error("Failed to update page: " + page.id);
    }
  }

  if (page.id !== result.lastInsertId) {
    console.warn(
      "Page id was",
      page.id,
      "but result ID is",
      result.lastInsertId
    );
  }

  return {
    id: page.id,
    title,
    lexicalState: editorState.toJSON(),
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
    "SELECT * FROM pages WHERE archived_at IS NULL ORDER BY id ASC"
  );

  return result.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    lexicalState: JSON.parse(dbPage.lexical_json),
  }));
}

export async function fuzzyFindPagesByTitle(
  query: string
): Promise<PageData[]> {
  const db = await getDB();
  // Convert query 'abc' into '%a%b%c%' pattern
  const fuzzyQuery = "%" + query.split("").join("%") + "%";

  const results = await select<DBPage[]>(
    db,
    `SELECT *
     FROM pages
     WHERE title LIKE $1
     AND archived_at IS NULL
     ORDER BY last_viewed_at DESC NULLS LAST, title ASC`,
    [fuzzyQuery]
  );

  return results.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    lexicalState: JSON.parse(dbPage.lexical_json),
  }));
}

export async function searchPages(
  query: string,
  titleOnly: boolean = false
): Promise<PageData[]> {
  const sqliteQuery = titleOnly ? `title:${query}` : query;
  const db = await getDB();

  const results = await select<DBPage[]>(
    db,
    `SELECT p.*, fts.rank
     FROM pages p
     JOIN (
       SELECT rowid, rank
       FROM pages_fts
       WHERE pages_fts MATCH $1
     ) AS fts ON p.id = fts.rowid
     WHERE p.archived_at IS NULL
     ORDER BY fts.rank`,
    [sqliteQuery]
  );

  return results.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    lexicalState: JSON.parse(dbPage.lexical_json),
  }));
}

// Tag management functions

export async function getPageTags(pageId: number): Promise<string[]> {
  const db = await getDB();
  const result = await db.select<{ tag: string }[]>(
    `SELECT t.tag 
     FROM tags t
     JOIN tag_associations ta ON ta.tag_id = t.id
     WHERE ta.page_id = $1
     ORDER BY t.tag`,
    [pageId]
  );
  return result.map((r) => r.tag);
}

export async function setPageTags(
  pageId: number,
  tags: string[]
): Promise<void> {
  if (tags.length === 0) {
    const db = await getDB();
    await db.execute("DELETE FROM tag_associations WHERE page_id = $1", [pageId]);
    return;
  }

  const db = await getDB();
  const lowerTags = tags.map((t) => t.toLowerCase());

  // Insert all tags in a single statement
  await db.execute(
    `INSERT OR IGNORE INTO tags (tag) VALUES ${lowerTags
      .map((_, i) => `($${i + 1})`)
      .join(", ")}`,
    lowerTags
  );

  // Get the IDs of all tags we want to set
  const tagIds = await db.select<{ id: number }[]>(
    `SELECT id FROM tags WHERE tag IN (${lowerTags
      .map((_, i) => `$${i + 1}`)
      .join(", ")})
    ORDER BY tag`,  // Ensure consistent order
    lowerTags
  );

  // Remove all existing associations for this page
  await db.execute("DELETE FROM tag_associations WHERE page_id = $1", [pageId]);

  if (tagIds.length === 0) {
    return;
  }

  // Prepare values array first to ensure correct parameter count
  const values = tagIds.flatMap(({ id }) => [pageId, id]);
  
  // Add all new associations in a single statement
  await db.execute(
    `INSERT INTO tag_associations (page_id, tag_id) 
     VALUES ${tagIds.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")}`,
    values
  );
}

export async function searchByTag(tag: string): Promise<PageData[]> {
  const db = await getDB();
  const result = await db.select<DBPage[]>(
    `SELECT DISTINCT p.* 
     FROM pages p
     JOIN tag_associations ta ON ta.page_id = p.id
     JOIN tags t ON t.id = ta.tag_id
     WHERE t.tag = $1
     ORDER BY p.title`,
    [tag.toLowerCase()]
  );

  return result.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    lexicalState: JSON.parse(dbPage.lexical_json),
    viewCount: dbPage.view_count,
    lastViewedAt: dbPage.last_viewed_at,
    createdAt: dbPage.created_at,
  }));
}

export async function getPopularTags(
  limit: number = 10
): Promise<{ tag: string; count: number }[]> {
  const db = await getDB();
  return await db.select<{ tag: string; count: number }[]>(
    `SELECT t.tag, COUNT(*) as count
     FROM tags t
     JOIN tag_associations ta ON ta.tag_id = t.id
     GROUP BY t.id, t.tag
     ORDER BY count DESC, t.tag
     LIMIT $1`,
    [limit]
  );
}

export async function cleanupOrphanedTags(): Promise<number> {
  const db = await getDB();
  const result = await db.execute(
    `DELETE FROM tags 
     WHERE id IN (
       SELECT t.id 
       FROM tags t
       LEFT JOIN tag_associations ta ON ta.tag_id = t.id
       WHERE ta.page_id IS NULL
     )`
  );
  return result.rowsAffected;
}
