import { useState, useEffect } from "react";
import * as Toolbar from "@radix-ui/react-toolbar";
import {
  CardStackIcon,
  CardStackPlusIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { useAtomValue, useSetAtom } from "jotai";
import { isPageEmptyAtom, isDatabaseBootstrappedAtom } from "../atoms";
import "./App.css";
import Page from "./Page";
import PageListModal from "./PageListModal";
import SearchModal from "./SearchModal";
import { listen } from "@tauri-apps/api/event";
import { queryNextPageID } from "../db/actions";
import Database from "@tauri-apps/plugin-sql";
import { bootstrapSchema } from "../db/bootstrap_schema";

function App() {
  const [pageID, setPageID] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isPageEmpty = useAtomValue(isPageEmptyAtom);
  const setIsDatabaseBootstrapped = useSetAtom(isDatabaseBootstrappedAtom);

  useEffect(() => {
    // Initialize database and schema
    const initDB = async () => {
      try {
        const db = await Database.load("sqlite:deckywiki.db");
        await bootstrapSchema(db);
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
      }
    });

    return () => {
      unlisten.then((fn) => fn()); // Cleanup Tauri event listener
    };
  }, []);

  const handleNewPage = async () => {
    const nextId = await queryNextPageID();
    setPageID(nextId);
  };

  return (
    <main className="App">
      <Toolbar.Root className="toolbar-root" aria-label="Page navigation">
        <Toolbar.Button
          className="toolbar-button"
          onClick={() => setIsModalOpen(true)}
          aria-label="View All Pages"
        >
          <CardStackIcon className="toolbar-icon" />
          Pages
        </Toolbar.Button>
        <Toolbar.Button
          className="toolbar-button"
          onClick={handleNewPage}
          aria-label="New Page"
          disabled={isPageEmpty}
        >
          <CardStackPlusIcon className="toolbar-icon" />
          New
        </Toolbar.Button>
        <Toolbar.Button
          className="toolbar-button"
          onClick={() => setIsSearchOpen(true)}
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="toolbar-icon" />
          Search
        </Toolbar.Button>
      </Toolbar.Root>
      <Page id={pageID} key={pageID} />
      <PageListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectPage={setPageID}
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
