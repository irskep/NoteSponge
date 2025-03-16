import { EditorState } from "lexical";
import { PageData } from "../../types";
import { getDB } from "./index";
import Database from "@tauri-apps/plugin-sql";
import { DBPage } from "./types";
import {
  getLexicalPlainText,
  createEditorState,
  extractImageIdsFromEditorState,
} from "../../utils/editor";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { IMAGE_TRANSFORMER } from "../../components/editor/lexicalplugins/ImageNode";

// Whenever working on this file, always check 01-initial-schema.sql!

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

async function execute(
  db: Database,
  ...args: Parameters<Database["execute"]>
): Promise<{ rowsAffected: number; lastInsertId?: number }> {
  if (log) {
    console.group("EXECUTE", ...args);
    console.log("EXECUTE", ...args);
  }
  const result = await db.execute(...args);
  if (log) {
    console.log(result);
    console.groupEnd();
  }
  return result;
}

export function getPageKey(id: number): string {
  return `page-${id}`;
}

export async function updatePageViewedAt(id: number): Promise<void> {
  const db = await getDB();
  await execute(
    db,
    "UPDATE pages SET last_viewed_at = CURRENT_TIMESTAMP, view_count = view_count + 1 WHERE id = $1",
    [id]
  );
}

export async function fetchPage(id: number): Promise<PageData> {
  const db = await getDB();
  const result = await select<DBPage[]>(
    db,
    "SELECT id, title, lexical_json, markdown_text, view_count, last_viewed_at, created_at FROM pages WHERE id = $1",
    [id]
  );

  if (result.length > 0) {
    const dbPage = result[0];
    return {
      id: dbPage.id,
      title: dbPage.title,
      lexicalState: JSON.parse(dbPage.lexical_json),
      markdownText: dbPage.markdown_text,
      viewCount: dbPage.view_count,
      lastViewedAt: dbPage.last_viewed_at,
      createdAt: dbPage.created_at,
    };
  }
  return { id };
}

function generateMarkdownFromLexical(editorState: EditorState): string {
  let markdown = "";
  editorState.read(() => {
    markdown = $convertToMarkdownString([...TRANSFORMERS, IMAGE_TRANSFORMER]);
  });
  console.log("markdown", markdown);
  return markdown;
}

export async function upsertPage(
  page: PageData,
  editorState: EditorState,
  title: string
): Promise<PageData> {
  const db = await getDB();
  const plainText = getLexicalPlainText(editorState);
  const serializedState = JSON.stringify(editorState.toJSON());
  const markdownText = generateMarkdownFromLexical(editorState);

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
      `INSERT INTO pages (id, title, lexical_json, plain_text, markdown_text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [page.id, title, serializedState, plainText, markdownText]
    );
  } else {
    // For existing pages, do an explicit update
    result = await execute(
      db,
      `UPDATE pages 
       SET title = $2,
           lexical_json = $3,
           plain_text = $4,
           markdown_text = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [page.id, title, serializedState, plainText, markdownText]
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
    ...page,
    title,
    lexicalState: editorState.toJSON(),
    markdownText,
  };
}

/**
 * Cleans up unused images for a page by comparing current images in the editor state
 * with those stored in the database. Should be called during component mount/unmount
 * rather than during edits to avoid breaking undo/redo functionality.
 */
export async function cleanupUnusedImages(pageId: number): Promise<void> {
  // First fetch the page to get its current state
  const page = await fetchPage(pageId);
  if (!page.lexicalState) {
    return;
  }

  // Create editor state and extract image IDs
  const editorState = createEditorState(page.lexicalState);
  const currentImageIds = extractImageIdsFromEditorState(editorState);

  // Now delete unused images
  await deleteUnusedImages(pageId, currentImageIds);
}

/**
 * Deletes images that are no longer used in the page
 */
