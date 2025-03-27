import { useAtom } from "jotai";
import { pageMetadataAtom } from "../../state/atoms";
import "./MetadataBar.css";
import { formatDateTime } from "../../utils/dates";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  return formatDateTime(date);
}

export function MetadataBar() {
  const [metadata] = useAtom(pageMetadataAtom);

  return (
    <div className="MetadataBar">
      <div className="MetadataBar__items">
        <span className="MetadataBar__item">
          Last viewed: {formatDate(metadata.lastViewedAt)}
        </span>
        <span className="MetadataBar__item">
          Created: {formatDate(metadata.createdAt)}
        </span>
        <span className="MetadataBar__item">
          Views: {metadata.viewCount ?? 0}
        </span>
        <span style={{ flexGrow: 1 }} />
      </div>
    </div>
  );
}
