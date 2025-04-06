import { type LexicalCommand, createCommand } from "lexical";

export const INSERT_INTERNAL_LINK_COMMAND: LexicalCommand<{
  pageId: number;
}> = createCommand();
