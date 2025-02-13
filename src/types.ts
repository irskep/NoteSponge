import { SerializedEditorState } from "lexical";

export interface PageData {
  id: number;
  lexicalState?: SerializedEditorState;
  title?: string;
  viewCount?: number;
  lastViewedAt?: string | null;
  createdAt?: string;
}

export interface TagData {
  id: number;
  tag: string;
  createdAt: string;
}
