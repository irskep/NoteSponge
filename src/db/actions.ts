import { SerializedEditorState } from "lexical";
import { PageData } from "../types";
import { getDB } from "../db";
import { DBPage, DBPageInsert } from "./types";
import { createEditorState, getLexicalPlainText } from "../utils";
import { DatabaseError, withRetry, withTransaction } from "./utils";

export function getPageKey(id: number): string {
  return `page-${id}`;
}

export async function fetchPage(id: number): Promise<PageData> {
  return withRetry(async () => {
    const db = await getDB();
    try {
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
      } else {
        return { id };
      }
    } catch (error) {
      throw new DatabaseError(
        `Failed to fetch page ${id}`,
        error
      );
    }
  });
}

export async function upsertPage(
  page: PageData,
  editorState: SerializedEditorState,
  title: string
): Promise<PageData> {
  return withRetry(async () => {
    const db = await getDB();
    const state = createEditorState(editorState);
    const plainText = getLexicalPlainText(state);

    return withTransaction(db, async () => {
      if (page.id === undefined) {
        const newPage: DBPageInsert = {
          title,
          lexical_json: JSON.stringify(editorState),
          plain_text: plainText,
        };

        const result = await db.select<[{ id: number }]>(
          "INSERT INTO pages (title, lexical_json, plain_text) VALUES ($1, $2, $3) RETURNING id",
          [newPage.title, newPage.lexical_json, newPage.plain_text]
        );
        page.id = result[0].id;
      } else {
        await db.execute(
          "UPDATE pages SET title = $1, lexical_json = $2, plain_text = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
          [title, JSON.stringify(editorState), plainText, page.id]
        );
      }

      return {
        id: page.id,
        title,
        lexicalState: editorState,
      };
    });
  });
}

export async function queryNextPageID(): Promise<number> {
  return withRetry(async () => {
    const db = await getDB();
    try {
      const result = await db.select<[{ max_id: number }]>(
        "SELECT COALESCE(MAX(id), -1) as max_id FROM pages"
      );
      return result[0].max_id + 1;
    } catch (error) {
      throw new DatabaseError(
        "Failed to query next page ID",
        error
      );
    }
  });
}

export async function listPages(): Promise<PageData[]> {
  return withRetry(async () => {
    const db = await getDB();
    try {
      const result = await db.select<DBPage[]>(
        "SELECT * FROM pages WHERE archived_at IS NULL ORDER BY id ASC"
      );
      
      return result.map(dbPage => ({
        id: dbPage.id,
        title: dbPage.title,
        lexicalState: JSON.parse(dbPage.lexical_json)
      }));
    } catch (error) {
      throw new DatabaseError(
        "Failed to list pages",
        error
      );
    }
  });
}

export async function searchPages(query: string): Promise<PageData[]> {
  return withRetry(async () => {
    const db = await getDB();
    try {
      const result = await db.select<DBPage[]>(
        `SELECT pages.* FROM pages
         JOIN pages_fts ON pages.id = pages_fts.rowid
         WHERE pages_fts MATCH $1 AND archived_at IS NULL
         ORDER BY rank`,
        [query]
      );
      
      return result.map(dbPage => ({
        id: dbPage.id,
        title: dbPage.title,
        lexicalState: JSON.parse(dbPage.lexical_json)
      }));
    } catch (error) {
      throw new DatabaseError(
        `Failed to search pages with query: ${query}`,
        error
      );
    }
  });
}
