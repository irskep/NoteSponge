import { useEffect, useState } from "react";
import { getImageAttachment } from "../../../services/db/actions";

export function DatabaseImage({ id }: { id: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width?: number; height?: number }>({});

  useEffect(() => {
    let mounted = true;
    console.log(`DatabaseImage: Fetching image with ID ${id}`);

    getImageAttachment(id)
      .then((result) => {
        console.log(`DatabaseImage: Got result for ID ${id}:`, result ? "Data found" : "No data found");
        
        if (!mounted) {
          console.log(`DatabaseImage: Component unmounted before data was received`);
          return;
        }
        
        if (!result) {
          console.error(`DatabaseImage: No image data found for ID ${id}`);
          setError(`No image data found for ID ${id}`);
          return;
        }
        
        if (!result.dataUrl) {
          console.error(`DatabaseImage: Image dataURL is undefined for ID ${id}`);
          setError(`Image data is missing for ID ${id}`);
          return;
        }
        
        console.log(`DatabaseImage: Setting dataURL and dimensions: ${result.width}x${result.height}`);
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
        console.error(`DatabaseImage: Error fetching image with ID ${id}:`, err);
        if (mounted) {
          setError(`Error loading image: ${err.message}`);
        }
      });

    return () => {
      console.log(`DatabaseImage: Cleaning up component for ID ${id}`);
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
