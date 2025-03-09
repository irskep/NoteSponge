import { useRef } from "react";
import type { TagAction } from "../state/reducers/tagReducer";

export type KeyHandler = (e: React.KeyboardEvent) => void;

interface UseTagKeyboardNavigationProps {
  tags: string[];
  focusedTagIndex: number | null;
  dispatch: React.Dispatch<TagAction>;
  handleTagAdd: (tag: string) => void;
  handleTagRemove: (tag: string) => void;
  inputValue: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedIndex: number | null;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  suggestions: Array<{ tag: string; count: number }>;
}

export function useTagKeyboardNavigation({
  tags,
  focusedTagIndex,
  dispatch,
  handleTagAdd,
  handleTagRemove,
  inputValue,
  setIsOpen,
  selectedIndex,
  setSelectedIndex,
  suggestions,
}: UseTagKeyboardNavigationProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);

  const tagFocusedHandlers: Record<string, KeyHandler> = {
    ArrowLeft: (e) => {
      e.preventDefault();
      if (focusedTagIndex === null) return;
      const newIndex = Math.max(0, focusedTagIndex - 1);
      dispatch({ type: "SET_FOCUSED_TAG", index: newIndex });
      tagRefs.current[newIndex]?.focus();
    },
    ArrowRight: (e) => {
      e.preventDefault();
      if (focusedTagIndex === null) return;
      if (focusedTagIndex === tags.length - 1) {
        dispatch({ type: "SET_FOCUSED_TAG", index: null });
        inputRef.current?.focus();
      } else {
        const newIndex = Math.min(tags.length - 1, focusedTagIndex + 1);
        dispatch({ type: "SET_FOCUSED_TAG", index: newIndex });
        tagRefs.current[newIndex]?.focus();
      }
    },
    Backspace: (e) => {
      e.preventDefault();
      if (focusedTagIndex === null) return;
      const tagToRemove = tags[focusedTagIndex];
      handleTagRemove(tagToRemove);
      if (focusedTagIndex > 0) {
        const newIndex = focusedTagIndex - 1;
        dispatch({ type: "SET_FOCUSED_TAG", index: newIndex });
        tagRefs.current[newIndex]?.focus();
      } else {
        dispatch({ type: "SET_FOCUSED_TAG", index: null });
        inputRef.current?.focus();
      }
    },
    Delete: (e) => tagFocusedHandlers.Backspace(e),
    Tab: () => {
      dispatch({ type: "SET_FOCUSED_TAG", index: null });
    },
  };

  const inputFocusedHandlers: Record<string, KeyHandler> = {
    ArrowDown: (e) => {
      e.preventDefault();
      setSelectedIndex((i) => {
        if (i === null) return 0;
        return Math.min(i + 1, suggestions.length - 1);
      });
    },
    ArrowUp: (e) => {
      e.preventDefault();
      setSelectedIndex((i) => {
        if (i === null) return suggestions.length - 1;
        return Math.max(i - 1, 0);
      });
    },
    Enter: (e) => {
      if (e.shiftKey) return;
      e.preventDefault();
      if (selectedIndex !== null && selectedIndex < suggestions.length) {
        handleTagAdd(suggestions[selectedIndex].tag);
      } else if (inputValue) {
        handleTagAdd(inputValue);
      }
    },
    Escape: () => {
      setIsOpen(false);
      inputRef.current?.blur();
    },
    Backspace: () => {
      if (inputValue) return;
      if (tags.length > 0) {
        const lastIndex = tags.length - 1;
        dispatch({ type: "SET_FOCUSED_TAG", index: lastIndex });
        tagRefs.current[lastIndex]?.focus();
      }
    },
    ArrowLeft: () => {
      if (inputValue) return;
      if (tags.length > 0) {
        const lastIndex = tags.length - 1;
        dispatch({ type: "SET_FOCUSED_TAG", index: lastIndex });
        tagRefs.current[lastIndex]?.focus();
      }
    },
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const handlers =
      focusedTagIndex !== null ? tagFocusedHandlers : inputFocusedHandlers;
    const handler = handlers[e.key];
    if (handler) {
      handler(e);
    }
  };

  const handleTagKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    const handlers: Record<string, KeyHandler> = {
      ArrowLeft: (e) => {
        e.preventDefault();
        if (index > 0) {
          dispatch({ type: "SET_FOCUSED_TAG", index: index - 1 });
          tagRefs.current[index - 1]?.focus();
        }
      },
      ArrowRight: (e) => {
        e.preventDefault();
        if (index < tags.length - 1) {
          dispatch({ type: "SET_FOCUSED_TAG", index: index + 1 });
          tagRefs.current[index + 1]?.focus();
        } else {
          dispatch({ type: "SET_FOCUSED_TAG", index: null });
          inputRef.current?.focus();
        }
      },
      Backspace: (e) => {
        e.preventDefault();
        handleTagRemove(tags[index]);
        if (index > 0) {
          const newIndex = index - 1;
          dispatch({ type: "SET_FOCUSED_TAG", index: newIndex });
          tagRefs.current[newIndex]?.focus();
        } else {
          dispatch({ type: "SET_FOCUSED_TAG", index: null });
          inputRef.current?.focus();
        }
      },
      Delete: (e) => handlers.Backspace(e),
      Tab: () => {
        dispatch({ type: "SET_FOCUSED_TAG", index: null });
      },
    };

    const handler = handlers[e.key];
    if (handler) {
      handler(e);
    }
  };

  return {
    inputRef,
    tagRefs,
    handleKeyDown,
    handleTagKeyDown,
  };
}
