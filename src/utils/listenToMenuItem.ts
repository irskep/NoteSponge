import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

// Simple registry to track which menu items are already being handled
const menuRegistry = new Map<string, { cleanup: () => void; id: number }>();

/**
 * Register a handler for a menu item, ensuring no duplicates and only responding when window is focused
 * @param menuId The ID of the menu item to listen for
 * @param handler The function to call when the menu item is activated
 * @returns An unlisten function to clean up the listener
 */
export function listenToMenuItem(
  menuId: string,
  handler: (payload: any) => void
): () => void {
  /*
  This function may be called many times in quick succession due to
  the React lifecycle, and calls an async function, but is not async.

  The approach used to deal with race conditions is:
  1. Last call wins
  2. Store previous calls so we can cancel them
  3. Identify calls by random numbers
  */

  if (menuRegistry.has(menuId)) {
    // console.warn(
    //   `Warning: Menu item "${menuId}" already has a handler registered.`
    // );
    menuRegistry.get(menuId)!.cleanup();
    menuRegistry.delete(menuId);
  }

  const id = Math.random();
  let cleanupFunctions: Array<() => void> = [() => menuRegistry.delete(menuId)];

  const cleanup = () => {
    cleanupFunctions.forEach((unlisten) => unlisten());
    cleanupFunctions = [];
  };

  menuRegistry.set(menuId, { cleanup, id });

  const currentWindow = getCurrentWindow();
  listen("tauri://menu", async (event) => {
    // Check if window is focused before processing menu events
    const isFocused = await currentWindow.isFocused();
    if (!isFocused) return;

    const payload = event.payload as { id?: string } | string;

    // Handle both object payloads with id property and string payloads
    const eventId = typeof payload === "string" ? payload : payload.id;

    if (eventId === menuId) {
      handler(payload);
    }
  }).then((unlisten) => {
    if (menuRegistry.has(menuId) && menuRegistry.get(menuId)!.id !== id) {
      // Race condition: listenToMenuItem was called again before
      // listen() finished
      unlisten();
      cleanup();
    } else {
      cleanupFunctions.push(() => {
        unlisten();
      });
    }
  });

  return cleanup;
}
