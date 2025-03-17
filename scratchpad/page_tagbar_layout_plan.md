# Page and TagBar Layout Redesign Plan (Updated)

## Current Layout

- Currently, the TagBar appears above the Page content in a horizontal layout
- The Page component has a column flex layout with TagBar at the top
- The MetadataBar appears at the bottom of the Page component
- TagBar itself has a column layout with tags displayed horizontally

## Proposed Layout

- Move TagBar to the right side of the Page content
- Convert TagBar to a vertical layout
- Keep MetadataBar at the bottom of the main content area
- Maintain all existing functionality

## Implementation Steps

### 1. Modify Page Component Layout Using CSS Grid

- Change the Page component's layout from flexbox to CSS Grid
- Create a grid with three areas:
  - Main content area (LexicalTextEditor)
  - Right sidebar (TagBar)
  - Bottom bar (MetadataBar)
- Define grid template areas to position components correctly:
  ```css
  grid-template-areas:
    "content sidebar"
    "bottom sidebar";
  ```
- Ensure proper sizing of each area

### 2. Modify TagBar Component Layout

- Convert TagBar from horizontal to vertical orientation
- Adjust the TagBar-container to use column layout for the vertical design
- Modify the TagBar-tags container to display tags in a vertical stack instead of horizontal row
- Update scrolling behavior for vertical orientation (vertical scrolling instead of horizontal)
- Ensure TagBar spans the full height of the page

### 3. CSS Adjustments

- Update Page.css:
  - Replace flex layout with grid layout
  - Define grid template areas, columns, and rows
  - Ensure MetadataBar stays at the bottom of the content area
  - Ensure proper spacing between all components
- Update TagBar.css:
  - Modify positioning to be on the right side
  - Change width/height properties to fit vertical layout
  - Update overflow handling for vertical scrolling
  - Adjust padding and margins for vertical orientation

### 4. Component Structure Updates

- Assign grid areas to each component:
  - LexicalTextEditor: "content" area
  - TagBar: "sidebar" area
  - MetadataBar: "bottom" area
- Ensure each component has the appropriate CSS class to position it correctly

### 5. Responsive Considerations

- Ensure the layout works well on different screen sizes
- Consider collapsible TagBar for smaller screens
- Define how the grid should behave on smaller screens
- Maintain proper spacing and proportions

### 6. Component Interaction

- Ensure tag suggestions popover still works correctly with the new layout
- Verify keyboard navigation still functions properly
- Maintain focus management between components

### 7. Testing

- Test the new layout on different screen sizes
- Verify all existing functionality works with the new layout
- Check for any visual regressions

## Technical Considerations

- CSS Grid provides better control for this 3-section layout than flexbox
- Grid allows precise placement of the MetadataBar at the bottom while TagBar spans the full height
- No changes to the data flow or component hierarchy needed
- Focus on maintaining all existing functionality while changing only the visual presentation
