import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { PageData } from "../types";
import { useSetAtom } from "jotai";
import { isPageEmptyAtom } from "../atoms";
import {
  deriveLexicalTitle,
  isLexicalEmpty,
  createEditorState,
} from "../utils";
import { LexicalTextEditor } from "./LexicalTextEditor";
import { EditorState } from "lexical";
import { fetchPage, upsertPage } from "../db/actions";
import { MetadataBar } from "./MetadataBar";
import "./Page.css";

export default function Page({ id }: { id: number }) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const setIsPageEmpty = useSetAtom(isPageEmptyAtom);

  // Initial load
  useEffect(() => {
    setIsLoaded(false);
    fetchPage(id).then((pageDataOrNull) => {
      if (pageDataOrNull) {
        setPageData(pageDataOrNull as PageData);
        // Check editor state for emptiness
        const isEmpty = pageDataOrNull.lexicalState
          ? isLexicalEmpty(createEditorState(pageDataOrNull.lexicalState))
          : true;
        setIsPageEmpty(isEmpty);
      } else {
        setPageData({
          id,
          lexicalState: undefined,
        });
        setIsPageEmpty(true);
      }
    });
  }, [id, setIsPageEmpty]);

  // Handle transition after data is loaded
  useLayoutEffect(() => {
    if (pageData) {
      setIsLoaded(true);
    }
  }, [pageData]);

  const handleLexicalChange = useCallback(
    async (editorState: EditorState) => {
      if (!pageData) return;
      const title = deriveLexicalTitle(editorState);
      const updatedPage = await upsertPage(pageData, editorState, title ?? "");
      setPageData(updatedPage);
      setIsPageEmpty(isLexicalEmpty(editorState));
    },
    [pageData, setIsPageEmpty]
  );

  return (
    <article className={`Page ${isLoaded ? "loaded" : "loading"}`}>
      <h1>
        {id}. {pageData?.title || "Untitled"}
      </h1>
      {pageData && (
        <LexicalTextEditor
          placeholder="Enter text..."
          initialContent={pageData.lexicalState}
          onChange={handleLexicalChange}
        />
      )}
      {pageData && <MetadataBar pageData={pageData} />}
    </article>
  );
}
