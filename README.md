# NoteSponge

This is a personal wiki built with Tauri. It differs from other personal notetaking or wiki apps in that it can automatically suggest tags using LLMs.

The intended user of this app is someone who wants to take notes, but is bad at organizing them. NoteSponge should proactively organize on the user's behalf.

The intended user of this README is an LLM who is working on NoteSponge.

"Page" and "note" are used interchangeably.

## Concepts

- The user is expected to just start typing without thinking. Organization is for later.
- Tags are for clustering. Tags are not expected to be comprehensive.
- There will be a decimal system layer that all notes fit into.

## Technologies

- Tauri v2
- Radix UI
- Lexical text editor
- NOT TAILWIND, DO NOT ADD ANY TAILWIND TO THIS PROJECT

## Tasks (definitely)

- [ ] Custom context menu (ugh)
- [ ] Let users formalize note relationships
  - parent/child, peer
- [ ] Right click image to delete
- [ ] Canonical note URLs; right click to copy from everywhere
- [ ] Fix toasts being unstyled
- [ ] Maintain an outline or index or decimal system or zettelkasten using LLMs
- [ ] Notes may be fleeting or permanent - expiration date?

## Tasks (maybe)

- [ ] Let user set a "relevancy date" for the note to resurface
- [ ] Store LLM interpretations of images in a separate table
- [ ] Graph notes created per day and total notes over time
- [ ] Let user import text or markdown files from their computer, by selecting an individual file or a directory to scan
- [ ] Markdown conversion & sync should happen on a background thread
- [ ] Write an MCP server in Rust which can do RAG on notes

## Architecture problems

- Overloaded "store" - Tauri store vs Jotai store
- There are 3 ways to use an atom: editorStore, getDefaultStore(), no-store
  - I should just always use one store
- DatabasePageLink demonstrates everything wrong with my data flow strategy

## Code organization

actions.ts contains mutation code. bootstrap_schema.ts contains the SQL schema.

src/styles/index.css contains design tokens and utility classes, and is used in most components.

In order to add a new kind of window:

1. Create a new .html file at the repo root
2. Create a corresponding .tsx file in src/, and a React component under src/components

The database schema is defined in Rust using SQLite migrations. The source of truth for the schema is in `src-tauri/migrations/01-initial-schema.sql`. SQLite PRAGMAs are set in the Rust code in `src-tauri/src/lib.rs`.

## Inspiration

- https://zettelkasten.de/introduction/
- https://johnnydecimal.com/
