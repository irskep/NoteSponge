import { useState, useEffect, forwardRef } from "react";
import { useDebounce } from "use-debounce";
import { SearchPopover, type SearchResult } from "@/components/shared/SearchPopover";
import { fuzzyFindTags } from "@/services/db/actions/tags";

// Define Tag result type
interface TagResult extends SearchResult {
  primaryText: string;
  secondaryText: string;
}

interface TagAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectTag: (tag: string) => void;
  autoFocus?: boolean;
  className?: string;
}

export const TagAutocompleteInput = forwardRef<
  HTMLInputElement,
  TagAutocompleteInputProps
>(
  (
    { value, onChange, onSelectTag, autoFocus = false, className = "" },
    ref
  ) => {
    const [debouncedValue] = useDebounce(value, 300);
    const [suggestions, setSuggestions] = useState<TagResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch tag suggestions
    useEffect(() => {
      if (!debouncedValue) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      fuzzyFindTags(debouncedValue)
        .then((tags) => {
          setIsLoading(false);
          setSuggestions(
            tags.map((tag) => ({
              id: tag.tag,
              primaryText: tag.tag,
              secondaryText: `(${tag.count})`,
            }))
          );
        })
        .catch((err) => {
          setIsLoading(false);
          setError("Error loading tags");
          console.error(err);
        });
    }, [debouncedValue]);

    const handleSelect = (result: SearchResult) => {
      onSelectTag(result.primaryText);
    };

    const handleCreateNew = (value: string) => {
      onSelectTag(value);
    };

    return (
      <SearchPopover
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder="Add tag…"
        results={suggestions}
        onSelect={handleSelect}
        isLoading={isLoading}
        error={error}
        emptyMessage="Begin typing to search or create tags"
        createNewOption={true}
        onCreateNew={handleCreateNew}
        autoFocus={autoFocus}
        customClass={className}
        inputAriaLabel="Search or create tags"
      />
    );
  }
);
