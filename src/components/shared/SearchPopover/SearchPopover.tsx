import * as Popover from "@radix-ui/react-popover";
import type React from "react";
import { type ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import "@/components/shared/SearchPopover/SearchPopover.css";

// Define a generic type for search results
export type SearchResult = {
  id: string | number;
  primaryText: string;
  secondaryText?: string;
};

export interface SearchPopoverProps<T extends SearchResult> {
  // Core props
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;

  // Results handling
  results: T[];
  onSelect: (result: T) => void;

  // Optional custom rendering
  renderItem?: (props: {
    result: T;
    isSelected: boolean;
    onSelect: () => void;
  }) => React.ReactNode;

  // Optional status displays
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  emptyMessage?: string;
  createNewOption?: boolean;
  onCreateNew?: (value: string) => void;

  // Other customization
  autoFocus?: boolean;
  customClass?: string;
  inputAriaLabel?: string;
  onKeyDown?: React.KeyboardEventHandler;
}

export const SearchPopover = forwardRef(function SearchPopover<T extends SearchResult>(
  {
    // Props with defaults
    value,
    onChange,
    placeholder = "Search...",
    results,
    onSelect,
    renderItem,
    isLoading = false,
    loadingMessage = "Loading...",
    error = null,
    emptyMessage = "No results found",
    createNewOption = false,
    onCreateNew,
    autoFocus = false,
    customClass = "",
    inputAriaLabel,
    onKeyDown: externalKeyDown,
  }: SearchPopoverProps<T>,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  // Internal state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<(HTMLElement | null)[]>([]);

  // Handle forwarded ref
  useEffect(() => {
    if (!forwardedRef || !inputRef.current) return;

    if (typeof forwardedRef === "function") {
      forwardedRef(inputRef.current);
    } else {
      forwardedRef.current = inputRef.current;
    }
  }, [forwardedRef]);

  // Determine if we should show the popover
  const hasResults = results.length > 0;
  const shouldShowPopover = Boolean(hasResults || isLoading || error || (createNewOption && value));
  const showCreateNew = Boolean(
    createNewOption && value && !results.some((r) => r.primaryText.toLowerCase() === value.toLowerCase()),
  );

  // Reset selected index when results change
  useEffect(() => {
    if (results.length > 0) {
      setSelectedIndex(0);
    }
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Call external key handler first
    if (externalKeyDown) {
      externalKeyDown(e);
      // If the external handler prevented default, don't handle the event further
      if (e.defaultPrevented) return;
    }

    const totalOptions = results.length + (showCreateNew ? 1 : 0);

    // Only handle arrow keys if we have options to navigate through
    if (totalOptions > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = (prev + 1) % totalOptions;
            resultsRef.current[next]?.scrollIntoView({ block: "nearest" });
            return next;
          });
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const next = (prev - 1 + totalOptions) % totalOptions;
            resultsRef.current[next]?.scrollIntoView({ block: "nearest" });
            return next;
          });
          break;
      }
    }

    // Handle enter key
    if (e.key === "Enter") {
      if (isOpen && shouldShowPopover) {
        e.preventDefault();
        if (showCreateNew && selectedIndex === results.length) {
          onCreateNew?.(value);
        } else if (selectedIndex >= 0 && selectedIndex < results.length) {
          onSelect(results[selectedIndex]);
        } else if (createNewOption && value) {
          // If we have value but no selection or no results, create new
          onCreateNew?.(value);
        }
      }
    }
    // Handle escape key
    else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (!isOpen && e.target.value) {
      setIsOpen(true);
    }
  };

  // Default item renderer
  const defaultRenderItem = (props: {
    result: T;
    isSelected: boolean;
    onSelect: () => void;
  }) => {
    const { result, isSelected, onSelect } = props;
    return (
      <button className={`ResultItem ${isSelected ? "ResultItem--selected" : ""}`} onClick={onSelect} type="button">
        <span className="ResultItem__primary">{result.primaryText}</span>
        {result.secondaryText && <span className="ResultItem__secondary">{result.secondaryText}</span>}
      </button>
    );
  };

  return (
    <Popover.Root open={isOpen && shouldShowPopover} onOpenChange={setIsOpen}>
      <div className={`SearchInput__wrapper ${customClass}`}>
        <Popover.Anchor className="SearchInput__anchor">
          <input
            ref={inputRef}
            className="SearchInput__input"
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label={inputAriaLabel || placeholder}
            onFocus={() => {
              setIsOpen(true);
            }}
          />
        </Popover.Anchor>
      </div>

      <Popover.Portal>
        <Popover.Content
          className={`SearchInput__content ${isOpen ? "SearchInput__content--open" : "SearchInput__content--closed"}`}
          onOpenAutoFocus={(e) => e.preventDefault()}
          side="bottom"
          align="start"
          sideOffset={4}
          avoidCollisions
        >
          {isLoading ? (
            <div className="StatusDisplay">{loadingMessage}</div>
          ) : error ? (
            <div className="StatusDisplay StatusDisplay--error">{error}</div>
          ) : results.length === 0 && !showCreateNew ? (
            <div className="StatusDisplay StatusDisplay--empty">{emptyMessage}</div>
          ) : (
            <div className="ResultsList">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  ref={(el) => {
                    resultsRef.current[index] = el;
                  }}
                >
                  {renderItem
                    ? renderItem({
                        result,
                        isSelected: selectedIndex === index,
                        onSelect: () => onSelect(result),
                      })
                    : defaultRenderItem({
                        result,
                        isSelected: selectedIndex === index,
                        onSelect: () => onSelect(result),
                      })}
                </div>
              ))}

              {showCreateNew && (
                <button
                  ref={(el) => {
                    resultsRef.current[results.length] = el;
                  }}
                  className={`ResultItem ResultItem--new ${
                    selectedIndex === results.length ? "ResultItem--selected" : ""
                  }`}
                  onClick={() => onCreateNew?.(value)}
                  type="button"
                >
                  <span className="ResultItem__newText">Create "{value}"</span>
                </button>
              )}
            </div>
          )}
          <Popover.Arrow className="SearchInput__arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
