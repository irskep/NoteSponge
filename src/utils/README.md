# Menu Event Utilities

This directory contains utilities for handling menu events in a consistent way across the application.

## Menu Event Handling

The `menuEvents.ts` file provides utility functions for listening to menu and window focus events in a way that:

1. Ensures the window is focused before processing events
2. Warns about duplicate menu handlers
3. Provides proper cleanup when components unmount

### Menu Event Usage

```typescript
import { useEffect } from "react";
import { listenToMenuItem } from "../utils/menuEvents";

function MyComponent() {
  useEffect(() => {
    // Set up menu listeners
    const cleanupFunctions: Array<() => void> = [];

    // Listen for a specific menu item
    listenToMenuItem("menu_item_id", (payload) => {
      // Handle the menu event
      console.log("Menu item clicked", payload);
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    // Clean up when component unmounts
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);

  return <div>{/* Component content */}</div>;
}
```

### Window Focus Event Usage

```typescript
import { useEffect } from "react";
import { listenToWindowFocus } from "../utils/menuEvents";

function MyComponent() {
  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    // Listen for window focus events
    listenToWindowFocus(() => {
      // Handle window focus
      console.log("Window gained focus");
    }).then((unlisten) => cleanupFunctions.push(unlisten));

    // Clean up when component unmounts
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);

  return <div>{/* Component content */}</div>;
}
```

### Benefits

- **Duplicate Detection**: Warns when the same menu item is registered multiple times
- **Focus Handling**: Only processes menu events when the window is focused
- **Clean Cleanup**: Properly removes listeners when components unmount
- **Minimal Overhead**: Lightweight wrapper around Tauri's event system

### Implementation Notes

This utility maintains a simple registry of menu items that are currently being handled. When a component tries to register a handler for a menu item that's already registered, it will log a warning to the console but still register the handler.

The registry is cleared when components unmount and unregister their handlers.
