import { useAtom } from "jotai";
import { Button, Flex, Popover, Spinner, Text } from "@radix-ui/themes";
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
import "./SuggestedTagsBar.css";

const pluralize = (count: number, singular: string, plural: string) =>
  count === 1 ? singular : plural;

interface SuggestedTagsBarProps {
  pageId: number;
  content: string;
}

export function SuggestedTagsBar({ pageId, content }: SuggestedTagsBarProps) {
  const [tagState, setTagState] = useAtom(tagStateAtom);
  const [filteredSuggestions] = useAtom(filteredAiSuggestionsAtom);
  const [_, setAiSuggestedTags] = useAtom(aiSuggestedTagsAtom);
  const [isLoadingAiTags, setIsLoadingAiTags] = useAtom(isLoadingAiTagsAtom);
  const { tags } = tagState;
  const [open, setOpen] = useState(false);
  const previousTextRef = useRef<string>("");

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
      debouncedSuggestTags(content, pageId);
    }
  }, [content, pageId, debouncedSuggestTags]);

  const shouldShow =
    isLoadingAiTags || (filteredSuggestions && filteredSuggestions.length > 0);

  return (
    <Flex
      align="center"
      style={{ visibility: shouldShow ? "visible" : "hidden", width: "140px" }}
      justify="center"
    >
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger disabled={isLoadingAiTags}>
          <Button
            variant="ghost"
            className="suggestions-button"
            style={{
              justifyContent: "flex-start",
              flexGrow: 0,
            }}
          >
            <MagicWandIcon />
            {isLoadingAiTags ? (
              <Spinner />
            ) : (
              <Text size="1" color="gray">
                {filteredSuggestions?.length || 0}{" "}
                {pluralize(
                  filteredSuggestions?.length || 0,
                  "suggestion",
                  "suggestions"
                )}{" "}
              </Text>
            )}
          </Button>
        </Popover.Trigger>
        <Popover.Content onMouseLeave={() => setOpen(false)}>
          <Flex direction="column" gap="2">
            {filteredSuggestions && filteredSuggestions.length > 0 && (
              <Flex gap="2" wrap="wrap">
                {filteredSuggestions.map((tag) => (
                  <TagToken
                    key={tag}
                    tag={tag}
                    showRemoveButton={false}
                    onClick={() => {
                      const newTags = [...tags, tag];
                      setTagState((prev) => ({ ...prev, tags: newTags }));
                      setPageTags(pageId, newTags);
                    }}
                  />
                ))}
              </Flex>
            )}
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  );
}
