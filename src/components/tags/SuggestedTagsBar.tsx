import { useAtom } from "jotai";
import { Button, Spinner } from "@radix-ui/themes";
import { tagStateAtom } from "../../state/atoms";
import { setPageTags } from "../../services/db/actions";
import { TagToken } from "./TagToken";
import "./SuggestedTagsBar.css";

interface SuggestedTagsBarProps {
  pageId: number;
  suggestedTags: string[] | null;
  isLoading: boolean;
}

export function SuggestedTagsBar({ pageId, suggestedTags, isLoading }: SuggestedTagsBarProps) {
  const [tagState, setTagState] = useAtom(tagStateAtom);
  const { tags } = tagState;

  const filteredSuggestions = suggestedTags?.filter(tag => !tags.includes(tag)) ?? [];

  const handleAddAll = () => {
    const newTags = [...tags, ...filteredSuggestions];
    setTagState(prev => ({ ...prev, tags: newTags }));
    setPageTags(pageId, newTags);
  };

  return (
    <div className="SuggestedTagsBar">
      <div className="SuggestedTagsBar-container">
        {isLoading ? (
          <div className="SuggestedTagsBar-loading">
            <Spinner />
          </div>
        ) : filteredSuggestions.length > 0 ? (
          <>
            <div className="SuggestedTagsBar-tags">
              {filteredSuggestions.map(tag => (
                <TagToken
                  key={tag}
                  tag={tag}
                  showRemoveButton={false}
                  onClick={() => {
                    const newTags = [...tags, tag];
                    setTagState(prev => ({ ...prev, tags: newTags }));
                    setPageTags(pageId, newTags);
                  }}
                />
              ))}
            </div>
            <Button
              className="SuggestedTagsBar-addAll"
              onClick={handleAddAll}
              size="1"
            >
              Add all
            </Button>
          </>
        ) : (
          <div className="SuggestedTagsBar-empty">
            No suggestions available
          </div>
        )}
      </div>
    </div>
  );
}
