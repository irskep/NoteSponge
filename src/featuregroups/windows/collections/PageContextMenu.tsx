import { deletePage } from "@/services/page";
import { Menu, MenuItem } from "@tauri-apps/api/menu";

interface PageContextMenuProps {
  pageId: number;
  onDelete?: () => void;
  children: React.ReactNode;
}

export function PageContextMenu({ pageId, onDelete, children }: PageContextMenuProps) {
  const handleContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();

    const menu = await Menu.new();
    const deleteItem = await MenuItem.new({
      text: "Delete",
      id: "delete",
      enabled: true,
      action: async () => {
        await deletePage(pageId);
        onDelete?.();
      },
    });
    await menu.append(deleteItem);

    // Position the menu at the mouse location
    await menu.popup();
  };

  return <div onContextMenu={handleContextMenu}>{children}</div>;
}
