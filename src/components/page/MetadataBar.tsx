import { useAtom } from "jotai";
import { pageMetadataAtom } from "../../state/atoms";
import "./MetadataBar.css";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export function MetadataBar() {
  const [metadata] = useAtom(pageMetadataAtom);

  return (
    <div className="metadata-bar">
      <div className="metadata-items">
        <span className="metadata-item">
          Last viewed: {formatDate(metadata.lastViewedAt)}
        </span>
        <span className="metadata-item">
          Created: {formatDate(metadata.createdAt)}
        </span>
        <span className="metadata-item">Views: {metadata.viewCount ?? 0}</span>
      </div>
    </div>
  );
}
