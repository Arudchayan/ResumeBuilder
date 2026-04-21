import { useState, useCallback } from "react";
import { exportToPDF } from "../utils/exportPdf";
import { exportToDocx } from "../utils/exportDocx";

/**
 * @param {object} opts
 * @param {object} opts.statePresent
 * @param {string} opts.paperSize
 * @param {number} opts.fontSize
 * @param {number} opts.contentPadding
 * @param {import('react').RefObject<HTMLElement | null>} opts.sheetRef
 */
export function useResumeExport({
  statePresent,
  paperSize,
  fontSize,
  contentPadding,
  sheetRef,
}) {
  const [exporting, setExporting] = useState(null);

  const handlePrintPDF = useCallback(async () => {
    setExporting("pdf");
    try {
      await exportToPDF(
        statePresent,
        paperSize,
        fontSize,
        contentPadding,
        sheetRef?.current ?? null
      );
    } catch {
      /* errors are surfaced via toast inside exportToPDF; swallow so finally always runs */
    } finally {
      setExporting(null);
    }
  }, [statePresent, paperSize, fontSize, contentPadding, sheetRef]);

  const handleExportDocx = useCallback(async () => {
    setExporting("docx");
    try {
      await exportToDocx(statePresent);
    } catch {
      /* errors surfaced inside exportToDocx */
    } finally {
      setExporting(null);
    }
  }, [statePresent]);

  return { exporting, handlePrintPDF, handleExportDocx };
}
