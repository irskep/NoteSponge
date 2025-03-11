# Sync Implementation Plan

## Menu Changes ✓

1. In `src-tauri/src/menu/builder.rs`:
   - Change `let sync = MenuItemBuilder::new("Save")` to `let sync = MenuItemBuilder::new("Sync")` ✓ (was already "Sync")

## Settings Changes ✓

1. In `src/components/settings/Settings.tsx`:
   - Add a new text field for sync_path below the API key field ✓
   - Add state management: `const [syncPath, setSyncPath] = useState("")` ✓
   - Add loading: `const syncPath = await store.get("sync_path")` in `loadApiKey()` ✓
   - Add saving: Update `handleChange` to handle both API key and sync path changes ✓
   - Add a "Browse" button next to the sync path field that opens the directory picker ✓

## Sync Logic Changes ✓

1. In `src/services/sync/index.ts`: ✓

   ```typescript
   import { Store } from "@tauri-apps/plugin-store";

   export async function handleSyncMenu() {
     const store = await Store.load("settings.json");
     let syncPath = await store.get("sync_path");

     if (!syncPath) {
       // Open directory picker
       const selectedPath = await open({
         multiple: false,
         directory: true,
       });

       if (!selectedPath) return; // User cancelled

       // Save the selected path
       await store.set("sync_path", selectedPath);
       await store.save();
       syncPath = selectedPath;
     }

     // Invoke the sync command with the path
     await invoke("sync_to_directory", { path: syncPath });
   }
   ```

2. In `src-tauri/src/commands.rs`: ✓

   ```rust
   use tauri_plugin_store::StoreExt;

   #[tauri::command]
   pub fn sync_to_directory(app_handle: tauri::AppHandle, path: String) -> Result<(), String> {
       // Load the store
       let store = app_handle.store("settings.json")
           .map_err(|e| e.to_string())?;

       // Get the sync path value
       let sync_path = store.get("sync_path")
           .map_err(|e| e.to_string())?;

       println!("Syncing to directory: {:?}", sync_path);

       // TODO: Implement actual sync logic
       Ok(())
   }
   ```

## Rust Dependencies

1. In `src-tauri/Cargo.toml`:
   - Add `tauri-plugin-store = "2"` to dependencies if not already present

## Plugin Setup

1. In `src-tauri/src/lib.rs`:
   - Add store plugin to the builder chain:
   ```rust
   .plugin(tauri_plugin_store::Builder::default().build())
   ```

## JavaScript Dependencies

1. In `package.json`:
   - Add `"@tauri-apps/plugin-store": "2.0.0"` to dependencies if not already present

## Testing Plan

1. Verify menu item text changes from "Save" to "Sync"
2. Verify settings UI shows sync path field
3. Test sync path persistence:
   - Set path via browse button
   - Close and reopen settings
   - Verify path is still there
4. Test sync behavior:
   - With no path set:
     - Click Sync
     - Verify directory picker opens
     - Verify selected path is saved
   - With path already set:
     - Click Sync
     - Verify directory picker does not open
     - Verify sync command is called with correct path
5. Verify Rust-side logging shows correct sync path
