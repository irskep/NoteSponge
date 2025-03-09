import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * Listen for window focus events
 * @param handler The function to call when the window gains focus
 * @returns An unlisten function to clean up the listener
 */
export async function listenToWindowFocus(
  handler: () => void
): Promise<UnlistenFn> {
  const currentWindow = getCurrentWindow();
  const unlisten = await currentWindow.listen("tauri://focus", () => {
    handler();
  });

  return unlisten;
}
