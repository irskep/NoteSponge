import { ReactNode } from "react";
import { Heading } from "@radix-ui/themes";
import "./SidebarSection.css";

interface SidebarSectionProps {
  children: ReactNode;
  title: string;
  grow?: boolean;
  shrink?: boolean;
}

export function SidebarSection({
  children,
  title,
  grow = false,
  shrink = false,
}: SidebarSectionProps) {
  return (
    <div
      className="SidebarSection"
      style={{
        flexGrow: grow ? 1 : 0,
        flexShrink: shrink ? 1 : 0,
      }}
    >
      <Heading size="2" mb="2">
        {title}
      </Heading>
      <div className="SidebarSection__content">{children}</div>
    </div>
  );
}
