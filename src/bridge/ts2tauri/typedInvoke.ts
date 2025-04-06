import { type InvokeOptions, invoke as tauriInvoke } from "@tauri-apps/api/core";

type SyncToDirectoryCommand = {
  cmd: "sync_to_directory";
  args: {
    path: string;
  };
  // biome-ignore lint/suspicious/noConfusingVoidType: It has no return value
  result: void;
};

type UpdateEditorStateCommand = {
  cmd: "update_formatting_menu_state";
  args: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    code: boolean;
    alignLeft: boolean;
    alignCenter: boolean;
    alignRight: boolean;
    alignJustify: boolean;
    bulletList: boolean;
    numberedList: boolean;
    canUndo: boolean;
    canRedo: boolean;
  };
  // biome-ignore lint/suspicious/noConfusingVoidType: It has no return value
  result: void;
};

type DisableEditorMenusCommand = {
  cmd: "disable_editor_menus";
  // biome-ignore lint/complexity/noBannedTypes: It has no arguments
  args: {};
  // biome-ignore lint/suspicious/noConfusingVoidType: It has no return value
  result: void;
};

type InvokeCommand = SyncToDirectoryCommand | UpdateEditorStateCommand | DisableEditorMenusCommand;

export default async function invoke<T extends InvokeCommand>(
  cmd: T["cmd"],
  args?: T["args"],
  options?: InvokeOptions,
): Promise<T["result"]> {
  return await tauriInvoke(cmd, args, options);
}
