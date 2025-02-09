import sqlite3
import textwrap

def execute_sql(db, sql):
    """Execute SQL and print what we're doing"""
    print("\n=== Executing SQL ===")
    print(textwrap.dedent(sql).strip())
    try:
        result = db.execute(sql)
        if result.description:  # If this was a SELECT
            rows = result.fetchall()
            if rows:
                print("\nResult:")
                for row in rows:
                    print(row)
            else:
                print("\nNo results")
        db.commit()
        print("\nSuccess!")
    except Exception as e:
        print(f"\nError: {e}")
        db.rollback()

def setup_schema(db):
    # Create the pages table
    execute_sql(db, """
        CREATE TABLE pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            plain_text TEXT NOT NULL
        );
    """)

    # Create the FTS5 virtual table
    execute_sql(db, """
        CREATE VIRTUAL TABLE pages_fts USING fts5(
            title,
            plain_text,
            content='pages',
            content_rowid='id'
        );
    """)

    # Create all the triggers
    execute_sql(db, """
        CREATE TRIGGER pages_ai AFTER INSERT ON pages BEGIN
            INSERT INTO pages_fts(rowid, title, plain_text)
            VALUES (new.id, new.title, new.plain_text);
        END;
    """)

    execute_sql(db, """
        CREATE TRIGGER pages_ad AFTER DELETE ON pages BEGIN
            INSERT INTO pages_fts(pages_fts, rowid, title, plain_text)
            VALUES('delete', old.id, old.title, old.plain_text);
        END;
    """)

    execute_sql(db, """
        CREATE TRIGGER pages_au AFTER UPDATE ON pages BEGIN
            INSERT INTO pages_fts(pages_fts, rowid, title, plain_text)
            VALUES('delete', old.id, old.title, old.plain_text);
            INSERT INTO pages_fts(rowid, title, plain_text)
            VALUES (new.id, new.title, new.plain_text);
        END;
    """)

def run_tests(db):
    # Test 1: Insert a new page
    print("\n=== Test 1: Insert a new page ===")
    execute_sql(db, """
        INSERT INTO pages (title, plain_text) 
        VALUES ('Test Page', 'This is a test page with some content');
    """)
    
    # Verify FTS index
    execute_sql(db, "SELECT * FROM pages_fts WHERE pages_fts MATCH 'test';")
    execute_sql(db, "SELECT * FROM pages;")

    # Test 2: Update the page
    print("\n=== Test 2: Update existing page ===")
    execute_sql(db, """
        UPDATE pages 
        SET title = 'Updated Test Page',
            plain_text = 'This is an updated test page'
        WHERE id = 1;
    """)
    
    # Verify FTS index after update
    execute_sql(db, "SELECT * FROM pages_fts WHERE pages_fts MATCH 'updated';")
    execute_sql(db, "SELECT * FROM pages;")

    # Test 3: Delete the page
    print("\n=== Test 3: Delete the page ===")
    execute_sql(db, "DELETE FROM pages WHERE id = 1;")
    
    # Verify FTS index after delete
    execute_sql(db, "SELECT * FROM pages_fts WHERE pages_fts MATCH 'test';")
    execute_sql(db, "SELECT * FROM pages;")

    # Test 4: Insert with specific ID
    print("\n=== Test 4: Insert with specific ID ===")
    execute_sql(db, """
        INSERT INTO pages (id, title, plain_text)
        VALUES (42, 'Page 42', 'This is page number 42');
    """)
    
    # Verify FTS index
    execute_sql(db, "SELECT * FROM pages_fts WHERE pages_fts MATCH '42';")
    execute_sql(db, "SELECT * FROM pages;")

    # Test 5: Update with same ID
    print("\n=== Test 5: Update page keeping same ID ===")
    execute_sql(db, """
        UPDATE pages 
        SET title = 'Still Page 42',
            plain_text = 'This is still page number 42, but updated'
        WHERE id = 42;
    """)
    
    # Verify FTS index
    execute_sql(db, "SELECT * FROM pages_fts WHERE pages_fts MATCH 'still';")
    execute_sql(db, "SELECT * FROM pages;")

def main():
    # Use in-memory database for testing
    db = sqlite3.connect(":memory:")
    
    try:
        setup_schema(db)
        run_tests(db)
    finally:
        db.close()

if __name__ == "__main__":
    main()
