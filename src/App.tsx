import { useState } from "react";

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
      <div className="toolbar">
        <button onClick={() => setIsModalOpen(true)}>View All Pages</button>
        <button onClick={handleNewPage}>New Page</button>
      </div>
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
