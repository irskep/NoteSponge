import { LexicalEditor } from "lexical";
import {
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

// Text formatting actions
export function toggleBold(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
}

export function toggleItalic(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
}

export function toggleUnderline(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
}

export function toggleStrikethrough(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
}

export function toggleCode(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
}

// Alignment actions
export function alignLeft(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
}

export function alignCenter(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
}

export function alignRight(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
}

export function alignJustify(editor: LexicalEditor): void {
  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
}

// List actions
export function toggleBulletList(
  editor: LexicalEditor,
  isActive: boolean
): void {
  if (isActive) {
    // If already a bullet list, remove it
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  } else {
    // If not a list, or a different type of list, make it a bullet list
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }
}

export function toggleNumberedList(
  editor: LexicalEditor,
  isActive: boolean
): void {
  if (isActive) {
    // If already a numbered list, remove it
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  } else {
    // If not a list, or a different type of list, make it a numbered list
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }
}

// History actions
export function undo(editor: LexicalEditor): void {
  editor.dispatchCommand(UNDO_COMMAND, undefined);
}

export function redo(editor: LexicalEditor): void {
  editor.dispatchCommand(REDO_COMMAND, undefined);
}
