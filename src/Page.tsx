import { useCallback, useEffect, useState } from "react";
import { WysiwygEditor } from "@remirror/react-editors/wysiwyg";
import { RemirrorJSON } from "remirror";
import { store } from "./store";
import { getPageKey, loadPage, PageData } from "./types";
import { OnChangeJSON } from "@remirror/react";

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

  // Initial load
  useEffect(() => {
    loadPage(id).then((pageDataOrNull) => {
      if (pageDataOrNull) {
        setPageData(pageDataOrNull as PageData);
      } else {
        setPageData({
          id,
          remirrorJSON: undefined,
          tags: [],
        });
      }
    });
  }, [id]);

  const handleEditorChange = useCallback(
    async (json: RemirrorJSON) => {
      if (!pageData) return;
      const updatedPage = await updatePage(pageData, json);
      await store.set(getPageKey(id), updatedPage);
      setPageData(updatedPage);
    },
    [pageData, id]
  );

  return (
    <article className="Page">
      <h1>
        {id}. {pageData?.title ? ` ${pageData.title}` : " Untitled"}
      </h1>
      {pageData ? (
        <WysiwygEditor
          placeholder="Enter text..."
          initialContent={pageData.remirrorJSON}
        >
          <OnChangeJSON onChange={handleEditorChange} />
        </WysiwygEditor>
      ) : null}
    </article>
  );
}
