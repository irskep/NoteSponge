import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
  deletePage as deletePageFromDB,
  queryNextPageID,
  upsertPage,
} from "../db/actions";
import { EditorState } from "lexical";
import { PageData } from "../../types";

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
export async function openPageInNewWindow(id: number) {
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
  });
}

/**
 * Creates a new page and opens it in a new window.
 */
export async function createNewPage(): Promise<number> {
  const nextId = await queryNextPageID();
  await openPageInNewWindow(nextId);
  return nextId;
}

/**
 * Deletes a page and closes any windows associated with it.
 */
export async function deletePage(id: number): Promise<void> {
  // First close any windows showing this page
  const windowLabel = `page_${id}`;
  const existingWindow = await WebviewWindow.getByLabel(windowLabel);
  if (existingWindow) {
    await existingWindow.close();
  }

  // Then delete from database
  await deletePageFromDB(id);
}

/**
 * Updates or creates a page with the given content.
 */
export async function updatePage(
  page: PageData,
  editorState: EditorState,
  title: string
): Promise<PageData> {
  return upsertPage(page, editorState, title);
}
