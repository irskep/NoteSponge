import { FC, useState, useEffect } from "react";
import * as Form from "@radix-ui/react-form";
import { Flex, Text } from "@radix-ui/themes";
import { fuzzyFindPagesByTitle, fetchPage } from "../../../services/db/actions";
import { useDebounce } from "use-debounce";
import { SearchPopover, SearchResult } from "../../shared/SearchPopover";
import "./LinkEditorDialog.css";

// Define the type for our page results
interface PageResult extends SearchResult {
  id: number;
  primaryText: string;
  secondaryText: string;
}

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
  const [pageResults, setPageResults] = useState<PageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search logic
  useEffect(() => {
    if (!debouncedPageQuery.trim()) {
      setPageResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Check if the query is a direct page ID
    const idMatch = debouncedPageQuery.match(/^#?(\d+)$/);

    if (idMatch) {
      const pageId = parseInt(idMatch[1], 10);
      fetchPage(pageId)
        .then((page) => {
          setIsLoading(false);
          if (page && page.title) {
            // If a page is found, select it directly
            onSelectPage(page.id, page.title);
            setPageQuery("");
          } else {
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
              primaryText: page.title || "",
              secondaryText: `#${page.id}`,
            }))
          );
          if (pages.length === 0) {
            setError("No pages match your search");
          }
        })
        .catch(() => {
          setIsLoading(false);
          setError("Error searching for pages");
          setPageResults([]);
        });
    }
  }, [debouncedPageQuery, onSelectPage]);

  const handleSelectPage = (result: SearchResult) => {
    onSelectPage(result.id as number, result.primaryText);
    setPageQuery("");
  };

  return (
    <>
      <Form.Field name="page" className="ExternalLinkForm__field">
        <Flex direction="column" gap="2">
          <Form.Label>
            <Text as="label" size="2" weight="medium">
              Search Pages
            </Text>
          </Form.Label>

          <SearchPopover
            value={pageQuery}
            onChange={setPageQuery}
            placeholder="Search by title or enter page ID (#123)"
            results={pageResults}
            onSelect={handleSelectPage}
            isLoading={isLoading}
            error={error}
            autoFocus={autoFocus}
            customClass="ExternalLinkForm__input"
            inputAriaLabel="Search pages"
          />
        </Flex>
      </Form.Field>

      {selectedPageId !== null && (
        <div className="LinkEditorDialog__selectedPage">
          <Text size="1">
            Selected page: {selectedPageTitle} (#{selectedPageId})
          </Text>
        </div>
      )}
    </>
  );
};
