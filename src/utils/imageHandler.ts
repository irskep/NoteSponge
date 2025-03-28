import { processAndStoreImage } from "@/services/db/actions/images";
import { INSERT_IMAGE_COMMAND } from "@/components/editor/lexicalplugins/image/ImagePlugin";
import { editorStateStore, editorAtom } from "@/components/editor/state/editorStore";

export enum ImageErrorType {
  NO_FILE = "NO_FILE",
  INVALID_TYPE = "INVALID_TYPE",
  MISSING_EXTENSION = "MISSING_EXTENSION",
  EDITOR_NOT_AVAILABLE = "EDITOR_NOT_AVAILABLE",
  PROCESSING_ERROR = "PROCESSING_ERROR",
  UPLOAD_ERROR = "UPLOAD_ERROR",
}

export interface ImageProcessError {
  type: ImageErrorType;
  message: string;
  title: string;
}

export interface ImageProcessResult {
  success: boolean;
  error?: ImageProcessError;
}

export async function handleImageDrop(pageId: number, file: File): Promise<ImageProcessResult> {
  if (!file) {
    return {
      success: false,
      error: {
        type: ImageErrorType.NO_FILE,
        message: "No file provided",
        title: "Missing File",
      },
    };
  }

  if (!file.type.startsWith("image/")) {
    return {
      success: false,
      error: {
        type: ImageErrorType.INVALID_TYPE,
        message: "Only image files are supported",
        title: "Invalid File Type",
      },
    };
  }

  // Check if the file has a valid extension
  const fileExtension = file.name.split(".").pop() || "";
  if (!fileExtension) {
    return {
      success: false,
      error: {
        type: ImageErrorType.MISSING_EXTENSION,
        message: "Image file must have an extension",
        title: "Invalid File",
      },
    };
  }

  // Get the editor instance from the atom store
  const editor = editorStateStore.get(editorAtom);
  if (!editor) {
    return {
      success: false,
      error: {
        type: ImageErrorType.EDITOR_NOT_AVAILABLE,
        message: "Editor not available",
        title: "Editor Error",
      },
    };
  }

  try {
    // Process and store the image in one step
    const result = await processAndStoreImage(pageId, file);

    if ("error" in result) {
      return {
        success: false,
        error: {
          type: ImageErrorType.UPLOAD_ERROR,
          message: result.error,
          title: "Image Upload Error",
        },
      };
    }

    // Dispatch the command to insert the image with file extension
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      id: result.id,
      fileExtension: result.fileExtension,
    });

    return { success: true };
  } catch (error) {
    console.error("Error handling image drop:", error);
    return {
      success: false,
      error: {
        type: ImageErrorType.PROCESSING_ERROR,
        message: "Failed to process image",
        title: "Processing Error",
      },
    };
  }
}
