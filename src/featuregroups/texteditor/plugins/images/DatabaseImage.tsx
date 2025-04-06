import { getImageAttachment } from "@/dbcalls/images";
import { useEffect, useState } from "react";

// It's OK that this component directly accesses the database because
// images are immutable and should be unloaded when not visible.
//
// However, a better design might be to have DatabaseImage let somebody know
// it's mounted/unmounted, and have that other object manage which images
// are fetched and available via jotai.
export function DatabaseImage({ id }: { id: number }): JSX.Element | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    width?: number;
    height?: number;
  }>({});
  const [metadata, setMetadata] = useState<{
    originalFilename: string;
    fileExtension: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    getImageAttachment(id)
      .then((result) => {
        if (!mounted) {
          return; // We were unmounted before the image was loaded
        }

        if (!result) {
          setError(`No image data found for ID ${id}`);
          return;
        }

        if (!result.dataUrl) {
          setError(`Image data is missing for ID ${id}`);
          return;
        }

        setDataUrl(result.dataUrl);
        setMetadata({
          originalFilename: result.originalFilename,
          fileExtension: result.fileExtension,
        });

        // Set dimensions if available
        if (result.width || result.height) {
          setDimensions({
            width: result.width,
            height: result.height,
          });
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(`Error loading image: ${err.message}`);
        }
      });

    return () => {
      mounted = false;
      // No need to revoke any blob URLs since we're using dataURLs
    };
  }, [id]);

  if (error) {
    return <div className="ImageNode--error">{error}</div>;
  }

  if (!dataUrl || !metadata) {
    return <div className="ImageNode--loading">Loading image…</div>;
  }

  return (
    <img
      src={dataUrl}
      width={dimensions.width}
      height={dimensions.height}
      alt={metadata.originalFilename}
      onError={(e) => console.error("Image load error:", e)}
    />
  );
}
