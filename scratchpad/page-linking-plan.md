# Page Linking Implementation Plan

## Overview

Implement internal page linking in the text editor, allowing pages to link to other pages using the "#123" syntax, with autocomplete support for finding pages by title.

## 1. Basic Link Navigation for "#123" Syntax

- Modify `CustomLinkPlugin.tsx` to:
  - Parse link URLs on click to detect "#123" pattern (e.g., href="#123")
  - Extract the page ID from the URL
  - Use `openPageWindow(id)` from `src/services/window/index.ts` to navigate to the page
  - Add visual indication when hovering over internal links (different cursor style)
  - Maintain existing external link behavior for non-internal links
  - Distinguish between "#123" (page ID) and regular fragment identifiers

## 2. Link Editor Dialog Enhancement

- Update `LinkEditorDialog.tsx` to:
  - Have two tabs, one for external and one for internal links
  - Live update to show the title of the linked page

## 3. "#" Autocomplete Popup

- Create new components based on TagBar/TagSuggestions pattern:
  - `PageAutocompletePopup.tsx`: UI for the popup, similar to TagSuggestions
  - `PageAutocompletePlugin.tsx`: Lexical plugin to manage behavior
  - `usePageAutocompleteKeyboardNavigation.tsx`: Custom hook for keyboard navigation
- State management:
  - Create atoms in editorStateStore for:
    - `pageAutocompleteOpen` (boolean)
    - `pageAutocompleteQuery` (string)
    - `pageAutocompleteSuggestions` (array)
    - `pageAutocompleteSelectedIndex` (number | null)
- Implement logic in the plugin to:
  - Detect when "#" is typed and open popover
  - Position popup relative to cursor position (using Radix UI Popover)
  - Query pages as user types using debounced fuzzyFindPagesByTitle
  - Handle keyboard navigation (arrow keys, enter, escape)
  - Insert selected page as link on selection (Enter key or click)
- Popup component should:
  - Display page titles with IDs in a consistent format
  - Support keyboard navigation similar to TagSuggestions
  - Allow filtering as user types after "#"
  - Close when user selects an item, presses Escape, or clicks elsewhere
  - Create links with correct format when a page is selected

## Technical Considerations

- Leverage existing UI patterns:
  - Follow TagBar/TagSuggestions pattern for consistent UX
  - Use same keyboard navigation approach with arrow keys, enter, escape
  - Consider reusing the PopoverContent styling for visual consistency
- State management:
  - Use Jotai atoms in editorStateStore similar to tagStateAtom approach
  - Track popup visibility, query string, selected item
- Performance:
  - Debounce search queries to avoid excessive database hits
  - Limit number of results returned
- UX improvements:
  - Highlight exact matches vs fuzzy matches (like TagSuggestions)
  - Show recently viewed pages at the top
  - Add keyboard shortcuts for quick selection
- Window behavior:
  - Consider whether to open links in new windows (using `openPageWindow`) or navigate within the same window
  - Add option for users to control this behavior (modifier key to force new window)

## Edge Cases to Handle

- Editing existing internal links
- Empty or invalid page IDs
- Non-existent page IDs
- Handling link clicks in read-only mode
- Multiple "#" characters in a row
- Navigating away from current page (save current content before navigation)
- Handling circular references between pages
- Handling text selection before typing "#" (modify selection or insert at cursor)
- Ensuring popup positions correctly within scroll containers and around edges

## Implementation Sequence

1. Modify `CustomLinkPlugin.tsx` to handle "#123" navigation with `openPageWindow`
2. Update `LinkEditorDialog.tsx` to support internal links
3. Create atoms for page autocomplete state
4. Implement usePageAutocompleteKeyboardNavigation hook
5. Create PageAutocompletePopup and PageAutocompletePlugin components
6. Test all features and refine keyboard navigation

## Database Considerations

- Leverage existing `fuzzyFindPagesByTitle` function in actions.ts
- Add a function to validate if a page ID exists before creating a link
- Ensure database queries are efficient for real-time autocomplete
- Consider adding a relation table to track internal links between pages (optional enhancement)

## Notes for Implementation

### General Guidelines

- **DO NOT USE TAILWIND** - This project does not use Tailwind CSS
- Use existing CSS patterns with class-based styling (see .css files)
- Keep changes incremental and small (aim for <200 lines per PR)
- Do not perform incidental refactors while implementing features
- Follow existing naming conventions and code organization

### Section 1 Implementation Notes

- Focus only on modifying `CustomLinkPlugin.tsx` to handle "#123" links
- Keep changes minimal - just the detection and navigation
- Use existing CSS classes for styling link hover states
- Prioritize simplicity over edge cases initially
- Test with basic internal links before adding more complex features

### Section 2 Implementation Notes

- Study the existing `LinkEditorDialog.tsx` structure before modifying
- Reuse existing form components and styles from Radix UI
- Consider using the Radix UI FormField pattern for the page selector
- Don't over-engineer - implement the minimal viable version first

### Section 3 Implementation Notes

- Examine `TagBar.tsx` and `TagSuggestions.tsx` very closely
- Copy and adapt their structure rather than reinventing
- The Popover positioning is critical - follow existing patterns exactly
- Start with basic functionality before adding advanced features
- Use the same keyboard navigation logic as tags for consistency
- Create CSS files that match the same structure as existing components
- Pay attention to z-index issues around editor positioning
- Minimize performance impact by limiting editor re-renders

### Debugging

- Check both keyboard and mouse interactions
- Ensure good error handling for non-existent pages
