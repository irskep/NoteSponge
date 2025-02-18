import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { PageData } from "../../types";
import { useSetAtom } from "jotai";
import { isPageEmptyAtom } from "../../state/atoms";
import {
  deriveLexicalTitle,
  isLexicalEmpty,
  createEditorState,
  getLexicalPlainText,
} from "../../utils";
import { LexicalTextEditor } from "../editor/LexicalTextEditor";
import { EditorState } from "lexical";
import { fetchPage, upsertPage } from "../../services/db/actions";
import { MetadataBar } from "./MetadataBar";
import { TagBar } from "../tags/TagBar";
import { SuggestedTagsBar } from "../tags/SuggestedTagsBar";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDebouncedCallback } from "use-debounce";
import { suggestTags } from "../../services/ai/tagging";
import "./Page.css";

export default function Page({ id }: { id: number }) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[] | null>(null);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
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
      getCurrentWindow().setTitle(pageDataOrNull?.title ?? "New page");
    });
  }, [id, setIsPageEmpty]);

  // Handle transition after data is loaded
  useLayoutEffect(() => {
    if (pageData) {
      setIsLoaded(true);
    }
  }, [pageData]);

  const debouncedSuggestTags = useDebouncedCallback(
    async (editorState: EditorState) => {
      try {
        const tags = await suggestTags(
          getLexicalPlainText(editorState),
          pageData?.id
        );
        setSuggestedTags(tags);
      } finally {
        setIsLoadingTags(false);
      }
    },
    3000
  );

  const handleLexicalChange = useCallback(
    async (editorState: EditorState) => {
      if (!pageData) return;
      const title = deriveLexicalTitle(editorState);
      const updatedPage = await upsertPage(pageData, editorState, title ?? "");
      setPageData(updatedPage);
      setIsPageEmpty(isLexicalEmpty(editorState));
      getCurrentWindow().setTitle(pageData?.title ?? "New page");
      setIsLoadingTags(true);
      debouncedSuggestTags(editorState);
    },
    [pageData, setIsPageEmpty, debouncedSuggestTags]
  );

  return (
    <article className={`Page ${isLoaded ? "loaded" : "loading"}`}>
      <h1>
        {id}. {pageData?.title || "Untitled"}
      </h1>
      {pageData && <TagBar pageId={pageData.id} />}
      {pageData && (
        <SuggestedTagsBar
          pageId={pageData.id}
          suggestedTags={suggestedTags}
          isLoading={isLoadingTags}
        />
      )}
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
