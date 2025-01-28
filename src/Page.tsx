import { useCallback, useEffect, useState } from "react";
import { WysiwygEditor } from "@remirror/react-editors/wysiwyg";
import { RemirrorJSON } from "remirror";
import { store } from "./store";
import { getPageKey, loadPage, PageData } from "./types";
import { OnChangeJSON } from "@remirror/react";

async function updatePage(
  page: PageData,
  remirrorJSON: RemirrorJSON
): Promise<PageData | null> {
  page.remirrorJSON = remirrorJSON;
  page.title = deriveTitle(remirrorJSON);
  return page;
}

function deriveTitle(data: RemirrorJSON): string | undefined {
  if (!data.content || !data.content.length) return undefined;
  return getTextsOfChildren(data.content[0], []).join("");
}

function getTextsOfChildren(node: RemirrorJSON, parts: string[]): string[] {
  if (node.text) parts.push(node.text);
  for (const child of node.content || []) {
    getTextsOfChildren(child, parts);
  }
  return parts;
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
  }, []);

  const handleEditorChange = useCallback(
    (json: RemirrorJSON) => {
      if (!pageData) return;
      // YOLO async order
      store.set(getPageKey(id), updatePage(pageData, json));
    },
    [pageData]
  );

  return (
    <article className="Page">
      {pageData?.title ? (
        <h1>
          {id}. {pageData.title}
        </h1>
      ) : (
        <h1>{id}</h1>
      )}
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
