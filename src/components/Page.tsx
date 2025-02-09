import { useCallback, useEffect, useLayoutEffect, useState } from "react";
// import { TextEditor } from "./TextEditor";
import { RemirrorJSON } from "remirror";
import { getStore } from "../store";
import { getPageKey, loadPage, PageData } from "../types";
// import { OnChangeJSON } from "@remirror/react";
import { useSetAtom } from "jotai";
import { isPageEmptyAtom } from "../atoms";
import {
  deriveLexicalTitle,
  deriveTitle,
  isLexicalEmpty,
  isRemirrorEmpty,
} from "../utils";
import { LexicalTextEditor } from "./LexicalTextEditor";
import { EditorState } from "lexical";
import { createEditor } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import "./Page.css";

// Legacy Remirror update function
async function updatePageRemirror(
  page: PageData,
  remirrorJSON: RemirrorJSON
): Promise<PageData> {
  const updatedPage = { ...page };
  updatedPage.remirrorJSON = remirrorJSON;
  updatedPage.title = deriveTitle(remirrorJSON);
  return updatedPage;
}

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
        // Check either editor state for emptiness
        const isEmpty = pageDataOrNull.lexicalState
          ? isLexicalEmpty(
              createConfiguredEditor().parseEditorState(
                pageDataOrNull.lexicalState
              )
            )
          : isRemirrorEmpty(pageDataOrNull.remirrorJSON);
        setIsPageEmpty(isEmpty);
      } else {
        setPageData({
          id,
          remirrorJSON: undefined,
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

  // Legacy Remirror change handler
  const handleRemirrorChange = useCallback(
    async (json: RemirrorJSON) => {
      if (!pageData) return;
      const updatedPage = await updatePageRemirror(pageData, json);
      await (await getStore()).set(getPageKey(id), updatedPage);
      setPageData(updatedPage);
      setIsPageEmpty(isRemirrorEmpty(json));
    },
    [pageData, id, setIsPageEmpty]
  );

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
      {/* Legacy Remirror editor, kept for reference
      {pageData && (
        <TextEditor
          placeholder="Enter text..."
          initialContent={pageData.remirrorJSON}
        >
          <OnChangeJSON onChange={handleRemirrorChange} />
        </TextEditor>
      )} */}
    </article>
  );
}
