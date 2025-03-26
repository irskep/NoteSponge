# Internal Link Node Implementation Plan

## 1. Create Database Loading Component ✓

- Create component that loads page title/archived status from DB
- Follow pattern from DatabaseImage.tsx for loading/error states
- Cache results to avoid repeated DB calls
- Add CSS classes for archived state
- Add window focus reactivity:
  - Use listenToWindowFocus utility
  - Re-fetch page data when window regains focus
  - Clean up listener in useEffect
  - Only update if title has changed to avoid flicker

## 2. Create Node Definition ✓

- Define SerializedInternalLinkNode interface with pageId
- Create InternalLinkNode class extending DecoratorNode
- Implement required node methods (clone, importJSON, exportJSON)
- Add markdown transformer for [[pageId]] syntax
- Use DatabasePageLink as decorator component

## 3. Create Plugin ✓

- Register node type with editor
- Create INSERT_INTERNAL_LINK_COMMAND
- Handle node creation/insertion
- Add click handler to open page (reuse from CustomLinkPlugin)

## 4. Add CSS ✓

- Style link appearance
- Add archived page styling
- Add loading/error states
- Match existing link styles from LexicalTextEditor.css

## 5. Update Editor Config ✓

- Register InternalLinkNode in nodes array
- Add InternalLinkPlugin to plugins list
- Add transformer to TRANSFORMERS array

## 6. Update CustomLinkPlugin.tsx

- Remove #123 link format handling
- Keep external link handling unchanged

## Testing Sequence:

1. Test data layer:

   - Type [[1]] to create test node via markdown
   - Verify node serialization/deserialization
   - Verify database loading

2. Test UI:

   - Verify link appearance
   - Test archived page styling
   - Test loading states
   - Test error states

3. Test interactions:
   - Verify Cmd+click opens page
   - Test markdown import/export
   - Test copy/paste behavior

Key considerations:

- Cache DB results to avoid performance issues
- Handle deleted/invalid page IDs gracefully
- Maintain markdown compatibility
- Keep consistent with existing link behavior
- Follow BEM naming convention for CSS

General guidelines:

- DO NOT RENAME ANY EXISTING TYPES. They are there for a reason and power other parts of the app. If you need a type that's similar to another type but you need more data, you can just add that data to the type and use that type, or define a new type with the data you need. Consider how a type is used before modifying it.
