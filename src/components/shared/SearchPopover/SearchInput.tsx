import React, { forwardRef } from "react";
import * as Popover from "@radix-ui/react-popover";
import "./SearchPopover.css";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoFocus?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  onFocus?: () => void;
  customClass?: string;
  inputAriaLabel?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChange,
      onKeyDown,
      placeholder,
      autoFocus = false,
      isOpen,
      onOpenChange,
      children,
      onFocus,
      customClass = "",
      inputAriaLabel,
    },
    ref
  ) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
        <Popover.Anchor className="SearchPopover-inputAnchor">
          <input
            ref={ref}
            className={`SearchPopover-input ${customClass}`}
            value={value}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            onFocus={() => {
              onOpenChange(true);
              onFocus?.();
            }}
            aria-label={inputAriaLabel}
          />
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            className="SearchPopover-content"
            onOpenAutoFocus={(e) => e.preventDefault()}
            side="bottom"
            align="start"
            sideOffset={4}
            avoidCollisions
          >
            {children}
            <Popover.Arrow className="SearchPopover-arrow" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }
);
