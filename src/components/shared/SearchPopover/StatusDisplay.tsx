import React from "react";
import { Text } from "@radix-ui/themes";
import "./SearchPopover.css";

interface StatusDisplayProps {
  message: string;
  type?: "loading" | "error" | "empty";
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  message,
  type = "loading",
}) => {
  const className = `StatusDisplay ${
    type === "error" ? "StatusDisplay--error" : ""
  } ${type === "empty" ? "StatusDisplay--empty" : ""}`;

  return (
    <div className={className}>
      <Text size="1" color={type === "error" ? "red" : undefined}>
        {message}
      </Text>
    </div>
  );
};

// Convenience components
export const LoadingState: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => <StatusDisplay message={message} type="loading" />;

export const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <StatusDisplay message={message} type="error" />
);

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <StatusDisplay message={message} type="empty" />
);
