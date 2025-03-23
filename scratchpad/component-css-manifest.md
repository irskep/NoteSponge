# React Components and CSS Selectors Manifest

This document lists all React components in the project and their associated CSS selectors, with BEM naming conventions applied using CamelCase for blocks and elements.

## Radix UI Usage

This project uses several Radix UI components, which come with their own CSS classes and data attributes:

- `@radix-ui/react-dialog` - Used for modals and dialogs
- `@radix-ui/react-popover` - Used for search popovers
- `@radix-ui/react-form` - Used for forms
- `@radix-ui/react-tabs` - Used for tabbed interfaces
- `@radix-ui/themes` - Used for base theme styling
- `@radix-ui/react-icons` - Used for UI icons

## Global CSS

The main CSS file is located at `src/styles/index.css` and contains global styles and utility classes.

### Global Selectors

- `:root` - CSS variables and design tokens
- `*`, `*::before`, `*::after` - Box-sizing reset
- `html`, `body` - Base styles for the document
- `body` - Global typography and colors

### Utility Classes

- `.custom-form-field input` - Custom form field styles
  → Not yet specified, ignore for now

## Component-Specific CSS

### Editor Components

#### `LexicalTextEditor.tsx` - `src/components/editor/LexicalTextEditor.css`

- `.LexicalTextEditor` - Main editor container
  → `.LexicalTextEditor`
- `.LexicalTextEditor > *` - Direct children of editor
  → `.LexicalTextEditor > *`
- `.LexicalTextEditor .editor-container` - Editor container
  → `.LexicalTextEditor__container`
- `.LexicalTextEditor .editor-inner` - Inner editor container
  → `.LexicalTextEditor__inner`
- `.LexicalTextEditor .editor-input` - Editor input field
  → `.LexicalTextEditor__input`
- `.LexicalTextEditor .editor-placeholder` - Placeholder text
  → `.LexicalTextEditor__placeholder`
- `.editor-text-bold` - Bold text formatting
  → `.LexicalTextEditor__text--bold`
- `.editor-text-italic` - Italic text formatting
  → `.LexicalTextEditor__text--italic`
- `.editor-text-underline` - Underline text formatting
  → `.LexicalTextEditor__text--underline`
- `.editor-text-strikethrough` - Strikethrough text formatting
  → `.LexicalTextEditor__text--strikethrough`
- `.editor-paragraph` - Paragraph element
  → `.LexicalTextEditor__paragraph`
- `.LexicalTextEditor a` - Link styling
  → `.LexicalTextEditor__link`
- `.LexicalTextEditor a[href^="#"]:not([href="#"])` - Internal page links
  → `.LexicalTextEditor__link--internal`
- `.editor-input.meta-pressed a:hover` - Link hover with meta key
  → `.LexicalTextEditor__input--metaPressed .LexicalTextEditor__link:hover`
- `.image-drop-target.dragging .editor-container` - Drag and drop target
  → `.ImageDropTarget--dragging .LexicalTextEditor__container`

#### `ImageDropTarget.tsx` - `src/components/editor/ImageDropTarget.css`

- `.image-drop-target` - Image drop target container
  → `.ImageDropTarget`
- `.image-drop-overlay` - Overlay when dragging an image
  → `.ImageDropTarget__overlay`
- `.image-drop-message` - Message displayed during image drag
  → `.ImageDropTarget__message`

#### `ImageNode.tsx` - `src/components/editor/lexicalplugins/ImageNode.css`

- `.editor-image-container` - Image container
  → `.ImageNode`
- `.editor-image-wrapper` - Image wrapper
  → `.ImageNode__wrapper`
- `.editor-image-wrapper img` - Actual image element
  → `.ImageNode__wrapper img`
- `.image-loading` - Loading state for images
  → `.ImageNode--loading`
- `.image-error` - Error state for images
  → `.ImageNode--error`

#### `ExternalLinkForm.tsx` - `src/components/editor/lexicalplugins/ExternalLinkForm.css`

- `.external-link-form` - Form container for external links
  → `.ExternalLinkForm`
