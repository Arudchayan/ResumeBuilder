import { A4_PAPER } from "./paper.js";

/**
 * Overlay dashed A4 page boundaries on the live sheet so authors can see
 * where the PDF will split before exporting.
 */
export function PageBreakGuides({
  pages,
  pageHeightMm = A4_PAPER.heightMm,
  pageWidthMm = A4_PAPER.widthMm,
  visible = true,
}: {
  pages: number;
  pageHeightMm?: number;
  pageWidthMm?: number;
  visible?: boolean;
}) {
  if (!visible) return null;
  const safePages = Math.max(1, pages);
  // Always draw the first page edge; add further edges for multi-page resumes.
  const edges = Array.from({ length: safePages }, (_, index) => index + 1);

  return (
    <>
      {edges.map((pageNumber) => (
        <div
          key={`band-${pageNumber}`}
          className={`page-band ${pageNumber % 2 === 0 ? "is-alt" : ""}`}
          data-page-band={pageNumber}
          style={{
            top: `${(pageNumber - 1) * pageHeightMm}mm`,
            height: `${pageHeightMm}mm`,
            width: `${pageWidthMm}mm`,
          }}
          aria-hidden="true"
        />
      ))}
      {edges.map((pageNumber) => {
        const isLast = pageNumber === safePages;
        const label =
          safePages === 1
            ? `A4 page ends (${pageHeightMm} mm)`
            : isLast
              ? `Page ${pageNumber} ends · PDF bottom`
              : `Page ${pageNumber} ends · page ${pageNumber + 1} starts`;
        return (
          <div
            key={pageNumber}
            className="page-break-indicator"
            data-page-edge={pageNumber}
            style={{ top: `${pageNumber * pageHeightMm}mm` }}
            aria-hidden="true"
          >
            <span className="page-break-label">{label}</span>
          </div>
        );
      })}
      {Array.from({ length: safePages }, (_, index) => (
        <div
          key={`badge-${index + 1}`}
          className="page-number-badge"
          style={{ top: `calc(${index * pageHeightMm}mm + 8px)` }}
          aria-hidden="true"
        >
          {index + 1}/{safePages}
        </div>
      ))}
    </>
  );
}
