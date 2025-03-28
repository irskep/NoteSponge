import { type ReactNode, useCallback, useState } from "react";

interface ImageDropTargetProps {
  onImageDrop: (file: File | null, error?: { title: string; message: string }) => void;
  children: ReactNode;
  className?: string;
}

const isSupportedImageType = (type: string) => {
  return type.startsWith("image/");
};

export function ImageDropTarget({ onImageDrop, children, className = "" }: ImageDropTargetProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
  }, []);

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

      const imageFiles = files.filter((file) => isSupportedImageType(file.type));

      if (imageFiles.length > 0) {
        onImageDrop(imageFiles[0]);
      } else if (files.length > 0) {
        onImageDrop(null, {
          title: "Invalid File Type",
          message: "Only image files are supported",
        });
      }
    },
    [onImageDrop],
  );

  return (
    <div
      className={`ImageDropTarget ${className} ${isDragging ? "ImageDropTarget--dragging" : ""}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragging && (
        <div className="ImageDropTarget__overlay">
          <div className="ImageDropTarget__message">Drop image to insert</div>
        </div>
      )}
    </div>
  );
}