- `.form-actions` - Action buttons container
  → `.ExternalLinkForm__actions`
- `.external-link-input` - Input field for external link URL
  → `.ExternalLinkForm__input`
- `.form-field`, `.form-input` - Used with Radix Form.Field and Form.Control
  → `.ExternalLinkForm__field`, `.ExternalLinkForm__inputControl`

#### `LinkEditorDialog.tsx` - `src/components/editor/lexicalplugins/LinkEditorDialog.css`

- `.tabs-root` - Tab container (styling for Radix Tabs.Root)
  → `.LinkEditorDialog__tabs`
- `.tabs-list` - List of tab triggers (styling for Radix Tabs.List)
  → `.LinkEditorDialog__tabsList`
- `.tabs-trigger` - Tab button (styling for Radix Tabs.Trigger)
  → `.LinkEditorDialog__tabsTrigger`
- `.tabs-trigger[data-state="active"]` - Active tab state (styling for Radix state attribute)
  → `.LinkEditorDialog__tabsTrigger--active`
- `.tabs-trigger[data-state="active"]::after` - Active tab indicator
  → `.LinkEditorDialog__tabsTrigger--active::after`
- `.tabs-content` - Tab content container (styling for Radix Tabs.Content)
  → `.LinkEditorDialog__tabsContent`
- `.tabs-content[data-state="inactive"]` - Inactive tab content (styling for Radix state attribute)
  → `.LinkEditorDialog__tabsContent--inactive`
- `.page-results` - Container for page search results
  → `.LinkEditorDialog__pageResults`
- `.page-result-item` - Individual page result
  → `.LinkEditorDialog__pageResult`
- `.page-result-item:hover` - Hover state for page result
  → `.LinkEditorDialog__pageResult:hover`
- `.page-result-item:not(:last-child)` - Border for all but last result
  → `.LinkEditorDialog__pageResult:not(:last-child)`
- `.page-result-title` - Page title in search results
  → `.LinkEditorDialog__pageResultTitle`
- `.page-result-id` - Page ID display
  → `.LinkEditorDialog__pageResultId`
- `.selected-page` - Selected page indicator
  → `.LinkEditorDialog__selectedPage`
- `.form-error` - Error message display
  → `.LinkEditorDialog__error`
- `.page-loading` - Loading state for page search
  → `.LinkEditorDialog__loading`

### Layout Components

#### `App.tsx` - `src/components/layout/App.css`

- `.App` - Main application container
  → `.App`

#### `PageWindow.tsx` - `src/components/layout/PageWindow.css`

- `.PageWindow` - Window container for pages
  → `.PageWindow`

### Page Components

#### `MetadataBar.tsx` - `src/components/page/MetadataBar.css`

- `.metadata-bar` - Metadata bar container
  → `.MetadataBar`
- `.metadata-items` - Container for metadata items
  → `.MetadataBar__items`
- `.metadata-item` - Individual metadata item
  → `.MetadataBar__item`

#### `Page.tsx` - `src/components/page/Page.css`

- `.Page` - Main page container
  → `.Page`
- `.Page.loaded` - Loaded state of page
  → `.Page--loaded`
- `.Page.loading` - Loading state of page
  → `.Page--loading`
- `.Page-content` - Content area of the page
  → `.Page__content`
- `.Page-metadata` - Metadata area of the page
  → `.Page__metadata`
- `.Page-sidebar` - Sidebar area of the page
  → `.Page__sidebar`

#### `PageListModal.tsx` - `src/components/page/PageListModal.css`

- `.dialog-overlay` - Modal overlay (styling for Radix Dialog.Overlay)
  → `.PageListModal__overlay`
- `.dialog-content` - Modal content container (styling for Radix Dialog.Content)
  → `.PageListModal__content`
- `.dialog-header` - Modal header
  → `.PageListModal__header`
- `.dialog-close` - Close button for dialog (styling for Radix Dialog.Close)
  → `.PageListModal__closeButton`
- `.dialog-close:hover` - Hover state for close button
  → `.PageListModal__closeButton:hover`
