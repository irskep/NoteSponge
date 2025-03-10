# Focused Code Reorganization Plan for src-tauri/src

## Current Structure

Based on examination of the code, the Tauri backend consists of:

- `lib.rs`: Contains:
  - Command handlers (`update_editor_state`, `disable_editor_menus`)
  - App initialization and plugin setup (`run()`)
  - Window event handling
  - Database migration setup (`get_migrations()`)
- `menu.rs`: Contains:
  - Menu structures (`MenuItems`, `EditorState`)
  - Menu creation logic (`create_app_menu`)

## Proposed Structure

### 1. Core Files

- `lib.rs` - Remain as the main entry point, but simplified to only:
  - Import and coordinate modules
  - Set up the Tauri application
  - Register commands and event handlers

### 2. New Modules

- `src-tauri/src/menu.rs` → `src-tauri/src/menu/` with:

  - `mod.rs` - Public exports and integration
  - `state.rs` - `EditorState` struct
  - `items.rs` - `MenuItems` struct
  - `builder.rs` - Menu creation logic

- `src-tauri/src/commands.rs` - Extract command handlers:

  - `update_editor_state`
  - `disable_editor_menus`

- `src-tauri/src/db.rs` - Extract database code:
  - `get_migrations()`

### 3. Implementation Steps

1. Create the menu directory and split menu.rs into smaller files
2. Create commands.rs for command handlers
3. Create db.rs for database functions
4. Update lib.rs to use the new modules
5. Test after each step to ensure functionality is preserved
