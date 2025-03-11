import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
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
  await invoke("sync_to_directory");
}
