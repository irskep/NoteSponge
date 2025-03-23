import { useAtom } from "jotai";
import { pageMetadataAtom } from "../../state/atoms";
import "./MetadataBar.css";
import { RelatedPages } from "./RelatedPages";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export function MetadataBar({ pageId }: { pageId: number }) {
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
        <RelatedPages pageId={pageId} />
      </div>
    </div>
  );
}
