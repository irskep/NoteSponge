import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { type FC, type PropsWithChildren, useEffect, useRef } from "react";

import EditorModals from "@/components/editor/EditorModals";
import CustomLinkPlugin from "@/components/editor/lexicalplugins/CustomLinkPlugin";
import FocusPlugin from "@/components/editor/lexicalplugins/FocusPlugin";
import KeyboardHandlerPlugin from "@/components/editor/lexicalplugins/KeyboardHandlerPlugin";
import { ImageNode } from "@/components/editor/lexicalplugins/image/ImageNode";
import ImagesPlugin from "@/components/editor/lexicalplugins/image/ImagePlugin";
import {
  INTERNAL_LINK_TRANSFORMER,
  InternalLinkNode,
} from "@/components/editor/lexicalplugins/internallink/InternalLinkNode.tsx";
import InternalLinkPlugin from "@/components/editor/lexicalplugins/internallink/InternalLinkPlugin";
import { editorAtom } from "@/components/editor/state/editorAtoms";
import { registerFormatMenuListeners } from "@/menu/listeners/formatMenuListeners";
import { pageIdAtom } from "@/state/pageState";
import { getDefaultStore, useAtom, useAtomValue } from "jotai";
import { $getRoot, type EditorState, type LexicalEditor, type SerializedEditorState } from "lexical";
import "./LexicalTextEditor.css";

export interface LexicalTextEditorProps {
  placeholder?: string;
  initialContent?: SerializedEditorState;
  editable?: boolean;
  onChange?: (editorState: EditorState) => void;
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
  children,
}) => {
  const pageId = useAtomValue(pageIdAtom);
  // Store editor instance in state and ref
  const [editor, _] = useAtom(editorAtom);
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
            getDefaultStore().set(editorAtom, editor);

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
