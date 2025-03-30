import { atom } from "jotai";

export interface ToastState {
  open: boolean;
  message: string;
  title: string;
  /**
   * Toast appearance type:
   * - "foreground": High contrast, attention-grabbing toast for important notifications
   * - "background": Subtle, lower contrast toast for non-critical information
   */
  type?: "foreground" | "background";
  /**
   * Duration in milliseconds the toast should remain visible
   * Default: 3000ms (3 seconds)
   */
  duration?: number;
}

export const toastStateAtom = atom<ToastState>({
  open: false,
  message: "",
  title: "Notification",
  type: "foreground",
  duration: 3000,
});
