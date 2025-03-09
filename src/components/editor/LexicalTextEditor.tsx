import { FC, PropsWithChildren, useCallback, useRef, useEffect } from "react";
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

import CustomLinkPlugin from "./lexicalplugins/CustomLinkPlugin";
import { EditorState, LexicalEditor, SerializedEditorState } from "lexical";
import { atom, useAtom } from "jotai";
import { registerFormatMenuListeners } from "../../menu/listeners/formatMenuListeners";
import "./LexicalTextEditor.css";
import ImagesPlugin, {
  INSERT_IMAGE_COMMAND,
} from "./lexicalplugins/ImagePlugin";
import { ImageNode } from "./lexicalplugins/ImageNode";
import { ImageDropTarget } from "./ImageDropTarget";
import "./ImageDropTarget.css";
import { processAndStoreImage } from "../../services/db/actions";
import KeyboardHandlerPlugin from "./lexicalplugins/KeyboardHandlerPlugin";
import EditorModals from "./EditorModals";

// Export the editor atom so it can be accessed by other components
export const editorAtom = atom<LexicalEditor | null>(null);

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
    ImageNode,
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
  placeholder = "Enter some text…",
  initialContent,
  editable = true,
  onChange,
  pageId,
  children,
}) => {
  // Store editor instance in state and ref
  const [editor, setEditor] = useAtom(editorAtom);
  const editorRef = useRef<LexicalEditor | null>(null);

  // Create a customized version of the editor config with the same nodes
  const customEditorConfig = {
    ...editorConfig,
    editable,
  };

  const handleImageDrop = useCallback(
    async (file: File) => {
      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        return;
      }

      if (!editorRef.current) {
        return;
      }

      try {
        // Process and store the image in one step
        const result = await processAndStoreImage(pageId, file);

        if (result) {
          // Dispatch the command to insert the image
          editorRef.current.dispatchCommand(INSERT_IMAGE_COMMAND, result.id);
        }
      } catch (error) {
        console.error("Error handling image drop:", error);
      }
    },
    [pageId]
  );

  useEffect(() => {
    return registerFormatMenuListeners(editor);
  }, [editor]);

  return (
    <LexicalComposer
      initialConfig={{
        ...customEditorConfig,
        namespace: "NoteSpongeEditor",
        editorState: (editor: LexicalEditor) => {
          // Store the editor reference in both state and ref
          editorRef.current = editor;
          setEditor(editor);

          // Initialize with content if provided
          if (initialContent) {
            editor.setEditorState(editor.parseEditorState(initialContent));
          }
        },
        onError: (error) => {
          console.error(error);
        },
      }}
    >
      <div className="LexicalTextEditor">
        <EditorModals />
        <ImageDropTarget onImageDrop={handleImageDrop}>
          <div className="editor-container">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={
                <div className="editor-placeholder">{placeholder}</div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <KeyboardHandlerPlugin />
            <HistoryPlugin />
            <ListPlugin />
            <CustomLinkPlugin />
            <AutoLinkPlugin matchers={MATCHERS} />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            {onChange && <OnChangePlugin onChange={onChange} />}
            <ImagesPlugin pageId={pageId} />
            {children}
          </div>
        </ImageDropTarget>
      </div>
    </LexicalComposer>
  );
};
