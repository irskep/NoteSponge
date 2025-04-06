import { Cross2Icon } from "@radix-ui/react-icons";
import { forwardRef } from "react";
import "./TagToken.css";
import { Flex, IconButton, Text } from "@radix-ui/themes";

interface TagTokenProps {
  tag: string;
  showRemoveButton?: boolean;
  supportsKeyboard?: boolean;
  isSuggestion?: boolean;
  onRemove?: (tag: string) => void;
  onClick?: () => void;
}

export const TagToken = forwardRef<HTMLDivElement, TagTokenProps>(function TagToken(
  { tag, showRemoveButton = true, supportsKeyboard = false, isSuggestion = false, onRemove, onClick },
  ref,
) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "Backspace" || e.key === "Delete") && onRemove) {
      e.preventDefault();
      onRemove(tag);
    }
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Flex
      ref={ref}
      className={`TagToken${isSuggestion ? " TagToken--suggestion" : ""}`}
      tabIndex={supportsKeyboard ? 0 : undefined}
      onKeyDown={supportsKeyboard ? handleKeyDown : undefined}
      onClick={onClick}
      align="center"
      gap="1"
    >
      <Text
        size="1"
        role="button"
        onClick={(e) => {
          e.preventDefault();
          onClick?.();
        }}
      >
        {tag}
      </Text>
      {showRemoveButton && onRemove && !isSuggestion && (
        <IconButton
          size="1"
          variant="ghost"
          color="gray"
          radius="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          tabIndex={-1}
        >
          <Cross2Icon width="14" height="14" />
        </IconButton>
      )}
    </Flex>
  );
});
