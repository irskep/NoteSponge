import { type FC, type PropsWithChildren, useRef, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
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

import CustomLinkPlugin from "@/components/editor/lexicalplugins/CustomLinkPlugin";
import { $getRoot, type EditorState, type LexicalEditor, type SerializedEditorState } from "lexical";
import { useAtom } from "jotai";
import { registerFormatMenuListeners } from "@/menu/listeners/formatMenuListeners";
import "@/components/editor/LexicalTextEditor.css";
import ImagesPlugin from "@/components/editor/lexicalplugins/image/ImagePlugin";
import { ImageNode } from "@/components/editor/lexicalplugins/image/ImageNode";
import KeyboardHandlerPlugin from "@/components/editor/lexicalplugins/KeyboardHandlerPlugin";
import EditorModals from "@/components/editor/EditorModals";
import { editorStateStore, editorAtom } from "@/components/editor/state/editorStore";
import FocusPlugin from "@/components/editor/lexicalplugins/FocusPlugin";
import {
  InternalLinkNode,
  INTERNAL_LINK_TRANSFORMER,
} from "@/components/editor/lexicalplugins/internallink/InternalLinkNode.tsx";
import InternalLinkPlugin from "@/components/editor/lexicalplugins/internallink/InternalLinkPlugin";

export interface LexicalTextEditorProps {
  placeholder?: string;
  initialContent?: SerializedEditorState;
  editable?: boolean;
  onChange?: (editorState: EditorState) => void;
  pageId: number;
}

const editorConfig = {
  namespace: "NoteSpongeEditor",
  // Handling of errors during update
  onError(error: unknown) {
    console.error("Editor error:", error);
  },
  // The editor theme
  theme: {
    // Theme styling goes here
    paragraph: "LexicalTextEditor__paragraph",
    text: {
      bold: "LexicalTextEditor__text--bold",
      italic: "LexicalTextEditor__text--italic",
      underline: "LexicalTextEditor__text--underline",
      strikethrough: "LexicalTextEditor__text--strikethrough",
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
    ImageNode,
    InternalLinkNode,
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

// Add our internal link transformer to the list of transformers
const CUSTOM_TRANSFORMERS = [...TRANSFORMERS, INTERNAL_LINK_TRANSFORMER];

export const LexicalTextEditor: FC<PropsWithChildren<LexicalTextEditorProps>> = ({
  placeholder = "Enter some text…",
  initialContent,
  editable = true,
  onChange,
  pageId,
  children,
}) => {
  // Store editor instance in state and ref
  const [editor, _] = useAtom(editorAtom, {
    store: editorStateStore,
  });
  const editorRef = useRef<LexicalEditor | null>(null);

  // Create a customized version of the editor config with the same nodes
  const customEditorConfig = {
    ...editorConfig,
    editable,
  };

  useEffect(() => {
    editor?.focus();
    return registerFormatMenuListeners();
  }, [editor]);

  return (
    <>
      <LexicalComposer
        initialConfig={{
          ...customEditorConfig,
          namespace: "NoteSpongeEditor",
          editorState: (editor: LexicalEditor) => {
            editorRef.current = editor;
            editorStateStore.set(editorAtom, editor);

            if (initialContent) {
              const editorState = editor.parseEditorState(initialContent);
              editor.update(() => {
                const selection = $getRoot().selectStart();
                editor.setEditorState(editorState.clone(selection));
              });
            }
          },
          onError: (error) => {
            console.error(error);
          },
        }}
      >
        <div className="LexicalTextEditor">
          <EditorModals />
          <div className="LexicalTextEditor__container">
            <RichTextPlugin
              contentEditable={<ContentEditable className="LexicalTextEditor__input" />}
              placeholder={<div className="LexicalTextEditor__placeholder">{placeholder}</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <KeyboardHandlerPlugin />
            <FocusPlugin />
            <HistoryPlugin />
            <ListPlugin />
            <CustomLinkPlugin />
            <AutoLinkPlugin matchers={MATCHERS} />
            <MarkdownShortcutPlugin transformers={CUSTOM_TRANSFORMERS} />
            {onChange && <OnChangePlugin onChange={onChange} />}
            <ImagesPlugin pageId={pageId} />
            <InternalLinkPlugin />
            {children}
          </div>
        </div>
      </LexicalComposer>
    </>
  );
};
