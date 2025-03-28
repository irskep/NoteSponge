# NoteSponge Project Guidelines

## Technologies
- Tauri v2 (Safari + Chromium based browsers only, never Firefox)
- Radix UI, specifically Radix Themes
- Lexical text editor
- NO TAILWIND - do not add any Tailwind to this project

## Key Files
- App.tsx: Main entry point, controls overall app layout
- Settings.tsx: Handles settings window (created by settings.tsx and settings.html)
- Database schema: Defined in `src-tauri/migrations/01-initial-schema.sql`
- SQLite PRAGMAs: Set in `src-tauri/src/lib.rs`
- Styles: Design tokens and utility classes in src/styles/index.css

## Useful Commands
- TypeScript validation: `bun run tsc`
- Exhaustive TypeScript lint: `bun run biome check src`
- Rust validation: `bun run cargo-check`
- Full validation (rarely needed): `bun run tauri build --no-bundle`

## CSS Guidelines
- Use colors in index.css preferentially, with Radix colors as a second option
- Use the latest Safari features (not Chrome or Firefox)
- Use nested CSS syntax with WHATWG spec (& { ... })
- Use BEM naming for CSS adjacent to React components
- Root React component class should match component name
- When writing CSS for Radix and Lexical frameworks, prefer to use CSS selectors and their baked-in class names; only introduce custom CSS class names when necessary

## Communication Guidelines
- After making changes, just say "done"
- Be concise in responses
- Never explain why changes are good
- Avoid summarizing code
- Only point out things not obvious from reading the code
- Make targeted changes (<200 lines when possible)
- Avoid incidental refactors
- Check before changing overall approach