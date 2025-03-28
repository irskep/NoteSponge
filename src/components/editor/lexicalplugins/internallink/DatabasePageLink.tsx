import { useEffect, useState } from "react";
import { fetchPage } from "../../../../services/db/actions/pages";
import { useWindowFocus } from "../../../../utils/listenToWindowFocus";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import "./DatabasePageLink.css";
import { Text } from "@radix-ui/themes";

interface PageLinkData {
  title: string;
  archivedAt: string | null;
}

export function DatabasePageLink({
  id,
  nodeKey,
}: {
  id: number;
  nodeKey: string;
}): JSX.Element {
  const [pageData, setPageData] = useState<PageLinkData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelected] = useLexicalNodeSelection(nodeKey);

  // Function to fetch page data
  const fetchPageData = async () => {
    try {
      const result = await fetchPage(id);

      if (!result) {
        setError(`Page #${id} not found`);
        return;
      }

      // Only update if title has changed to avoid flicker
      setPageData((prev) => {
        const newData = {
          title: result.title || `Page #${id}`,
          archivedAt: result.archivedAt || null,
        };

        if (
          prev?.title !== newData.title ||
          prev?.archivedAt !== newData.archivedAt
        ) {
          return newData;
        }
        return prev;
      });
    } catch (err) {
      setError(
        `Error loading page: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await fetchPageData();
    };

    init();

    return () => {
      mounted = false;
    };
  }, [id]);

  // Set up window focus listener
  useWindowFocus(() => {
    fetchPageData();
  }, [id]);

  if (error) {
    return (
      <span role="alert" className="DatabasePageLink--error">
        {error}
      </span>
    );
  }

  if (isLoading || !pageData) {
    return (
      <span
        role="status"
        aria-busy="true"
        className="DatabasePageLink--loading"
      >
        Loading page #{id}…
      </span>
    );
  }

  let className = pageData.archivedAt
    ? "DatabasePageLink DatabasePageLink--archived"
    : "DatabasePageLink";

  if (isSelected) {
    className += " DatabasePageLink--selected";
  }

  return (
    <Text
      className={className}
      color="indigo"
      role="link"
      aria-label={`Link to page: ${pageData.title}`}
      aria-disabled={!!pageData.archivedAt}
    >
      [[{id}]] {pageData.title}
    </Text>
  );
}
