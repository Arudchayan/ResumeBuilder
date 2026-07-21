import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Link,
} from "@react-pdf/renderer";
import type { ResumeDocument } from "@resume/core";
import { documentToIr, type IrBlock } from "@resume/templates";
import { themes, type ThemeId } from "@resume/ui";

/**
 * Classic sidebar PDF: capture the live `.sheet` DOM (same path as the old builder)
 * so preview and PDF match. Falls back to react-pdf for ATS/compact.
 */
export async function exportPdfFromSheet(
  sheetRoot: HTMLElement,
  options: {
    name?: string;
    widthMm?: number;
    heightMm?: number;
    fontScale?: number;
    contentPadding?: number;
  } = {},
): Promise<Blob> {
  const widthMm = options.widthMm ?? 210;
  const heightMm = options.heightMm ?? 297;
  const fontScale = options.fontScale ?? 100;
  const contentPadding = options.contentPadding ?? 48;

  const root =
    (document.querySelector(".min-h-screen") as HTMLElement | null) || document.body;
  const cs = getComputedStyle(root);
  const themeColors = {
    primary: cs.getPropertyValue("--theme-primary").trim() || "#14b8a6",
    dark: cs.getPropertyValue("--theme-dark").trim() || "#0f766e",
    light: cs.getPropertyValue("--theme-light").trim() || "#5eead4",
    gradientFrom: cs.getPropertyValue("--theme-gradient-from").trim() || "#f7fbfb",
    gradientTo: cs.getPropertyValue("--theme-gradient-to").trim() || "#f0f8f9",
  };

  await document.fonts?.ready;

  const pdfDoc = new jsPDF("p", "mm", "a4");
  const pageWidth = pdfDoc.internal.pageSize.getWidth();
  const pageHeight = pdfDoc.internal.pageSize.getHeight();
  const mmToPx = 3.7795275591;
  const pageHeightPx = pageHeight * mmToPx;

  const applyThemeColors = (element: HTMLElement) => {
    const aside = element.querySelector("aside");
    if (aside) {
      (aside as HTMLElement).style.background =
        `linear-gradient(180deg, ${themeColors.gradientFrom} 0%, ${themeColors.gradientTo} 100%)`;
    }
    element.querySelectorAll<HTMLElement>("*").forEach((el) => {
      const inline = el.getAttribute("style");
      if (!inline) return;
      let updated = inline
        .replace(/var\(--theme-primary\)/g, themeColors.primary)
        .replace(/var\(--theme-dark\)/g, themeColors.dark)
        .replace(/var\(--theme-light\)/g, themeColors.light)
        .replace(/var\(--theme-gradient-from\)/g, themeColors.gradientFrom)
        .replace(/var\(--theme-gradient-to\)/g, themeColors.gradientTo);
      if (updated !== inline) el.setAttribute("style", updated);
    });
  };

  const temp = document.createElement("div");
  temp.setAttribute("data-rb-pdf-temp", "true");
  temp.style.position = "absolute";
  temp.style.left = "-9999px";
  temp.style.top = "0";
  document.body.appendChild(temp);

  try {
    const mainContent = sheetRoot.querySelector("main");
    const captureScale =
      mainContent && mainContent.scrollHeight > pageHeightPx * 2 ? 1.5 : 2;

    const page1 = sheetRoot.cloneNode(true) as HTMLElement;
    page1.style.width = `${widthMm}mm`;
    page1.style.height = `${heightMm}mm`;
    page1.style.minHeight = `${heightMm}mm`;
    page1.style.maxHeight = `${heightMm}mm`;
    page1.style.overflow = "hidden";
    page1.style.fontSize = `${fontScale}%`;
    page1.style.background = "white";
    page1.style.transform = "none";

    const page1Aside = page1.querySelector("aside") as HTMLElement | null;
    const page1Main = page1.querySelector("main") as HTMLElement | null;
    if (page1Aside) page1Aside.style.padding = `${contentPadding}px ${contentPadding * 0.667}px`;
    if (page1Main) page1Main.style.padding = `${contentPadding}px`;
    applyThemeColors(page1);
    page1.querySelector(".page-break-indicator")?.remove();

    temp.appendChild(page1);
    await new Promise((r) => setTimeout(r, 80));

    const canvas1 = await html2canvas(page1, {
      scale: captureScale,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: page1.offsetWidth,
      height: page1.offsetHeight,
    });
    pdfDoc.addImage(canvas1.toDataURL("image/png"), "PNG", 0, 0, pageWidth, pageHeight);

    if (mainContent && mainContent.scrollHeight > pageHeightPx) {
      const remainingHeight = mainContent.scrollHeight - pageHeightPx;
      const additionalPages = Math.ceil(remainingHeight / pageHeightPx);
      for (let i = 0; i < additionalPages; i++) {
        const pageN = sheetRoot.cloneNode(true) as HTMLElement;
        pageN.style.width = `${widthMm}mm`;
        pageN.style.height = `${heightMm}mm`;
        pageN.style.minHeight = `${heightMm}mm`;
        pageN.style.maxHeight = `${heightMm}mm`;
        pageN.style.overflow = "hidden";
        pageN.style.fontSize = `${fontScale}%`;
        pageN.style.background = "white";
        pageN.style.transform = "none";

        const asideN = pageN.querySelector("aside") as HTMLElement | null;
        const mainN = pageN.querySelector("main") as HTMLElement | null;
        if (asideN) {
          asideN.innerHTML = "";
          asideN.style.padding = `${contentPadding}px ${contentPadding * 0.667}px`;
        }
        if (mainN) {
          mainN.style.padding = `${contentPadding}px`;
          mainN.style.marginTop = `-${pageHeightPx * (i + 1)}px`;
        }
        applyThemeColors(pageN);
        pageN.querySelector(".page-break-indicator")?.remove();
        temp.appendChild(pageN);
        await new Promise((r) => setTimeout(r, 80));
        const canvasN = await html2canvas(pageN, {
          scale: captureScale,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: pageN.offsetWidth,
          height: pageN.offsetHeight,
        });
        pdfDoc.addPage();
        pdfDoc.addImage(canvasN.toDataURL("image/png"), "PNG", 0, 0, pageWidth, pageHeight);
        pageN.remove();
      }
    }

    return pdfDoc.output("blob");
  } finally {
    temp.remove();
  }
}

