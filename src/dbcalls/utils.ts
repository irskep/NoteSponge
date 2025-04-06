/**
 * Get a unique key for a page based on its ID
 */
export function getPageKey(id: number): string {
  return `page-${id}`;
}

/**
 * Sanitizes a filename by removing invalid characters
 */
export function sanitizeFilename(filename: string): string {
  const invalidChars = /[/\\:" ]/g;
  return filename.replace(invalidChars, "_");
}

/**
 * Converts an ArrayBuffer to a base64 string
 */
export function bufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}
