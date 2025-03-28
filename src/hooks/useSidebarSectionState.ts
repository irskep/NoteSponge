import { useEffect } from "react";
import { useAtom, getDefaultStore } from "jotai";
import { sidebarSectionStateAtom } from "@/state/atoms";
import { getStore } from "@/state/store";

/**
 * A hook that synchronizes the sidebar section collapsed state atom with the Tauri store
 * for persistence across app restarts.
 */
export function useSidebarSectionState() {
  const [sectionState, setSectionState] = useAtom(sidebarSectionStateAtom, {
    store: getDefaultStore(),
  });

  // Load persisted state from Tauri store on mount
  useEffect(() => {
    async function loadState() {
      try {
        const store = await getStore();
        const savedState = await store.get("sidebar_section_collapsed_state");

        if (savedState) {
          setSectionState(savedState as typeof sectionState);
        }
      } catch (err) {
        console.error("❌ Failed to load sidebar section state:", err);
      }
    }
    loadState();
  }, [setSectionState]);

  // Save state to Tauri store when it changes
  useEffect(() => {
    async function saveState() {
      try {
        const store = await getStore();
        await store.set("sidebar_section_collapsed_state", sectionState);
      } catch (err) {}
    }

    // Only save if we have actual state to save (skip the initial empty state)
    if (Object.keys(sectionState).length > 0) {
      saveState();
    }
  }, [sectionState]);

  return [sectionState, setSectionState] as const;
}