async function deleteUnusedImages(
  pageId: number,
  currentImageIds: number[]
): Promise<void> {
  const db = await getDB();

  // Get all image IDs for this page
  const existingImages = await select<{ id: number }[]>(
    db,
    "SELECT id FROM image_attachments WHERE page_id = $1",
    [pageId]
  );

  // Find images that are in the database but not in the current editor state
  const unusedImageIds = existingImages
    .map((img) => img.id)
    .filter((id) => !currentImageIds.includes(id));

  if (unusedImageIds.length === 0) {
    return;
  }

  // Delete the unused images
  const placeholders = unusedImageIds.map((_, i) => `$${i + 2}`).join(", ");
  await execute(
    db,
    `DELETE FROM image_attachments 
     WHERE page_id = $1 AND id IN (${placeholders})`,
    [pageId, ...unusedImageIds]
  );

  if (log) {
    console.log(
      `Deleted ${unusedImageIds.length} unused images for page ${pageId}`
    );
  }
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
     ORDER BY last_viewed_at DESC NULLS LAST, title ASC LIMIT 100`,
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
     ORDER BY fts.rank LIMIT 100`,
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
  const result = await select<{ tag: string }[]>(
    db,
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

export async function getRecentPages(): Promise<PageData[]> {
  const db = await getDB();
  const result = await select<DBPage[]>(
    db,
    "SELECT * FROM pages WHERE archived_at IS NULL AND last_viewed_at IS NOT NULL ORDER BY last_viewed_at DESC LIMIT 10"
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

export type RelatedPageData = PageData & { sharedTags: number };

export async function getRelatedPages(
  pageId: number
): Promise<RelatedPageData[]> {
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
      GROUP BY p.id, p.title, p.lexical_json, p.view_count, p.last_viewed_at, p.created_at
      ORDER BY shared_tags DESC
      LIMIT 10
    )
    SELECT * FROM related_pages`,
    [pageId]
  );

  return results.map((dbPage) => ({
    id: dbPage.id,
    title: dbPage.title,
    lexicalState: JSON.parse(dbPage.lexical_json),
    viewCount: dbPage.view_count,
    lastViewedAt: dbPage.last_viewed_at,
    createdAt: dbPage.created_at,
    sharedTags: dbPage.shared_tags,
  }));
}

export async function deletePage(id: number): Promise<void> {
  const db = await getDB();

  // The page's tags will be automatically cleaned up due to ON DELETE CASCADE
  // The FTS index will be automatically updated due to the pages_ad trigger
  await execute(db, "DELETE FROM pages WHERE id = $1", [id]);

  // Clean up any orphaned tags that might have been created
  await cleanupOrphanedTags();
}

export async function createImageAttachment(
  pageId: number,
  mimeType: string,
  data: ArrayBuffer,
  originalFilename: string,
  fileExtension: string,
  width?: number,
  height?: number
): Promise<{ id: number; fileExtension: string } | null> {
  try {
    const db = await getDB();

    // Convert the binary data to base64 string
    const base64Data = bufferToBase64(data);

    const result = await execute(
      db,
      `INSERT INTO image_attachments (
        page_id, 
        mime_type, 
        data, 
        width, 
        height, 
        original_filename, 
        file_extension
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        pageId,
        mimeType,
        base64Data,
        width || null,
        height || null,
        originalFilename,
        fileExtension,
      ]
    );

    if (!result.lastInsertId) {
      console.error(
        `Failed to get last insert ID when creating image attachment`
      );
      return null;
    }

    return { id: result.lastInsertId, fileExtension };
  } catch (error) {
    console.error(`Error saving image attachment:`, error);
    throw error;
  }
}

export async function deleteImageAttachment(attachmentId: number) {
  const db = await getDB();
  await execute(db, `DELETE FROM image_attachments WHERE id = $1`, [
    attachmentId,
  ]);
}

export async function getImageAttachment(id: number): Promise<{
  dataUrl: string;
  width?: number;
  height?: number;
  originalFilename: string;
  fileExtension: string;
} | null> {
  const db = await getDB();

  try {
    const result = await select<
      {
        mime_type: string;
        data: string | null;
        width: number | null;
        height: number | null;
        original_filename: string | null;
        file_extension: string | null;
      }[]
    >(
      db,
      "SELECT mime_type, data, width, height, original_filename, file_extension FROM image_attachments WHERE id = ?",
      [id]
    );

    if (result.length === 0) {
      return null;
    }

    if (!result[0].data) {
      return null;
    }

    // Check if required fields are present
    if (!result[0].original_filename || !result[0].file_extension) {
      console.error(`Image attachment ${id} is missing required fields`);
      return null;
    }

    // Convert base64 data to dataURL
    const dataUrl = `data:${result[0].mime_type};base64,${result[0].data}`;

    const response: {
      dataUrl: string;
      width?: number;
      height?: number;
      originalFilename: string;
      fileExtension: string;
    } = {
      dataUrl,
      originalFilename: result[0].original_filename,
      fileExtension: result[0].file_extension,
    };

    if (result[0].width !== null) response.width = result[0].width;
    if (result[0].height !== null) response.height = result[0].height;

    return response;
  } catch (error) {
    console.error(`Error fetching image attachment with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Converts an ArrayBuffer to a base64 string
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

/**
 * Process an image file and store it in the database
 * This function handles all the steps: reading the file, getting dimensions, and storing in DB
 */
export async function processAndStoreImage(
  pageId: number,
  file: File
): Promise<{ id: number; fileExtension: string } | { error: string }> {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return { error: "Failed to read image file" };
    }

    // Extract original filename and extension
    const originalFilename = file.name;
    const fileExtension = originalFilename.split(".").pop() || "";
    if (!fileExtension) {
      return { error: "Image file must have an extension" };
    }

    // Get image dimensions
    const { width, height } = await getImageDimensions(arrayBuffer, file.type);

    // Save the image to the database
    const result = await createImageAttachment(
      pageId,
      file.type,
      arrayBuffer,
      originalFilename,
      fileExtension,
      width,
      height
    );

    if (!result) {
      return { error: "Failed to save image to database" };
    }

    return result;
  } catch (error) {
    console.error(`Error processing and storing image:`, error);
    return { error: "An unexpected error occurred while processing the image" };
  }
}

/**
 * Get the dimensions of an image from its binary data
 */
async function getImageDimensions(
  arrayBuffer: ArrayBuffer,
  mimeType: string
): Promise<{ width: number; height: number }> {
  // Create a blob URL
  const blobUrl = URL.createObjectURL(
    new Blob([arrayBuffer], { type: mimeType })
  );

  try {
    // Create an image element to get dimensions
    const img = document.createElement("img");
    img.src = blobUrl;

    // Wait for the image to load
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });

    // Return the dimensions
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
  } finally {
    // Always clean up the blob URL
    URL.revokeObjectURL(blobUrl);
  }
}
