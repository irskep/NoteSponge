import Database from "@tauri-apps/plugin-sql";

let dbInstance: Database | null = null;

export async function getDB() {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:notesponge.db");
  }
  return dbInstance;
}

// For cases where we need to reset the connection
export function resetDB() {
  dbInstance = null;
}
