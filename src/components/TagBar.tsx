import { useCallback, useEffect, useReducer, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { getPageTags, fuzzyFindTags, setPageTags } from "../db/actions";
import { tagReducer } from "../reducers/tagReducer";
import { useTagKeyboardNavigation } from "../hooks/useTagKeyboardNavigation";
import { TagSuggestions } from "./TagSuggestions";
import { TagToken } from "./TagToken";
import "./TagBar.css";

interface TagBarProps {
  pageId: number;
}

export function TagBar({ pageId }: TagBarProps) {
  const [{ tags, focusedTagIndex }, dispatch] = useReducer(tagReducer, {
    tags: [],
    focusedTagIndex: null,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<
    { tag: string; count: number }[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Load initial tags
  useEffect(() => {
    getPageTags(pageId).then((tags) => dispatch({ type: "SET_TAGS", tags }));
  }, [pageId]);

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
  }, [inputValue]);

  const handleTagRemove = useCallback(
    (tagToRemove: string) => {
      dispatch({ type: "REMOVE_TAG", tag: tagToRemove });
      setPageTags(
        pageId,
        tags.filter((tag) => tag !== tagToRemove)
      );
    },
    [pageId, tags]
  );

  const handleTagAdd = useCallback(
    (newTag: string) => {
      dispatch({ type: "ADD_TAG", tag: newTag });
      const trimmedTag = newTag.trim().toLowerCase();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setPageTags(pageId, [...tags, trimmedTag]);
      }
      setInputValue("");
      setIsOpen(false);
    },
    [pageId, tags]
  );

  const filteredSuggestions = suggestions.filter(
    ({ tag }) => !tags.includes(tag)
  );

  const { inputRef, tagRefs, handleKeyDown, handleTagKeyDown } =
    useTagKeyboardNavigation({
      tags,
      focusedTagIndex,
      dispatch,
      handleTagAdd,
      handleTagRemove,
      inputValue,
      setIsOpen,
      selectedIndex,
      setSelectedIndex,
      suggestions: filteredSuggestions,
    });

  return (
    <div className="TagBar">
      <div className="TagBar-container">
        {tags.map((tag, index) => (
          <TagToken
            key={tag}
            ref={(el) => (tagRefs.current[index] = el)}
            tag={tag}
            isFocused={focusedTagIndex === index}
            onRemove={handleTagRemove}
            onClick={() => {
              dispatch({ type: "SET_FOCUSED_TAG", index });
              tagRefs.current[index]?.focus();
            }}
            onKeyDown={(e) => handleTagKeyDown(e, index)}
          />
        ))}
        <Popover.Root
          open={isOpen}
          onOpenChange={(open) => {
            if (document.activeElement === inputRef.current) return;
            setIsOpen(open);
          }}
        >
          <Popover.Anchor className="TagBar-inputAnchor">
            <div className="TagBar-inputWrapper">
              <input
                ref={inputRef}
                className="TagBar-input"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => {
                  setIsOpen(true);
                  dispatch({ type: "SET_FOCUSED_TAG", index: null });
                }}
                onBlur={() => setIsOpen(false)}
                onKeyDown={handleKeyDown}
                placeholder="Add tag..."
              />
            </div>
          </Popover.Anchor>
          <Popover.Portal>
            <Popover.Content
              className="TagBar-content"
              onOpenAutoFocus={(e) => e.preventDefault()}
              side="bottom"
              align="start"
              sideOffset={4}
              avoidCollisions
            >
              <div className="TagBar-suggestions">
                <TagSuggestions
                  suggestions={filteredSuggestions}
                  selectedIndex={selectedIndex}
                  inputValue={inputValue}
                  onSelect={handleTagAdd}
                  onHighlight={setSelectedIndex}
                />
              </div>
              <Popover.Arrow className="TagBar-arrow" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}
