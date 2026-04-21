import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { logger } from "./logger";
import { getPaperPreset } from "../constants/paper.js";

export async function exportToPDF(state, paperSize, fontSize, contentPadding, sheetRoot = null) {
  let tempContainer = null;
  let pageBreakIndicator = null;
  let pageBreakIndicatorPrevDisplay = "";

  try {
    toast.info("Generating PDF...");

    const originalSheet = sheetRoot ?? document.querySelector(".sheet");
    if (!originalSheet) throw new Error("Could not find resume sheet element for PDF export");

    const currentPaper = getPaperPreset(paperSize);

    pageBreakIndicator = originalSheet.querySelector(".page-break-indicator");
    if (pageBreakIndicator) {
      pageBreakIndicatorPrevDisplay = pageBreakIndicator.style.display;
      pageBreakIndicator.style.display = "none";
    }

    const rootElement = document.querySelector(".min-h-screen") || document.body;
    const computedStyle = getComputedStyle(rootElement);
    const themeColors = {
      primary: computedStyle.getPropertyValue("--theme-primary").trim() || "#14b8a6",
      dark: computedStyle.getPropertyValue("--theme-dark").trim() || "#0f766e",
      light: computedStyle.getPropertyValue("--theme-light").trim() || "#5eead4",
      gradientFrom: computedStyle.getPropertyValue("--theme-gradient-from").trim() || "#f7fbfb",
      gradientTo: computedStyle.getPropertyValue("--theme-gradient-to").trim() || "#f0f8f9",
    };

    await document.fonts?.ready;

    const pdfFormat = currentPaper.jsPdfFormat;
    const pdf = new jsPDF("p", "mm", pdfFormat);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const mmToPx = 3.7795275591;
    const pageHeightPx = pageHeight * mmToPx;

    const applyThemeColors = (element) => {
      if (!element) return;

      const aside = element.querySelector("aside");
      if (aside) {
        aside.style.background = `linear-gradient(180deg, ${themeColors.gradientFrom} 0%, ${themeColors.gradientTo} 100%)`;
      }

      const allElements = element.querySelectorAll("*");
      allElements.forEach((el) => {
        const inlineStyle = el.getAttribute("style");
        if (!inlineStyle) return;

        let updatedStyle = inlineStyle;

        if (updatedStyle.includes("var(--theme-primary)")) {
          updatedStyle = updatedStyle.replace(/color:\s*var\(--theme-primary\)/g, `color: ${themeColors.primary}`);
        }

        if (updatedStyle.includes("var(--theme-dark)")) {
          updatedStyle = updatedStyle.replace(/color:\s*var\(--theme-dark\)/g, `color: ${themeColors.dark}`);
        }

        if (updatedStyle.includes("var(--theme-light)")) {
          updatedStyle = updatedStyle.replace(/color:\s*var\(--theme-light\)/g, `color: ${themeColors.light}`);
        }

        if (updatedStyle.includes("background-color: var(--theme-primary)")) {
          updatedStyle = updatedStyle.replace(
            /background-color:\s*var\(--theme-primary\)/g,
            `background-color: ${themeColors.primary}`
          );
        }

        if (updatedStyle.includes("backgroundColor") && updatedStyle.includes("var(--theme-primary)")) {
          el.style.backgroundColor = themeColors.primary;
        }

        if (updatedStyle !== inlineStyle) {
          el.setAttribute("style", updatedStyle);
        }
      });
    };

    tempContainer = document.createElement("div");
    tempContainer.setAttribute("data-rb-pdf-temp", "true");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    document.body.appendChild(tempContainer);

    try {
      const mainContent = originalSheet.querySelector("main");
      const captureScale =
        mainContent && mainContent.scrollHeight > pageHeightPx * 2 ? 1.5 : 2;

      const page1 = originalSheet.cloneNode(true);
      page1.style.width = `${currentPaper.widthMm}mm`;
      page1.style.height = `${currentPaper.heightMm}mm`;
      page1.style.minHeight = `${currentPaper.heightMm}mm`;
      page1.style.maxHeight = `${currentPaper.heightMm}mm`;
      page1.style.overflow = "hidden";
      page1.style.fontSize = `${fontSize}%`;
      page1.style.background = "white";

      const page1Aside = page1.querySelector("aside");
      const page1Main = page1.querySelector("main");
      if (page1Aside) page1Aside.style.padding = `${contentPadding}px ${contentPadding * 0.667}px`;
      if (page1Main) page1Main.style.padding = `${contentPadding}px`;

      applyThemeColors(page1);

      const clonedIndicator = page1.querySelector(".page-break-indicator");
      if (clonedIndicator) clonedIndicator.remove();

      tempContainer.appendChild(page1);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas1 = await html2canvas(page1, {
        scale: captureScale,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: page1.offsetWidth,
        height: page1.offsetHeight,
      });

      const imgData1 = canvas1.toDataURL("image/png");
      pdf.addImage(imgData1, "PNG", 0, 0, pageWidth, pageHeight);

      if (mainContent && mainContent.scrollHeight > pageHeightPx) {
        const remainingHeight = mainContent.scrollHeight - pageHeightPx;
        const additionalPages = Math.ceil(remainingHeight / pageHeightPx);

        for (let i = 0; i < additionalPages; i++) {
          const pageN = originalSheet.cloneNode(true);
          pageN.style.width = `${currentPaper.widthMm}mm`;
          pageN.style.height = `${currentPaper.heightMm}mm`;
          pageN.style.minHeight = `${currentPaper.heightMm}mm`;
          pageN.style.maxHeight = `${currentPaper.heightMm}mm`;
          pageN.style.overflow = "hidden";
          pageN.style.fontSize = `${fontSize}%`;
          pageN.style.background = "white";

          const pageNAside = pageN.querySelector("aside");
          const pageNMain = pageN.querySelector("main");

          if (pageNAside) {
            pageNAside.innerHTML = "";
            pageNAside.style.padding = `${contentPadding}px ${contentPadding * 0.667}px`;
          }

          if (pageNMain) {
            pageNMain.style.padding = `${contentPadding}px`;
            pageNMain.style.marginTop = `-${pageHeightPx * (i + 1)}px`;
          }

          applyThemeColors(pageN);

          const pageNIndicator = pageN.querySelector(".page-break-indicator");
          if (pageNIndicator) pageNIndicator.remove();

          tempContainer.appendChild(pageN);
          await new Promise((resolve) => setTimeout(resolve, 100));

          const canvasN = await html2canvas(pageN, {
            scale: captureScale,
            useCORS: true,
            backgroundColor: "#ffffff",
            width: pageN.offsetWidth,
            height: pageN.offsetHeight,
          });

          pdf.addPage();
          const imgDataN = canvasN.toDataURL("image/png");
          pdf.addImage(imgDataN, "PNG", 0, 0, pageWidth, pageHeight);

          pageN.remove();
        }
      }
    } finally {
      if (tempContainer?.parentNode) {
        tempContainer.remove();
      }
      tempContainer = null;
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const base = (state.name || "resume")
      .toString()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^A-Za-z0-9_-]/g, "");
    const filename = `${base || "resume"}-Resume-${dateStr}.pdf`;
    pdf.save(filename);

    toast.success(`PDF exported successfully (${currentPaper.name})!`);

    return true;
  } catch (err) {
    logger.error("PDF export failed", err);
    toast.error("PDF export failed: " + (err?.message || err));
    return false;
  } finally {
    if (pageBreakIndicator) {
      pageBreakIndicator.style.display = pageBreakIndicatorPrevDisplay;
    }
  }
}
