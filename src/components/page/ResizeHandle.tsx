import { FC } from "react";
import "./Page.css";

interface ResizeHandleProps {
  onResize: (clientX: number) => void;
}

const ResizeHandle: FC<ResizeHandleProps> = ({ onResize }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent text selection during drag
    e.preventDefault();

    // Add a class to the body to show we're in resize mode
    document.body.classList.add("resizing");

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onResize(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("resizing");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="ResizeHandle"
      onMouseDown={handleMouseDown}
      aria-label="Resize sidebar"
    >
      <div className="ResizeHandle__indicator" />
    </div>
  );
};

export default ResizeHandle;
