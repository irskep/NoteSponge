import { LexicalTextEditor } from "@/components/editor/LexicalTextEditor";
import { MetadataBar } from "@/components/page/MetadataBar";
import PageSidebar from "@/components/page/PageSidebar";
import ResizeHandle from "@/components/page/ResizeHandle";
import { ImageDropTarget } from "@/components/shared/ImageDropTarget/ImageDropTarget";
import { useToast } from "@/hooks/useToast";
import { upsertPage } from "@/services/db/actions/pageWrites";
import { fetchPage, getPageTitlesByIds } from "@/services/db/actions/pages";
import { cleanupUnusedImages } from "@/services/images";
import { getSidebarWidth, setSidebarWidth } from "@/services/sidebar";
import { externalLinksAtom, internalLinksAtom, isPageEmptyAtom } from "@/state/atoms";
import type { PageData } from "@/types";
import { createEditorState, deriveLexicalTitle, getLexicalPlainText, isLexicalEmpty } from "@/utils/editor";
import { extractExternalLinks, extractInternalLinks } from "@/utils/editorLinks";
import { handleImageDrop } from "@/utils/imageHandler";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSetAtom } from "jotai";
import type { EditorState } from "lexical";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import "./Page.css";

interface PageProps {
  id: number;
}

export default function Page({ id }: PageProps) {
  // TODO: don't load the entire page here, just make sure it exists,
  // and then load the lexical state on demand.
  const [page, setPage] = useState<PageData | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const setIsPageEmpty = useSetAtom(isPageEmptyAtom);
  const setInternalLinks = useSetAtom(internalLinksAtom);
  const setExternalLinks = useSetAtom(externalLinksAtom);
  const [pageContent, setPageContent] = useState("");
  const [sidebarWidth, setSidebarWidthState] = useState(260); // Default width from PageSidebar.css
  const [hasResized, setHasResized] = useState(false);
  const { showToast } = useToast();

  // Helper function to set window title consistently
  const setWindowTitle = useCallback((title: string, pageId: number) => {
    getCurrentWindow().setTitle(`#${pageId} ${title}`);
  }, []);

  // Initial load
  useEffect(() => {
    setIsLoaded(false);
    if (id !== null) {
      fetchPage(id).then((pageDataOrNull) => {
        if (pageDataOrNull) {
          setPage(pageDataOrNull as PageData);
          // Check editor state for emptiness
          const isEmpty = pageDataOrNull.lexicalState
            ? isLexicalEmpty(createEditorState(pageDataOrNull.lexicalState))
            : true;
          setIsPageEmpty(isEmpty);
        } else {
          setPage({
            id,
            lexicalState: undefined,
          });
          setIsPageEmpty(true);
        }
        setWindowTitle(pageDataOrNull?.title ?? "New page", id);
      });
    } else {
      setPage(null);
      setIsPageEmpty(true);
    }
  }, [id, setIsPageEmpty, setWindowTitle]);

  // Load stored sidebar width
  useEffect(() => {
    if (id !== null) {
      getSidebarWidth(id)
        .then((width) => {
          setSidebarWidthState(width);
        })
        .catch((err) => {
          console.error("Failed to load sidebar width:", err);
        });
    }
  }, [id]);

  // Clean up unused images when component is mounted
  useEffect(() => {
    if (id !== null) {
      // Clean up unused images when the page is loaded
      cleanupUnusedImages(id).catch((err) => {
        console.error("Failed to clean up unused images:", err);
      });

      // Clean up unused images when the component is unmounted or page changes
      return () => {
        // TODO: This doesn't work because the web view is already gone by the time this would run.
        // Listen in the main window for close events instead and do it there.
        cleanupUnusedImages(id).catch((err) => {
          console.error("Failed to clean up unused images on unmount:", err);
        });
      };
    }
  }, [id]);

  // Handle transition after data is loaded
  useLayoutEffect(() => {
    if (page) {
      setIsLoaded(true);
    }
  }, [page]);

  // Debounced upsert function
  const debouncedUpsert = useDebouncedCallback(
    async (pageData: PageData, editorState: EditorState, title: string) => {
      // Just persist to database without updating local state
      await upsertPage(pageData, editorState, title);
    },
    3000, // 3 seconds debounce
  );

  // Debounced function to update link data
  const debouncedUpdateLinks = useDebouncedCallback(
    async (editorState: EditorState) => {
      // Extract internal and external links
      const internalLinks = extractInternalLinks(editorState);
      const externalLinks = extractExternalLinks(editorState);

      // For internal links, fetch their titles
      if (internalLinks.length > 0) {
        const pageIds = internalLinks.map((link) => link.pageId);
        const titleMap = await getPageTitlesByIds(pageIds);

        // Update titles in the links data
        const updatedInternalLinks = internalLinks.map((link) => ({
          ...link,
          title: titleMap.get(link.pageId) || `Page ${link.pageId}`,
        }));

        setInternalLinks(updatedInternalLinks);
      } else {
        setInternalLinks([]);
      }

      // Update external links
      setExternalLinks(externalLinks);
    },
    500, // 500ms debounce for extracting links
  );

  const handleLexicalChange = useCallback(
    (editorState: EditorState) => {
      if (!page) {
        setWindowTitle("New page", id);
        return;
      }
      const title = deriveLexicalTitle(editorState);

      // Update UI immediately
      setIsPageEmpty(isLexicalEmpty(editorState));
      setWindowTitle(title ?? "New page", page.id);
      setPageContent(getLexicalPlainText(editorState));

      // Create updated page for UI consistency
      const updatedPage = {
        ...page,
        title: title ?? "",
        lexicalState: editorState.toJSON(),
      };

      // Update local state immediately
      setPage(updatedPage);

      // Debounce the database update
      debouncedUpsert(updatedPage, editorState, title ?? "");

      // Update outbound links with debouncing
      debouncedUpdateLinks(editorState);
    },
    [page, setIsPageEmpty, debouncedUpsert, debouncedUpdateLinks, id, setWindowTitle],
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

      if (id === null || !file) return;

      const result = await handleImageDrop(id, file);

      if (!result.success && result.error) {
        showToast(result.error.title, result.error.message);
      }
    },
    [id, showToast],
  );

  // Save the sidebar width when it changes due to user interaction
  useEffect(() => {
    if (id !== null && hasResized) {
      setSidebarWidth(id, sidebarWidth).catch((err) => {
        console.error("Failed to save sidebar width:", err);
      });
    }
  }, [id, sidebarWidth, hasResized]);

  if (!page) {
    return <article className={`Page ${isLoaded ? "Page--loaded" : "Page--loading"}`} />;
  }

  return (
    <ImageDropTarget onImageDrop={handleImageProcessing}>
      <article className={`Page ${isLoaded ? "Page--loaded" : "Page--loading"}`}>
        <div className="Page__content">
          <LexicalTextEditor
            placeholder="Enter text…"
            initialContent={page.lexicalState}
            onChange={handleLexicalChange}
            pageId={page.id}
          />
          <ResizeHandle onResize={handleResize} />
        </div>
        <PageSidebar page={page} pageContent={pageContent} style={{ width: `${sidebarWidth}px` }} />
        <div className="Page__metadata">
          <MetadataBar />
        </div>
      </article>
    </ImageDropTarget>
  );
}
