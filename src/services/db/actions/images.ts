import { getDB } from "../index";
import { select, execute } from "./db";
import { bufferToBase64 } from "./utils";
import { extractImageIdsFromEditorState } from "../../../utils/editor";
import { createEditorState } from "../../../utils/editor";
import { fetchPage } from "./pages";

/**
 * Cleans up unused images for a page by comparing current images in the editor state
 * with those stored in the database. Should be called during component mount/unmount
 * rather than during edits to avoid breaking undo/redo functionality.
 */
export async function cleanupUnusedImages(pageId: number): Promise<void> {
  // First fetch the page to get its current state
  const page = await fetchPage(pageId);
  if (!page || !page.lexicalState) {
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
