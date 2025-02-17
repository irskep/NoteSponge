import { Cross2Icon } from "@radix-ui/react-icons";
import { forwardRef } from "react";
import "./TagToken.css";

interface TagTokenProps {
  tag: string;
  isFocused: boolean;
  onRemove: (tag: string) => void;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const TagToken = forwardRef<HTMLDivElement, TagTokenProps>(
  function TagToken({ tag, isFocused, onRemove, onClick, onKeyDown }, ref) {
    return (
      <div
        ref={ref}
        className={`TagBar-tag${isFocused ? " focused" : ""}`}
        tabIndex={0}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <span>{tag}</span>
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
      </div>
    );
  }
);
