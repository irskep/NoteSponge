import { RemirrorJSON } from "remirror";
import { store } from "./store";

export interface PageData {
  id: number;
  remirrorJSON?: RemirrorJSON;
  title?: string;
  tags: string[];
}

export function getPageKey(id: number) {
  return `page-${id}`;
}

export async function loadPage(id: number): Promise<PageData> {
  if (await store.has(getPageKey(id))) {
    const pageFromStore: undefined | Partial<PageData> = (await store.get(
      getPageKey(id)
    )) as PageData;
    return {
      id,
      tags: [],
      ...pageFromStore,
    };
  } else {
    return {
      id,
      tags: [],
    };
  }
}

export async function getNextPageId(): Promise<number> {
  const allKeys = await store.keys();
  const pageKeys = allKeys.filter(key => key.startsWith('page-'));
  const pageIds = pageKeys.map(key => parseInt(key.replace('page-', '')));
  
  if (pageIds.length === 0) return 0;
  return Math.max(...pageIds) + 1;
}
