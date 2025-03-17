import { useAtom } from "jotai";
import { Button, Flex, Spinner, Text, Theme } from "@radix-ui/themes";
import * as Popover from "@radix-ui/react-popover";
import {
  tagStateAtom,
  filteredAiSuggestionsAtom,
  aiSuggestedTagsAtom,
  isLoadingAiTagsAtom,
} from "../../state/atoms";
import { setPageTags } from "../../services/db/actions";
import { TagToken } from "./TagToken";
import { MagicWandIcon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { suggestTags } from "../../services/ai/tagging";
import "./TagSuggestionsControl.css";

interface SuggestedTagsBarProps {
  pageId: number;
  content: string;
}

export function TagSuggestionsControl({
  pageId,
  content,
}: SuggestedTagsBarProps) {
  const [tagState, setTagState] = useAtom(tagStateAtom);
  const [filteredSuggestions] = useAtom(filteredAiSuggestionsAtom);
  const [_, setAiSuggestedTags] = useAtom(aiSuggestedTagsAtom);
  const [isLoadingAiTags, setIsLoadingAiTags] = useAtom(isLoadingAiTagsAtom);
  const { tags } = tagState;
  const [open, setOpen] = useState(false);
  const previousTextRef = useRef<string>("");
  const [hasRequestedSuggestions, setHasRequestedSuggestions] = useState(false);

  const debouncedSuggestTags = useDebouncedCallback(
    async (text: string, pageId: number | undefined) => {
      try {
        const tags = await suggestTags(text, pageId);
        setAiSuggestedTags(tags);
      } finally {
        setIsLoadingAiTags(false);
      }
    },
    3000
  );

  useEffect(() => {
    if (content !== previousTextRef.current) {
      previousTextRef.current = content;
      setIsLoadingAiTags(true);
      setHasRequestedSuggestions(true);
      debouncedSuggestTags(content, pageId);
    }
  }, [content, pageId, debouncedSuggestTags]);

  // If we've never requested suggestions, show nothing
  if (!hasRequestedSuggestions) {
    return null;
  }

  // If we're loading, show only the spinner
  if (isLoadingAiTags) {
    return (
      <div style={{ boxSizing: "border-box", display: "inline-block" }}>
        <Spinner className="suggestions-spinner" />
      </div>
    );
  }

  // If we have no suggestions after loading, show just the icon and 0
  if (!filteredSuggestions || filteredSuggestions.length === 0) {
    return (
      <div className="suggestions-indicator">
        <MagicWandIcon />
        <Text size="1" color="gray">
          0
        </Text>
      </div>
    );
  }

  // If we have suggestions, show the button with icon and count
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div
          style={{
            transform:
              "translateX(calc(-1 * var(--space-2))) translateY(var(--space-1))",
          }}
        >
          <Button variant="ghost" className="suggestions-button">
            <MagicWandIcon />
            <Text size="1" color="gray">
              {filteredSuggestions.length}
            </Text>
          </Button>
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="suggestions-content TagBar-content"
          onMouseLeave={() => setOpen(false)}
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <Theme>
            <Flex direction="column" gap="2">
              <Flex gap="2" wrap="wrap" align="center">
                {filteredSuggestions.length > 0 && (
                  <Button
                    size="1"
                    onClick={() => {
                      const newTags = [
                        ...new Set([...tags, ...filteredSuggestions]),
                      ];
                      setTagState((prev) => ({ ...prev, tags: newTags }));
                      setPageTags(pageId, newTags);
                      setOpen(false);
                    }}
                  >
                    Add all
                  </Button>
                )}
                {filteredSuggestions.map((tag) => (
                  <TagToken
                    key={tag}
                    tag={tag}
                    showRemoveButton={false}
                    isSuggestion={true}
                    onClick={() => {
                      const newTags = [...tags, tag];
                      setTagState((prev) => ({ ...prev, tags: newTags }));
                      setPageTags(pageId, newTags);
                    }}
                  />
                ))}
              </Flex>
            </Flex>
            <Popover.Arrow className="TagBar-arrow" />
          </Theme>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
