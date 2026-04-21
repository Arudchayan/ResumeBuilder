import { describe, it, expect, vi, beforeEach } from "vitest";

const { toDataURLMock, addImageMock, saveMock, addPageMock } = vi.hoisted(() => ({
  toDataURLMock: vi.fn(() => "data:image/png;base64,xx"),
  addImageMock: vi.fn(),
  saveMock: vi.fn(),
  addPageMock: vi.fn(),
}));

vi.mock("jspdf", () => ({
  default: vi.fn().mockImplementation(function MockJsPDF() {
    this.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } };
    this.addImage = addImageMock;
    this.addPage = addPageMock;
    this.save = saveMock;
  }),
}));

vi.mock("html2canvas", () => ({
  default: vi.fn().mockResolvedValue({ toDataURL: toDataURLMock, offsetWidth: 100, offsetHeight: 200 }),
}));

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { exportToPDF } from "../exportPdf.js";

describe("exportToPDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    const sheet = document.createElement("div");
    sheet.className = "sheet";
    const main = document.createElement("main");
    main.style.height = "400px";
    sheet.appendChild(main);
    document.body.appendChild(sheet);
  });

  it("uses provided sheet root and completes jsPDF pipeline", async () => {
    const sheet = document.querySelector(".sheet");
    const state = { name: "Jane Doe" };
    const ok = await exportToPDF(state, "a4", 100, 48, sheet);
    expect(ok).toBe(true);
    expect(html2canvas).toHaveBeenCalled();
    expect(jsPDF).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalled();
  });
});
