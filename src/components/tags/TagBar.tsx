import { useCallback, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  getPageTags,
  fuzzyFindTags,
  setPageTags,
} from "../../services/db/actions";
import { useTagKeyboardNavigation } from "../../hooks/useTagKeyboardNavigation";
import { TagSuggestions } from "./TagSuggestions";
import { TagToken } from "./TagToken";
import { useAtom } from "jotai";
import {
  tagStateAtom,
  tagSuggestionsAtom,
  tagInputValueAtom,
  tagSelectedIndexAtom,
  isTagPopoverOpenAtom,
} from "../../state/atoms";
import "./TagBar.css";
import { SuggestedTagsBar } from "./SuggestedTagsBar";

interface TagBarProps {
  pageId: number;
  content: string;
}

// Export a function to focus the tag input from anywhere in the app
export const focusTagInput = () => {
  const tagInput = document.querySelector(".TagBar-input") as HTMLInputElement;
  if (tagInput) {
    tagInput.focus();
  }
};

export function TagBar({ pageId, content }: TagBarProps) {
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

  return (
    <div className="TagBar">
      <div className="TagBar-container">
        <div className="TagBar-tags">
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

        <div className="TagBar-input-row">
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
                    setTagState((prev) => ({ ...prev, focusedTagIndex: null }));
                  }}
                  onBlur={() => setIsOpen(false)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tag…"
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
          <SuggestedTagsBar pageId={pageId} content={content} />
        </div>
      </div>
    </div>
  );
}
