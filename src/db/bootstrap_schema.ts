import Database from "@tauri-apps/plugin-sql";

export async function bootstrapSchema(db: Database) {
  console.log("BOOTSTRAP");

  await db.execute(`
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 1000000000;
PRAGMA foreign_keys = true;
PRAGMA temp_store = memory;
    `);

  // Create the pages table
  await db.execute(`
        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            lexical_json TEXT NOT NULL,
            plain_text TEXT NOT NULL,
            view_count INTEGER NOT NULL DEFAULT 0,
            last_viewed_at TIMESTAMP NULL,
            archived_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

  // Create the FTS5 virtual table for full-text search
  await db.execute(`
        CREATE VIRTUAL TABLE IF NOT EXISTS pages_fts USING fts5(
            title,
            plain_text,
            content='',
            contentless_delete=1  -- Enable proper DELETE/UPDATE support
        );
    `);

  // Create triggers to keep the FTS index up to date
  await db.execute(`
        CREATE TRIGGER IF NOT EXISTS pages_ai AFTER INSERT ON pages BEGIN
            INSERT INTO pages_fts(rowid, title, plain_text)
            VALUES (new.id, new.title, new.plain_text);
        END;
    `);

  await db.execute(`
        CREATE TRIGGER IF NOT EXISTS pages_ad AFTER DELETE ON pages BEGIN
            DELETE FROM pages_fts WHERE rowid = old.id;
        END;
    `);

  await db.execute(`
        CREATE TRIGGER IF NOT EXISTS pages_au AFTER UPDATE ON pages BEGIN
            INSERT OR REPLACE INTO pages_fts(rowid, title, plain_text)
            VALUES (new.id, new.title, new.plain_text);
        END;
    `);

  // Create trigger to update the updated_at timestamp
  await db.execute(`
        CREATE TRIGGER IF NOT EXISTS pages_update_timestamp
        AFTER UPDATE ON pages
        BEGIN
            UPDATE pages
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.id;
        END;
    `);

  // Create trigger to update view_count when last_viewed_at is updated
  await db.execute(`
        CREATE TRIGGER IF NOT EXISTS pages_update_view_stats
        AFTER UPDATE OF last_viewed_at ON pages
        WHEN NEW.last_viewed_at IS NOT NULL AND NEW.last_viewed_at != OLD.last_viewed_at
        BEGIN
            UPDATE pages
            SET view_count = view_count + 1
            WHERE id = NEW.id;
        END;
    `);
}
