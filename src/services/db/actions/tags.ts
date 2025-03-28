import { getDB } from "@/services/db/index";
import { PageData } from "@/types";
import { DBPage } from "@/services/db/types";
import { select, execute } from "@/services/db/actions/db";

export async function getPageTags(pageId: number): Promise<string[]> {
  const db = await getDB();
  const result = await select<{ tag: string }[]>(
    db,
    `SELECT t.tag 
     FROM tags t
     JOIN tag_associations ta ON ta.tag_id = t.id
     WHERE ta.page_id = $1
     ORDER BY (
       SELECT COUNT(*) 
       FROM tag_associations ta2 
       WHERE ta2.tag_id = t.id
     ) DESC, t.tag`,
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
    await execute(db, "DELETE FROM tag_associations WHERE page_id = $1", [
      pageId,
    ]);
    return;
  }

  const db = await getDB();
  const lowerTags = tags.map((t) => t.toLowerCase());

  // Insert all tags in a single statement
  await execute(
    db,
    `INSERT OR IGNORE INTO tags (tag) VALUES ${lowerTags
      .map((_, i) => `($${i + 1})`)
      .join(", ")}`,
    lowerTags
  );

  // Get the IDs of all tags we want to set
  const tagIds = await select<{ id: number }[]>(
    db,
    `SELECT id FROM tags WHERE tag IN (${lowerTags
      .map((_, i) => `$${i + 1}`)
      .join(", ")})
    ORDER BY tag`, // Ensure consistent order
    lowerTags
  );

  // Remove all existing associations for this page
  await execute(db, "DELETE FROM tag_associations WHERE page_id = $1", [
    pageId,
  ]);

  if (tagIds.length === 0) {
    return;
  }

  // Prepare values array first to ensure correct parameter count
  const values = tagIds.flatMap(({ id }) => [pageId, id]);

  // Add all new associations in a single statement
  await execute(
    db,
    `INSERT INTO tag_associations (page_id, tag_id) 
     VALUES ${tagIds
       .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
       .join(", ")}`,
    values
  );
}

export async function findPagesByTag(tag: string): Promise<PageData[]> {
  const db = await getDB();
  const result = await select<DBPage[]>(
    db,
    `SELECT DISTINCT p.* 
     FROM pages p
     JOIN tag_associations ta ON ta.page_id = p.id
     JOIN tags t ON t.id = ta.tag_id
     WHERE t.tag = $1
     ORDER BY p.title
     LIMIT 100`,
    [tag.toLowerCase()]
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

export async function fuzzyFindTags(
  query: string
): Promise<{ tag: string; count: number }[]> {
  const db = await getDB();
  // Convert query 'abc' into '%a%b%c%' pattern
  const fuzzyQuery = "%" + query.toLowerCase().split("").join("%") + "%";

  return await select<{ tag: string; count: number }[]>(
    db,
    `SELECT t.tag, COUNT(DISTINCT ta.page_id) as count
     FROM tags t
     LEFT JOIN tag_associations ta ON ta.tag_id = t.id
     WHERE t.tag LIKE $1
     GROUP BY t.id, t.tag
     ORDER BY count DESC, t.tag ASC
     LIMIT 100`,
    [fuzzyQuery]
  );
}

export async function getPopularTags(): Promise<
  { tag: string; count: number }[]
> {
  const db = await getDB();
  return await select<{ tag: string; count: number }[]>(
    db,
    `SELECT t.tag, COUNT(*) as count
     FROM tags t
     JOIN tag_associations ta ON ta.tag_id = t.id
     GROUP BY t.id, t.tag
     ORDER BY count DESC, t.tag
     LIMIT 100`
  );
}

export async function getAllTags(): Promise<string[]> {
  const db = await getDB();
  const results = await select<{ tag: string }[]>(
    db,
    "SELECT DISTINCT tag FROM tags ORDER BY tag ASC"
  );
  return results.map((r) => r.tag);
}

export async function cleanupOrphanedTags(): Promise<number> {
  const db = await getDB();
  const result = await execute(
    db,
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
