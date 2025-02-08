import { load } from "@tauri-apps/plugin-store";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;

export async function getStore() {
  if (!storeInstance) {
    storeInstance = await load("pages.json", { autoSave: 2000 });
  }
  return storeInstance;
}
