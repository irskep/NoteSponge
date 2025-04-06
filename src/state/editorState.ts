import { atom, getDefaultStore } from "jotai";
import type { $getSelection, CommandPayloadType, EditorState, LexicalCommand, LexicalEditor } from "lexical";

export const debouncedEditorStateAtom = atom<EditorState | null>(null);

// Editor instance atom
export const editorAtom = atom<LexicalEditor | null>(null); // For toolbar state

export function dispatchEditorCommand<TCommand extends LexicalCommand<unknown>>(
  command: TCommand,
  arg: CommandPayloadType<TCommand>,
) {
  const editor = getDefaultStore().get(editorAtom);
  if (editor) {
    editor.dispatchCommand(command, arg);
  }
}

export function dispatchEditorCommandWithDerivedArg<TCommand extends LexicalCommand<unknown>>(
  command: TCommand,
  deriveArg: (editor: LexicalEditor) => CommandPayloadType<TCommand>,
) {
  const editor = getDefaultStore().get(editorAtom);
  if (editor) {
    editor.dispatchCommand(command, deriveArg(editor));
  }
}

export interface FormattingState {
  canUndo: boolean;
  canRedo: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isLink: boolean;
  isCode: boolean;
  listType: "bullet" | "number" | "check" | null;
  storedSelection: ReturnType<typeof $getSelection> | null;
  hasSelection: boolean;
}

export const formattingStateAtom = atom<FormattingState>({
  canUndo: false,
  canRedo: false,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isLink: false,
  isCode: false,
  listType: null,
  storedSelection: null, // Not used at the moment
  hasSelection: false,
});

export interface InternalLinkInfo {
  pageId: number;
  title: string; // Page title
  instances: Array<{
    text: string; // Link text
    nodeKey: string;
  }>;
}

export interface ExternalLinkInfo {
  url: string;
  instances: Array<{
    text: string; // Link text
    nodeKey: string;
  }>;
}

export const internalLinksAtom = atom<InternalLinkInfo[]>([]);
export const externalLinksAtom = atom<ExternalLinkInfo[]>([]);
