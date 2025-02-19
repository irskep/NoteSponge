# DeckyWiki

This is a personal wiki built with Tauri. It differs from other personal notetaking or wiki apps in that it can automatically suggest tags using LLMs.

The intended user of this app is someone who wants to take notes, but is bad at organizing them. DeckyWiki should proactively organize on the user's behalf.

"Page" and "note" are used interchangeably.

## Technologies

- Tauri v2
- Radix UI
- Lexical text editor
- NOT TAILWIND, DO NOT ADD ANY TAILWIND TO THIS PROJECT

## Tasks

- [x] Multi-window
- [x] Settings window to configure API key
- [x] Fuzzy find by title
- [x] Search
- [x] Rich text
- [x] Tag suggestions
- [x] "New page" should open in a new window
- [ ] First-launch window should be a list of recently viewed pages instead of page zero
- [ ] Image attachments
- [ ] Maintain an outline or index using LLMs
- [ ] Show related pages at the bottom of each page

## Code organization

App.tsx is the main entry point. It controls the overall layout of the app.

Settings.tsx handles the settings window, and is created by settings.tsx and settings.html.

actions.ts contains mutation code. bootstrap_schema.ts contains the SQL schema.

src/styles/index.css contains design tokens and utility classes, and is used in most components.

In order to add a new kind of window:

1. Create a new .html file at the repo root
2. Create a corresponding .tsx file in src/, and a React component under src/components
