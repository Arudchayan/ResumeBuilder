import { Fragment } from "react";
import { PAPER_PRESETS } from "./paper.js";

/**
 * Overlay dashed A4 page boundaries on the live sheet so authors can see
 * where the printout will split before printing.
 */
export function PageBreakGuides({
  pages,
  pageHeightMm = PAPER_PRESETS.a4.heightMm,
  pageWidthMm = PAPER_PRESETS.a4.widthMm,
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
      {edges.map((pageNumber) => {
        const isLast = pageNumber === safePages;
        return (
          <Fragment key={pageNumber}>
            <div
              className={`page-band ${pageNumber % 2 === 0 ? "is-alt" : ""}`}
              data-page-band={pageNumber}
              style={{
                top: `${(pageNumber - 1) * pageHeightMm}mm`,
                height: `${pageHeightMm}mm`,
                width: `${pageWidthMm}mm`,
              }}
              aria-hidden="true"
            />
            <div
              className="page-break-indicator"
              data-page-edge={pageNumber}
              style={{ top: `${pageNumber * pageHeightMm}mm` }}
              aria-hidden="true"
            >
              <span className="page-break-label">
                {safePages === 1
                  ? `Page ends (${pageHeightMm} mm)`
                  : isLast
                    ? `Page ${pageNumber} ends · PDF bottom`
                    : `Page ${pageNumber} ends · page ${pageNumber + 1} starts`}
              </span>
            </div>
            <div
              className="page-number-badge"
              style={{ top: `calc(${(pageNumber - 1) * pageHeightMm}mm + 8px)` }}
              aria-hidden="true"
            >
              {pageNumber}/{safePages}
            </div>
          </Fragment>
        );
      })}
    </>
  );
}
