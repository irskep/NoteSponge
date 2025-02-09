import { EditorState, SerializedEditorState } from "lexical";
import { PageData } from "../types";
import { getDB } from "../db";
import { DBPage } from "./types";
import { createEditorState, getLexicalPlainText } from "../utils";

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
  console.log(
    "upsertPage",
    page,
    editorState.toJSON(),
    title,
    getLexicalPlainText(editorState)
  );
  const db = await getDB();
  const plainText = getLexicalPlainText(editorState);

  if (page.id === undefined) {
    const result = await db.execute(
      `
      BEGIN;
      INSERT INTO pages (title, lexical_json, plain_text)
      VALUES ($1, $2, $3)
      RETURNING id;
      COMMIT;`,
      [title, JSON.stringify(editorState), plainText]
    );
    if (!result.lastInsertId) {
      throw new Error("Failed to insert page");
    }
    page.id = result.lastInsertId;
  } else {
    // Check if the page exists first
    const exists = await db.select<[{ count: number }]>(
      "SELECT COUNT(*) as count FROM pages WHERE id = $1",
      [page.id]
    );

    if (exists[0].count === 0) {
      // Page doesn't exist, do an insert with the specified ID
      await db.execute(
        `
        BEGIN;
        INSERT INTO pages (id, title, lexical_json, plain_text)
        VALUES ($1, $2, $3, $4);
        COMMIT;`,
        [page.id, title, JSON.stringify(editorState), plainText]
      );
    } else {
      // Page exists, do an update
      await db.execute(
        `
        BEGIN;
        UPDATE pages 
        SET title = $1, 
            lexical_json = $2, 
            plain_text = $3, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $4;
        COMMIT;`,
        [title, JSON.stringify(editorState.toJSON()), plainText, page.id]
      );
    }
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
