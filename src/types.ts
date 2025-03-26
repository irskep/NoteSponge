import { SerializedEditorState } from "lexical";

export interface PageData {
  id: number;
  lexicalState?: SerializedEditorState;
  title?: string;
  filename?: string;
  markdownText?: string;
  viewCount?: number;
  lastViewedAt?: string | null;
  createdAt?: string;
  archivedAt?: string | null;
}

export interface TagData {
  id: number;
  tag: string;
  createdAt: string;
}

export type RelatedPageData = PageData & { sharedTags: number };
