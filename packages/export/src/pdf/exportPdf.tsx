import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
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

export type PdfProgress = {
  phase: "prepare" | "capture" | "render";
  current: number;
  total: number;
  message: string;
};

export type PdfExportOptions = {
  name?: string;
  widthMm?: number;
  heightMm?: number;
  fontScale?: number;
  contentPadding?: number;
  onProgress?: (progress: PdfProgress) => void;
};

export type ThemeColorSet = {
  primary: string;
  dark: string;
  light: string;
  gradientFrom: string;
  gradientTo: string;
};

const DEFAULT_THEME: ThemeColorSet = {
  primary: "#14b8a6",
  dark: "#0f766e",
  light: "#5eead4",
  gradientFrom: "#f7fbfb",
  gradientTo: "#f0f8f9",
};

type ThemeVarMap = Partial<Record<`--theme-${string}`, string>>;

/** Pure picker used by resolveThemeColors (unit-testable without a DOM). */
export function pickThemeColors(sources: Array<ThemeVarMap | null | undefined>): ThemeColorSet {
  for (const src of sources) {
    if (!src) continue;
    const primary = src["--theme-primary"]?.trim();
    if (!primary) continue;
    return {
      primary,
      dark: src["--theme-dark"]?.trim() || DEFAULT_THEME.dark,
      light: src["--theme-light"]?.trim() || DEFAULT_THEME.light,
      gradientFrom: src["--theme-gradient-from"]?.trim() || DEFAULT_THEME.gradientFrom,
      gradientTo: src["--theme-gradient-to"]?.trim() || DEFAULT_THEME.gradientTo,
    };
  }
  return { ...DEFAULT_THEME };
}

function readThemeVars(el: Element | null | undefined): ThemeVarMap | null {
  if (!el || typeof getComputedStyle !== "function") return null;
  const cs = getComputedStyle(el);
  return {
    "--theme-primary": cs.getPropertyValue("--theme-primary"),
    "--theme-dark": cs.getPropertyValue("--theme-dark"),
    "--theme-light": cs.getPropertyValue("--theme-light"),
    "--theme-gradient-from": cs.getPropertyValue("--theme-gradient-from"),
    "--theme-gradient-to": cs.getPropertyValue("--theme-gradient-to"),
  };
}

/** Read theme tokens from the live sheet / workspace — not global :root defaults. */
export function resolveThemeColors(sheetRoot?: HTMLElement | null): ThemeColorSet {
  return pickThemeColors([
    readThemeVars(sheetRoot),
    readThemeVars(document.querySelector(".workspace-page")),
    readThemeVars(document.querySelector(".min-h-screen")),
  ]);
}

function applyThemeColors(element: HTMLElement, themeColors: ThemeColorSet) {
  const aside = element.querySelector("aside");
  if (aside) {
    (aside as HTMLElement).style.background =
      `linear-gradient(180deg, ${themeColors.gradientFrom} 0%, ${themeColors.gradientTo} 100%)`;
  }
  element.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const inline = el.getAttribute("style");
    if (!inline) return;
    const updated = inline
      .replace(/var\(--theme-primary\)/g, themeColors.primary)
      .replace(/var\(--theme-dark\)/g, themeColors.dark)
      .replace(/var\(--theme-light\)/g, themeColors.light)
      .replace(/var\(--theme-gradient-from\)/g, themeColors.gradientFrom)
      .replace(/var\(--theme-gradient-to\)/g, themeColors.gradientTo);
    if (updated !== inline) el.setAttribute("style", updated);
  });
}

function styleFullClone(
  page: HTMLElement,
  options: {
    widthMm: number;
    heightMm: number;
    fontScale: number;
    contentPadding: number;
  },
) {
  page.style.width = `${options.widthMm}mm`;
  page.style.height = "auto";
  page.style.minHeight = `${options.heightMm}mm`;
  page.style.maxHeight = "none";
  page.style.overflow = "visible";
  page.style.fontSize = `${options.fontScale}%`;
  page.style.background = "white";
  page.style.transform = "none";
  page.style.boxShadow = "none";
  page.style.position = "relative";

  const aside = page.querySelector("aside") as HTMLElement | null;
  const main = page.querySelector("main") as HTMLElement | null;
  if (aside) aside.style.padding = `${options.contentPadding}px ${options.contentPadding * 0.667}px`;
  if (main) main.style.padding = `${options.contentPadding}px`;

  const grid = page.querySelector(".sheet-grid, .grid") as HTMLElement | null;
  if (grid) {
    grid.style.minHeight = `${options.heightMm}mm`;
    grid.style.height = "auto";
  }

  page
    .querySelectorAll(".page-break-indicator, .page-number-badge, .page-band")
    .forEach((node) => node.remove());
}

/**
 * WYSIWYG PDF: capture the full sheet once, then slice into paper-sized pages.
 * Keeps sidebar + main continuous across pages (no cleared aside).
 */
