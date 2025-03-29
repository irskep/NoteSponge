import { load } from "@tauri-apps/plugin-store";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;

export async function getTauriSettingsStore() {
  if (!storeInstance) {
    storeInstance = await load("settings.json", { autoSave: 2000 });
  }
  return storeInstance;
}
