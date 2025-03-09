import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

/**
 * Opens the settings window. If it already exists, brings it to focus.
 */
export async function openSettingsWindow() {
  const existingSettings = await WebviewWindow.getByLabel("settings");
  if (existingSettings) {
    await existingSettings.setFocus();
    return;
  }

  new WebviewWindow("settings", {
    url: "settings.html",
    title: "Settings",
    width: 400,
    height: 200,
    resizable: false,
  });
}

/**
 * Opens a page in a new window. If a window for this page already exists,
 * it will be focused instead of creating a new one.
 */
export async function openPageWindow(id: number) {
  const myWindow = WebviewWindow.getCurrent();
  const windowLabel = `page_${id}`;

  const existingWindow = await WebviewWindow.getByLabel(windowLabel);
  if (existingWindow) {
    await existingWindow.setFocus();
    return;
  }

  const url = `page.html?page=${id}`;
  const activePos = await myWindow.outerPosition();

  new WebviewWindow(windowLabel, {
    url,
    title: `Loading page ${id}`,
    width: 800,
    height: 600,
    x: activePos.x / 2 + 40,
    y: activePos.y / 2 + 40,
    dragDropEnabled: false,
  });
}

/**
 * Closes a page window if it exists.
 */
export async function closePageWindow(id: number): Promise<void> {
  const windowLabel = `page_${id}`;
  const existingWindow = await WebviewWindow.getByLabel(windowLabel);
  if (existingWindow) {
    await existingWindow.close();
  }
}

/**
 * Opens the Recent Pages window. If it already exists, brings it to focus.
 */
export async function openRecentPagesWindow() {
  const existingWindow = await WebviewWindow.getByLabel("main");
  if (existingWindow) {
    // See lib.rs on_window_event. We intercept window close events and
    // hide the main window instead of closing it. So this is the only
    // conditional branch we expect to hit.
    await existingWindow.show();
    await existingWindow.setFocus();
    return;
  }

  new WebviewWindow("main", {
    url: "index.html",
    title: "Recent Pages",
    width: 800,
    height: 600,
  });
}
