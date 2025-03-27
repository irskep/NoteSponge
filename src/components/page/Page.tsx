import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { PageData } from "../../types";
import { useSetAtom } from "jotai";
import {
  isPageEmptyAtom,
  internalLinksAtom,
  externalLinksAtom,
} from "../../state/atoms";
import {
  deriveLexicalTitle,
  isLexicalEmpty,
  createEditorState,
  getLexicalPlainText,
  extractInternalLinks,
  extractExternalLinks,
} from "../../utils/editor";
import { LexicalTextEditor } from "../editor/LexicalTextEditor";
import { EditorState } from "lexical";
import {
  fetchPage,
  upsertPage,
  cleanupUnusedImages,
  getPageTitlesByIds,
} from "../../services/db/actions";
import { MetadataBar } from "./MetadataBar";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDebouncedCallback } from "use-debounce";
import "./Page.css";
import PageSidebar from "./PageSidebar";

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

  // Helper function to set window title consistently
  const setWindowTitle = (title: string, pageId: number) => {
    getCurrentWindow().setTitle(`#${pageId} ${title}`);
  };

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
  }, [id, setIsPageEmpty]);

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
    3000 // 3 seconds debounce
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
    500 // 500ms debounce for extracting links
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
    [page, setIsPageEmpty, debouncedUpsert, debouncedUpdateLinks]
  );

  if (!page) {
    return (
      <article
        className={`Page ${isLoaded ? "Page--loaded" : "Page--loading"}`}
      ></article>
    );
  }

  return (
    <article className={`Page ${isLoaded ? "Page--loaded" : "Page--loading"}`}>
      <div className="Page__content">
        <LexicalTextEditor
          placeholder="Enter text…"
          initialContent={page.lexicalState}
          onChange={handleLexicalChange}
          pageId={page.id}
        />
      </div>
      <PageSidebar page={page} pageContent={pageContent} />
      <div className="Page__metadata">
        <MetadataBar />
      </div>
    </article>
  );
}
