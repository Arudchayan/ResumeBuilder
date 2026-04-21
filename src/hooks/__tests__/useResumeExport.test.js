import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResumeExport } from "../useResumeExport.js";

vi.mock("../../utils/exportPdf.js", () => ({
  exportToPDF: vi.fn(() => Promise.reject(new Error("mock pdf fail"))),
}));

vi.mock("../../utils/exportDocx.js", () => ({
  exportToDocx: vi.fn(() => Promise.reject(new Error("mock docx fail"))),
}));

describe("useResumeExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears exporting in finally when PDF export rejects", async () => {
    const sheetRef = { current: document.createElement("div") };
    const { result } = renderHook(() =>
      useResumeExport({
        statePresent: { name: "Test" },
        paperSize: "a4",
        fontSize: 100,
        contentPadding: 48,
        sheetRef,
      })
    );

    expect(result.current.exporting).toBe(null);
    await act(async () => {
      await result.current.handlePrintPDF();
    });
    expect(result.current.exporting).toBe(null);
  });

  it("clears exporting in finally when DOCX export rejects", async () => {
    const sheetRef = { current: document.createElement("div") };
    const { result } = renderHook(() =>
      useResumeExport({
        statePresent: { name: "Test" },
        paperSize: "a4",
        fontSize: 100,
        contentPadding: 48,
        sheetRef,
      })
    );

    await act(async () => {
      await result.current.handleExportDocx();
    });
    expect(result.current.exporting).toBe(null);
  });
});
