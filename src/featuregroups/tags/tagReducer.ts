export interface TagState {
  tags: string[];
}

export type TagAction =
  | { type: "SET_TAGS"; tags: string[] }
  | { type: "ADD_TAG"; tag: string }
  | { type: "REMOVE_TAG"; tag: string };

export function tagReducer(state: TagState, action: TagAction): TagState {
  switch (action.type) {
    case "SET_TAGS":
      return { ...state, tags: action.tags };
    case "ADD_TAG": {
      const trimmedTag = action.tag.trim().toLowerCase();
      if (!trimmedTag || state.tags.includes(trimmedTag)) {
        return state;
      }
      return {
        ...state,
        tags: [...state.tags, trimmedTag],
      };
    }
    case "REMOVE_TAG":
      return {
        ...state,
        tags: state.tags.filter((tag) => tag !== action.tag),
      };
    default:
      return state;
  }
}
