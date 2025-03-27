import { useAtom } from "jotai";
import * as RadixToast from "@radix-ui/react-toast";
import { toastStateAtom } from "../../state/atoms";
import "./Toast.css";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixToast.Provider swipeDirection="right">
      {children}
      <ToastRenderer />
      <RadixToast.Viewport className="ToastViewport" />
    </RadixToast.Provider>
  );
}

function ToastRenderer() {
  const [toastState, setToastState] = useAtom(toastStateAtom);

  return (
    <RadixToast.Root
      className="ToastRoot"
      open={toastState.open}
      onOpenChange={(open) => setToastState((prev) => ({ ...prev, open }))}
      duration={toastState.duration}
      type={toastState.type}
    >
      {toastState.title && (
        <RadixToast.Title className="ToastTitle">
          {toastState.title}
        </RadixToast.Title>
      )}
      <RadixToast.Description className="ToastDescription">
        {toastState.message}
      </RadixToast.Description>
      <RadixToast.Close className="ToastClose" aria-label="Close">
        <span aria-hidden>×</span>
      </RadixToast.Close>
    </RadixToast.Root>
  );
}
