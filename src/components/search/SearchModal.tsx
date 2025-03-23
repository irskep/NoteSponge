import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { PageData } from "../../types";
import "../shared/Modal.css";
import "./SearchModal.css";
import { listPages, fuzzyFindPagesByTitle } from "../../services/db/actions";

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
        <Dialog.Overlay className="Modal__overlay" />
        <Dialog.Content
          className="Modal__content SearchModal__dialog"
          onKeyDown={handleKeyDown}
        >
          <div className="SearchModal__inputWrapper">
            <MagnifyingGlassIcon className="SearchModal__icon" />
            <input
              type="text"
              className="SearchModal__input"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="SearchModal__results">
            {pages.length > 0 ? (
              <ul className="Modal__pageList">
                {pages.map((page, index) => (
                  <li
                    key={page.id}
                    className={`Modal__pageItem ${
                      index === selectedIndex ? "Modal__pageItem--selected" : ""
                    }`}
                    onClick={() => {
                      onSelectPage(page.id);
                      onClose();
                    }}
                  >
                    <span className="PageListModal__itemId">{page.id}.</span>
                    <span className="PageListModal__itemTitle">
                      {page.title || "Untitled"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="SearchModal__noResults">No pages found</div>
            )}
          </div>
          <div className="SearchModal__footer">
            <div className="SearchModal__shortcuts">
              <span className="SearchModal__shortcut">↑↓ to navigate</span>
              <span className="SearchModal__shortcut">↵ to select</span>
              <span className="SearchModal__shortcut">esc to close</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
