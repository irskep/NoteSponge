import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { PageData } from "../types";
import "./shared/Modal.css";
import "./PageListModal.css";
import { listPages } from "../db/actions";

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
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">All Pages</Dialog.Title>
          <Dialog.Close asChild>
            <button className="dialog-close" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
          <div className="page-list-container">
            <ul className="page-list">
              {pages.map((page) => (
                <li
                  key={page.id}
                  onClick={() => {
                    onSelectPage(page.id);
                    onClose();
                  }}
                >
                  <span className="page-id">{page.id}.</span>
                  <span className="page-title">{page.title || "Untitled"}</span>
                </li>
              ))}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
