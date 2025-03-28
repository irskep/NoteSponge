import { toastStateAtom } from "@/state/atoms";
import { getDefaultStore, useSetAtom } from "jotai";
import { useCallback } from "react";

interface ShowToastOptions {
  type?: "foreground" | "background";
  duration?: number;
}

export function showToast(title: string, message: string, options?: ShowToastOptions) {
  const setToastState = useSetAtom(toastStateAtom, { store: getDefaultStore() });
  setToastState({
    open: true,
    message,
    title,
    type: options?.type ?? "foreground",
    duration: options?.duration ?? 3000,
  });
}

export function useToast() {
  const setToastState = useSetAtom(toastStateAtom, { store: getDefaultStore() });

  const showToast = useCallback(
    (title: string, message: string, options?: ShowToastOptions) => {
      setToastState({
        open: true,
        message,
        title,
        type: options?.type ?? "foreground",
        duration: options?.duration ?? 3000,
      });
    },
    [setToastState],
  );

  return { showToast };
}
