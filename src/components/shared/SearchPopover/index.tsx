// Keep backward compatibility with existing imports
export { SearchInput } from "@/components/shared/SearchPopover/SearchInput";
export { ResultItem } from "@/components/shared/SearchPopover/ResultItem";
export { ResultsList } from "@/components/shared/SearchPopover/ResultsList";
export {
  StatusDisplay,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/shared/SearchPopover/StatusDisplay";

// Export our new SearchPopover component
export { SearchPopover, type SearchResult } from "@/components/shared/SearchPopover/SearchPopover";
