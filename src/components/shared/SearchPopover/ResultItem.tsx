import { forwardRef } from "react";
import "./SearchPopover.css";

export interface ResultItemProps {
  primaryText: string;
  secondaryText?: string;
  isSelected: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

export const ResultItem = forwardRef<HTMLButtonElement, ResultItemProps>(
  function ResultItem(
    { primaryText, secondaryText, isSelected, onSelect, onMouseEnter },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={`SearchPopover-resultItem${isSelected ? " selected" : ""}`}
        onClick={onSelect}
        onMouseEnter={onMouseEnter}
        type="button"
      >
        <span className="SearchPopover-resultPrimary">{primaryText}</span>
        {secondaryText && (
          <span className="SearchPopover-resultSecondary">{secondaryText}</span>
        )}
      </button>
    );
  }
);
