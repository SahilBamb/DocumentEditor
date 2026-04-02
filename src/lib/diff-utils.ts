export interface DiffSegment {
  type: 'equal' | 'insert' | 'delete';
  text: string;
}

export function extractPlainText(content: Record<string, unknown>): string {
  if (!content || Object.keys(content).length === 0) return '';

  const blocks: string[] = [];

  function walk(node: unknown): string {
    if (!node || typeof node !== 'object') return '';
    const n = node as Record<string, unknown>;

    if (n.type === 'text' && typeof n.text === 'string') {
      return n.text;
    }

    if (Array.isArray(n.content)) {
      const texts = (n.content as unknown[]).map(walk).filter(Boolean);
      return texts.join('');
    }

    return '';
  }

  if (Array.isArray((content as Record<string, unknown>).content)) {
    for (const block of (content as Record<string, unknown>).content as unknown[]) {
      const text = walk(block);
      blocks.push(text);
    }
  }

  return blocks.join('\n');
}

function lcs(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}

export function computeTextDiff(oldText: string, newText: string): DiffSegment[] {
  const oldWords = oldText.split(/(\s+)/).filter(Boolean);
  const newWords = newText.split(/(\s+)/).filter(Boolean);

  const common = lcs(oldWords, newWords);

  const segments: DiffSegment[] = [];
  let oi = 0;
  let ni = 0;
  let ci = 0;

  while (ci < common.length) {
    const cWord = common[ci];

    const deletedWords: string[] = [];
    while (oi < oldWords.length && oldWords[oi] !== cWord) {
      deletedWords.push(oldWords[oi]);
      oi++;
    }

    const insertedWords: string[] = [];
    while (ni < newWords.length && newWords[ni] !== cWord) {
      insertedWords.push(newWords[ni]);
      ni++;
    }

    if (deletedWords.length > 0) {
      segments.push({ type: 'delete', text: deletedWords.join('') });
    }
    if (insertedWords.length > 0) {
      segments.push({ type: 'insert', text: insertedWords.join('') });
    }

    segments.push({ type: 'equal', text: cWord });
    oi++;
    ni++;
    ci++;
  }

  const trailingDeleted: string[] = [];
  while (oi < oldWords.length) {
    trailingDeleted.push(oldWords[oi]);
    oi++;
  }
  if (trailingDeleted.length > 0) {
    segments.push({ type: 'delete', text: trailingDeleted.join('') });
  }

  const trailingInserted: string[] = [];
  while (ni < newWords.length) {
    trailingInserted.push(newWords[ni]);
    ni++;
  }
  if (trailingInserted.length > 0) {
    segments.push({ type: 'insert', text: trailingInserted.join('') });
  }

  // Merge consecutive segments of the same type
  const merged: DiffSegment[] = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (last && last.type === seg.type) {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }

  return merged;
}
