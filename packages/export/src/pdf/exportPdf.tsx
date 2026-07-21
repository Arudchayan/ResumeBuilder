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
    h1: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#0f172a", marginBottom: 2 },
    headline: { fontSize: 11, fontFamily: "Helvetica-Bold", color: theme.dark, marginBottom: 6 },
    accent: {
      width: 48,
      height: 4,
      backgroundColor: theme.primary,
      borderRadius: 2,
      marginBottom: 10,
      marginTop: 4,
    },
    h2: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: theme.dark,
      textTransform: "uppercase",
      letterSpacing: 1.4,
      marginTop: 10,
      marginBottom: 4,
    },
    p: { fontSize: 10, lineHeight: 1.45, marginBottom: 4, color: "#1e293b" },
    kvLabel: { fontSize: 8, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.6 },
    kvValue: { fontSize: 9, color: "#1e293b", marginBottom: 6 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
    chip: {
      fontSize: 8,
      borderWidth: 1,
      borderColor: "#e2e8f0",
      backgroundColor: "#f8fafc",
      color: "#1e293b",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 10,
      marginRight: 4,
      marginBottom: 4,
    },
    entryTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" },
    entrySub: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#64748b" },
    entryMeta: { fontSize: 8, color: "#64748b", marginBottom: 2 },
    subTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 4 },
    bulletRow: { flexDirection: "row", marginBottom: 2 },
    bulletDot: { width: 10, fontSize: 10, color: theme.dark },
    bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.35, color: "#1e293b" },
    lineItem: { fontSize: 9.5, marginBottom: 2 },
    photo: { width: 72, height: 72, borderRadius: 36, marginBottom: 12, objectFit: "cover", alignSelf: "center" },
    link: { fontSize: 9, color: theme.primary, marginBottom: 4 },
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
          case "accentBar":
            return <View key={key} style={s.accent} />;
          case "paragraph":
            return (
              <Text key={key} style={block.muted ? s.headline : s.p}>
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
                  <View key={idx} style={s.bulletRow}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          case "kv":
            return (
              <View key={key}>
                <Text style={s.kvLabel}>{block.label}</Text>
                {block.href ? (
                  <Link src={block.href} style={s.link}>
                    {block.value}
                  </Link>
                ) : (
                  <Text style={s.kvValue}>{block.value}</Text>
                )}
              </View>
            );
          case "link":
            return (
              <Link key={key} src={block.href} style={s.link}>
                {block.label}
              </Link>
            );
          case "photo":
            return block.src ? <Image key={key} src={block.src} style={s.photo} /> : null;
          case "lineItem":
            return (
              <Text key={key} style={s.lineItem}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{block.text}</Text>
                {block.muted ? <Text style={{ color: "#64748b" }}> {block.muted}</Text> : null}
              </Text>
            );
          case "entry":
            return (
              <View key={key} style={{ marginBottom: 8 }}>
                <Text style={s.entryTitle}>{block.title}</Text>
                {block.subtitle ? <Text style={s.entrySub}>{block.subtitle}</Text> : null}
                {block.meta ? <Text style={s.entryMeta}>{block.meta}</Text> : null}
                {block.url ? (
                  <Link src={block.url} style={s.link}>
                    {block.url}
                  </Link>
                ) : null}
                {block.subsections?.map((sec, idx) => (
                  <View key={idx}>
                    {sec.title ? <Text style={s.subTitle}>{sec.title}</Text> : null}
                    {sec.bullets.map((line, j) => (
                      <View key={j} style={s.bulletRow}>
                        <Text style={s.bulletDot}>•</Text>
                        <Text style={s.bulletText}>{line}</Text>
                      </View>
                    ))}
                  </View>
                ))}
                {block.body?.map((line, idx) => (
                  <Text key={idx} style={s.p}>
                    {line}
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
