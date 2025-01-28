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
