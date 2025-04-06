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
const log = false;

export async function select<T>(db: Database, ...args: Parameters<Database["select"]>): Promise<T> {
  if (log) {
    console.group("SELECT", ...args);
    console.log("SELECT", ...args);
  }
  const results = await db.select<T>(...args);
  if (log) {
    console.log(results);
    console.groupEnd();
  }
  return results;
}

export type ExecuteResult = {
  rowsAffected: number;
  lastInsertId?: number;
};

export async function execute(db: Database, ...args: Parameters<Database["execute"]>): Promise<ExecuteResult> {
  if (log) {
    console.group("EXECUTE", ...args);
    console.log("EXECUTE", ...args);
  }
  const result = await db.execute(...args);
  if (log) {
    console.log(result);
    console.groupEnd();
  }
  return result;
}
