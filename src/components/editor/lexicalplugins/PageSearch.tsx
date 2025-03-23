import { FC, useEffect, useState, useRef } from "react";
import * as Form from "@radix-ui/react-form";
import * as Popover from "@radix-ui/react-popover";
import { Flex, Text } from "@radix-ui/themes";
import { fuzzyFindPagesByTitle, fetchPage } from "../../../services/db/actions";
import { useDebounce } from "use-debounce";
import "./LinkEditorDialog.css";
import "./PageSearch.css";

interface PageSearchProps {
  autoFocus?: boolean;
  selectedPageId: number | null;
  selectedPageTitle: string;
  onSelectPage: (pageId: number, pageTitle: string) => void;
}

export const PageSearch: FC<PageSearchProps> = ({
  autoFocus = false,
  selectedPageId,
  selectedPageTitle,
  onSelectPage,
}) => {
  const [pageQuery, setPageQuery] = useState("");
  const [debouncedPageQuery] = useDebounce(pageQuery, 300);
  const [pageResults, setPageResults] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Check for direct ID entry or fuzzy search
  useEffect(() => {
    if (!debouncedPageQuery.trim()) {
      setPageResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Check if the query is a direct page ID (e.g., "#123" or just "123")
    const idMatch = debouncedPageQuery.match(/^#?(\d+)$/);

    if (idMatch) {
      const pageId = parseInt(idMatch[1], 10);

      // Fetch the page by ID
      fetchPage(pageId)
        .then((page) => {
          setIsLoading(false);

          if (page && page.title) {
            // If a page is found, select it directly
            handleSelectPage(page.id, page.title);
          } else {
            // If no page is found, show an error
            setError(`Page #${pageId} not found`);
            setPageResults([]);
          }
        })
        .catch(() => {
          setIsLoading(false);
          setError(`Error finding page #${pageId}`);
          setPageResults([]);
        });
    } else {
      // Regular fuzzy search by title
      fuzzyFindPagesByTitle(debouncedPageQuery)
        .then((pages) => {
          setIsLoading(false);
          setPageResults(
            pages.map((page) => ({
              id: page.id,
              title: page.title || "",
            }))
          );

          if (pages.length === 0) {
            setError("No pages match your search");
          } else {
            setSelectedIndex(0);
          }
        })
        .catch(() => {
          setIsLoading(false);
          setError("Error searching for pages");
          setPageResults([]);
        });
    }
  }, [debouncedPageQuery]);

  const handleSelectPage = (pageId: number, pageTitle: string) => {
    onSelectPage(pageId, pageTitle);
    setPageQuery("");
    setPageResults([]);
    setError(null);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (pageResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next =
            prev === null ? 0 : Math.min(prev + 1, pageResults.length - 1);
          // Scroll the selected item into view
          resultsRef.current[next]?.scrollIntoView({ block: "nearest" });
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next =
            prev === null ? pageResults.length - 1 : Math.max(prev - 1, 0);
          // Scroll the selected item into view
          resultsRef.current[next]?.scrollIntoView({ block: "nearest" });
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex !== null) {
          const selected = pageResults[selectedIndex];
          handleSelectPage(selected.id, selected.title);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return (
    <>
      <Form.Field name="page" className="form-field">
        <Flex direction="column" gap="2">
          <Form.Label>
            <Text as="label" size="2" weight="medium">
              Search Pages
            </Text>
          </Form.Label>
          <Popover.Root
            open={
              isOpen && (pageResults.length > 0 || isLoading || error !== null)
            }
            onOpenChange={setIsOpen}
          >
            <Popover.Anchor className="PageSearch-inputAnchor">
              <Form.Control asChild>
                <input
                  ref={inputRef}
                  name="page"
                  type="text"
                  className="form-input PageSearch-input"
                  placeholder="Search by title or enter page ID (#123)"
                  value={pageQuery}
                  onChange={(e) => {
                    setPageQuery(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                  onKeyDown={handleKeyDown}
                  autoFocus={autoFocus}
                />
              </Form.Control>
            </Popover.Anchor>
            <Popover.Portal>
              <Popover.Content
                className="PageSearch-content"
                onOpenAutoFocus={(e) => e.preventDefault()}
                side="bottom"
                align="start"
                sideOffset={4}
                avoidCollisions
              >
                <div className="PageSearch-results">
                  {isLoading && (
                    <div className="PageSearch-loading">
                      <Text size="2">Searching...</Text>
                    </div>
                  )}

                  {error && !isLoading && (
                    <div className="PageSearch-error">
                      <Text size="2" color="red">
                        {error}
                      </Text>
                    </div>
                  )}

                  {pageResults.length > 0 && !isLoading && (
                    <div className="PageSearch-resultsList">
                      {pageResults.map((page, index) => (
                        <div
                          ref={(el) => (resultsRef.current[index] = el)}
                          key={page.id}
                          className={`PageSearch-resultItem${
                            selectedIndex === index ? " selected" : ""
                          }`}
                          onClick={() => handleSelectPage(page.id, page.title)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <span className="PageSearch-resultTitle">
                            {page.title}
                          </span>
                          <span className="PageSearch-resultId">
                            #{page.id}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Popover.Arrow className="PageSearch-arrow" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </Flex>
      </Form.Field>

      {selectedPageId !== null && (
        <div className="selected-page">
          <Text size="2">
            Selected page: {selectedPageTitle} (#{selectedPageId})
          </Text>
        </div>
      )}
    </>
  );
};
