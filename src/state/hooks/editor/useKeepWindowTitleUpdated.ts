import { setWindowTitle } from "@/bridge/ts2tauri/window";
import { activePageAtom } from "@/state/pageState";
import { getDefaultStore } from "jotai";
import { useEffect } from "react";

export default function useKeepWindowTitleUpdated() {
  useEffect(() => {
    const store = getDefaultStore();

    return store.sub(activePageAtom, () => {
      const page = store.get(activePageAtom);
      setWindowTitle(`#${page.id} ${page.title}`);
    });
  }, []);
}
