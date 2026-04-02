'use client';

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

type DocxChild = Paragraph | Table;

const HEADING_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
};

function buildTextRuns(node: TiptapNode): TextRun[] {
  if (node.type === 'text' && node.text) {
    const opts: Record<string, unknown> = { text: node.text };
    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case 'bold':
            opts.bold = true;
            break;
          case 'italic':
            opts.italics = true;
            break;
          case 'underline':
            opts.underline = { type: 'single' };
            break;
          case 'strike':
            opts.strike = true;
            break;
          case 'code':
            opts.font = { name: 'Courier New' };
            break;
          case 'highlight':
            opts.shading = { type: 'solid' as const, color: 'FFFF00', fill: 'FFFF00' };
            break;
          case 'textStyle':
            if (mark.attrs?.color) {
              opts.color = (mark.attrs.color as string).replace('#', '');
            }
            break;
          case 'link':
            break;
        }
      }
    }
    return [new TextRun(opts as ConstructorParameters<typeof TextRun>[0])];
  }

  if (node.type === 'hardBreak') {
    return [new TextRun({ break: 1 })];
  }

  if (node.content) {
    return node.content.flatMap(buildTextRuns);
  }

  return [];
}

function collectListItems(node: TiptapNode, bullet: boolean): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  if (!node.content) return paragraphs;

  for (const listItem of node.content) {
    if (listItem.type !== 'listItem') continue;
    if (!listItem.content) continue;

    for (const child of listItem.content) {
      if (child.type === 'paragraph') {
        const runs = child.content ? child.content.flatMap(buildTextRuns) : [];
        paragraphs.push(
          new Paragraph({
            children: runs,
            bullet: bullet ? { level: 0 } : undefined,
            numbering: !bullet ? { reference: 'default-numbering', level: 0 } : undefined,
          }),
        );
      } else if (child.type === 'bulletList') {
        paragraphs.push(...collectListItems(child, true));
      } else if (child.type === 'orderedList') {
        paragraphs.push(...collectListItems(child, false));
      }
    }
  }
  return paragraphs;
}

function collectTaskItems(node: TiptapNode): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  if (!node.content) return paragraphs;

  for (const taskItem of node.content) {
    if (taskItem.type !== 'taskItem') continue;
    const checked = taskItem.attrs?.checked ? '☑' : '☐';
    const innerRuns: TextRun[] = [];
    if (taskItem.content) {
      for (const child of taskItem.content) {
        if (child.type === 'paragraph' && child.content) {
          innerRuns.push(...child.content.flatMap(buildTextRuns));
        }
      }
    }
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `${checked} ` }), ...innerRuns],
      }),
    );
  }
  return paragraphs;
}

function convertTableNode(node: TiptapNode): Table {
  const rows = (node.content ?? []).map((rowNode) => {
    const cells = (rowNode.content ?? []).map((cellNode) => {
      const cellParagraphs: Paragraph[] = [];
      for (const child of cellNode.content ?? []) {
        const converted = convertNode(child);
        for (const item of converted) {
          if (item instanceof Paragraph) cellParagraphs.push(item);
        }
      }
      if (cellParagraphs.length === 0) {
        cellParagraphs.push(new Paragraph({ children: [] }));
      }
      return new TableCell({
        children: cellParagraphs,
        width: { size: 0, type: WidthType.AUTO },
      });
    });
    return new TableRow({ children: cells });
  });

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function convertNode(node: TiptapNode): DocxChild[] {
  switch (node.type) {
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      const runs = node.content ? node.content.flatMap(buildTextRuns) : [];
      return [
        new Paragraph({
          children: runs,
          heading: HEADING_MAP[level] ?? HeadingLevel.HEADING_1,
        }),
      ];
    }

    case 'paragraph': {
      const runs = node.content ? node.content.flatMap(buildTextRuns) : [];
      return [new Paragraph({ children: runs })];
    }

    case 'bulletList':
      return collectListItems(node, true);

    case 'orderedList':
      return collectListItems(node, false);

    case 'taskList':
      return collectTaskItems(node);

    case 'blockquote': {
      const children: DocxChild[] = [];
      for (const child of node.content ?? []) {
        const converted = convertNode(child);
        for (const item of converted) {
          if (item instanceof Paragraph) {
            children.push(
              new Paragraph({
                children: (item as unknown as { options: { children: TextRun[] } }).options?.children ?? [],
                indent: { left: 720 },
                border: {
                  left: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 8 },
                },
              }),
            );
          } else {
            children.push(item);
          }
        }
      }
      return children;
    }

    case 'codeBlock': {
      const lines: string[] = [];
      for (const child of node.content ?? []) {
        if (child.text) lines.push(child.text);
      }
      const text = lines.join('');
      return text.split('\n').map(
        (line) =>
          new Paragraph({
            children: [new TextRun({ text: line, font: { name: 'Courier New' }, size: 20 })],
            spacing: { line: 276 },
          }),
      );
    }

    case 'horizontalRule':
      return [
        new Paragraph({
          children: [],
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA', space: 1 },
          },
          spacing: { before: 200, after: 200 },
        }),
      ];

    case 'table':
      return [convertTableNode(node)];

    case 'doc':
      return (node.content ?? []).flatMap(convertNode);

    default:
      if (node.content) {
        return node.content.flatMap(convertNode);
      }
      return [];
  }
}

export async function exportToDocx(
  title: string,
  editorContent: Record<string, unknown>,
): Promise<void> {
  const children = convertNode(editorContent as unknown as TiptapNode);

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal' as const,
              text: '%1.',
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [{ children: children as Paragraph[] }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}.docx`);
}

export async function importDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}
