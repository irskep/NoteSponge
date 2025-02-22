import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
} from "react";
import { PageData } from "../../types";
import { useAtom, useSetAtom } from "jotai";
import {
  isPageEmptyAtom,
  aiSuggestedTagsAtom,
  isLoadingAiTagsAtom,
} from "../../state/atoms";
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
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useDebouncedCallback } from "use-debounce";
import { suggestTags } from "../../services/ai/tagging";
import "./Page.css";
import { SuggestedTagsBar } from "../tags/SuggestedTagsBar";
import { RelatedPages } from "./RelatedPages";

interface PageProps {
  id: number | null;
}

export default function Page({ id }: PageProps) {
  const [page, setPage] = useState<PageData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const setIsPageEmpty = useSetAtom(isPageEmptyAtom);
  const [_, setAiSuggestedTags] = useAtom(aiSuggestedTagsAtom);
  const [isLoadingAiTags, setIsLoadingAiTags] = useAtom(isLoadingAiTagsAtom);
  const previousTextRef = useRef<string>("");

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
        getCurrentWindow().setTitle(pageDataOrNull?.title ?? "New page");
      });
    } else {
      setPage(null);
      setIsPageEmpty(true);
    }
  }, [id, setIsPageEmpty]);

  // Handle transition after data is loaded
  useLayoutEffect(() => {
    if (page) {
      setIsLoaded(true);
    }
  }, [page]);

  const debouncedSuggestTags = useDebouncedCallback(
    async (text: string, pageId: number | undefined) => {
      try {
        const tags = await suggestTags(text, pageId);
        setAiSuggestedTags(tags);
      } finally {
        setIsLoadingAiTags(false);
      }
    },
    3000
  );

  const handleLexicalChange = useCallback(
    async (editorState: EditorState) => {
      if (!page) return;
      const title = deriveLexicalTitle(editorState);
      const updatedPage = await upsertPage(page, editorState, title ?? "");
      setPage(updatedPage);
      setIsPageEmpty(isLexicalEmpty(editorState));
      getCurrentWindow().setTitle(page?.title ?? "New page");

      const currentText = getLexicalPlainText(editorState);
      if (currentText !== previousTextRef.current) {
        previousTextRef.current = currentText;
        setIsLoadingAiTags(true);
        debouncedSuggestTags(currentText, page.id);
      }
    },
    [page, setIsPageEmpty, debouncedSuggestTags]
  );

  return (
    <article className={`Page ${isLoaded ? "loaded" : "loading"}`}>
      <div className="page-header">
        <h1>
          {id !== null ? id + ". " : ""} {page?.title || "Untitled"}
        </h1>
        {page && <RelatedPages pageId={page.id} />}
      </div>
      {page && <TagBar pageId={page.id} />}
      {page && (
        <SuggestedTagsBar pageId={page.id} isLoading={isLoadingAiTags} />
      )}
      {page && (
        <LexicalTextEditor
          placeholder="Enter text..."
          initialContent={page.lexicalState}
          onChange={handleLexicalChange}
        />
      )}
      {page && <MetadataBar />}
    </article>
  );
}
