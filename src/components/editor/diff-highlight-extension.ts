import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { ChangeItem } from '@/types';

export const diffHighlightPluginKey = new PluginKey('diffHighlight');

function findTextRange(
  doc: ProseMirrorNode,
  needle: string,
): { from: number; to: number } | null {
  if (!needle || needle.length === 0) return null;

  let result: { from: number; to: number } | null = null;

  doc.descendants((node, pos) => {
    if (result) return false;
    if (node.isTextblock) {
      const text = node.textContent;
      const idx = text.indexOf(needle);
      if (idx !== -1) {
        result = { from: pos + 1 + idx, to: pos + 1 + idx + needle.length };
        return false;
      }
    }
    return true;
  });

  if (result) return result;

  // Fallback: try matching the first 40 characters for partial match
  const trimmed = needle.trim();
  const prefix = trimmed.slice(0, Math.min(40, trimmed.length));
  if (prefix.length >= 10 && prefix !== needle) {
    doc.descendants((node, pos) => {
      if (result) return false;
      if (node.isTextblock) {
        const text = node.textContent;
        const idx = text.indexOf(prefix);
        if (idx !== -1) {
          const endIdx = Math.min(text.length, idx + needle.length);
          result = { from: pos + 1 + idx, to: pos + 1 + endIdx };
          return false;
        }
      }
      return true;
    });
  }

  return result;
}

export { findTextRange };

export interface DiffHighlightStorage {
  changes: ChangeItem[];
  onAccept: (changeSetId: string, itemId: string) => void;
  onReject: (changeSetId: string, itemId: string) => void;
}

export const DiffHighlight = Extension.create<object, DiffHighlightStorage>({
  name: 'diffHighlight',

  addStorage() {
    return {
      changes: [] as ChangeItem[],
      onAccept: () => {},
      onReject: () => {},
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: diffHighlightPluginKey,
        props: {
          decorations: (state) => {
            const { changes, onAccept, onReject } = extension.storage;
            if (!changes || changes.length === 0) return DecorationSet.empty;

            const decorations: Decoration[] = [];

            for (const change of changes) {
              if (change.status !== 'pending') continue;

              if (change.changeType === 'insert' && !change.beforeFragment) {
                // Pure insertion — show as widget at end of document
                const pos = Math.max(1, state.doc.content.size - 1);
                decorations.push(
                  Decoration.widget(
                    pos,
                    () => buildInsertWidget(change, onAccept, onReject),
                    { side: 1, key: `insert-${change.id}` },
                  ),
                );
                continue;
              }

              const range = findTextRange(state.doc, change.beforeFragment);
              if (!range) continue;

              // Strikethrough decoration on the original text
              decorations.push(
                Decoration.inline(range.from, range.to, {
                  class: 'diff-inline-delete',
                  nodeName: 'span',
                }),
              );

              // Widget after the original text showing the replacement + buttons
              decorations.push(
                Decoration.widget(
                  range.to,
                  () => buildReplaceWidget(change, onAccept, onReject),
                  { side: 1, key: `replace-${change.id}` },
                ),
              );
            }

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

function buildInsertWidget(
  change: ChangeItem,
  onAccept: DiffHighlightStorage['onAccept'],
  onReject: DiffHighlightStorage['onReject'],
): HTMLElement {
  const wrapper = document.createElement('span');
  wrapper.className = 'diff-inline-wrapper';

  const text = document.createElement('span');
  text.className = 'diff-inline-insert';
  text.textContent = change.afterFragment;
  wrapper.appendChild(text);

  wrapper.appendChild(buildButtons(change, onAccept, onReject));
  return wrapper;
}

function buildReplaceWidget(
  change: ChangeItem,
  onAccept: DiffHighlightStorage['onAccept'],
  onReject: DiffHighlightStorage['onReject'],
): HTMLElement {
  const wrapper = document.createElement('span');
  wrapper.className = 'diff-inline-wrapper';

  if (change.afterFragment) {
    const text = document.createElement('span');
    text.className = 'diff-inline-insert';
    text.textContent = change.afterFragment;
    wrapper.appendChild(text);
  }

  wrapper.appendChild(buildButtons(change, onAccept, onReject));
  return wrapper;
}

function buildButtons(
  change: ChangeItem,
  onAccept: DiffHighlightStorage['onAccept'],
  onReject: DiffHighlightStorage['onReject'],
): HTMLElement {
  const group = document.createElement('span');
  group.className = 'diff-inline-buttons';

  const accept = document.createElement('button');
  accept.className = 'diff-inline-btn diff-inline-btn-accept';
  accept.title = `Accept: ${change.label}`;
  accept.innerHTML =
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  accept.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAccept(change.changeSetId, change.id);
  });
  accept.addEventListener('mousedown', (e) => e.preventDefault());

  const reject = document.createElement('button');
  reject.className = 'diff-inline-btn diff-inline-btn-reject';
  reject.title = `Reject: ${change.label}`;
  reject.innerHTML =
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  reject.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onReject(change.changeSetId, change.id);
  });
  reject.addEventListener('mousedown', (e) => e.preventDefault());

  group.appendChild(accept);
  group.appendChild(reject);
  return group;
}
