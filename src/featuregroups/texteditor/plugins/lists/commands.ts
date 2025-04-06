import { type LexicalCommand, createCommand } from "lexical";

export const TOGGLE_BULLET_LIST_COMMAND: LexicalCommand<void> = createCommand();
export const TOGGLE_NUMBERED_LIST_COMMAND: LexicalCommand<void> = createCommand();
