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
    return (
      <div className="TagBar-item TagBar-empty">
        Begin typing to search or create tags
      </div>
    );
  }

  return (
    <>
      {suggestions.map(({ tag, count }, index) => (
        <button
          key={tag}
          className={`TagBar-item${
            index === selectedIndex ? " selected" : ""
          }`}
          onClick={() => onSelect(tag)}
          onMouseEnter={() => onHighlight(index)}
        >
          <span>{tag}</span>
          <span className="TagBar-count">({count})</span>
        </button>
      ))}
      {inputValue &&
        !suggestions.some(
          (s) => s.tag.toLowerCase() === inputValue.toLowerCase()
        ) && (
          <button
            className={`TagBar-item TagBar-newItem${
              selectedIndex === null ? " selected" : ""
            }`}
            onClick={() => onSelect(inputValue)}
            onMouseEnter={() => onHighlight(null)}
          >
            Create "{inputValue}"
          </button>
        )}
    </>
  );
}