- `.dialog-close:focus-visible` - Focus state for close button
  → `.PageListModal__closeButton:focus-visible`
- `.dialog-close svg` - SVG icon in close button
  → `.PageListModal__closeButton svg`
- `.page-list-container` - Container for page list
  → `.PageListModal__listContainer`
- `.page-list` - List of pages
  → `.PageListModal__list`
- `.page-list li` - Individual page item
  → `.PageListModal__item`
- `.page-list li:hover` - Hover state for page item
  → `.PageListModal__item:hover`
- `.page-id` - Page ID display
  → `.PageListModal__itemId`
- `.page-title` - Page title display
  → `.PageListModal__itemTitle`
- `@keyframes overlayShow` - Animation for overlay
- `@keyframes contentShow` - Animation for content

#### `RelatedPages.tsx` - `src/components/page/RelatedPages.css`

- `.related-pages` - Related pages container
  → `.RelatedPages`
- `.related-pages-button` - Button to show related pages
  → `.RelatedPages__button`
- `.related-pages-content` - Content area for related pages
  → `.RelatedPages__content`
- `.related-page-link` - Link to a related page
  → `.RelatedPages__link`
- `.related-page-link:hover` - Hover state for related page link
  → `.RelatedPages__link:hover`

### Search Components

#### `SearchModal.tsx` - `src/components/search/SearchModal.css`

- `.search-dialog` - Search dialog container (styling for Radix Dialog.Content)
  → `.SearchModal__dialog`
- `.search-input-wrapper` - Wrapper for search input
  → `.SearchModal__inputWrapper`
- `.search-icon` - Search icon
  → `.SearchModal__icon`
- `.search-input` - Search input field
  → `.SearchModal__input`
- `.search-results` - Search results container
  → `.SearchModal__results`
- `.no-results` - No results message
  → `.SearchModal__noResults`
- `.search-footer` - Footer area of search
  → `.SearchModal__footer`
- `.search-shortcuts` - Keyboard shortcuts display
  → `.SearchModal__shortcuts`
- `.search-shortcuts span` - Individual shortcut item
  → `.SearchModal__shortcut`
- `@keyframes searchShow` - Animation for search dialog

### Shared Components

#### `Modal.css` (used by multiple components) - `src/components/shared/Modal.css`

- `.dialog-overlay` - Modal overlay (styling for Radix Dialog.Overlay)
  → `.Modal__overlay`
- `.dialog-content` - Modal content container (styling for Radix Dialog.Content)
  → `.Modal__content`
- `.dialog-content button` - Buttons in modal
  → `.Modal__content button`
- `.dialog-header` - Modal header
  → `.Modal__header`
- `.dialog-title` - Modal title
  → `.Modal__title`
- `.dialog-close` - Close button (styling for Radix Dialog.Close)
  → `.Modal__closeButton`
- `.dialog-close:hover` - Hover state for close button
  → `.Modal__closeButton:hover`
- `.dialog-close:focus-visible` - Focus state for close button
  → `.Modal__closeButton:focus-visible`
- `.dialog-close svg` - SVG icon in close button
  → `.Modal__closeButton svg`
- `.page-list` - List of pages in modal
  → `.Modal__pageList`
- `.page-list li` - Individual page item
  → `.Modal__pageItem`
- `.page-list li:hover` - Hover state for page item
  → `.Modal__pageItem:hover`
- `.page-list li.selected` - Selected page item
  → `.Modal__pageItem--selected`
- `@keyframes overlayShow` - Animation for overlay
- `@keyframes contentShow` - Animation for content

#### `SearchInput.tsx`, `ResultItem.tsx`, `ResultsList.tsx`, `StatusDisplay.tsx` - `src/components/shared/SearchPopover/SearchPopover.css`

- `.SearchPopover-inputAnchor` - Input anchor container (styling for Radix Popover.Anchor)
  → `.SearchInput__anchor`
- `.SearchPopover-inputWrapper` - Input wrapper
  → `.SearchInput__wrapper`
- `.SearchPopover-input` - Input field
  → `.SearchInput__input`
