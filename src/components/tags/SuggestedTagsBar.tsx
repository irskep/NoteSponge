import { useAtom } from "jotai";
import { Button, Flex, Popover, Spinner, Text } from "@radix-ui/themes";
import { tagStateAtom, filteredAiSuggestionsAtom } from "../../state/atoms";
import { setPageTags } from "../../services/db/actions";
import { TagToken } from "./TagToken";
import { MagicWandIcon } from "@radix-ui/react-icons";
import "./SuggestedTagsBar.css";

const pluralize = (count: number, singular: string, plural: string) =>
  count === 1 ? singular : plural;

interface SuggestedTagsBarProps {
  pageId: number;
  isLoading: boolean;
}

export function SuggestedTagsBar({ pageId, isLoading }: SuggestedTagsBarProps) {
  const [tagState, setTagState] = useAtom(tagStateAtom);
  const [filteredSuggestions] = useAtom(filteredAiSuggestionsAtom);
  const { tags } = tagState;

  const handleAddAll = () => {
    if (!filteredSuggestions) return;
    const newTags = [...tags, ...filteredSuggestions];
    setTagState((prev) => ({ ...prev, tags: newTags }));
    setPageTags(pageId, newTags);
  };

  const shouldShow =
    isLoading || (filteredSuggestions && filteredSuggestions.length > 0);

  return (
    <Flex
      align="center"
      style={{ visibility: shouldShow ? "visible" : "hidden" }}
    >
      <Popover.Root>
        <Popover.Trigger>
          <Button
            variant="ghost"
            className="suggestions-button"
            style={{
              width: "140px",
              justifyContent: "flex-start",
              flexGrow: 0,
            }}
          >
            <MagicWandIcon />
            {isLoading ? (
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
        <Popover.Content>
          <Flex direction="column" gap="2">
            {filteredSuggestions && filteredSuggestions.length > 0 && (
              <>
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
                <Button size="1" onClick={handleAddAll}>
                  Add all
                </Button>
              </>
            )}
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  );
}
