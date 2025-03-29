import { TagToken } from "@/components/tags/TagToken";
import { fetchSuggestedTags } from "@/services/ai/tagging";
import { debouncedEditorStateAtom } from "@/state/editorState";
import { aiTagSuggestionsAtoms, pageIdAtom, pageTagAtoms } from "@/state/pageState";
import { getLexicalPlainText } from "@/utils/editor";
import { Button, Flex, Spinner } from "@radix-ui/themes";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function AutomaticTagSuggestions() {
  const pageId = useAtomValue(pageIdAtom);

  const debouncedEditorState = useAtomValue(debouncedEditorStateAtom);
  const content = debouncedEditorState ? getLexicalPlainText(debouncedEditorState) : "";

  const [filteredSuggestions] = useAtom(aiTagSuggestionsAtoms.filteredSuggestions);
  const [_, setAiSuggestedTags] = useAtom(aiTagSuggestionsAtoms.suggestions);
  const [isLoadingAiTags, setIsLoadingAiTags] = useAtom(aiTagSuggestionsAtoms.isLoading);
  const previousTextRef = useRef<string>("");
  const [hasRequestedSuggestions, setHasRequestedSuggestions] = useState(false);

  const tags = useAtomValue(pageTagAtoms.activeTags) ?? [];
  const [pageTags, setPageTags] = useAtom(pageTagAtoms.tags);
  const setActivePageTags = useCallback(
    (newTags: string[]) => {
      setPageTags({ ...pageTags, [pageId]: newTags });
    },
    [pageId, pageTags, setPageTags],
  );

  const suggestTags = useCallback(
    async (text: string) => {
      console.log("suggestTags for", text);
      try {
        const tags = await fetchSuggestedTags(text, pageId);
        setAiSuggestedTags(tags);
      } finally {
        setIsLoadingAiTags(false);
      }
    },
    [setAiSuggestedTags, setIsLoadingAiTags, pageId],
  );

  const debouncedSuggestTags = useDebouncedCallback(async (text: string) => {
    suggestTags(text);
  }, 2000);

  useEffect(() => {
    if (content !== previousTextRef.current) {
      previousTextRef.current = content;
      setIsLoadingAiTags(true);
      setHasRequestedSuggestions(true);
      debouncedSuggestTags(content);
    }
  }, [content, debouncedSuggestTags, setIsLoadingAiTags]);

  // If we've never requested suggestions, show nothing
  if (!hasRequestedSuggestions) {
    return null;
  }

  // If we have no suggestions after loading, show just the icon and 0
  if (!isLoadingAiTags && (!filteredSuggestions || filteredSuggestions.length === 0)) {
    return null;
  }

  // If we have suggestions, show the button with icon and count
  return (
    <Flex direction="row" gap="2" wrap="wrap" align="center">
      {filteredSuggestions?.map((tag) => (
        <TagToken
          key={tag}
          tag={tag}
          showRemoveButton={false}
          isSuggestion={true}
          supportsKeyboard={true}
          onClick={() => {
            const newTags = [...tags, tag];
            setActivePageTags(newTags);
          }}
        />
      ))}
      {filteredSuggestions && filteredSuggestions.length > 0 && (
        <Button
          size="1"
          onClick={() => {
            const newTags = [...new Set([...tags, ...filteredSuggestions])];
            setActivePageTags(newTags);
          }}
        >
          Add all
        </Button>
      )}
      {isLoadingAiTags && (
        <Flex direction="column" gap="2" align="start">
          <div style={{ boxSizing: "border-box", display: "inline-block" }}>
            <Spinner className="suggestions-spinner" />
          </div>
        </Flex>
      )}
    </Flex>
  );
}
