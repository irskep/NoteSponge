import { listenToWindowBlur, listenToWindowFocus } from "@/bridge/tauri2ts/listenToWindowFocus";
import { isWindowFocusedAtom, pageCacheAtoms } from "@/state/pageState";
import { getDefaultStore } from "jotai";
import { useEffect } from "react";

export default function useUpdateWindowFocus() {
  useEffect(() => {
    return listenToWindowFocus(() => {
      const store = getDefaultStore();
      store.set(isWindowFocusedAtom, true);
      const dirtyPageIds = Object.values(store.get(pageCacheAtoms.loadedPages)).map((page) => page.id);
      getDefaultStore().set(pageCacheAtoms.dirtyPageIds, dirtyPageIds);
    });
  }, []);

  useEffect(() => {
    return listenToWindowBlur(() => {
      const store = getDefaultStore();
      store.set(isWindowFocusedAtom, false);
    });
  }, []);
}
