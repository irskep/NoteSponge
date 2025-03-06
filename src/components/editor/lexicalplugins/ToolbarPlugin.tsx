/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isLinkNode, LinkNode } from "@lexical/link";
import { useCallback, useEffect, useRef } from "react";
import {
  ResetIcon,
  ReloadIcon,
  FontBoldIcon,
  FontItalicIcon,
  StrikethroughIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignJustifyIcon,
  UnderlineIcon,
  Link2Icon,
  CodeIcon,
  ListBulletIcon,
} from "@radix-ui/react-icons";
import { LinkEditorDialog } from "./LinkEditorDialog";
import { useAtom } from "jotai";
import { linkEditorStateAtom, toolbarStateAtom } from "../../../state/atoms";
import { editorStateStore } from "../state/editorStore";
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleCode,
  alignLeft,
  alignCenter,
  alignRight,
  alignJustify,
  toggleBulletList,
  toggleNumberedList,
  undo,
  redo,
} from "../editorActions";
import {
  registerToolbarStateListeners,
  updateStoredSelection,
} from "../state/toolbarStateListeners";

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  // Use the shared editor state store for toolbar state
  const [toolbarState, setToolbarState] = useAtom(toolbarStateAtom, { store: editorStateStore });
  // Use the shared editor state store for link editor state
  const [linkEditorState, setLinkEditorState] = useAtom(linkEditorStateAtom, { store: editorStateStore });

  // Destructure toolbar state for easier access in the component
  const {
    canUndo,
    canRedo,
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    isLink,
    isCode,
    listType,
    storedSelection,
  } = toolbarState;

  const openLinkDialog = useCallback(() => {
    // Update stored selection in the atom
    updateStoredSelection(editor, setToolbarState);

    editor.getEditorState().read(() => {
      const selection = editor.getEditorState()._selection;
      if (!selection || selection.isCollapsed()) {
        setLinkEditorState({ isOpen: true, url: "", text: "" });
        return;
      }

      const nodes = selection.getNodes();
      const isCollapsed = selection.isCollapsed();
      const linkNode = nodes.find((node) => {
        const parent = node.getParent();
        return $isLinkNode(parent) || $isLinkNode(node);
      });

      if ($isLinkNode(linkNode)) {
        setLinkEditorState({
          isOpen: true,
          url: linkNode.getURL(),
          text: linkNode.getTextContent(),
        });
      } else if ($isLinkNode(linkNode?.getParent())) {
        const parentLink = linkNode.getParent() as LinkNode;
        setLinkEditorState({
          isOpen: true,
          url: parentLink.getURL(),
          text: parentLink.getTextContent(),
        });
      } else {
        setLinkEditorState({
          isOpen: true,
          url: "",
          text: isCollapsed ? "" : selection.getTextContent(),
        });
      }
    });
  }, [editor, setLinkEditorState, setToolbarState]);

  useEffect(() => {
    return registerToolbarStateListeners(editor, setToolbarState);
  }, [editor, setToolbarState]);

  return (
    <div className="toolbar" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => undo(editor)}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <ResetIcon className="h-4 w-4" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => redo(editor)}
        className="toolbar-item"
        aria-label="Redo"
      >
        <ReloadIcon className="h-4 w-4" />
      </button>
      <Divider />
      <button
        onClick={() => toggleBold(editor)}
        className={"toolbar-item spaced " + (isBold ? "active" : "")}
        aria-label="Format Bold"
      >
        <FontBoldIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => toggleItalic(editor)}
        className={"toolbar-item spaced " + (isItalic ? "active" : "")}
        aria-label="Format Italics"
      >
        <FontItalicIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => toggleUnderline(editor)}
        className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
        aria-label="Format Underline"
      >
        <UnderlineIcon className="h-4 w-4" rotate={90} />
      </button>
      <button
        onClick={() => toggleStrikethrough(editor)}
        className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
        aria-label="Format Strikethrough"
      >
        <StrikethroughIcon className="h-4 w-4" />
      </button>
      <button
        onClick={openLinkDialog}
        className={"toolbar-item spaced " + (isLink ? "active" : "")}
        aria-label="Insert Link"
      >
        <Link2Icon className="h-4 w-4" />
      </button>
      <LinkEditorDialog
        editor={editor}
        isOpen={linkEditorState.isOpen}
        onOpenChange={(isOpen) =>
          setLinkEditorState((prev) => ({ ...prev, isOpen }))
        }
        initialUrl={linkEditorState.url}
        initialText={linkEditorState.text}
        storedSelection={storedSelection}
      />
      <button
        onClick={() => toggleCode(editor)}
        className={"toolbar-item spaced " + (isCode ? "active" : "")}
        aria-label="Insert Code Block"
      >
        <CodeIcon className="h-4 w-4" />
      </button>
      <Divider />
      <button
        onClick={() => alignLeft(editor)}
        className="toolbar-item spaced"
        aria-label="Left Align"
      >
        <TextAlignLeftIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => alignCenter(editor)}
        className="toolbar-item spaced"
        aria-label="Center Align"
      >
        <TextAlignCenterIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => alignRight(editor)}
        className="toolbar-item spaced"
        aria-label="Right Align"
      >
        <TextAlignRightIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => alignJustify(editor)}
        className="toolbar-item"
        aria-label="Justify Align"
      >
        <TextAlignJustifyIcon className="h-4 w-4" />
      </button>
      <Divider />
      <button
        onClick={() => toggleBulletList(editor, listType === "bullet")}
        className={
          "toolbar-item spaced " + (listType === "bullet" ? "active" : "")
        }
        aria-label="Bullet List"
      >
        <ListBulletIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => toggleNumberedList(editor, listType === "number")}
        className={
          "toolbar-item spaced " + (listType === "number" ? "active" : "")
        }
        aria-label="Numbered List"
      >
        <ListBulletIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
