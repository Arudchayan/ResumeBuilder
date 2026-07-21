import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  AlignmentType,
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
      case "paragraph":
        out.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.text,
                italics: Boolean(block.muted),
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
          out.push(
            new Paragraph({
              text: item,
              bullet: { level: 0 },
            }),
          );
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
      case "photo":
        // Photos omitted in DOCX for portability; section still represented by surrounding content
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
              children: [new TextRun({ text: block.subtitle, italics: true, size: 18 })],
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
        for (const line of block.body ?? []) {
          out.push(new Paragraph({ text: line, bullet: { level: 0 } }));
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

export async function exportDocxBlob(doc: ResumeDocument): Promise<Blob> {
  const ir = documentToIr(doc);
  const page = ir.pages[0]!;
  const paragraphs: Paragraph[] = [];

  if (ir.templateId === "sidebar") {
    const aside = page.columns.find((c) => c.id === "aside");
    const main = page.columns.find((c) => c.id === "main");
    // DOCX is inherently linear; emit main then aside labeled sections for parity of content
    if (main) paragraphs.push(...blocksToParagraphs(main.blocks));
    if (aside) {
      paragraphs.push(
        new Paragraph({
          text: "Sidebar",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300 },
        }),
      );
      paragraphs.push(...blocksToParagraphs(aside.blocks));
    }
  } else {
    const main = page.columns[0]!;
    paragraphs.push(...blocksToParagraphs(main.blocks));
  }

  const document = new Document({
    sections: [
      {
        properties: {},
        children:
          paragraphs.length > 0
            ? paragraphs
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
