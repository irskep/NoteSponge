import { useCallback, useEffect, useRef, useReducer, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { getPageTags, fuzzyFindTags, setPageTags } from "../db/actions";
import { Cross2Icon } from "@radix-ui/react-icons";
import "./TagBar.css";

interface TagBarProps {
  pageId: number;
}

interface TagState {
  tags: string[];
  focusedTagIndex: number | null;
}

type TagAction = 
  | { type: 'SET_TAGS'; tags: string[] }
  | { type: 'ADD_TAG'; tag: string }
  | { type: 'REMOVE_TAG'; tag: string }
  | { type: 'SET_FOCUSED_TAG'; index: number | null };

function tagReducer(state: TagState, action: TagAction): TagState {
  switch (action.type) {
    case 'SET_TAGS':
      return { ...state, tags: action.tags };
    case 'ADD_TAG':
      const trimmedTag = action.tag.trim().toLowerCase();
      if (!trimmedTag || state.tags.includes(trimmedTag)) {
        return state;
      }
      return {
        ...state,
        tags: [...state.tags, trimmedTag],
        focusedTagIndex: null
      };
    case 'REMOVE_TAG':
      return {
        ...state,
        tags: state.tags.filter(tag => tag !== action.tag),
        focusedTagIndex: null
      };
    case 'SET_FOCUSED_TAG':
      return { ...state, focusedTagIndex: action.index };
    default:
      return state;
  }
}

export function TagBar({ pageId }: TagBarProps) {
  const [{ tags, focusedTagIndex }, dispatch] = useReducer(tagReducer, {
    tags: [],
    focusedTagIndex: null
  });

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<
    { tag: string; count: number }[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load initial tags
  useEffect(() => {
    getPageTags(pageId).then(tags => dispatch({ type: 'SET_TAGS', tags }));
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
      dispatch({ type: 'REMOVE_TAG', tag: tagToRemove });
      setPageTags(pageId, tags.filter(tag => tag !== tagToRemove));
    },
    [pageId, tags]
  );

  const handleTagAdd = useCallback(
    (newTag: string) => {
      dispatch({ type: 'ADD_TAG', tag: newTag });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (focusedTagIndex !== null) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const newIndex = Math.max(0, focusedTagIndex - 1);
        dispatch({ type: 'SET_FOCUSED_TAG', index: newIndex });
        tagRefs.current[newIndex]?.focus();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (focusedTagIndex === tags.length - 1) {
          dispatch({ type: 'SET_FOCUSED_TAG', index: null });
          inputRef.current?.focus();
        } else {
          const newIndex = Math.min(tags.length - 1, focusedTagIndex + 1);
          dispatch({ type: 'SET_FOCUSED_TAG', index: newIndex });
          tagRefs.current[newIndex]?.focus();
        }
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        const tagToRemove = tags[focusedTagIndex];
        handleTagRemove(tagToRemove);
        if (focusedTagIndex > 0) {
          const newIndex = focusedTagIndex - 1;
          dispatch({ type: 'SET_FOCUSED_TAG', index: newIndex });
          tagRefs.current[newIndex]?.focus();
        } else {
          dispatch({ type: 'SET_FOCUSED_TAG', index: null });
          inputRef.current?.focus();
        }
      }
      return;
    }

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
      if (
        selectedIndex !== null &&
        selectedIndex < filteredSuggestions.length
      ) {
        handleTagAdd(filteredSuggestions[selectedIndex].tag);
      } else if (inputValue) {
        handleTagAdd(inputValue);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Backspace" && !inputValue) {
      if (tags.length > 0) {
        const lastIndex = tags.length - 1;
        dispatch({ type: 'SET_FOCUSED_TAG', index: lastIndex });
        tagRefs.current[lastIndex]?.focus();
      }
    } else if (e.key === "ArrowLeft" && !inputValue && tags.length > 0) {
      const lastIndex = tags.length - 1;
      dispatch({ type: 'SET_FOCUSED_TAG', index: lastIndex });
      tagRefs.current[lastIndex]?.focus();
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) {
        dispatch({ type: 'SET_FOCUSED_TAG', index: index - 1 });
        tagRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (index < tags.length - 1) {
        dispatch({ type: 'SET_FOCUSED_TAG', index: index + 1 });
        tagRefs.current[index + 1]?.focus();
      } else {
        dispatch({ type: 'SET_FOCUSED_TAG', index: null });
        inputRef.current?.focus();
      }
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      handleTagRemove(tags[index]);
      if (index > 0) {
        dispatch({ type: 'SET_FOCUSED_TAG', index: index - 1 });
        tagRefs.current[index - 1]?.focus();
      } else {
        dispatch({ type: 'SET_FOCUSED_TAG', index: null });
        inputRef.current?.focus();
      }
    }
  };

  const renderSuggestions = () => {
    if (!inputValue && filteredSuggestions.length === 0) {
      return (
        <div className="TagBar-item TagBar-empty">
          Begin typing to search or create tags
        </div>
      );
    }

    return (
      <>
        {filteredSuggestions.map(({ tag, count }, index) => (
          <button
            key={tag}
            className={`TagBar-item${
              index === selectedIndex ? " selected" : ""
            }`}
            onClick={() => handleTagAdd(tag)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span>{tag}</span>
            <span className="TagBar-count">{count}</span>
          </button>
        ))}
        {inputValue &&
          !filteredSuggestions.some(
            (s) => s.tag.toLowerCase() === inputValue.toLowerCase()
          ) && (
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
      </>
    );
  };

  return (
    <div className="TagBar">
      <div className="TagBar-container">
        {tags.map((tag, index) => (
          <div
            key={tag}
            ref={(el) => (tagRefs.current[index] = el)}
            className={`TagBar-tag${focusedTagIndex === index ? " focused" : ""}`}
            tabIndex={0}
            onClick={() => {
              dispatch({ type: 'SET_FOCUSED_TAG', index });
              tagRefs.current[index]?.focus();
            }}
            onKeyDown={(e) => handleTagKeyDown(e, index)}
          >
            <span>{tag}</span>
            <button
              className="TagBar-removeButton"
              onClick={(e) => {
                e.stopPropagation();
                handleTagRemove(tag);
              }}
              tabIndex={-1}
            >
              <Cross2Icon />
            </button>
          </div>
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
                  dispatch({ type: 'SET_FOCUSED_TAG', index: null });
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
                {renderSuggestions()}
              </div>
              <Popover.Arrow className="TagBar-arrow" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}
