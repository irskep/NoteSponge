import type { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function listenToWindowFocus(handler: () => void): UnlistenFn {
  const currentWindow = getCurrentWindow();
  let aborted = false;
  let unlisten = () => {
    aborted = true;
  };
  currentWindow
    .listen("tauri://focus", () => {
      if (aborted) {
        unlisten();
        return;
      }
      handler();
    })
    .then((unlisten2) => {
      if (aborted) {
        unlisten2();
        return;
      }
      unlisten = unlisten2;
    });

  return () => unlisten();
}

export function listenToWindowBlur(handler: () => void): UnlistenFn {
  const currentWindow = getCurrentWindow();
  let aborted = false;
  let unlisten = () => {
    aborted = true;
  };
  currentWindow
    .listen("tauri://blur", () => {
      if (aborted) {
        unlisten();
        return;
      }
      handler();
    })
    .then((unlisten2) => {
      if (aborted) {
        unlisten2();
        return;
      }
      unlisten = unlisten2;
    });

  return () => unlisten();
}
