import { EditorState } from "lexical";
import { PageData } from "../types";
import { getDB } from "../db";
import { DBPage } from "./types";
import { getLexicalPlainText } from "../utils";

export function getPageKey(id: number): string {
  return `page-${id}`;
}

export async function fetchPage(id: number): Promise<PageData> {
  const db = await getDB();
  const result = await db.select<DBPage[]>(
    "SELECT * FROM pages WHERE id = $1",
    [id]
  );

  if (result.length > 0) {
    const dbPage = result[0];
    return {
      id: dbPage.id,
      title: dbPage.title,
      lexicalState: JSON.parse(dbPage.lexical_json),
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

  console.log("upsertPage", [page.id, title, serializedState, plainText]);

  // First check if the page exists
  const exists =
    page.id !== undefined &&
    (
      await db.select<[{ count: number }]>(
        "SELECT COUNT(*) as count FROM pages WHERE id = ?",
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
  const result = await db.select<[{ max_id: number }]>(
    "SELECT COALESCE(MAX(id), -1) as max_id FROM pages"
  );
  return result[0].max_id + 1;
}

export async function listPages(): Promise<PageData[]> {
  const db = await getDB();
  const result = await db.select<DBPage[]>(
    "SELECT * FROM pages WHERE archived_at IS NULL ORDER BY id ASC"
  );

  return result.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    lexicalState: JSON.parse(dbPage.lexical_json),
  }));
}

export async function searchPages(query: string): Promise<PageData[]> {
  const db = await getDB();
  const result = await db.select<DBPage[]>(
    `SELECT pages.* FROM pages
     JOIN pages_fts ON pages.id = pages_fts.rowid
     WHERE pages_fts MATCH $1 AND archived_at IS NULL
     ORDER BY rank`,
    [query]
  );

  return result.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    lexicalState: JSON.parse(dbPage.lexical_json),
  }));
}
