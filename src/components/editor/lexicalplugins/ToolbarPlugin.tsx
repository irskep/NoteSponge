/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $isLinkNode, LinkNode } from "@lexical/link";
import { $isCodeNode } from "@lexical/code";
import { $isListNode } from "@lexical/list";
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
  redo
} from "../editorActions";

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [toolbarState, setToolbarState] = useAtom(toolbarStateAtom);
  const [linkEditorState, setLinkEditorState] = useAtom(linkEditorStateAtom);
  
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
    storedSelection
  } = toolbarState;

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update toolbar state with all format information
      setToolbarState(prevState => ({
        ...prevState,
        isBold: selection.hasFormat("bold"),
        isItalic: selection.hasFormat("italic"),
        isUnderline: selection.hasFormat("underline"),
        isStrikethrough: selection.hasFormat("strikethrough"),
        isLink: (() => {
          const nodes = selection.getNodes();
          const linkNode = nodes.find((node) => {
            const parent = node.getParent();
            return $isLinkNode(parent) || $isLinkNode(node);
          });
          return $isLinkNode(linkNode) || $isLinkNode(linkNode?.getParent());
        })(),
        isCode: (() => {
          const node = selection.getNodes()[0];
          const parent = node.getParent();
          return $isCodeNode(parent) || $isCodeNode(node);
        })(),
        listType: (() => {
          const node = selection.getNodes()[0];
          const parent = node.getParent();
          const listParent = $isListNode(parent) ? parent : null;
          return listParent?.getListType() || null;
        })()
      }));
    }
  }, [setToolbarState]);

  const openLinkDialog = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      // Update stored selection in the atom
      setToolbarState(prevState => ({
        ...prevState,
        storedSelection: selection
      }));

      if (!$isRangeSelection(selection)) {
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
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setToolbarState(prevState => ({
            ...prevState,
            canUndo: payload
          }));
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setToolbarState(prevState => ({
            ...prevState,
            canRedo: payload
          }));
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar, setToolbarState]);

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
        onOpenChange={(isOpen) => setLinkEditorState((prev) => ({ ...prev, isOpen }))}
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
