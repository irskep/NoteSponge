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
          className={`ResultItem ${
            index === selectedIndex ? "ResultItem--selected" : ""
          }`}
          onClick={() => onSelect(tag)}
          onMouseEnter={() => onHighlight(index)}
          type="button"
        >
          <span className="ResultItem__primary">{tag}</span>
          <span className="ResultItem__secondary">({count})</span>
        </button>
      ))}
      {inputValue &&
        !suggestions.some(
          (s) => s.tag.toLowerCase() === inputValue.toLowerCase()
        ) && (
          <button
            className={`ResultItem ResultItem--new ${
              selectedIndex === null ? "ResultItem--selected" : ""
            }`}
            onClick={() => onSelect(inputValue)}
            onMouseEnter={() => onHighlight(null)}
            type="button"
          >
            <span className="ResultItem__newText">Create "{inputValue}"</span>
          </button>
        )}
    </>
  );
}