- `.SearchPopover-content` - Popover content container (styling for Radix Popover.Content)
  → `.SearchInput__content`
- `.SearchPopover-content[data-state="open"]` - Open state of content (styling for Radix state attribute)
  → `.SearchInput__content--open`
- `.SearchPopover-content[data-state="closed"]` - Closed state of content (styling for Radix state attribute)
  → `.SearchInput__content--closed`
- `.SearchPopover-arrow` - Arrow element (styling for Radix Popover.Arrow)
  → `.SearchInput__arrow`
- `.SearchPopover-results` - Results container
  → `.ResultsList` (matches component name)
- `.SearchPopover-resultItem` - Individual result item
  → `.ResultItem` (matches component name)
- `.SearchPopover-resultItem:not(:last-child)` - All but last result item
  → `.ResultItem:not(:last-child)`
- `.SearchPopover-resultItem:hover`, `.SearchPopover-resultItem.selected` - Hover/selected states
  → `.ResultItem:hover`, `.ResultItem--selected`
- `.SearchPopover-resultPrimary` - Primary text in result
  → `.ResultItem__primary`
- `.SearchPopover-resultSecondary` - Secondary text in result
  → `.ResultItem__secondary`
- `.SearchPopover-status` - Status message
  → `.StatusDisplay`
- `.SearchPopover-error` - Error message
  → `.StatusDisplay--error`
- `.SearchPopover-empty` - Empty state
  → `.StatusDisplay--empty`
- `.SearchPopover-resultNew` - New result item
  → `.ResultItem--new`
- `.SearchPopover-resultNewText` - Text for new item
  → `.ResultItem__newText`
- `@keyframes slideDownAndFade` - Animation for sliding down
- `@keyframes slideUpAndFade` - Animation for sliding up

### Tag Components

#### `TagBar.tsx` - `src/components/tags/TagBar.css`

- `.TagBar` - Main tag bar container
  → `.TagBar`
- `.TagBar-container` - Container for all tag bar elements
  → `.TagBar__container`
- `.TagBar-tags` - Container for tags
  → `.TagBar__tags`
- `.TagBar-container::last-child` - Last child styling
  → `.TagBar__container::last-child`
- `.TagBar-tags::-webkit-scrollbar` - Scrollbar styling
  → `.TagBar__tags::-webkit-scrollbar`
- `.TagBar-tags::-webkit-scrollbar-thumb` - Scrollbar thumb styling
  → `.TagBar__tags::-webkit-scrollbar-thumb`
- `.TagBar-tags:hover::-webkit-scrollbar-thumb` - Scrollbar thumb on hover
  → `.TagBar__tags:hover::-webkit-scrollbar-thumb`
- `.TagBar-input-row` - Input row container
  → `.TagBar__inputRow`
- `.TagBar-inputAnchor` - Input anchor point (styling for Radix Popover.Anchor)
  → `.TagBar__inputAnchor`
- `.TagBar-inputWrapper` - Input wrapper
  → `.TagBar__inputWrapper`
- `.TagBar-input` - Tag input field
  → `.TagBar__input`
- `.TagBar-trigger` - Trigger for tag popover (styling for Radix Popover.Trigger)
  → `.TagBar__trigger`
- `.TagBar-trigger:hover` - Hover state for trigger
  → `.TagBar__trigger:hover`
- `.TagBar-content` - Popover content (styling for Radix Popover.Content)
  → `.TagBar__content`
- `.TagBar-content[data-state="open"]` - Open state animation (styling for Radix state attribute)
  → `.TagBar__content--open`
- `.TagBar-content[data-state="closed"]` - Closed state animation (styling for Radix state attribute)
  → `.TagBar__content--closed`
- `.TagBar-arrow` - Popover arrow element (styling for Radix Popover.Arrow)
  → `.TagBar__arrow`
- `@keyframes slideDownAndFade` - Animation for sliding down
- `@keyframes slideUpAndFade` - Animation for sliding up

#### `TagSuggestions.tsx` - `src/components/tags/TagSuggestions.css`

