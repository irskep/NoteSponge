import { useAtomValue } from "jotai";
import "./MetadataBar.css";
import { activePageAtom } from "@/state/pageState";
import { formatDateTime } from "@/utils/dates";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  return formatDateTime(date);
}

export function MetadataBar() {
  const page = useAtomValue(activePageAtom);

  return (
    <div className="MetadataBar">
      <div className="MetadataBar__items">
        <span className="MetadataBar__item">Last viewed: {formatDate(page.lastViewedAt)}</span>
        <span className="MetadataBar__item">Created: {formatDate(page.createdAt)}</span>
        <span className="MetadataBar__item">Views: {page.viewCount ?? 0}</span>
        <span style={{ flexGrow: 1 }} />
      </div>
    </div>
  );
}
