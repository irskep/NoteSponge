import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export function handleSyncMenu() {
  // https://v2.tauri.app/plugin/dialog/#open-a-file-selector-dialog
  (async function () {
    const path = await open({
      multiple: false,
      directory: true,
    });

    invoke("sync_to_directory", { path });
  })();
}
