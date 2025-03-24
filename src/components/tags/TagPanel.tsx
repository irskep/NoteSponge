import { useCallback, useEffect, useRef } from "react";
import {
  getPageTags,
  fuzzyFindTags,
  setPageTags,
} from "../../services/db/actions";
import { TagToken } from "./TagToken";
import { useAtom } from "jotai";
import {
  tagStateAtom,
  tagSuggestionsAtom,
  tagInputValueAtom,
  tagSelectedIndexAtom,
  isTagPopoverOpenAtom,
} from "../../state/atoms";
import { TagAutocompleteInput } from "./TagAutocompleteInput";
import { AutomaticTagSuggestions } from "./AutomaticTagSuggestions";
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
  const [, setIsOpen] = useAtom(isTagPopoverOpenAtom);
  const [inputValue, setInputValue] = useAtom(tagInputValueAtom);
  const [, setSuggestions] = useAtom(tagSuggestionsAtom);
  const [, setSelectedIndex] = useAtom(tagSelectedIndexAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { tags } = tagState;

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
    (tagToRemove: string, index: number) => {
      // Remove the tag
      setTagState((prev) => ({
        ...prev,
        tags: prev.tags.filter((tag) => tag !== tagToRemove),
      }));
      setPageTags(
        pageId,
        tags.filter((tag) => tag !== tagToRemove)
      );

      // Focus the previous tag or the input field
      setTimeout(() => {
        if (index > 0) {
          tagRefs.current[index - 1]?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 0);
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

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value) {
      setIsOpen(true);
    }
  };

  return (
    <div className="TagPanel">
      <div className="TagPanel__container">
        <div className="TagPanel__inputRow">
          <TagAutocompleteInput
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onSelectTag={handleTagAdd}
            className="TagPanel__input"
          />
        </div>
        <div className="TagPanel__tags">
          {tags.map((tag, index) => (
            <TagToken
              key={tag}
              ref={(el) => (tagRefs.current[index] = el)}
              tag={tag}
              supportsKeyboard={true}
              onRemove={(tag) => handleTagRemove(tag, index)}
            />
          ))}
        </div>
        <AutomaticTagSuggestions pageId={pageId} content={content} />
      </div>
    </div>
  );
}
