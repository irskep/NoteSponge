import { useSetAtom } from "jotai";
import { toastStateAtom } from "@/state/atoms";
import { useCallback } from "react";

interface ShowToastOptions {
  type?: "foreground" | "background";
  duration?: number;
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
    [setToastState]
  );

  return { showToast };
}
