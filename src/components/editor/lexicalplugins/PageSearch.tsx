import { FC, useEffect, useState, useRef } from "react";
import * as Form from "@radix-ui/react-form";
import { Flex, Text } from "@radix-ui/themes";
import { fuzzyFindPagesByTitle, fetchPage } from "../../../services/db/actions";
import { useDebounce } from "use-debounce";
import {
  SearchInput,
  ResultItem,
  ResultsList,
  LoadingState,
  ErrorState,
} from "../../shared/SearchPopover";
import "./LinkEditorDialog.css";

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
  const resultsRef = useRef<(HTMLElement | null)[]>([]);

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

  // Only show the popover if we have results, are loading, or have an error
  const shouldShowPopover =
    pageResults.length > 0 || isLoading || error !== null;

  return (
    <>
      <Form.Field name="page" className="form-field">
        <Flex direction="column" gap="2">
          <Form.Label>
            <Text as="label" size="2" weight="medium">
              Search Pages
            </Text>
          </Form.Label>
          <SearchInput
            ref={inputRef}
            value={pageQuery}
            onChange={setPageQuery}
            onKeyDown={handleKeyDown}
            placeholder="Search by title or enter page ID (#123)"
            autoFocus={autoFocus}
            isOpen={isOpen && shouldShowPopover}
            onOpenChange={setIsOpen}
            customClass="form-input"
            inputAriaLabel="Search pages"
          >
            {isLoading ? (
              <LoadingState message="Searching..." />
            ) : error ? (
              <ErrorState message={error} />
            ) : (
              <ResultsList>
                {pageResults.map((page, index) => (
                  <ResultItem
                    key={page.id}
                    ref={(el) =>
                      (resultsRef.current[index] = el as HTMLButtonElement)
                    }
                    primaryText={page.title}
                    secondaryText={`#${page.id}`}
                    isSelected={selectedIndex === index}
                    onSelect={() => handleSelectPage(page.id, page.title)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  />
                ))}
              </ResultsList>
            )}
          </SearchInput>
        </Flex>
      </Form.Field>

      {selectedPageId !== null && (
        <div className="selected-page">
          <Text size="1">
            Selected page: {selectedPageTitle} (#{selectedPageId})
          </Text>
        </div>
      )}
    </>
  );
};
