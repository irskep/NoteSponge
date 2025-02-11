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
