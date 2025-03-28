import { forwardRef } from "react";
import "@/components/shared/SearchPopover/SearchPopover.css";

export interface ResultItemProps {
  primaryText: string;
  secondaryText?: string;
  isSelected: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

export const ResultItem = forwardRef<HTMLButtonElement, ResultItemProps>(function ResultItem(
  { primaryText, secondaryText, isSelected, onSelect, onMouseEnter },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`ResultItem ${isSelected ? "ResultItem--selected" : ""}`}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      type="button"
    >
      <span className="ResultItem__primary">{primaryText}</span>
      {secondaryText && <span className="ResultItem__secondary">{secondaryText}</span>}
    </button>
  );
});
