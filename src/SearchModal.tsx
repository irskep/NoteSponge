import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { getStore } from "./store";
import { PageData, loadPage } from "./types";
import "./SearchModal.css";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (id: number) => void;
}

function fuzzyMatch(text: string, query: string): boolean {
  const pattern = query
    .split("")
    .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  const regex = new RegExp(pattern, "i");
  return regex.test(text);
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelectPage,
}: SearchModalProps) {
  const [pages, setPages] = useState<PageData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    async function loadAllPages() {
      const store = await getStore();
      const allKeys = await store.keys();
      const pageKeys = allKeys.filter((key) => key.startsWith("page-"));
      const pageIds = pageKeys.map((key) => parseInt(key.replace("page-", "")));
      const loadedPages = await Promise.all(pageIds.map((id) => loadPage(id)));
      setPages(loadedPages.sort((a, b) => a.id - b.id));
    }

    if (isOpen) {
      loadAllPages();
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredPages = pages.filter((page) =>
    fuzzyMatch(page.title || "Untitled", searchQuery)
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredPages.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && filteredPages.length > 0) {
      e.preventDefault();
      const selectedPage = filteredPages[selectedIndex];
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              autoFocus
            />
          </div>
          <div className="search-results">
            {filteredPages.length > 0 ? (
              <ul className="page-list">
                {filteredPages.map((page, index) => (
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
              <div className="no-results">
                {searchQuery
                  ? "No matching pages found"
                  : "Type to search pages"}
              </div>
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
