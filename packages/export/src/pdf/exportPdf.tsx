import { saveAs } from "file-saver";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Link,
  Image,
} from "@react-pdf/renderer";
import type { ResumeDocument } from "@resume/core";
import { documentToIr, type IrBlock, type LayoutIr } from "@resume/templates";
import { themes, type ThemeId } from "@resume/ui";

function stylesFor(themeId: string, sidebar: boolean) {
  const theme = themes[themeId as ThemeId] ?? themes.teal;
  return StyleSheet.create({
    page: {
      flexDirection: sidebar ? "row" : "column",
      fontSize: 10,
      fontFamily: "Helvetica",
      color: "#0f172a",
    },
    aside: {
      width: "32%",
      backgroundColor: theme.surface,
      padding: 18,
    },
    main: {
      width: sidebar ? "68%" : "100%",
      padding: sidebar ? 22 : 28,
    },
    h1: { fontSize: 22, fontFamily: "Helvetica-Bold", color: theme.dark, marginBottom: 4 },
    h2: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: theme.primary,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginTop: 10,
      marginBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.light,
      paddingBottom: 2,
    },
    p: { fontSize: 10, lineHeight: 1.4, marginBottom: 4, color: "#334155" },
    muted: { fontSize: 11, color: theme.dark, marginBottom: 6 },
    kvLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: theme.dark },
    kvValue: { fontSize: 9, color: "#475569", marginBottom: 4 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
    chip: {
      fontSize: 8,
      backgroundColor: theme.light,
      color: theme.dark,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginRight: 4,
      marginBottom: 4,
    },
    entryTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" },
    entryMeta: { fontSize: 8, color: "#64748b" },
    entrySub: { fontSize: 9, color: "#475569", marginBottom: 2 },
    bullet: { fontSize: 9, marginLeft: 8, marginBottom: 2 },
    photo: { width: 72, height: 72, borderRadius: 36, marginBottom: 10, objectFit: "cover" },
  });
}

function PdfBlocks({ blocks, s }: { blocks: IrBlock[]; s: ReturnType<typeof stylesFor> }) {
  return (
    <>
      {blocks.map((block, i) => {
        const key = `${block.type}-${i}`;
        switch (block.type) {
          case "heading":
            return (
              <Text key={key} style={block.level === 1 ? s.h1 : s.h2}>
                {block.text}
              </Text>
            );
          case "paragraph":
            return (
              <Text key={key} style={block.muted ? s.muted : s.p}>
                {block.text}
              </Text>
            );
          case "chips":
            return (
              <View key={key} style={s.chipRow}>
                {block.items.map((item) => (
                  <Text key={item} style={s.chip}>
                    {item}
                  </Text>
                ))}
              </View>
            );
          case "bullets":
            return (
              <View key={key}>
                {block.items.map((item, idx) => (
                  <Text key={idx} style={s.bullet}>
                    • {item}
                  </Text>
                ))}
              </View>
            );
          case "kv":
            return (
              <View key={key}>
                <Text style={s.kvLabel}>{block.label}</Text>
                <Text style={s.kvValue}>{block.value}</Text>
              </View>
            );
          case "photo":
            return block.src ? <Image key={key} src={block.src} style={s.photo} /> : null;
          case "entry":
            return (
              <View key={key} style={{ marginBottom: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={s.entryTitle}>{block.title}</Text>
                  {block.meta ? <Text style={s.entryMeta}>{block.meta}</Text> : null}
                </View>
                {block.subtitle ? <Text style={s.entrySub}>{block.subtitle}</Text> : null}
                {block.url ? (
                  <Link src={block.url} style={{ fontSize: 8, color: "#0f766e" }}>
                    {block.url}
                  </Link>
                ) : null}
                {block.body?.map((line, idx) => (
                  <Text key={idx} style={s.bullet}>
                    • {line}
                  </Text>
                ))}
              </View>
            );
          case "spacer":
            return <View key={key} style={{ height: block.size === "sm" ? 4 : 8 }} />;
          default: {
            const _exhaustive: never = block;
            void _exhaustive;
            return null;
          }
        }
      })}
    </>
  );
}

function PdfDocument({ ir }: { ir: LayoutIr }) {
  const sidebar = ir.templateId === "sidebar";
  const s = stylesFor(ir.themeId, sidebar);
  const page = ir.pages[0]!;
  const aside = page.columns.find((c) => c.id === "aside");
  const main = page.columns.find((c) => c.id === "main") ?? page.columns[0]!;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {aside ? (
          <View style={s.aside}>
            <PdfBlocks blocks={aside.blocks} s={s} />
          </View>
        ) : null}
        <View style={s.main}>
          <PdfBlocks blocks={main.blocks} s={s} />
        </View>
      </Page>
    </Document>
  );
}

export async function exportPdfBlob(doc: ResumeDocument): Promise<Blob> {
  const ir = documentToIr(doc);
  const instance = pdf(<PdfDocument ir={ir} />);
  return instance.toBlob();
}

export async function downloadPdf(doc: ResumeDocument, filename = "resume.pdf") {
  const blob = await exportPdfBlob(doc);
  saveAs(blob, filename);
}
