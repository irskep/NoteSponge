import {
  FC,
  PropsWithChildren,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";
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
import { Toast } from "radix-ui";

import CustomLinkPlugin from "./lexicalplugins/CustomLinkPlugin";
import { EditorState, LexicalEditor, SerializedEditorState } from "lexical";
import { useAtom } from "jotai";
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
import { editorStateStore, editorAtom } from "./state/editorStore";

// Export the editor atom so it can be accessed by other components
// export const editorAtom = atom<LexicalEditor | null>(null);

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
  const [editor, _] = useAtom(editorAtom, {
    store: editorStateStore,
  });
  const editorRef = useRef<LexicalEditor | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const timerRef = useRef(0);

  // Create a customized version of the editor config with the same nodes
  const customEditorConfig = {
    ...editorConfig,
    editable,
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const showToast = useCallback((message: string) => {
    setToastOpen(false);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setToastMessage(message);
      setToastOpen(true);
    }, 100);
  }, []);

  const handleImageDrop = useCallback(
    async (file: File) => {
      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        showToast("Only image files are supported");
        return;
      }

      // Check if the file has a valid extension
      const fileExtension = file.name.split(".").pop() || "";
      if (!fileExtension) {
        showToast("Image file must have an extension");
        return;
      }

      if (!editorRef.current) {
        return;
      }

      try {
        // Process and store the image in one step
        const result = await processAndStoreImage(pageId, file);

        if ("error" in result) {
          showToast(result.error);
          return;
        }

        // Dispatch the command to insert the image with file extension
        editorRef.current.dispatchCommand(INSERT_IMAGE_COMMAND, {
          id: result.id,
          fileExtension: result.fileExtension,
        });
      } catch (error) {
        console.error("Error handling image drop:", error);
        showToast("Failed to process image");
      }
    },
    [pageId, showToast]
  );

  useEffect(() => {
    return registerFormatMenuListeners();
  }, [editor]);

  return (
    <>
      <Toast.Provider swipeDirection="right">
        <LexicalComposer
          initialConfig={{
            ...customEditorConfig,
            namespace: "NoteSpongeEditor",
            editorState: (editor: LexicalEditor) => {
              // Store the editor reference in both state and ref
              editorRef.current = editor;
              editorStateStore.set(editorAtom, editor);

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
            <ImageDropTarget onImageDrop={handleImageDrop} onError={showToast}>
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

        <Toast.Root
          className="ToastRoot"
          open={toastOpen}
          onOpenChange={setToastOpen}
          duration={3000}
        >
          <Toast.Title className="ToastTitle">Notification</Toast.Title>
          <Toast.Description className="ToastDescription">
            {toastMessage}
          </Toast.Description>
          <Toast.Close className="ToastClose" aria-label="Close">
            <span aria-hidden>×</span>
          </Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="ToastViewport" />
      </Toast.Provider>
    </>
  );
};
