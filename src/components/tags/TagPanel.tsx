import { useCallback, useEffect } from "react";
import {
  getPageTags,
  fuzzyFindTags,
  setPageTags,
} from "../../services/db/actions";
import { useTagKeyboardNavigation } from "./useTagKeyboardNavigation";
import { TagToken } from "./TagToken";
import { useAtom } from "jotai";
import {
  tagStateAtom,
  tagSuggestionsAtom,
  tagInputValueAtom,
  tagSelectedIndexAtom,
  isTagPopoverOpenAtom,
} from "../../state/atoms";
import { SearchInput, ResultsList } from "../shared/SearchPopover";
import { AiTagSuggestionsList } from "./AiTagSuggestionsList";
import { TagAutocompleteResults } from "./TagAutocompleteResults";
import "./TagPanel.css";

interface TagPanelProps {
  pageId: number;
  content: string;
}

// Export a function to focus the tag input from anywhere in the app
export const focusTagInput = () => {
  const tagInput = document.querySelector(
    ".TagPanel__input"
  ) as HTMLInputElement;
  if (tagInput) {
    tagInput.focus();
  }
};

export function TagPanel({ pageId, content }: TagPanelProps) {
  const [tagState, setTagState] = useAtom(tagStateAtom);
  const [isOpen, setIsOpen] = useAtom(isTagPopoverOpenAtom);
  const [inputValue, setInputValue] = useAtom(tagInputValueAtom);
  const [suggestions, setSuggestions] = useAtom(tagSuggestionsAtom);
  const [selectedIndex, setSelectedIndex] = useAtom(tagSelectedIndexAtom);

  const { tags, focusedTagIndex } = tagState;

  // Load initial tags
  useEffect(() => {
    getPageTags(pageId).then((tags) =>
      setTagState((prev) => ({ ...prev, tags }))
    );
  }, [pageId, setTagState]);

  // Load tag suggestions when input changes
  useEffect(() => {
    let isCanceled = false;

    if (inputValue) {
      fuzzyFindTags(inputValue).then((results) => {
        if (!isCanceled) {
          setSuggestions(results);
        }
      });
    } else {
      setSuggestions([]);
    }
    setSelectedIndex(null);

    return () => {
      isCanceled = true;
    };
  }, [inputValue, setSuggestions, setSelectedIndex]);

  const handleTagRemove = useCallback(
    (tagToRemove: string) => {
      setTagState((prev) => ({
        ...prev,
        tags: prev.tags.filter((tag) => tag !== tagToRemove),
      }));
      setPageTags(
        pageId,
        tags.filter((tag) => tag !== tagToRemove)
      );
    },
    [pageId, tags, setTagState]
  );

  const handleTagAdd = useCallback(
    (newTag: string) => {
      const trimmedTag = newTag.trim().toLowerCase();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setTagState((prev) => ({
          ...prev,
          tags: [...prev.tags, trimmedTag],
        }));
        setPageTags(pageId, [...tags, trimmedTag]);
      }
      setInputValue("");
      setIsOpen(false);
    },
    [pageId, tags, setTagState, setInputValue, setIsOpen]
  );

  const filteredSuggestions = suggestions.filter(
    ({ tag }) => !tags.includes(tag)
  );

  const { inputRef, tagRefs, handleKeyDown, handleTagKeyDown } =
    useTagKeyboardNavigation({
      tags,
      focusedTagIndex,
      dispatch: (action: any) => {
        if (action.type === "SET_FOCUSED_TAG") {
          setTagState((prev) => ({
            ...prev,
            focusedTagIndex: action.index,
          }));
        }
      },
      handleTagAdd,
      handleTagRemove,
      inputValue,
      setIsOpen,
      selectedIndex,
      setSelectedIndex,
      suggestions: filteredSuggestions,
    });

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setTagState((prev) => ({ ...prev, focusedTagIndex: null }));
  };

  return (
    <div className="TagPanel">
      <div className="TagPanel__container">
        <div className="TagPanel__inputRow">
          <SearchInput
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Add tag…"
            isOpen={isOpen}
            onOpenChange={(open) => {
              // Don't close when the input has focus
              if (document.activeElement === inputRef.current) return;
              setIsOpen(open);
            }}
            onFocus={handleInputFocus}
          >
            <ResultsList>
              <TagAutocompleteResults
                suggestions={filteredSuggestions}
                selectedIndex={selectedIndex}
                inputValue={inputValue}
                onSelect={handleTagAdd}
                onHighlight={setSelectedIndex}
              />
            </ResultsList>
          </SearchInput>
        </div>
        <div className="TagPanel__tags">
          {tags.map((tag, index) => (
            <TagToken
              key={tag}
              ref={(el) => (tagRefs.current[index] = el)}
              tag={tag}
              isFocused={focusedTagIndex === index}
              supportsKeyboard={true}
              onRemove={handleTagRemove}
              onClick={() => {
                setTagState((prev) => ({ ...prev, focusedTagIndex: index }));
                tagRefs.current[index]?.focus();
              }}
              onKeyDown={(e) => handleTagKeyDown(e, index)}
            />
          ))}
        </div>
        <AiTagSuggestionsList pageId={pageId} content={content} />
      </div>
    </div>
  );
}
