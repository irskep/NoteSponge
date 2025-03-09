import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

// Simple registry to track which menu items are already being handled
const registeredMenuItems = new Set<string>();

/**
 * Register a handler for a menu item, ensuring no duplicates and only responding when window is focused
 * @param menuId The ID of the menu item to listen for
 * @param handler The function to call when the menu item is activated
 * @returns An unlisten function to clean up the listener
 */
export async function listenToMenuItem(
  menuId: string,
  handler: (payload: any) => void
): Promise<UnlistenFn> {
  if (registeredMenuItems.has(menuId)) {
    console.warn(
      `Warning: Menu item "${menuId}" already has a handler registered.`
    );
  }

  registeredMenuItems.add(menuId);

  const currentWindow = getCurrentWindow();
  const unlisten = await listen("tauri://menu", async (event) => {
    // Check if window is focused before processing menu events
    const isFocused = await currentWindow.isFocused();
    if (!isFocused) return;

    const payload = event.payload as { id?: string } | string;

    // Handle both object payloads with id property and string payloads
    const eventId = typeof payload === "string" ? payload : payload.id;

    if (eventId === menuId) {
      handler(payload);
    }
  });

  // Return a wrapped unlisten function that also removes from registry
  return () => {
    registeredMenuItems.delete(menuId);
    unlisten();
  };
}

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
