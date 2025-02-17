import { useState, useEffect } from "react";
import { useSetAtom } from "jotai";
import { isDatabaseBootstrappedAtom } from "../state/atoms";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./App.css";
import Page from "./page/Page";
import PageListModal from "./page/PageListModal";
import SearchModal from "./search/SearchModal";
import { listen } from "@tauri-apps/api/event";
import { queryNextPageID, updatePageViewedAt } from "../services/db/actions";
import { getDB } from "../services/db";

function App() {
  const [pageID, setPageID] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const setIsDatabaseBootstrapped = useSetAtom(isDatabaseBootstrappedAtom);

  useEffect(() => {
    // Initialize database and schema, and check URL for page ID
    const initDB = async () => {
      try {
        await getDB();

        // Check URL for page ID
        const urlParams = new URLSearchParams(window.location.search);
        const pageIdParam = urlParams.get("page");
        if (pageIdParam) {
          const numericPageId = parseInt(pageIdParam, 10);
          if (!isNaN(numericPageId)) {
            setPageID(numericPageId);
          }
        }

        setIsDatabaseBootstrapped(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setIsDatabaseBootstrapped(false);
      }
    };
    initDB();
  }, [setIsDatabaseBootstrapped]);

  useEffect(() => {
    // Tauri menu event listeners (handles both menu clicks and keyboard shortcuts)
    const unlisten = listen("tauri://menu", async (event) => {
      const { payload } = event;
      switch (payload) {
        case "menu_new_page":
          await handleNewPage();
          break;
        case "menu_view_pages":
          setIsModalOpen(true);
          break;
        case "menu_search":
          setIsSearchOpen(true);
          break;
        case "menu_settings":
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
          break;
      }
    });

    return () => {
      unlisten.then((fn) => fn()); // Cleanup Tauri event listener
    };
  }, []);

  useEffect(() => {
    updatePageViewedAt(pageID);
  }, [pageID]);

  const handleNewPage = async () => {
    const nextId = await queryNextPageID();
    setPageID(nextId);
  };

  const handlePageSelect = async (id: number) => {
    // Create a sanitized label for the window (only alphanumeric and underscores)
    const windowLabel = `page_${id}`;

    // Check if window already exists
    const existingWindow = await WebviewWindow.getByLabel(windowLabel);
    if (existingWindow) {
      await existingWindow.setFocus();
      return;
    }

    const url = `index.html?page=${id}`;
    console.log(url);

    // Create new window
    const webview = new WebviewWindow(windowLabel, {
      url,
      title: "Loading...",
      width: 800,
      height: 600,
    });

    // Handle window events
    webview.once("tauri://created", async () => {
      // Window successfully created
      console.log("Window created successfully");
      // await updatePageViewedAt(id);
    });

    webview.once("tauri://error", (e) => {
      console.error("Error creating window:", e);
    });
  };

  return (
    <main className="App">
      <Page id={pageID} key={pageID} />
      <PageListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectPage={handlePageSelect}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={setPageID}
      />
    </main>
  );
}

export default App;
