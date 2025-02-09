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
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import ToolbarPlugin from "./lexicalplugins/ToolbarPlugin";
import { EditorState } from "lexical";
import "./LexicalTextEditor.css";

export interface LexicalTextEditorProps {
  placeholder?: string;
  initialContent?: any;
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

export const LexicalTextEditor: FC<PropsWithChildren<LexicalTextEditorProps>> = ({
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
        editorState: initialContent,
      }}
    >
      <div className="LexicalTextEditor">
        <ToolbarPlugin />
        <div className="editor-container">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div className="editor-placeholder">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          {onChange && <OnChangePlugin onChange={onChange} />}
          {children}
        </div>
      </div>
    </LexicalComposer>
  );
};
