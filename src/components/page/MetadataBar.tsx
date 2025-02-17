import { PageData } from "../../types";
import "./MetadataBar.css";

interface MetadataBarProps {
  pageData: PageData;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export function MetadataBar({ pageData }: MetadataBarProps) {
  return (
    <div className="metadata-bar">
      <div className="metadata-items">
        <span className="metadata-item">
          Last viewed:{" "}
          {pageData.lastViewedAt ? formatDate(pageData.lastViewedAt) : "Never"}
        </span>
        <span className="metadata-item">
          Created: {formatDate(pageData.createdAt)}
        </span>
        <span className="metadata-item">Views: {pageData.viewCount ?? 0}</span>
      </div>
    </div>
  );
}