- `.TagBar-suggestions` - Suggestions container
  → `.TagSuggestions` (matches component name)
- `.TagBar-item` - Suggestion item
  → `.TagSuggestions__item`
- `.TagBar-item:not(.TagBar-empty):hover`, `.TagBar-item:not(.TagBar-empty).selected` - Hover/selected state
  → `.TagSuggestions__item:not(.TagSuggestions__empty):hover`, `.TagSuggestions__item:not(.TagSuggestions__empty)--selected`
- `.TagBar-count` - Tag count display
  → `.TagSuggestions__count`
- `.TagBar-newItem`, `.TagBar-empty` - Styling for new item and empty state
  → `.TagSuggestions__newItem`, `.TagSuggestions__empty`
- `.TagBar-newItem` - New item styling
  → `.TagSuggestions__newItem`
- `.TagBar-empty` - Empty state styling
  → `.TagSuggestions__empty`

#### `TagToken.tsx` - `src/components/tags/TagToken.css`

- `.TagBar-tag` - Individual tag styling
  → `.TagToken` (matches component name)
- `.TagBar-tag:focus`, `.TagBar-tag.focused` - Focus state for tag
  → `.TagToken:focus`, `.TagToken--focused`
- `.TagBar-tag:focus .TagBar-removeButton`, `.TagBar-tag.focused .TagBar-removeButton` - Remove button in focused tag
  → `.TagToken:focus .TagToken__removeButton`, `.TagToken--focused .TagToken__removeButton`
- `.TagBar-tag > span` - Tag text
  → `.TagToken > span`
- `.TagBar-removeButton` - Tag remove button
  → `.TagToken__removeButton`
- `.TagBar-removeButton:hover` - Hover state for remove button
  → `.TagToken__removeButton:hover`
- `.TagBar-tag.suggestion` - Tag suggestion styling
  → `.TagToken--suggestion`
- `.TagBar-tag.suggestion:hover` - Hover state for tag suggestion
  → `.TagToken--suggestion:hover`

## CSS Redundancies and Issues

1. Duplicate modal styling: Both `Modal.css` and `PageListModal.css` contain identical selectors like `.dialog-overlay`, `.dialog-content`, `.dialog-close`, etc., which are custom styling for Radix Dialog components.

2. Animation redundancy: Identical keyframes `@keyframes overlayShow` and `@keyframes contentShow` appear in multiple files but are all custom animations.

3. Inconsistent naming conventions: Some components use BEM-like naming (e.g., `SearchPopover-input`, `TagBar-container`) while others use simpler class names (e.g., `image-drop-target`, `dialog-content`), but all are custom styles.

4. Mixed prefixing: Some selectors include component name as prefix (e.g., `.LexicalTextEditor`) while others use functional prefixes (e.g., `.editor-image-container`).

5. Potential selector conflicts: Selectors like `.page-list` are used in multiple component CSS files without proper namespacing.

6. Inconsistent state handling: Some components use Radix-style attribute selectors `[data-state="active"]` while others use class modifiers (`.selected`).

7. Component/CSS mismatch: Many CSS class names do not match their associated React component names, making the relationship between components and styles unclear.

8. Inconsistent animation naming: Some animations use functional names (`overlayShow`) while others use descriptive names (`slideDownAndFade`).

9. Mixed placement of common elements: Dialog and modal styling (used with Radix Dialog components) appears in multiple places rather than in a shared location.

10. Search-related styling fragmentation: Search styling is split across `SearchModal.css` and `SearchPopover.css` with similar concepts but different class names, despite both using Radix components.

## Radix UI Specific Notes

1. Radix provides unstyled components with data attributes for styling (e.g., `[data-state="active"]`, `[data-state="open"]`, `[data-state="closed"]`). Most of the CSS in this project applies custom styling to those elements rather than relying on Radix's default styles.

2. Component wrappers from Radix (like Dialog.Content, Popover.Anchor, Tabs.Trigger) are being styled with custom class names rather than letting Radix handle the styling.

3. The project uses both Radix UI primitive components and Radix Themes, but mostly applies custom styling on top of the primitives.
