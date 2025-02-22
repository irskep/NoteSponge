# NoteSponge data model

NoteSponge is a wiki of "notes." Each page in the wiki is intended to be short, and to be correlated with other pages using a web of tags.

The defining feature of NoteSponge is that tags are guessed by an LLM as the user types, and that users can quickly search for pages using a hotkey which shows a modal with rich search results.

It is meant to be a knowledge base that requires no initial setup or conscious ongoing organization. It could theoretically be used as a personal RAG system for asking an LLM about personal notes.

NoteSponge data is stored in SQLite, but can also be exported as and imported from a well-defined JSON format.

There is no page hierarchy.

## Page

- ID (primary key, auto-incremented)
- Title (derived from Lexical JSON)
- Lexical JSON
- Plain text (for full text search, derived from Lexical JSON)
- Created at, updated at, last viewed at
- Archived at (null if not archived)

## Tags

Tag fields:

- ID (primary key, auto-incremented)
- Tag (unique, string)

Tag association (tag-to-page):

- Page ID (foreign key, references pages)
- Tag ID (foreign key, references tags)

Once in a while, we should query for any tags with no page associations, and delete them.
