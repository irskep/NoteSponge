import { useState } from "react";
import * as Toolbar from '@radix-ui/react-toolbar';

import "./App.css";
import Page from "./Page";
import PageListModal from "./PageListModal";
import { getNextPageId } from "./types";

function App() {
  const [pageID, setPageID] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    </main>
  );
}

export default App;
