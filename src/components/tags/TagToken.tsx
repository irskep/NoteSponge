import { Cross2Icon } from "@radix-ui/react-icons";
import { forwardRef } from "react";
import "./TagToken.css";

interface TagTokenProps {
  tag: string;
  isFocused?: boolean;
  showRemoveButton?: boolean;
  supportsKeyboard?: boolean;
  isSuggestion?: boolean;
  onRemove?: (tag: string) => void;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const TagToken = forwardRef<HTMLDivElement, TagTokenProps>(
  function TagToken(
    {
      tag,
      isFocused = false,
      showRemoveButton = true,
      supportsKeyboard = false,
      isSuggestion = false,
      onRemove,
      onClick,
      onKeyDown,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={`TagBar-tag${isFocused ? " focused" : ""}${
          isSuggestion ? " suggestion" : ""
        }`}
        tabIndex={supportsKeyboard ? 0 : undefined}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <span>{tag}</span>
        {showRemoveButton && onRemove && !isSuggestion && (
          <button
            className="TagBar-removeButton"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(tag);
            }}
            tabIndex={-1}
          >
            <Cross2Icon />
          </button>
        )}
      </div>
    );
  }
);
