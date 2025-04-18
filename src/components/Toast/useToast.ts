import { toastStateAtom } from "@/state/toastState";
import { useSetAtom } from "jotai";
import { useCallback } from "react";

interface ShowToastOptions {
  type?: "foreground" | "background";
  duration?: number;
}

export function showToast(title: string, message: string, options?: ShowToastOptions) {
  const setToastState = useSetAtom(toastStateAtom);
  setToastState({
    open: true,
    message,
    title,
    type: options?.type ?? "foreground",
    duration: options?.duration ?? 3000,
  });
}

export function useToast() {
  const setToastState = useSetAtom(toastStateAtom);

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
