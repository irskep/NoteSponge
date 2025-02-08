import { useEffect, useState } from "react";
import { store } from "./store";
import { PageData, loadPage } from "./types";
import "./PageListModal.css";

interface PageListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (id: number) => void;
}

export default function PageListModal({ isOpen, onClose, onSelectPage }: PageListModalProps) {
  const [pages, setPages] = useState<PageData[]>([]);

  useEffect(() => {
    async function loadAllPages() {
      const allKeys = await store.keys();
      const pageKeys = allKeys.filter(key => key.startsWith('page-'));
      const pageIds = pageKeys.map(key => parseInt(key.replace('page-', '')));
      
      const loadedPages = await Promise.all(
        pageIds.map(id => loadPage(id))
      );
      
      setPages(loadedPages.sort((a, b) => a.id - b.id));
    }

    if (isOpen) {
      loadAllPages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>All Pages</h2>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <ul className="page-list">
            {pages.map(page => (
              <li key={page.id} onClick={() => {
                onSelectPage(page.id);
                onClose();
              }}>
                <span className="page-id">{page.id}.</span>
                <span className="page-title">{page.title || 'Untitled'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
