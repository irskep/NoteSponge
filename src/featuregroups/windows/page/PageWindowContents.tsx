import { ImageDropTarget } from "@/components/shared/ImageDropTarget/ImageDropTarget";
import { MetadataBar } from "@/featuregroups/metadatabar/MetadataBar";
import PageSidebar from "@/featuregroups/sidebar/PageSidebar";
import ResizeHandle from "@/featuregroups/sidebar/ResizeHandle";
import { LexicalTextEditor } from "@/featuregroups/texteditor/LexicalTextEditor";
import { useToast } from "@/hooks/useToast";
import { getSidebarWidth, setSidebarWidth } from "@/services/sidebar";
import { debouncedEditorStateAtom } from "@/state/editorState";
import { activePageAtom, isBootedAtom, pageIdAtom } from "@/state/pageState";
import { handleImageDrop } from "@/utils/imageHandler";
import { useAtomValue, useSetAtom } from "jotai";
import type { EditorState } from "lexical";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import "./PageWindowContents.css";

export default function PageWindowContents() {
  const pageId = useAtomValue(pageIdAtom);
  const [sidebarWidth, setSidebarWidthState] = useState(260); // Default width from PageSidebar.css
  const [hasResized, setHasResized] = useState(false);
  const { showToast } = useToast();
  const setDebouncedEditorState = useSetAtom(debouncedEditorStateAtom);

  const activePage = useAtomValue(activePageAtom);
  const isBooted = useAtomValue(isBootedAtom);

  // Load stored sidebar width
  useEffect(() => {
    if (pageId !== null) {
      getSidebarWidth(pageId)
        .then((width) => {
          setSidebarWidthState(width);
        })
        .catch((err) => {
          console.error("Failed to load sidebar width:", err);
        });
    }
  }, [pageId]);

  const updateDebouncedEditorState = useDebouncedCallback((editorState: EditorState) => {
    setDebouncedEditorState(editorState);
  }, 500);

  const handleLexicalChange = useCallback(
    (editorState: EditorState) => {
      updateDebouncedEditorState(editorState);
    },
    [updateDebouncedEditorState],
  );

  const handleResize = useCallback((clientX: number) => {
    // Get the page element's position
    const pageRect = document.querySelector(".Page")?.getBoundingClientRect();
    if (!pageRect) return;

    // Calculate new width ensuring it stays within reasonable limits
    const newWidth = Math.max(
      100, // Min width
      Math.min(
        500, // Max width
        pageRect.right - clientX,
      ),
    );

    setSidebarWidthState(newWidth);
    setHasResized(true);
  }, []);

  // Handler for image drops and errors
  const handleImageProcessing = useCallback(
    async (file: File | null, error?: { title: string; message: string }) => {
      // If we got an error directly from the drop target
      if (!file && error) {
        showToast(error.title, error.message);
        return;
      }

      if (pageId === null || !file) return;

      const result = await handleImageDrop(pageId, file);

      if (!result.success && result.error) {
        showToast(result.error.title, result.error.message);
      }
    },
    [pageId, showToast],
  );

  // Save the sidebar width when it changes due to user interaction
  useEffect(() => {
    if (pageId !== null && hasResized) {
      setSidebarWidth(pageId, sidebarWidth).catch((err) => {
        console.error("Failed to save sidebar width:", err);
      });
    }
  }, [pageId, sidebarWidth, hasResized]);

  if (!isBooted) {
    return <article className="PageWindowContents PageWindowContents--loading" />;
  }

  return (
    <ImageDropTarget onImageDrop={handleImageProcessing}>
      <article className="PageWindowContents PageWindowContents--loaded">
        <div className="PageWindowContents__content">
          <LexicalTextEditor
            placeholder="Enter text…"
            initialContent={activePage.lexicalState}
            onChange={handleLexicalChange}
          />
          <ResizeHandle onResize={handleResize} />
        </div>
        <PageSidebar style={{ width: `${sidebarWidth}px` }} />
        <div className="PageWindowContents__metadata">
          <MetadataBar />
        </div>
      </article>
    </ImageDropTarget>
  );
}
