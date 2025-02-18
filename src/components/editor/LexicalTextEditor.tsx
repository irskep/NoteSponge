import { FC, PropsWithChildren } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";

import ToolbarPlugin from "./lexicalplugins/ToolbarPlugin";
import CustomLinkPlugin from "./lexicalplugins/CustomLinkPlugin";
import { EditorState, SerializedEditorState } from "lexical";
import "./LexicalTextEditor.css";

export interface LexicalTextEditorProps {
  placeholder?: string;
  initialContent?: SerializedEditorState;
  editable?: boolean;
  onChange?: (editorState: EditorState) => void;
}

const editorConfig = {
  namespace: "DeckywikiEditor",
  // Handling of errors during update
  onError(error: Error) {
    console.error("Editor error:", error);
  },
  // The editor theme
  theme: {
    // Theme styling goes here
    paragraph: "editor-paragraph",
    text: {
      bold: "editor-text-bold",
      italic: "editor-text-italic",
      underline: "editor-text-underline",
      strikethrough: "editor-text-strikethrough",
    },
  },
  // Handling of nodes
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
};

/*
TODO:
- Use a custom modal for entering links
- Detect links with regex
*/

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith("http") ? fullMatch : `https://${fullMatch}`,
      attributes: { rel: "noreferrer", target: "_blank" },
    };
  },
];

export const LexicalTextEditor: FC<
  PropsWithChildren<LexicalTextEditorProps>
> = ({
  placeholder = "Enter some text...",
  initialContent,
  editable = true,
  onChange,
  children,
}) => {
  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editable,
        editorState: initialContent
          ? (editor) => {
              editor.setEditorState(editor.parseEditorState(initialContent));
            }
          : undefined,
      }}
    >
      <div className="LexicalTextEditor">
        <ToolbarPlugin />
        <div className="editor-container">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={
              <div className="editor-placeholder">{placeholder}</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <CustomLinkPlugin />
          <AutoLinkPlugin matchers={MATCHERS} />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          {onChange && <OnChangePlugin onChange={onChange} />}
          {children}
        </div>
      </div>
    </LexicalComposer>
  );
};
