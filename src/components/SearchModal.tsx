import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { PageData } from "../types";
import "./shared/Modal.css";
import "./SearchModal.css";
import { listPages, fuzzyFindPagesByTitle } from "../db/actions";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (id: number) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelectPage,
}: SearchModalProps) {
  const [pages, setPages] = useState<PageData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Load initial pages when modal opens
  useEffect(() => {
    async function loadAllPages() {
      const loadedPages = await listPages();
      setPages(loadedPages);
    }

    if (isOpen) {
      loadAllPages();
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Update search results when query changes
  useEffect(() => {
    async function performSearch() {
      if (searchQuery.trim()) {
        const results = await fuzzyFindPagesByTitle(searchQuery);
        setPages(results);
        setSelectedIndex(0);
      } else {
        const allPages = await listPages();
        setPages(allPages);
        setSelectedIndex(0);
      }
    }

    performSearch();
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < pages.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && pages.length > 0) {
      e.preventDefault();
      const selectedPage = pages[selectedIndex];
      onSelectPage(selectedPage.id);
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-content search-dialog"
          onKeyDown={handleKeyDown}
        >
          <div className="search-input-wrapper">
            <MagnifyingGlassIcon className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="search-results">
            {pages.length > 0 ? (
              <ul className="page-list">
                {pages.map((page, index) => (
                  <li
                    key={page.id}
                    className={index === selectedIndex ? "selected" : ""}
                    onClick={() => {
                      onSelectPage(page.id);
                      onClose();
                    }}
                  >
                    <span className="page-id">{page.id}.</span>
                    <span className="page-title">
                      {page.title || "Untitled"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-results">No pages found</div>
            )}
          </div>
          <div className="search-footer">
            <div className="search-shortcuts">
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
              <span>esc to close</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
