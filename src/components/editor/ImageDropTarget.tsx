import { useState, useCallback, ReactNode } from "react";

interface ImageDropTargetProps {
  onImageDrop: (file: File) => void;
  children: ReactNode;
  className?: string;
  onError?: (message: string) => void;
}

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
    console.log("Drag enter event triggered");

    // Check if the dragged item is an image
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      console.log("Drag over event triggered");
      console.log("DataTransfer types:", e.dataTransfer.types);

      // Check if the dragged item is an image
      if (e.dataTransfer.types.includes("Files") && !isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("Drag leave event triggered");
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Drop event triggered");
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      console.log("Dropped files:", files);

      const imageFiles = files.filter((file) => {
        const fileType = file.type.toLowerCase();
        console.log("File type:", fileType);
        return (
          fileType === "image/jpeg" ||
          fileType === "image/png" ||
          fileType === "image/jpg" ||
          fileType === "image/gif" ||
          fileType === "image/webp" ||
          fileType === "image/svg+xml"
        );
      });

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
