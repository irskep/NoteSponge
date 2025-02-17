<!--
Relevant files:
- bootstrap_schema.ts
- actions.ts
- Page.tsx
- TagBar.tsx
-->

# AI tagging design

As the user types, we should use an LLM to automatically add tags to the page.

ALL changes should be in TypeScript except to implement any menus.

## New LLM tagging service

A new service under src/services/llm will be required which can:

1. Authenticate with Anthropic, perhaps using @tauri-apps/plugin-store for API key storage (Docs here: https://v2.tauri.app/plugin/store/)
2. Implement a function for getting tag suggestions based on page content (using @anthropic-ai/sdk; docs here https://docs.anthropic.com/en/docs/initial-setup)

## UI changes

### Tag suggestions

The tag suggestions should be displayed in a draft state until the user accepts them. TagBar should be updated so that suggestions are shown after any existing tags. Clicking the tag should accept it, and clicking the X should reject it.

### Settings menu

There needs to be a Settings menu (see menu.rs) which opens in its own window and has a field for the user's Anthropic API key.
