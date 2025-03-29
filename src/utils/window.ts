import { getCurrentWindow } from "@tauri-apps/api/window";

export function setWindowTitle(title: string) {
  getCurrentWindow().setTitle(title);
}
