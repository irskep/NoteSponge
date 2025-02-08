import { useState, useEffect } from "react";
import * as Toolbar from '@radix-ui/react-toolbar';
import { store } from "./store";
import "./App.css";
import Page from "./Page";
import PageListModal from "./PageListModal";
import SearchModal from "./SearchModal";
import { getNextPageId } from "./types";

function App() {
  const [pageID, setPageID] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+/ (Mac) or Ctrl+/ (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNewPage = async () => {
    const nextId = await getNextPageId();
    setPageID(nextId);
  };

  return (
    <main className="App">
      <Toolbar.Root className="toolbar-root" aria-label="Page navigation">
        <Toolbar.Button 
          className="toolbar-button" 
          onClick={() => setIsModalOpen(true)}
        >
          View All Pages
        </Toolbar.Button>
        <Toolbar.Separator className="toolbar-separator" />
        <Toolbar.Button 
          className="toolbar-button" 
          onClick={handleNewPage}
        >
          New Page
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
