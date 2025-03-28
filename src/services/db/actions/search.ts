import { select } from "@/services/db/actions/db";
import { getDB } from "@/services/db/index";
import type { DBPage } from "@/services/db/types";
import type { PageData } from "@/types";

export async function fuzzyFindPagesByTitle(query: string): Promise<PageData[]> {
  const db = await getDB();
  // Convert query 'abc' into '%a%b%c%' pattern
  const fuzzyQuery = `%${query.split("").join("%")}%`;

  const results = await select<DBPage[]>(
    db,
    `SELECT *
     FROM pages
     WHERE title LIKE $1
     AND archived_at IS NULL
     ORDER BY last_viewed_at DESC NULLS LAST, title ASC LIMIT 100`,
    [fuzzyQuery],
  );

  return results.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    filename: dbPage.filename,
    lexicalState: JSON.parse(dbPage.lexical_json),
  }));
}

export async function searchPages(query: string, titleOnly = false): Promise<PageData[]> {
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
     ORDER BY fts.rank LIMIT 100`,
    [sqliteQuery],
  );

  return results.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    filename: dbPage.filename,
    lexicalState: JSON.parse(dbPage.lexical_json),
  }));
}
