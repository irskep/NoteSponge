import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function openSettingsWindow() {
  const existingSettings = await WebviewWindow.getByLabel("settings");
  if (existingSettings) {
    await existingSettings.setFocus();
    return;
  }

  const settingsWindow = new WebviewWindow("settings", {
    url: "settings.html",
    title: "Settings",
    width: 400,
    height: 200,
    resizable: false,
  });

  settingsWindow.once("tauri://error", (e) => {
    console.error("Error creating settings window:", e);
  });
}

export async function openPageInNewWindow(id: number) {
  const windowLabel = `page_${id}`;

  const existingWindow = await WebviewWindow.getByLabel(windowLabel);
  if (existingWindow) {
    await existingWindow.setFocus();
    return;
  }

  const url = `index.html?page=${id}`;

  const webview = new WebviewWindow(windowLabel, {
    url,
    title: "Loading...",
    width: 800,
    height: 600,
  });

  webview.once("tauri://created", () => {
    console.log("Window created successfully");
  });

  webview.once("tauri://error", (e) => {
    console.error("Error creating window:", e);
  });
}
