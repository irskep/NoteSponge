import { createStore } from "jotai";

// Create a store instance for working with editor state outside of React components
// This store is used for both format menu and toolbar state
export const editorStateStore = createStore();
