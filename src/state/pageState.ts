import type { PageData } from "@/types";
import { type Atom, type PrimitiveAtom, atom } from "jotai";
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
export type PageTagAtoms = {
  tags: PrimitiveAtom<PageTags>;
  activeTags: Atom<string[] | null>;
  activeTagsWrittenToDatabase: PrimitiveAtom<string[]>;
};
export const pageTagAtoms: PageTagAtoms = {
  tags: atom<PageTags>({}),
  activeTags: atom<string[] | null>((get) => {
    const pageId = get(pageIdAtom);
    const tags = get(pageTagAtoms.tags);
    return tags[pageId] ?? null;
  }),
  activeTagsWrittenToDatabase: atom<string[]>([]),
};

// See useLoadRelatedPages.ts
export const relatedPagesAtom = atom<{ id: number; sharedTags: number }[]>([]);
export const isWindowFocusedAtom = atom(true);

export const pageCacheAtoms = {
  dirtyPageIds: atom<number[]>([]),
  pageIdsEverRequested: atom<{ [pageId: number]: boolean }>({}),
  loadedPages: atom<{ [pageId: number]: PageData }>({}),
  loadedPagesTags: atom<{ [pageId: number]: string[] }>({}),
};

/* Tags */

export const tagSearchAtoms = {
  inputValue: atom<string>(""),
  selectedIndex: atom<number | null>(null),
  isOpen: atom<boolean>(false),
  suggestions: atom<Array<{ tag: string; count: number }>>([]),
};

/* AI tag suggestions */

export type AiTagSuggestionsAtoms = {
  suggestions: PrimitiveAtom<string[] | null>;
  isLoading: PrimitiveAtom<boolean>;
  filteredSuggestions: Atom<string[] | null>;
};
export const aiTagSuggestionsAtoms: AiTagSuggestionsAtoms = {
  suggestions: atom<string[] | null>(null),
  isLoading: atom<boolean>(false),
  filteredSuggestions: atom((get) => {
    const aiSuggestions = get(aiTagSuggestionsAtoms.suggestions);
    const activePageTags = get(pageTagAtoms.activeTags) ?? [];
    return aiSuggestions?.filter((tag) => !activePageTags.includes(tag)) ?? null;
  }),
};
