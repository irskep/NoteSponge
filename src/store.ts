import { load } from "@tauri-apps/plugin-store";
export const store = await load("pages.json", { autoSave: 2000 });
