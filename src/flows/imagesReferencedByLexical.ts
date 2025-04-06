import { deleteUnusedImages } from "@/dbcalls/images";
import { fetchPage } from "@/dbcalls/pages";
import { createEditorState } from "@/featuregroups/texteditor/editorStateHelpers";
import { $isImageNode } from "@/featuregroups/texteditor/plugins/images/ImageNode";
import { $getRoot, $isElementNode, type EditorState } from "lexical";

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
 * Extracts all image IDs from a Lexical editor state
 */
function extractImageIdsFromEditorState(editorState: EditorState): number[] {
  const imageIds: number[] = [];

  editorState.read(() => {
    const root = $getRoot();

    // Recursive function to traverse the editor tree
    // biome-ignore lint/suspicious/noExplicitAny: stfu
    const traverseNodes = (node: any) => {
      if ($isImageNode(node)) {
        imageIds.push(node.getId());
      }

      if ($isElementNode(node)) {
        const children = node.getChildren();
        for (const child of children) {
          traverseNodes(child);
        }
      }
    };

    traverseNodes(root);
  });

  return imageIds;
}
