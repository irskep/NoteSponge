import Database from "@tauri-apps/plugin-sql";
import { bootstrapSchema } from "./db/bootstrap_schema";

let dbInstance: Database | null = null;

export async function getDB() {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:deckywiki.db");
    await bootstrapSchema(dbInstance);
  }
  return dbInstance;
}

// For cases where we need to reset the connection
export function resetDB() {
  dbInstance = null;
}
