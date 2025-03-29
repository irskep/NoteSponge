import type { PageData } from "@/types";
import { atom } from "jotai";
import { atomWithLazy } from "jotai/utils";

function getPageId(): number {
  const urlParams = new URLSearchParams(window.location.search);
  const pageIdParam = urlParams.get("page");
  if (!pageIdParam) throw new Error("No page ID found");
  const numericPageId = Number.parseInt(pageIdParam, 10);
  if (Number.isNaN(numericPageId)) throw new Error("Invalid page ID");
  return numericPageId;
}

export const activePageAtom = atomWithLazy<PageData>(() => {
  return { id: getPageId() };
});
export const pageIdAtom = atom((get) => get(activePageAtom).id);
export const isBootedAtom = atom(false);

// Any page state loaded from sqlite (no UI state, just ground truth)
export type PageTags = {
  [pageId: number]: string[];
};
export const pageTagsAtom = atom<PageTags>({});
export const activePageTagsAtom = atom<string[] | null>((get) => {
  const pageId = get(pageIdAtom);
  const tags = get(pageTagsAtom);
  return tags[pageId] ?? null;
});
// Same as pageTagsAtom, but only updated after a write
export const activePageTagsWrittenToDatabaseAtom = atom<string[]>([]);
export const relatedPagesAtom = atom<{ id: number; sharedTags: number }[]>([]);

export const isWindowFocusedAtom = atom(true);

export const dirtyPageIdsAtom = atom<number[]>([]);
export const pageIdsEverRequestedAtom = atom<{ [pageId: number]: boolean }>({});
export const loadedPagesAtom = atom<{ [pageId: number]: PageData }>({});

export const loadedPagesTagsAtom = atom<{ [pageId: number]: string[] }>({});
