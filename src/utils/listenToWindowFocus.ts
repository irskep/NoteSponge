import type { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { type DependencyList, useEffect } from "react";

/**
 * Listen for window focus events
 * @param handler The function to call when the window gains focus
 * @returns An unlisten function to clean up the listener
 */
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

export function useWindowFocus(handler: () => void, deps?: DependencyList) {
  useEffect(() => {
    return listenToWindowFocus(handler);
  }, [handler, ...(deps ?? [])]);
}
