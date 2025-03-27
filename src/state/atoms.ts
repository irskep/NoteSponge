import { atom } from "jotai";
import { PageData, RelatedPageData } from "../types";

export const isPageEmptyAtom = atom<boolean>(true);
export const isDatabaseBootstrappedAtom = atom<boolean>(false);

export interface TagState {
  tags: string[];
}

export const tagStateAtom = atom<TagState>({
  tags: [],
});

// For tag input autocomplete suggestions
export const tagSuggestionsAtom = atom<Array<{ tag: string; count: number }>>(
  []
);
export const tagInputValueAtom = atom<string>("");
export const tagSelectedIndexAtom = atom<number | null>(null);
export const isTagPopoverOpenAtom = atom<boolean>(false);

// For AI-suggested tags
export const aiSuggestedTagsAtom = atom<string[] | null>(null);
export const isLoadingAiTagsAtom = atom<boolean>(false);

// Derived atom that filters out removed tags from AI suggestions
export const filteredAiSuggestionsAtom = atom((get) => {
  const aiSuggestions = get(aiSuggestedTagsAtom);
  const { tags } = get(tagStateAtom);
  return aiSuggestions?.filter((tag) => !tags.includes(tag)) ?? null;
});

export const currentPageIdAtom = atom<number | null>(null);

// For related pages
export interface ExtendedRelatedPageData extends RelatedPageData {
  tags?: string[];
}

export const relatedPagesAtom = atom<ExtendedRelatedPageData[]>([]);
export const relatedPagesErrorAtom = atom<string | null>(null);

// For outbound links
export interface InternalLinkInfo {
  pageId: number;
  title: string; // Page title
  instances: Array<{
    text: string; // Link text
    nodeKey: string;
  }>;
}

export interface ExternalLinkInfo {
  url: string;
  instances: Array<{
    text: string; // Link text
    nodeKey: string;
  }>;
}

export const internalLinksAtom = atom<InternalLinkInfo[]>([]);
export const externalLinksAtom = atom<ExternalLinkInfo[]>([]);

export interface ModalState {
  isSearchOpen: boolean;
}

export const modalStateAtom = atom<ModalState>({
  isSearchOpen: false,
});

export type PageMetadata = Pick<
  PageData,
  "viewCount" | "lastViewedAt" | "createdAt"
>;

export const pageMetadataAtom = atom<PageMetadata>({});

// Toast state atoms
export interface ToastState {
  open: boolean;
  message: string;
  title?: string;
  /**
   * Toast appearance type:
   * - "foreground": High contrast, attention-grabbing toast for important notifications
   * - "background": Subtle, lower contrast toast for non-critical information
   */
  type?: "foreground" | "background";
  /**
   * Duration in milliseconds the toast should remain visible
   * Default: 3000ms (3 seconds)
   */
  duration?: number;
}

export const toastStateAtom = atom<ToastState>({
  open: false,
  message: "",
  title: "Notification",
  type: "foreground",
  duration: 3000,
});
