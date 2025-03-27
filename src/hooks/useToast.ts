import { useSetAtom } from "jotai";
import { toastStateAtom } from "../state/atoms";
import { useCallback } from "react";

interface ShowToastOptions {
  title?: string;
  type?: "foreground" | "background";
  duration?: number;
}

export function useToast() {
  const setToastState = useSetAtom(toastStateAtom);

  const showToast = useCallback(
    (message: string, options?: ShowToastOptions) => {
      setToastState({
        open: true,
        message,
        title: options?.title ?? "Notification",
        type: options?.type ?? "foreground",
        duration: options?.duration ?? 3000,
      });
    },
    [setToastState]
  );

  return { showToast };
}
