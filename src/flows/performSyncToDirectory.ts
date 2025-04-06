import invoke from "@/bridge/ts2tauri/typedInvoke";
import { showToast } from "@/components/Toast/useToast";
import { getTauriSettingsStore } from "@/state/tauriSettingsStore";
import { open } from "@tauri-apps/plugin-dialog";

export default async function performSyncToDirectory() {
  try {
    const store = await getTauriSettingsStore();
    let syncPath: string | undefined = await store.get("sync_path");

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

    showToast("Success", "Synced to directory", { type: "background" });
  } catch (err) {
    console.error("Sync error:", err);
  }
}
