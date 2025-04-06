import type { DBPage } from "@/dbcalls/types";
import { getDB } from "@/services/foundation/db";
import { select } from "@/services/foundation/db";
import type { RelatedPageData } from "@/types";

export async function getRelatedPages(pageId: number): Promise<RelatedPageData[]> {
  const db = await getDB();
  const results = await select<(DBPage & { shared_tags: number })[]>(
    db,
    `WITH current_page_tags AS (
      SELECT t.tag 
      FROM tag_associations ta
      JOIN tags t ON t.id = ta.tag_id
      WHERE ta.page_id = $1
    ),
    related_pages AS (
      SELECT 
        p.id,
        p.title,
        p.filename,
        p.lexical_json,
        p.view_count,
        p.last_viewed_at,
        p.created_at,
        COUNT(*) as shared_tags
      FROM pages p
      JOIN tag_associations ta ON p.id = ta.page_id
      JOIN tags t ON t.id = ta.tag_id
      WHERE 
        t.tag IN (SELECT tag FROM current_page_tags)
        AND p.id != $1
      GROUP BY p.id, p.title, p.filename, p.lexical_json, p.view_count, p.last_viewed_at, p.created_at
      ORDER BY shared_tags DESC
      LIMIT 10
    )
    SELECT * FROM related_pages`,
    [pageId],
  );

  return results.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    filename: dbPage.filename,
    lexicalState: JSON.parse(dbPage.lexical_json),
    viewCount: dbPage.view_count,
    lastViewedAt: dbPage.last_viewed_at,
    createdAt: dbPage.created_at,
    sharedTags: dbPage.shared_tags,
  }));
}