export async function exportPdfFromSheet(
  sheetRoot: HTMLElement,
  options: PdfExportOptions = {},
): Promise<Blob> {
  const widthMm = options.widthMm ?? 210;
  const heightMm = options.heightMm ?? 297;
  const fontScale = options.fontScale ?? 100;
  const contentPadding = options.contentPadding ?? 48;
  const onProgress = options.onProgress;
  const themeColors = resolveThemeColors(sheetRoot);

  onProgress?.({
    phase: "prepare",
    current: 0,
    total: 1,
    message: "Preparing resume for PDF…",
  });

  await document.fonts?.ready;

  const pdfDoc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: [widthMm, heightMm],
  });

  const temp = document.createElement("div");
  temp.setAttribute("data-rb-pdf-temp", "true");
  temp.style.position = "absolute";
  temp.style.left = "-9999px";
  temp.style.top = "0";
  temp.style.pointerEvents = "none";
  document.body.appendChild(temp);

  try {
    const full = sheetRoot.cloneNode(true) as HTMLElement;
    styleFullClone(full, { widthMm, heightMm, fontScale, contentPadding });
    applyThemeColors(full, themeColors);
    temp.appendChild(full);
    await new Promise((r) => setTimeout(r, 80));

    const contentHeightPx = Math.max(full.scrollHeight, full.offsetHeight, 1);
    const pageHeightPx = full.offsetWidth * (heightMm / widthMm);
    const captureScale = contentHeightPx > pageHeightPx * 2 ? 1.5 : 2;

    onProgress?.({
      phase: "capture",
      current: 0,
      total: 1,
      message: "Capturing live preview…",
    });

    const canvas = await html2canvas(full, {
      scale: captureScale,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: full.offsetWidth,
      height: contentHeightPx,
      windowWidth: full.offsetWidth,
      windowHeight: contentHeightPx,
    });

    const sliceHeight = Math.max(1, Math.round(pageHeightPx * captureScale));
    const totalPages = Math.max(1, Math.ceil(canvas.height / sliceHeight));

    for (let i = 0; i < totalPages; i++) {
      onProgress?.({
        phase: "render",
        current: i + 1,
        total: totalPages,
        message: `Rendering page ${i + 1} of ${totalPages}…`,
      });

      const sourceY = i * sliceHeight;
      const sourceH = Math.min(sliceHeight, canvas.height - sourceY);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const ctx = slice.getContext("2d");
      if (!ctx) throw new Error("Could not create PDF page canvas");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceH, 0, 0, canvas.width, sourceH);

      if (i > 0) pdfDoc.addPage([widthMm, heightMm]);
      pdfDoc.addImage(
        slice.toDataURL("image/jpeg", 0.92),
        "JPEG",
        0,
        0,
        widthMm,
        heightMm,
        undefined,
        "FAST",
      );
    }

    full.remove();
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
              <Text key={key} style={block.level === 1 ? s.h1 : s.h2} wrap={false}>
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
              <View key={key} wrap={false}>
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
              <Text key={key} style={s.p} wrap={false}>
                {block.text} {block.muted || ""}
              </Text>
            );
          case "entry":
            return (
              <View key={key} style={{ marginBottom: 6 }} wrap={false}>
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

async function exportPdfFromIr(
  doc: ResumeDocument,
  options: PdfExportOptions = {},
): Promise<Blob> {
  const ir = documentToIr(doc);
  const s = stylesFor(ir.themeId);
  const page = ir.pages[0];
  const widthMm = options.widthMm ?? ir.paper.widthMm;
  const heightMm = options.heightMm ?? ir.paper.heightMm;
  const blocks =
    ir.templateId === "sidebar"
      ? [
          ...(page?.columns.find((c) => c.id === "main")?.blocks ?? []),
          ...(page?.columns.find((c) => c.id === "aside")?.blocks ?? []),
        ]
      : (page?.columns.flatMap((c) => c.blocks) ?? []);

  const instance = pdf(
    <Document>
      <Page size={[widthMm, heightMm]} style={s.page} wrap>
        <PdfBlocks blocks={blocks} s={s} />
      </Page>
    </Document>,
  );
  return instance.toBlob();
}

export async function exportPdfBlob(
  doc: ResumeDocument,
  sheetRoot?: HTMLElement | null,
  options: PdfExportOptions = {},
): Promise<Blob> {
  const root = sheetRoot ?? document.querySelector<HTMLElement>(".sheet");
  // Prefer live sheet capture for every template (true WYSIWYG).
  if (root) {
    try {
      return await exportPdfFromSheet(root, { name: doc.name, ...options });
    } catch (error) {
      console.warn("Sheet PDF capture failed; falling back to vector PDF", error);
      options.onProgress?.({
        phase: "render",
        current: 1,
        total: 1,
        message: "Using vector fallback…",
      });
    }
  }
  return exportPdfFromIr(doc, options);
}

export async function downloadPdf(
  doc: ResumeDocument,
  filename = "resume.pdf",
  sheetRoot?: HTMLElement | null,
  options: PdfExportOptions = {},
) {
  const blob = await exportPdfBlob(
    doc,
    sheetRoot ?? document.querySelector<HTMLElement>(".sheet"),
    options,
  );
  saveAs(blob, filename);
}
