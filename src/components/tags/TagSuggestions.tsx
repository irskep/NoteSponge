import { EmptyState } from "../shared/SearchPopover";
import "./TagSuggestions.css";

interface TagSuggestion {
  tag: string;
  count: number;
}

interface TagSuggestionsProps {
  suggestions: TagSuggestion[];
  selectedIndex: number | null;
  inputValue: string;
  onSelect: (tag: string) => void;
  onHighlight: (index: number | null) => void;
}

export function TagSuggestions({
  suggestions,
  selectedIndex,
  inputValue,
  onSelect,
  onHighlight,
}: TagSuggestionsProps) {
  if (!inputValue && suggestions.length === 0) {
    return <EmptyState message="Begin typing to search or create tags" />;
  }

  return (
    <>
      {suggestions.map(({ tag, count }, index) => (
        <button
          key={tag}
          className={`SearchPopover-resultItem${
            index === selectedIndex ? " selected" : ""
          }`}
          onClick={() => onSelect(tag)}
          onMouseEnter={() => onHighlight(index)}
          type="button"
        >
          <span className="SearchPopover-resultPrimary">{tag}</span>
          <span className="SearchPopover-resultSecondary">({count})</span>
        </button>
      ))}
      {inputValue &&
        !suggestions.some(
          (s) => s.tag.toLowerCase() === inputValue.toLowerCase()
        ) && (
          <button
            className={`SearchPopover-resultItem SearchPopover-resultNew${
              selectedIndex === null ? " selected" : ""
            }`}
            onClick={() => onSelect(inputValue)}
            onMouseEnter={() => onHighlight(null)}
            type="button"
          >
            <span className="SearchPopover-resultPrimary SearchPopover-resultNewText">
              Create "{inputValue}"
            </span>
          </button>
        )}
    </>
  );
}
