import { useAtom } from "jotai";
import { Button, Flex, Spinner } from "@radix-ui/themes";
import {
  tagStateAtom,
  filteredAiSuggestionsAtom,
  aiSuggestedTagsAtom,
  isLoadingAiTagsAtom,
} from "../../state/atoms";
import { setPageTags } from "../../services/db/actions";
import { TagToken } from "./TagToken";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { suggestTags } from "../../services/ai/tagging";

interface AutomaticTagSuggestionsProps {
  pageId: number;
  content: string;
}

export function AutomaticTagSuggestions({
  pageId,
  content,
}: AutomaticTagSuggestionsProps) {
  const [tagState, setTagState] = useAtom(tagStateAtom);
  const [filteredSuggestions] = useAtom(filteredAiSuggestionsAtom);
  const [_, setAiSuggestedTags] = useAtom(aiSuggestedTagsAtom);
  const [isLoadingAiTags, setIsLoadingAiTags] = useAtom(isLoadingAiTagsAtom);
  const { tags } = tagState;
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
      <Flex direction="column" gap="2" align="end">
        <div style={{ boxSizing: "border-box", display: "inline-block" }}>
          <Spinner className="suggestions-spinner" />
        </div>
      </Flex>
    );
  }

  // If we have no suggestions after loading, show just the icon and 0
  if (!filteredSuggestions || filteredSuggestions.length === 0) {
    return null;
  }

  // If we have suggestions, show the button with icon and count
  return (
    <Flex direction="column" gap="2" align="end">
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
      {filteredSuggestions.length > 0 && (
        <Button
          size="1"
          onClick={() => {
            const newTags = [...new Set([...tags, ...filteredSuggestions])];
            setTagState((prev) => ({ ...prev, tags: newTags }));
            setPageTags(pageId, newTags);
          }}
        >
          Add all
        </Button>
      )}
    </Flex>
  );
}
