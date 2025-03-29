import { getTauriSettingsStore } from "@/state/tauriSettingsStore";

// Default width from PageSidebar.css
const DEFAULT_SIDEBAR_WIDTH = 260;

export async function getSidebarWidth(pageId: number): Promise<number> {
  const store = await getTauriSettingsStore();

  // Get the map of sidebar widths by page
  const widthsByPage = (await store.get("sidebar_widths_by_page")) as Record<number, number> | null;

  // Check if this page has a stored width
  if (widthsByPage?.[pageId]) {
    return widthsByPage[pageId];
  }

  // Otherwise, get the default width (most recently used)
  const defaultWidth = (await store.get("default_sidebar_width")) as number | null;
  return defaultWidth || DEFAULT_SIDEBAR_WIDTH;
}

export async function setSidebarWidth(pageId: number, width: number): Promise<void> {
  const store = await getTauriSettingsStore();

  // Get current map of sidebar widths
  const widthsByPage = ((await store.get("sidebar_widths_by_page")) as Record<number, number> | null) || {};

  // Update the width for this specific page
  widthsByPage[pageId] = width;

  // Save back to store
  await store.set("sidebar_widths_by_page", widthsByPage);

  // Also update the default width
  await setDefaultSidebarWidth(width);
}

export async function setDefaultSidebarWidth(width: number): Promise<void> {
  const store = await getTauriSettingsStore();
  await store.set("default_sidebar_width", width);
}

// Helper function to create unique section keys
function getSectionKey(pageId: number, sectionTitle: string): string {
  return `${pageId}_${sectionTitle}`;
}

export async function getSectionCollapsedState(
  pageId: number,
  sectionTitle: string,
  defaultCollapsed = false,
): Promise<boolean> {
  const store = await getTauriSettingsStore();

  // Get the map of section collapsed states
  const sectionStates = (await store.get("sidebar_section_collapsed_state")) as Record<string, boolean> | null;

  // Get the key for this specific section
  const sectionKey = getSectionKey(pageId, sectionTitle);

  // Return stored value if exists, otherwise return default
  if (sectionStates && sectionKey in sectionStates) {
    return sectionStates[sectionKey];
  }

  return defaultCollapsed;
}

export async function setSectionCollapsedState(
  pageId: number,
  sectionTitle: string,
  isCollapsed: boolean,
): Promise<void> {
  const store = await getTauriSettingsStore();

  // Get current map of section collapsed states
  const sectionStates = ((await store.get("sidebar_section_collapsed_state")) as Record<string, boolean> | null) || {};

  // Get the key for this specific section
  const sectionKey = getSectionKey(pageId, sectionTitle);

  // Update the state for this specific section
  sectionStates[sectionKey] = isCollapsed;

  // Save back to store
  await store.set("sidebar_section_collapsed_state", sectionStates);
}
