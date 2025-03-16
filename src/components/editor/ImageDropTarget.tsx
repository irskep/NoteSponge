import { useState, useCallback, ReactNode } from "react";

interface ImageDropTargetProps {
  onImageDrop: (file: File) => void;
  children: ReactNode;
  className?: string;
  onError?: (message: string) => void;
}

const isSupportedImageType = (type: string) => {
  return type.startsWith("image/");
};

export function ImageDropTarget({
  onImageDrop,
  children,
  className = "",
  onError,
}: ImageDropTargetProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
    },
    [isDragging]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);

      const imageFiles = files.filter((file) =>
        isSupportedImageType(file.type)
      );

      console.log("Image files:", imageFiles);
      if (imageFiles.length > 0) {
        onImageDrop(imageFiles[0]);
      } else if (files.length > 0 && onError) {
        onError("Only image files are supported");
      }
    },
    [onImageDrop, onError]
  );

  return (
    <div
      className={`image-drop-target ${className} ${
        isDragging ? "dragging" : ""
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragging && (
        <div className="image-drop-overlay">
          <div className="image-drop-message">Drop image to insert</div>
        </div>
      )}
    </div>
  );
}
