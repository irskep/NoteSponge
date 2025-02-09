import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { getStore } from "../store";
import { getPageKey, loadPage, PageData } from "../types";
import { useSetAtom } from "jotai";
import { isPageEmptyAtom } from "../atoms";
import { deriveLexicalTitle, isLexicalEmpty } from "../utils";
import { LexicalTextEditor } from "./LexicalTextEditor";
import { EditorState } from "lexical";
import { createEditor } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import "./Page.css";

async function updatePageLexical(
  page: PageData,
  editorState: EditorState
): Promise<PageData> {
  const updatedPage = { ...page };
  // We need to serialize the editor state before storing it
  updatedPage.lexicalState = editorState.toJSON();
  updatedPage.title = deriveLexicalTitle(editorState);
  return updatedPage;
}

function createConfiguredEditor() {
  const editor = createEditor({
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
  });
  return editor;
}

export default function Page({ id }: { id: number }) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const setIsPageEmpty = useSetAtom(isPageEmptyAtom);

  // Initial load
  useEffect(() => {
    setIsLoaded(false);
    loadPage(id).then((pageDataOrNull) => {
      if (pageDataOrNull) {
        setPageData(pageDataOrNull as PageData);
        // Check editor state for emptiness
        const isEmpty = pageDataOrNull.lexicalState
          ? isLexicalEmpty(
              createConfiguredEditor().parseEditorState(
                pageDataOrNull.lexicalState
              )
            )
          : true;
        setIsPageEmpty(isEmpty);
      } else {
        setPageData({
          id,
          lexicalState: undefined,
          tags: [],
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
      const updatedPage = await updatePageLexical(pageData, editorState);
      await (await getStore()).set(getPageKey(id), updatedPage);
      setPageData(updatedPage);
      setIsPageEmpty(isLexicalEmpty(editorState));
    },
    [pageData, id, setIsPageEmpty]
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
    </article>
  );
}
