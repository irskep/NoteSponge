import { useCallback, useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { getPageTags, fuzzyFindTags, setPageTags } from "../db/actions";
import { Cross2Icon } from "@radix-ui/react-icons";
import "./TagBar.css";

interface TagBarProps {
  pageId: number;
}

export function TagBar({ pageId }: TagBarProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<{ tag: string; count: number }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load initial tags
  useEffect(() => {
    getPageTags(pageId).then(setTags);
  }, [pageId]);

  // Load tag suggestions when input changes
  useEffect(() => {
    if (inputValue) {
      fuzzyFindTags(inputValue).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
    setSelectedIndex(null);
  }, [inputValue]);

  const handleTagRemove = useCallback(
    (tagToRemove: string) => {
      const newTags = tags.filter((tag) => tag !== tagToRemove);
      setTags(newTags);
      setPageTags(pageId, newTags);
    },
    [pageId, tags]
  );

  const handleTagAdd = useCallback(
    (newTag: string) => {
      const trimmedTag = newTag.trim().toLowerCase();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        const newTags = [...tags, trimmedTag];
        setTags(newTags);
        setPageTags(pageId, newTags);
      }
      setInputValue("");
      setIsOpen(false);
    },
    [pageId, tags]
  );

  const filteredSuggestions = suggestions.filter(
    ({ tag }) => !tags.includes(tag)
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => {
        if (i === null) return 0;
        return Math.min(i + 1, filteredSuggestions.length - 1);
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => {
        if (i === null) return filteredSuggestions.length - 1;
        return Math.max(i - 1, 0);
      });
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (selectedIndex !== null && selectedIndex < filteredSuggestions.length) {
        handleTagAdd(filteredSuggestions[selectedIndex].tag);
      } else if (inputValue) {
        handleTagAdd(inputValue);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="TagBar">
      <div className="TagBar-container">
        {tags.map((tag) => (
          <div key={tag} className="TagBar-tag">
            <span>{tag}</span>
            <button
              className="TagBar-removeButton"
              onClick={() => handleTagRemove(tag)}
            >
              <Cross2Icon />
            </button>
          </div>
        ))}
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
          <Popover.Anchor>
            <div className="TagBar-inputWrapper">
              <input
                ref={inputRef}
                className="TagBar-input"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Add tag..."
              />
            </div>
          </Popover.Anchor>
          <Popover.Portal>
            <Popover.Content 
              className="TagBar-content" 
              side="bottom" 
              align="start" 
              sideOffset={4}
              avoidCollisions
            >
              <div className="TagBar-suggestions">
                {filteredSuggestions.map(({ tag, count }, index) => (
                  <button
                    key={tag}
                    className={`TagBar-item${index === selectedIndex ? " selected" : ""}`}
                    onClick={() => handleTagAdd(tag)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span>{tag}</span>
                    <span className="TagBar-count">{count}</span>
                  </button>
                ))}
                {inputValue && (
                  <button
                    className={`TagBar-item TagBar-newItem${
                      selectedIndex === null ? " selected" : ""
                    }`}
                    onClick={() => handleTagAdd(inputValue)}
                    onMouseEnter={() => setSelectedIndex(null)}
                  >
                    Create "{inputValue}"
                  </button>
                )}
                {!inputValue && (
                  <div className="TagBar-item TagBar-empty">
                    Begin typing to search or create tags
                  </div>
                )}
              </div>
              <Popover.Arrow className="TagBar-arrow" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}
