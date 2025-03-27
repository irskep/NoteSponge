import { useAtom } from "jotai";
import * as RadixToast from "@radix-ui/react-toast";
import { Box, Flex, Text, IconButton } from "@radix-ui/themes";
import { toastStateAtom } from "../../state/atoms";
import { Cross1Icon } from "@radix-ui/react-icons";
import "./Toast.css";
import AppTheme from "../AppTheme";

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
  const toastType = toastState.type || "foreground";
  const highContrast = toastType === "foreground";

  return (
    <RadixToast.Root
      className={`ToastRoot ${toastType}`}
      open={toastState.open}
      onOpenChange={(open) => setToastState((prev) => ({ ...prev, open }))}
      duration={toastState.duration}
    >
      <AppTheme>
        <Box p="3" className="ToastContent">
          <Flex justify="between" align="start" gap="3">
            <Flex direction="column" gap="1" style={{ flex: 1 }}>
              {toastState.title && (
                <RadixToast.Title asChild>
                  <Text size="2" weight="bold" highContrast={highContrast}>
                    {toastState.title}
                  </Text>
                </RadixToast.Title>
              )}
              <RadixToast.Description asChild>
                <Text size="2" color="gray">
                  {toastState.message}
                </Text>
              </RadixToast.Description>
            </Flex>

            <RadixToast.Close asChild>
              <IconButton size="1" variant="ghost" color="gray">
                <Cross1Icon />
              </IconButton>
            </RadixToast.Close>
          </Flex>
        </Box>
      </AppTheme>
    </RadixToast.Root>
  );
}
