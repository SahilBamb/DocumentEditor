'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { useDocumentStore } from '@/stores/document-store';
import { useUIStore } from '@/stores/ui-store';
import { useChangeStore } from '@/stores/change-store';
import { SelectionToolbar } from '@/components/editor/SelectionToolbar';
import { SearchReplace } from '@/components/editor/SearchReplace';
import { SlashPrompt } from '@/components/editor/SlashPrompt';
import {
  DiffHighlight,
  findTextRange,
  type DiffHighlightStorage,
} from '@/components/editor/diff-highlight-extension';
import type { ChangeItem } from '@/types';

const DRAG_TYPE_EDITOR_TEXT = 'application/x-doc-editor-text';

function applyAcceptedChanges(ed: Editor, items: ChangeItem[]) {
  const withRanges = items
    .map((item) => ({
      item,
      range:
        item.changeType === 'insert' && !item.beforeFragment
          ? null
          : findTextRange(ed.state.doc, item.beforeFragment),
    }))
    .filter(
      (c) => c.range !== null || (c.item.changeType === 'insert' && !c.item.beforeFragment),
    );

  withRanges.sort((a, b) => (b.range?.from ?? Infinity) - (a.range?.from ?? Infinity));

  ed.chain()
    .command(({ tr }) => {
      for (const { item, range } of withRanges) {
        if (item.changeType === 'insert' && !item.beforeFragment) {
          const pos = Math.max(1, tr.doc.content.size - 1);
          tr.insertText(item.afterFragment, pos);
        } else if (range) {
          tr.insertText(item.afterFragment ?? '', range.from, range.to);
        }
      }
      return true;
    })
    .run();
}

export function EditorArea() {
  const activeDoc = useDocumentStore((s) => s.getActiveDocument());
  const activeDocId = useDocumentStore((s) => s.activeDocumentId);
  const updateContent = useDocumentStore((s) => s.updateDocumentContent);
  const setCurrentSelection = useUIStore((s) => s.setCurrentSelection);
  const searchReplaceOpen = useUIStore((s) => s.searchReplaceOpen);
  const showInlineDiff = useUIStore((s) => s.showInlineDiff);
  const allChangeSets = useChangeStore((s) => s.changeSets);
  const updateItemStatus = useChangeStore((s) => s.updateItemStatus);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Editor | null>(null);

  const activeChanges = useMemo(
    () =>
      allChangeSets
        .filter((cs) => cs.documentId === activeDocId && cs.status === 'proposed')
        .flatMap((cs) => cs.items)
        .filter((item) => item.status === 'pending'),
    [allChangeSets, activeDocId],
  );

  const handleAcceptInline = useCallback(
    (changeSetId: string, itemId: string) => {
      updateItemStatus(changeSetId, itemId, 'accepted');
    },
    [updateItemStatus],
  );

  const handleRejectInline = useCallback(
    (changeSetId: string, itemId: string) => {
      updateItemStatus(changeSetId, itemId, 'rejected');
    },
    [updateItemStatus],
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({
          placeholder: 'Start writing, or type / to ask AI...',
        }),
        Link.configure({ openOnClick: false }),
        Image,
        Table.configure({ resizable: true }),
        TableRow,
        TableCell,
        TableHeader,
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        TextStyle,
        Color,
        FontFamily,
        CharacterCount,
        Subscript,
        Superscript,
        DiffHighlight,
      ],
      content: activeDoc?.editorContent ?? {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      },
      onUpdate: ({ editor: ed }) => {
        if (activeDoc) {
          updateContent(activeDoc.id, ed.getJSON());
        }
      },
      onSelectionUpdate: ({ editor: ed }) => {
        const { from, to } = ed.state.selection;
        if (from !== to) {
          const text = ed.state.doc.textBetween(from, to, ' ');
          setCurrentSelection({ from, to, text });
        } else {
          setCurrentSelection(null);
        }
      },
      editorProps: {
        attributes: {
          class: 'tiptap',
        },
        handleDOMEvents: {
          dragstart: (view, event) => {
            const { from, to } = view.state.selection;
            if (from !== to && event.dataTransfer) {
              const text = view.state.doc.textBetween(from, to, ' ');
              event.dataTransfer.setData(DRAG_TYPE_EDITOR_TEXT, text);
              event.dataTransfer.setData('text/plain', text);
              event.dataTransfer.effectAllowed = 'copyMove';
            }
            return false;
          },
        },
      },
    },
    [activeDoc?.id],
  );

  editorInstanceRef.current = editor;

  // Sync pending changes + callbacks into the DiffHighlight extension storage
  const visibleChanges = showInlineDiff ? activeChanges : [];
  const changesKey = visibleChanges.map((c) => `${c.id}:${c.status}`).join(',');
  useEffect(() => {
    if (!editor) return;
    const storage = (editor.storage as unknown as Record<string, DiffHighlightStorage | undefined>)
      .diffHighlight;
    if (!storage) return;
    storage.changes = visibleChanges;
    storage.onAccept = handleAcceptInline;
    storage.onReject = handleRejectInline;
    editor.view.dispatch(editor.state.tr);
  }, [editor, changesKey, handleAcceptInline, handleRejectInline, visibleChanges]);

  useEffect(() => {
    if (!editor) return;
    const handler = (e: Event) => {
      const html = (e as CustomEvent<string>).detail;
      if (html) editor.commands.setContent(html);
    };
    window.addEventListener('docx-import', handler);
    return () => window.removeEventListener('docx-import', handler);
  }, [editor]);

  // Subscribe to store: when items transition pending→accepted, apply text changes
  useEffect(() => {
    if (!editor) return;

    const unsub = useChangeStore.subscribe((state, prevState) => {
      const ed = editorInstanceRef.current;
      if (!ed || ed.isDestroyed) return;

      const accepted: ChangeItem[] = [];

      for (const cs of state.changeSets) {
        if (cs.documentId !== activeDocId) continue;
        const prevCs = prevState.changeSets.find((p) => p.id === cs.id);
        if (!prevCs) continue;

        for (const item of cs.items) {
          const prevItem = prevCs.items.find((p) => p.id === item.id);
          if (prevItem?.status === 'pending' && item.status === 'accepted') {
            accepted.push(item);
          }
        }
      }

      if (accepted.length > 0) {
        applyAcceptedChanges(ed, accepted);
      }
    });

    return unsub;
  }, [editor, activeDocId]);

  return (
    <div
      className="flex-1 overflow-hidden relative flex flex-col"
      style={{ background: 'var(--bg-base)' }}
    >
      {searchReplaceOpen && <SearchReplace />}

      <div className="editor-scroll-container flex-1 overflow-y-auto flex justify-center py-8 px-4">
        <div
          className="editor-pages-wrapper"
          style={{ maxWidth: '816px', width: '100%' }}
        >
          <div ref={editorRef} className="paper rounded-lg w-full relative">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {editor && <SelectionToolbar editor={editor} />}
      {editor && <SlashPrompt editor={editor} />}
    </div>
  );
}
