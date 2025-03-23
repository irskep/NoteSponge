import React from "react";
import "./SearchPopover.css";

interface ResultsListProps {
  children: React.ReactNode;
}

export const ResultsList: React.FC<ResultsListProps> = ({ children }) => {
  return <div className="ResultsList">{children}</div>;
};
