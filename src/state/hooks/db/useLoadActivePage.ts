import { boot } from "@/state/actions/boot";
import { useEffect } from "react";

/**
 * Hook to initialize the database and set the current page ID from URL parameters
 */
export default function useLoadActivePage() {
  useEffect(() => {
    boot();
  }, []);
}
