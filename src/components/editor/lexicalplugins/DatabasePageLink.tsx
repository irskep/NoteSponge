import { useEffect, useState } from "react";
import { fetchPage } from "../../../services/db/actions";
import { listenToWindowFocus } from "../../../utils/listenToWindowFocus";
import "./InternalLinkNode.css";

interface PageLinkData {
  title: string;
  archivedAt: string | null;
}

export function DatabasePageLink({ id }: { id: number }): JSX.Element {
  const [pageData, setPageData] = useState<PageLinkData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      cleanup = await listenToWindowFocus(() => {
        fetchPageData();
      });
    };

    setup();

    return () => {
      if (cleanup) cleanup();
    };
  }, [id]);

  if (error) {
    return <span className="InternalLinkNode--error">{error}</span>;
  }

  if (isLoading || !pageData) {
    return (
      <span className="InternalLinkNode--loading">Loading page #{id}…</span>
    );
  }

  const className = pageData.archivedAt
    ? "InternalLinkNode InternalLinkNode--archived"
    : "InternalLinkNode";

  return <span className={className}>{pageData.title}</span>;
}
