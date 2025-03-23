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
        <Popover.Anchor className="SearchInput__anchor">
          <input
            ref={ref}
            className={`SearchInput__input ${customClass}`}
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
            className={`SearchInput__content ${
              isOpen
                ? "SearchInput__content--open"
                : "SearchInput__content--closed"
            }`}
            onOpenAutoFocus={(e) => e.preventDefault()}
            side="bottom"
            align="start"
            sideOffset={4}
            avoidCollisions
          >
            {children}
            <Popover.Arrow className="SearchInput__arrow" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }
);
