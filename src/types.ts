import { SerializedEditorState } from "lexical";

export interface PageData {
  id: number;
  lexicalState?: SerializedEditorState;
  title?: string;
  viewCount?: number;
  lastViewedAt?: string;
  createdAt?: string;
}
