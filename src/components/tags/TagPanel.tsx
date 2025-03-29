import { AutomaticTagSuggestions } from "@/components/tags/AutomaticTagSuggestions";
import { TagAutocompleteInput } from "@/components/tags/TagAutocompleteInput";
import { TagToken } from "@/components/tags/TagToken";
import { fuzzyFindTags } from "@/services/db/actions/tags";
import {
  currentPageIdAtom,
  isTagPopoverOpenAtom,
  sidebarSectionStateAtom,
  tagInputValueAtom,
  tagSelectedIndexAtom,
  tagSuggestionsAtom,
} from "@/state/atoms";
import { Box, Flex, Text } from "@radix-ui/themes";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import "./TagPanel.css";
import { SidebarSection } from "@/components/page/SidebarSection";
import { fetchRelatedPages } from "@/services/page";
import useSyncTags from "@/state/hooks/useSyncTags";
import { activePageTagsAtom, pageTagsAtom } from "@/state/pageState";
import { getTauriSettingsStore } from "@/state/store";
import { getDefaultStore } from "jotai";

interface TagPanelProps {
  pageId: number;
  content: string;
}

/**
 * Ensures that a specific sidebar section is expanded for the given page
 * @param sectionName The name of the section to expand
 * @param pageId The current page ID
 * @returns True if the section was expanded, false if it was already expanded
 */
const ensureSectionExpanded = async (sectionName: string, pageId: number): Promise<boolean> => {
  const jotaiStore = getDefaultStore();
  const sectionState = jotaiStore.get(sidebarSectionStateAtom);

  // Check if the section is collapsed
  const isCollapsed = sectionState[pageId]?.[sectionName];

  // If already expanded, no action needed
  if (!isCollapsed) {
    return false;
  }

  // Create new state with section expanded
  const newState = {
    ...sectionState,
    [pageId]: {
      ...sectionState[pageId],
      [sectionName]: false,
    },
  };

  // Update atom state
  jotaiStore.set(sidebarSectionStateAtom, newState);

  // Also update the Tauri store directly to ensure persistence
  try {
    const store = await getTauriSettingsStore();
    await store.set("sidebar_section_collapsed_state", newState);
  } catch (err) {
    // Handle error silently
  }

  // Force layout calculation to ensure DOM updates
  document.body.offsetHeight;

  return true;
};

// Export a function to focus the tag input from anywhere in the app
export const focusTagInput = async () => {
  // Get the current page ID from the Jotai atom
  const jotaiStore = getDefaultStore();
  const pageId = jotaiStore.get(currentPageIdAtom);

  if (pageId === null || pageId === undefined) {
    return;
  }

  await ensureSectionExpanded("Tags", pageId);

  setTimeout(() => {
    const tagInput = document.querySelector(".TagPanel input") as HTMLInputElement;

    if (tagInput) {
      tagInput.focus();
    }
  }, 0);
};

export function TagPanel({ pageId, content: pageContent }: TagPanelProps) {
  const [, setIsOpen] = useAtom(isTagPopoverOpenAtom);
  const [inputValue, setInputValue] = useAtom(tagInputValueAtom);
  const [, setSuggestions] = useAtom(tagSuggestionsAtom);
  const [, setSelectedIndex] = useAtom(tagSelectedIndexAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);

  const tags = useAtomValue(activePageTagsAtom) ?? [];
  const [pageTags, setPageTags] = useAtom(pageTagsAtom);
  const tagsCount = tags?.length ?? 0;

  const setActivePageTags = useCallback(
    (tags: string[]) => {
      setPageTags({ ...pageTags, [pageId]: tags });
    },
    [pageId, pageTags, setPageTags],
  );

  useSyncTags();

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
    (tagToRemove: string, index: number) => {
      // Remove the tag
      setActivePageTags(tags.filter((tag) => tag !== tagToRemove));

      // Focus the previous tag or the input field
      setTimeout(() => {
        if (index > 0) {
          tagRefs.current[index - 1]?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 0);
    },
    [tags, setActivePageTags],
  );

  const handleTagAdd = useCallback(
    (newTag: string) => {
      const trimmedTag = newTag.trim().toLowerCase();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        setActivePageTags([...tags, trimmedTag]);
      }
      setInputValue("");
      setIsOpen(false);
    },
    [tags, setActivePageTags, setInputValue, setIsOpen],
  );

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value) {
      setIsOpen(true);
    }
  };

  const tagPanelContent = (
    <Box className="TagPanel">
      <Flex direction="column" gap="2" height="100%">
        <Box className="TagPanel__inputRow">
          <TagAutocompleteInput
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onSelectTag={handleTagAdd}
            className="TagPanel__input"
          />
        </Box>

        <Flex direction="column" gap="2">
          <Flex direction="row" gap="2" wrap="wrap" width="100%">
            {tags.map((tag, index) => (
              <TagToken
                key={tag}
                ref={(el) => {
                  tagRefs.current[index] = el;
                }}
                tag={tag}
                supportsKeyboard={true}
                onRemove={(tag) => handleTagRemove(tag, index)}
              />
            ))}
          </Flex>
          <Text size="1" color="gray">
            Claude suggests:
          </Text>
          <AutomaticTagSuggestions pageId={pageId} content={pageContent} />
        </Flex>
      </Flex>
    </Box>
  );

  return (
    <SidebarSection title="Tags" grow shrink itemCount={tagsCount} defaultCollapsed={false} pageId={pageId}>
      {tagPanelContent}
    </SidebarSection>
  );
}
