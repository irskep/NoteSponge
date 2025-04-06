import { listPages } from "@/services/db/pages";
import { fuzzyFindPagesByTitle } from "@/services/db/search";
import { navigateToPage } from "@/services/windowRouting";
import { openModalsAtom, searchModalStateAtom } from "@/state/modalState";
import type { PageData } from "@/types";
import { Link1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Box, Dialog, Flex, ScrollArea, Text, TextField, VisuallyHidden } from "@radix-ui/themes";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
import "./SearchModal.css";
import { dispatchEditorCommand } from "@/state/editorState";
import { INSERT_INTERNAL_LINK_COMMAND } from "../texteditor/plugins/internallink/commands";

export default function SearchModal() {
  const [openModals, setOpenModals] = useAtom(openModalsAtom);
  const searchModalState = useAtomValue(searchModalStateAtom);
  const [pages, setPages] = useState<PageData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isOpen = openModals.search;

  const onClose = useCallback(() => {
    setOpenModals((prev) => ({ ...prev, search: false }));
  }, [setOpenModals]);

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

      if (searchModalState.mode === "insertLink") {
        dispatchEditorCommand(INSERT_INTERNAL_LINK_COMMAND, { pageId: selectedPage.id });
      } else {
        navigateToPage(selectedPage.id);
      }

      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <VisuallyHidden>
        <Dialog.Title>Find a page</Dialog.Title>
      </VisuallyHidden>
      <Dialog.Content className="SearchModal__dialog" size="2" onKeyDown={handleKeyDown}>
        <Flex align="center" gap="2" mb="3">
          <TextField.Root
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="3"
            autoFocus
            style={{ flexGrow: 1 }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>

          {searchModalState.mode === "insertLink" && (
            <Box style={{ display: "flex", alignItems: "center" }}>
              <Link1Icon width="18" height="18" />
            </Box>
          )}
        </Flex>

        <ScrollArea className="SearchModal__results" style={{ maxHeight: "300px" }}>
          {pages.length > 0 ? (
            <Box>
              {pages.map((page, index) => (
                <Flex
                  key={page.id}
                  className={index === selectedIndex ? "SearchModal__pageItem--selected" : undefined}
                  p="3"
                  align="center"
                  gap="2"
                  mb="1"
                  style={{
                    cursor: "pointer",
                    borderRadius: "var(--radius-sm)",
                  }}
                  onClick={() => {
                    if (searchModalState.mode === "insertLink") {
                      dispatchEditorCommand(INSERT_INTERNAL_LINK_COMMAND, { pageId: page.id });
                    } else {
                      navigateToPage(page.id);
                    }
                    onClose();
                  }}
                >
                  <Text color="gray" weight="medium">
                    {page.id}.
                  </Text>
                  <Text>{page.title || "Untitled"}</Text>
                </Flex>
              ))}
            </Box>
          ) : (
            <Box p="5" style={{ textAlign: "center" }}>
              <Text color="gray">No pages found</Text>
            </Box>
          )}
        </ScrollArea>

        <Box
          pt="3"
          mt="3"
          style={{
            borderTop: "var(--border-width) solid var(--border-default)",
          }}
        >
          <Flex justify="center" gap="4">
            <Text size="1" color="gray">
              ↑↓ to navigate
            </Text>
            <Text size="1" color="gray">
              ↵ to {searchModalState.mode === "insertLink" ? "insert link" : "select"}
            </Text>
            <Text size="1" color="gray">
              esc to close
            </Text>
          </Flex>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
}
