import { useEffect, useState } from "react";
import { getImageAttachment } from "../../../services/db/actions";

export function DatabaseImage({ id }: { id: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width?: number; height?: number }>({});

  useEffect(() => {
    let mounted = true;

    getImageAttachment(id)
      .then((result) => {
        if (!mounted) {
          return;
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
        
        // Set dimensions if available
        if (result.width || result.height) {
          setDimensions({
            width: result.width,
            height: result.height
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
    return <div className="image-error">{error}</div>;
  }
  
  if (!dataUrl) {
    return <div className="image-loading">Loading image…</div>;
  }
  
  return (
    <img 
      src={dataUrl} 
      width={dimensions.width} 
      height={dimensions.height}
      onError={(e) => console.error("Image load error:", e)} 
    />
  );
}
