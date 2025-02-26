import { useEffect, useState } from "react";
import { getImageAttachment } from "../../../services/db/actions";

export function DatabaseImage({ id }: { id: number }) {
  const [url, setUrl] = useState<string | null>(null);
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
        
        if (!result.data) {
          console.error(`DatabaseImage: Image data is undefined for ID ${id}`);
          setError(`Image data is missing for ID ${id}`);
          return;
        }
        
        const dataSize = result.data ? result.data.byteLength : 0;
        console.log(`DatabaseImage: Creating blob with type ${result.mimeType}, data size: ${dataSize} bytes, dimensions: ${result.width}x${result.height}`);
        
        try {
          const blob = new Blob([result.data], { type: result.mimeType });
          const url = URL.createObjectURL(blob);
          console.log(`DatabaseImage: Created blob URL: ${url}`);
          setUrl(url);
          
          // Set dimensions if available
          if (result.width || result.height) {
            console.log(`DatabaseImage: Setting dimensions: ${result.width}x${result.height}`);
            setDimensions({
              width: result.width,
              height: result.height
            });
          }
        } catch (blobError) {
          console.error(`DatabaseImage: Error creating blob:`, blobError);
          setError(`Error creating image: ${blobError.message}`);
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
      if (url) {
        console.log(`DatabaseImage: Revoking blob URL: ${url}`);
        URL.revokeObjectURL(url);
      }
    };
  }, [id]);

  if (error) {
    return <div className="image-error">{error}</div>;
  }
  
  if (!url) {
    return <div className="image-loading">Loading image…</div>;
  }
  
  return (
    <img 
      src={url} 
      width={dimensions.width} 
      height={dimensions.height}
      onError={(e) => console.error("Image load error:", e)} 
    />
  );
}
