/*
Example from tauri docs:

import Database from '@tauri-apps/plugin-sql';
// when using `"withGlobalTauri": true`, you may use
// const Database = window.__TAURI__.sql;

const db = await Database.load('sqlite:test.db');
await db.execute('INSERT INTO ...');

const result = await db.execute(
  "INSERT into todos (id, title, status) VALUES ($1, $2, $3)",
  [todos.id, todos.title, todos.status],
);

const result = await db.execute(
"UPDATE todos SET title = $1, status = $2 WHERE id = $3",
[todos.title, todos.status, todos.id],
);
*/
