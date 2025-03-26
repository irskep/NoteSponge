// Database row types that exactly match our schema
export interface DBPage {
  id: number;
  title: string;
  filename: string;
  lexical_json: string; // Stored as JSON string in DB
  plain_text: string;
  markdown_text: string;
  view_count: number;
  last_viewed_at: string | null; // SQLite timestamp stored as string
  archived_at: string | null; // SQLite timestamp stored as string
  created_at: string; // SQLite timestamp stored as string
  updated_at: string; // SQLite timestamp stored as string
}

// Type for inserting a new page (omit auto-generated fields)
export type DBPageInsert = Omit<
  DBPage,
  | "id"
  | "view_count"
  | "last_viewed_at"
  | "archived_at"
  | "created_at"
  | "updated_at"
>;

// Type for updating an existing page
export type DBPageUpdate = Partial<DBPageInsert> & {
  id: number;
};
