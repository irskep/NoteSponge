import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { TextEditor } from "../TextEditor";
import { RemirrorJSON } from "remirror";
import { getStore } from "../store";
import { getPageKey, loadPage, PageData } from "../types";
import { OnChangeJSON } from "@remirror/react";
import { useSetAtom } from "jotai";
import { isPageEmptyAtom } from "../atoms";
import { isRemirrorEmpty } from "../utils";
import "./Page.css";

function deriveTitle(data: RemirrorJSON): string | undefined {
  if (!data.content || !data.content.length) return undefined;
  const firstNode = data.content[0];
  if (!firstNode.content || !firstNode.content.length) return undefined;
  return getTextsOfChildren(firstNode, []).join("");
}

function getTextsOfChildren(node: RemirrorJSON, parts: string[]): string[] {
  if (node.text) parts.push(node.text);
  for (const child of node.content || []) {
    getTextsOfChildren(child, parts);
  }
  return parts;
}

async function updatePage(
  page: PageData,
  remirrorJSON: RemirrorJSON
): Promise<PageData> {
  const updatedPage = { ...page };
  updatedPage.remirrorJSON = remirrorJSON;
  updatedPage.title = deriveTitle(remirrorJSON);
  return updatedPage;
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
        setIsPageEmpty(isRemirrorEmpty(pageDataOrNull.remirrorJSON));
      } else {
        setPageData({
          id,
          remirrorJSON: undefined,
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

  const handleEditorChange = useCallback(
    async (json: RemirrorJSON) => {
      if (!pageData) return;
      const updatedPage = await updatePage(pageData, json);
      await (await getStore()).set(getPageKey(id), updatedPage);
      setPageData(updatedPage);
      setIsPageEmpty(isRemirrorEmpty(json));
    },
    [pageData, id, setIsPageEmpty]
  );

  return (
    <article className={`Page ${isLoaded ? "loaded" : "loading"}`}>
      <h1>
        {id}. {pageData?.title || "Untitled"}
      </h1>
      {pageData && (
        <TextEditor
          placeholder="Enter text..."
          initialContent={pageData.remirrorJSON}
        >
          <OnChangeJSON onChange={handleEditorChange} />
        </TextEditor>
      )}
    </article>
  );
}
