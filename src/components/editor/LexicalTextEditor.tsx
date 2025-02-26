import { FC, PropsWithChildren, useCallback, useRef } from "react";
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
import { EditorState, LexicalEditor, SerializedEditorState } from "lexical";
import "./LexicalTextEditor.css";
import ImagesPlugin, {
  INSERT_IMAGE_COMMAND,
} from "./lexicalplugins/ImagePlugin";
import { ImageNode } from "./lexicalplugins/ImageNode";
import { ImageDropTarget } from "./ImageDropTarget";
import "./ImageDropTarget.css";
import { createImageAttachment } from "../../services/db/actions";

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
  onError(error: Error) {
    console.error("Lexical Editor Error:", error);
    throw error;
  },
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
  // Create a ref to store the editor instance
  const editorRef = useRef<LexicalEditor | null>(null);

  // Create a customized version of the editor config with the same nodes
  const customEditorConfig = {
    ...editorConfig,
    editable,
  };

  const handleImageDrop = useCallback(
    async (file: File) => {
      console.log(
        "handleImageDrop called with file:",
        file.name,
        file.type,
        file.size
      );

      if (!file) {
        console.error("No file provided to handleImageDrop");
        return;
      }

      if (!editorRef.current) {
        console.error("Editor reference is not available");
        return;
      }

      try {
        // Read the file as ArrayBuffer
        console.log("Reading file as ArrayBuffer...");
        const arrayBuffer = await file.arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          console.error("File read resulted in empty buffer");
          return;
        }
        console.log("File read successfully, size:", arrayBuffer.byteLength);

        // Create a blob URL to get the image dimensions
        const blobUrl = URL.createObjectURL(new Blob([arrayBuffer], { type: file.type }));
        console.log("Created temporary blob URL for dimension detection:", blobUrl);
        
        // Get image dimensions
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const width = img.width;
            const height = img.height;
            console.log("Detected image dimensions:", width, "x", height);
            URL.revokeObjectURL(blobUrl);
            resolve({ width, height });
          };
          img.onerror = (e) => {
            console.error("Failed to load image for dimension detection:", e);
            URL.revokeObjectURL(blobUrl);
            reject(new Error("Failed to load image"));
          };
          img.src = blobUrl;
        });

        // Create image attachment in the database
        console.log("Creating image attachment in DB for page:", pageId);
        const result = await createImageAttachment(
          pageId,
          file.type,
          arrayBuffer,
          dimensions.width,
          dimensions.height
        );
        console.log("DB result:", result);

        if (!result) {
          console.error("Failed to create image attachment in database");
          return;
        }

        if (!result.id) {
          console.error("Failed to get valid ID from createImageAttachment");
          return;
        }

        console.log("Dispatching INSERT_IMAGE_COMMAND with ID:", result.id);
        // Use the editor from the ref
        editorRef.current.dispatchCommand(INSERT_IMAGE_COMMAND, result.id);
        console.log("Command dispatched successfully");
      } catch (error) {
        console.error("Error handling image drop:", error);
      }
    },
    [pageId]
  );

  return (
    <LexicalComposer
      initialConfig={{
        ...customEditorConfig,
        namespace: "NoteSpongeEditor",
        editorState: (editor: LexicalEditor) => {
          // Store the editor reference
          editorRef.current = editor;

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
        <ToolbarPlugin />
        <ImageDropTarget onImageDrop={handleImageDrop}>
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
            <ImagesPlugin pageId={pageId} />
            {children}
          </div>
        </ImageDropTarget>
      </div>
    </LexicalComposer>
  );
};
