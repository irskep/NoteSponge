import { SerializedEditorState } from "lexical";
import { getStore } from "../store";
import { PageData } from "../types";

export function getPageKey(id: number): string {
  return `page-${id}`;
}

export async function fetchPage(id: number): Promise<PageData> {
  const store = await getStore();
  if (await store.has(getPageKey(id))) {
    const pageFromStore: undefined | Partial<PageData> = (await store.get(
      getPageKey(id)
    )) as PageData;
    return {
      id,
      ...pageFromStore,
    };
  } else {
    return {
      id,
    };
  }
}

export async function upsertPage(
  page: PageData,
  editorState: SerializedEditorState,
  title: string
): Promise<PageData> {
  const updatedPage = { ...page };
  updatedPage.lexicalState = editorState;
  updatedPage.title = title;
  const store = await getStore();
  await store.set(getPageKey(page.id), updatedPage);
  return updatedPage;
}

export async function queryNextPageID(): Promise<number> {
  const store = await getStore();
  const allKeys = await store.keys();
  const pageKeys = allKeys.filter((key) => key.startsWith("page-"));
  const pageIds = pageKeys.map((key) => parseInt(key.replace("page-", "")));

  if (pageIds.length === 0) return 0;
  return Math.max(...pageIds) + 1;
}
