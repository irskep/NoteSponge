import type { PageData, RelatedPageData } from "@/types";
import { atom } from "jotai";

// For related pages
export interface ExtendedRelatedPageData extends RelatedPageData {
  tags?: string[];
}

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
  searchMode: "navigate" | "insertLink";
}

export const modalStateAtom = atom<ModalState>({
  isSearchOpen: false,
  searchMode: "navigate",
});

export type PageMetadata = Pick<PageData, "viewCount" | "lastViewedAt" | "createdAt">;

export const pageMetadataAtom = atom<PageMetadata>({});

// Toast state atoms
export interface ToastState {
  open: boolean;
  message: string;
  title: string;
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

// Sidebar section collapse state
export interface SidebarSectionState {
  [pageId: number]: {
    [sectionTitle: string]: boolean; // true = collapsed, false = expanded
  };
}

export const sidebarSectionStateAtom = atom<SidebarSectionState>({});
