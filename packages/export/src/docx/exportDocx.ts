import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TableBorders,
  TableLayoutType,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import type { ResumeDocument } from "@resume/core";
import { documentToIr, type IrBlock } from "@resume/templates";

function blocksToParagraphs(blocks: IrBlock[]): Paragraph[] {
  const out: Paragraph[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        out.push(
          new Paragraph({
            text: block.text,
            heading: block.level === 1 ? HeadingLevel.TITLE : HeadingLevel.HEADING_2,
            spacing: { before: block.level === 1 ? 0 : 200, after: 80 },
          }),
        );
        break;
      case "accentBar":
        break;
      case "paragraph":
        out.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.text,
                bold: Boolean(block.muted),
                size: block.muted ? 22 : 20,
              }),
            ],
            spacing: { after: 60 },
          }),
        );
        break;
      case "chips":
        out.push(
          new Paragraph({
            children: [new TextRun({ text: block.items.join(" · "), size: 18 })],
            spacing: { after: 80 },
          }),
        );
        break;
      case "bullets":
        for (const item of block.items) {
          out.push(new Paragraph({ text: item, bullet: { level: 0 } }));
        }
        break;
      case "kv":
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${block.label}: `, bold: true, size: 18 }),
              new TextRun({ text: block.value, size: 18 }),
            ],
          }),
        );
        break;
      case "link":
        out.push(
          new Paragraph({
            children: [
              new ExternalHyperlink({
                children: [new TextRun({ text: block.label, style: "Hyperlink", size: 18 })],
                link: block.href,
              }),
            ],
          }),
        );
        break;
      case "photo":
        break;
      case "lineItem":
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: block.text, bold: true, size: 19 }),
              block.muted
                ? new TextRun({ text: ` ${block.muted}`, size: 18, color: "64748B" })
                : new TextRun({ text: "" }),
            ],
          }),
        );
        break;
      case "entry": {
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: block.title, bold: true, size: 22 }),
              block.meta
                ? new TextRun({ text: `  ${block.meta}`, size: 18, color: "64748B" })
                : new TextRun({ text: "" }),
            ],
            spacing: { before: 120 },
          }),
        );
        if (block.subtitle) {
          out.push(
            new Paragraph({
              children: [new TextRun({ text: block.subtitle, bold: true, size: 18, color: "64748B" })],
            }),
          );
        }
        if (block.url) {
          out.push(
            new Paragraph({
              children: [
                new ExternalHyperlink({
                  children: [new TextRun({ text: block.url, style: "Hyperlink", size: 16 })],
                  link: block.url,
                }),
              ],
            }),
          );
        }
        for (const sec of block.subsections ?? []) {
          if (sec.title) {
            out.push(
              new Paragraph({
                children: [new TextRun({ text: sec.title, bold: true, size: 19 })],
              }),
            );
          }
          for (const line of sec.bullets) {
            out.push(new Paragraph({ text: line, bullet: { level: 0 } }));
          }
        }
        for (const line of block.body ?? []) {
          out.push(new Paragraph({ children: [new TextRun({ text: line, size: 19 })] }));
        }
        break;
      }
      case "spacer":
        out.push(new Paragraph({ text: "" }));
        break;
      default: {
        const _exhaustive: never = block;
        void _exhaustive;
        break;
      }
    }
  }
  return out;
}

const SIDEBAR_TABLE_WIDTH_DXA = 9360;
const SIDEBAR_ASIDE_WIDTH_DXA = 2995;
const SIDEBAR_MAIN_WIDTH_DXA = SIDEBAR_TABLE_WIDTH_DXA - SIDEBAR_ASIDE_WIDTH_DXA;

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "auto" } as const;
const NO_CELL_BORDERS = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
} as const;

function paragraphsOrEmpty(blocks: IrBlock[]): Paragraph[] {
  const paragraphs = blocksToParagraphs(blocks);
  return paragraphs.length > 0 ? paragraphs : [new Paragraph({ text: "" })];
}

function buildSidebarTable(asideBlocks: IrBlock[], mainBlocks: IrBlock[]): Table {
  return new Table({
    width: { size: SIDEBAR_TABLE_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [SIDEBAR_ASIDE_WIDTH_DXA, SIDEBAR_MAIN_WIDTH_DXA],
    layout: TableLayoutType.FIXED,
    borders: TableBorders.NONE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: SIDEBAR_ASIDE_WIDTH_DXA, type: WidthType.DXA },
            borders: NO_CELL_BORDERS,
            shading: { fill: "f0f8f9", type: ShadingType.CLEAR },
            children: paragraphsOrEmpty(asideBlocks),
          }),
          new TableCell({
            width: { size: SIDEBAR_MAIN_WIDTH_DXA, type: WidthType.DXA },
            borders: NO_CELL_BORDERS,
            children: paragraphsOrEmpty(mainBlocks),
          }),
        ],
      }),
    ],
  });
}

export async function exportDocxBlob(doc: ResumeDocument): Promise<Blob> {
  const ir = documentToIr(doc);
  const page = ir.pages[0]!;
  let children: (Paragraph | Table)[];

  if (ir.templateId === "sidebar") {
    const aside = page.columns.find((c) => c.id === "aside");
    const main = page.columns.find((c) => c.id === "main");
    children = [buildSidebarTable(aside?.blocks ?? [], main?.blocks ?? [])];
  } else {
    const main = page.columns[0]!;
    children = blocksToParagraphs(main.blocks);
  }

  const document = new Document({
    sections: [
      {
        properties: {},
        children:
          children.length > 0
            ? children
            : [
                new Paragraph({
                  children: [new TextRun("Empty resume")],
                  alignment: AlignmentType.CENTER,
                }),
              ],
      },
    ],
  });

  return Packer.toBlob(document);
}

export async function downloadDocx(doc: ResumeDocument, filename = "resume.docx") {
  const blob = await exportDocxBlob(doc);
  saveAs(blob, filename);
}
