import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { PageData } from "../../types";
import "../shared/Modal.css";
import "./PageListModal.css";
import { listPages } from "../../services/db/actions";

interface PageListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (id: number) => void;
}

export default function PageListModal({
  isOpen,
  onClose,
  onSelectPage,
}: PageListModalProps) {
  const [pages, setPages] = useState<PageData[]>([]);

  useEffect(() => {
    async function loadAllPages() {
      const loadedPages = await listPages();
      setPages(loadedPages);
    }

    if (isOpen) {
      loadAllPages();
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="PageListModal__overlay" />
        <Dialog.Content className="PageListModal__content">
          <Dialog.Title className="PageListModal__header">
            All Pages
          </Dialog.Title>
          <Dialog.Close asChild>
            <button className="PageListModal__closeButton" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
          <div className="PageListModal__listContainer">
            <ul className="PageListModal__list">
              {pages.map((page) => (
                <li
                  key={page.id}
                  className="PageListModal__item"
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