function stylesFor(themeId: string) {
  const theme = themes[themeId as ThemeId] ?? themes.teal;
  return StyleSheet.create({
    page: { padding: 28, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
    h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 4 },
    h2: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: theme.dark,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginTop: 10,
      marginBottom: 4,
    },
    p: { fontSize: 10, lineHeight: 1.4, marginBottom: 4 },
    muted: { fontSize: 11, color: theme.dark, marginBottom: 6, fontFamily: "Helvetica-Bold" },
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
              <Text key={key} style={s.p}>
                {block.items.join(" · ")}
              </Text>
            );
          case "bullets":
            return (
              <View key={key}>
                {block.items.map((item, idx) => (
                  <Text key={idx} style={s.p}>
                    • {item}
                  </Text>
                ))}
              </View>
            );
          case "kv":
          case "link":
            return (
              <Text key={key} style={s.p}>
                {"label" in block ? `${block.label}: ` : ""}
                {"value" in block ? block.value : "href" in block ? block.href : ""}
              </Text>
            );
          case "lineItem":
            return (
              <Text key={key} style={s.p}>
                {block.text} {block.muted || ""}
              </Text>
            );
          case "entry":
            return (
              <View key={key} style={{ marginBottom: 6 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{block.title}</Text>
                {block.subtitle ? <Text style={s.p}>{block.subtitle}</Text> : null}
                {block.meta ? <Text style={s.p}>{block.meta}</Text> : null}
                {block.url ? (
                  <Link src={block.url} style={{ fontSize: 8, color: "#0f766e" }}>
                    {block.url}
                  </Link>
                ) : null}
                {block.subsections?.map((sec, idx) => (
                  <View key={idx}>
                    {sec.title ? (
                      <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>{sec.title}</Text>
                    ) : null}
                    {sec.bullets.map((line, j) => (
                      <Text key={j} style={s.p}>
                        • {line}
                      </Text>
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
          case "accentBar":
          case "photo":
          case "spacer":
            return <View key={key} style={{ height: 6 }} />;
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

async function exportPdfFromIr(doc: ResumeDocument): Promise<Blob> {
  const ir = documentToIr(doc);
  const s = stylesFor(ir.themeId);
  const blocks = ir.pages[0]?.columns.flatMap((c) => c.blocks) ?? [];
  const instance = pdf(
    <Document>
      <Page size="A4" style={s.page}>
        <PdfBlocks blocks={blocks} s={s} />
      </Page>
    </Document>,
  );
  return instance.toBlob();
}

export async function exportPdfBlob(
  doc: ResumeDocument,
  sheetRoot?: HTMLElement | null,
): Promise<Blob> {
  if (doc.template === "sidebar" && sheetRoot) {
    return exportPdfFromSheet(sheetRoot, { name: doc.name });
  }
  // Prefer live sheet whenever present (best WYSIWYG)
  if (sheetRoot?.querySelector("aside") && sheetRoot?.querySelector("main")) {
    return exportPdfFromSheet(sheetRoot, { name: doc.name });
  }
  return exportPdfFromIr(doc);
}

export async function downloadPdf(
  doc: ResumeDocument,
  filename = "resume.pdf",
  sheetRoot?: HTMLElement | null,
) {
  const blob = await exportPdfBlob(
    doc,
    sheetRoot ?? document.querySelector<HTMLElement>(".sheet"),
  );
  saveAs(blob, filename);
}
