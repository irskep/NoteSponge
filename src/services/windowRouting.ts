import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export function navigateToPage(pageId: number) {
  openOrFocusWindow({ type: "page", pageId });
}

interface TypedWindow {
  type: string;
}

type CollectionsWindow = TypedWindow & {
  type: "main";
};

type SettingsWindow = TypedWindow & {
  type: "settings";
};

type PageWindow = TypedWindow & {
  type: "page";
  pageId: number;
};

type NotespongeWindow = CollectionsWindow | SettingsWindow | PageWindow;

function getWindowLabel(window: NotespongeWindow) {
  switch (window.type) {
    case "main":
      return "main";
    case "settings":
      return "settings";
    case "page":
      return `page_${window.pageId}`;
  }
}

export async function openOrFocusWindow(window: NotespongeWindow) {
  const existingWindow = await WebviewWindow.getByLabel(getWindowLabel(window));
  if (existingWindow) {
    await existingWindow.setFocus();
    return;
  }

  switch (window.type) {
    case "main":
      await showAndFocusCollectionsWindow();
      break;
    case "settings":
      await openNewSettingsWindow();
      break;
    case "page":
      await openNewPageWindow(window.pageId);
      break;
  }
}

export async function closeWindow(window: NotespongeWindow) {
  const windowLabel = getWindowLabel(window);
  const existingWindow = await WebviewWindow.getByLabel(windowLabel);
  if (!existingWindow) return;

  switch (window.type) {
    case "main":
      existingWindow.hide();
      break;
    case "settings":
      existingWindow.close();
      break;
    case "page":
      existingWindow.close();
      break;
  }
}

/**
 * Opens the settings window. If it already exists, brings it to focus.
 */
async function openNewSettingsWindow() {
  new WebviewWindow("settings", {
    url: "settings.html",
    title: "Settings",
    width: 450,
    height: 240,
    resizable: false,
  });
}

/**
 * Opens a page in a new window. If a window for this page already exists,
 * it will be focused instead of creating a new one.
 */
async function openNewPageWindow(id: number) {
  const myWindow = WebviewWindow.getCurrent();
  const windowLabel = `page_${id}`;

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
 * Opens the Recent Pages window. If it already exists, brings it to focus.
 */
async function showAndFocusCollectionsWindow() {
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
