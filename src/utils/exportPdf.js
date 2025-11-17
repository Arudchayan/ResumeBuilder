import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export async function exportToPDF(state, paperSize, fontSize, contentPadding) {
  try {
    toast.info("Generating PDF...");
    
    const originalSheet = document.querySelector(".sheet");
    if (!originalSheet) throw new Error("Could not find .sheet element");

    // Paper size dimensions
    const paperSizes = {
      a4: { width: 210, height: 297 },
      letter: { width: 215.9, height: 279.4 },
      legal: { width: 215.9, height: 355.6 }
    };
    
    const currentPaper = paperSizes[paperSize] || paperSizes.a4;

    // Capture theme colors from CSS variables
    const rootElement = document.querySelector('.min-h-screen') || document.body;
    const computedStyle = getComputedStyle(rootElement);
    const themeColors = {
      primary: computedStyle.getPropertyValue('--theme-primary').trim() || '#14b8a6',
      dark: computedStyle.getPropertyValue('--theme-dark').trim() || '#0f766e',
      light: computedStyle.getPropertyValue('--theme-light').trim() || '#5eead4',
      gradientFrom: computedStyle.getPropertyValue('--theme-gradient-from').trim() || '#f7fbfb',
      gradientTo: computedStyle.getPropertyValue('--theme-gradient-to').trim() || '#f0f8f9',
    };

    // Hide page break indicator
    const pageBreakIndicator = document.querySelector(".page-break-indicator");
    if (pageBreakIndicator) {
      pageBreakIndicator.style.display = 'none';
    }

    await document.fonts?.ready;
    
    // Get paper dimensions
    const pdfFormat = paperSize === 'a4' ? 'a4' : 
                      paperSize === 'letter' ? [215.9, 279.4] : 
                      [215.9, 355.6];
    
    const pdf = new jsPDF("p", "mm", pdfFormat);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Convert mm to pixels (96 DPI standard)
    const mmToPx = 3.7795275591;
    const pageHeightPx = pageHeight * mmToPx;

    // Helper function to apply theme colors to cloned element
    const applyThemeColors = (element) => {
      if (!element) return;
      
      // Apply gradient background to sidebar
      const aside = element.querySelector('aside');
      if (aside) {
        aside.style.background = `linear-gradient(180deg, ${themeColors.gradientFrom} 0%, ${themeColors.gradientTo} 100%)`;
      }
      
      // Get all elements and replace CSS variables in inline styles
      const allElements = element.querySelectorAll('*');
      allElements.forEach(el => {
        const inlineStyle = el.getAttribute('style');
        if (!inlineStyle) return;
        
        // Replace CSS variables in inline styles
        let updatedStyle = inlineStyle;
        
        // Replace color: var(--theme-primary)
        if (updatedStyle.includes("var(--theme-primary)")) {
          updatedStyle = updatedStyle.replace(/color:\s*var\(--theme-primary\)/g, `color: ${themeColors.primary}`);
        }
        
        // Replace color: var(--theme-dark)
        if (updatedStyle.includes("var(--theme-dark)")) {
          updatedStyle = updatedStyle.replace(/color:\s*var\(--theme-dark\)/g, `color: ${themeColors.dark}`);
        }
        
        // Replace color: var(--theme-light)
        if (updatedStyle.includes("var(--theme-light)")) {
          updatedStyle = updatedStyle.replace(/color:\s*var\(--theme-light\)/g, `color: ${themeColors.light}`);
        }
        
        // Replace background-color: var(--theme-primary)
        if (updatedStyle.includes("background-color: var(--theme-primary)")) {
          updatedStyle = updatedStyle.replace(/background-color:\s*var\(--theme-primary\)/g, `background-color: ${themeColors.primary}`);
        }
        
        // Replace backgroundColor: var(--theme-primary) (React style)
        if (updatedStyle.includes("backgroundColor") && updatedStyle.includes("var(--theme-primary)")) {
          // For React inline styles
          el.style.backgroundColor = themeColors.primary;
        }
        
        // Apply the updated style
        if (updatedStyle !== inlineStyle) {
          el.setAttribute('style', updatedStyle);
        }
      });
    };

    // Clone the original sheet for manipulation
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    document.body.appendChild(tempContainer);

    // Create page 1 (with sidebar and content)
    const page1 = originalSheet.cloneNode(true);
    page1.style.width = `${currentPaper.width}mm`;
    page1.style.height = `${currentPaper.height}mm`;
    page1.style.minHeight = `${currentPaper.height}mm`;
    page1.style.maxHeight = `${currentPaper.height}mm`;
    page1.style.overflow = 'hidden';
    page1.style.fontSize = `${fontSize}%`;
    page1.style.background = 'white';
    
    // Apply padding to cloned elements
    const page1Aside = page1.querySelector('aside');
    const page1Main = page1.querySelector('main');
    if (page1Aside) page1Aside.style.padding = `${contentPadding}px ${contentPadding * 0.667}px`;
    if (page1Main) page1Main.style.padding = `${contentPadding}px`;
    
    // Apply theme colors to page 1
    applyThemeColors(page1);
    
    // Remove page break indicator from clone
    const clonedIndicator = page1.querySelector('.page-break-indicator');
    if (clonedIndicator) clonedIndicator.remove();
    
    tempContainer.appendChild(page1);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Capture page 1
    const canvas1 = await html2canvas(page1, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: page1.offsetWidth,
      height: page1.offsetHeight
    });

    // Add page 1 to PDF
    const imgData1 = canvas1.toDataURL("image/png");
    pdf.addImage(imgData1, "PNG", 0, 0, pageWidth, pageHeight);

    // Check if we need page 2+ by measuring main content height
    const mainContent = originalSheet.querySelector('main');
    if (mainContent && mainContent.scrollHeight > pageHeightPx) {
      // Calculate how many additional pages needed
      const remainingHeight = mainContent.scrollHeight - pageHeightPx;
      const additionalPages = Math.ceil(remainingHeight / pageHeightPx);

      for (let i = 0; i < additionalPages; i++) {
        // Clone the ENTIRE sheet structure to maintain exact layout
        const pageN = originalSheet.cloneNode(true);
        pageN.style.width = `${currentPaper.width}mm`;
        pageN.style.height = `${currentPaper.height}mm`;
        pageN.style.minHeight = `${currentPaper.height}mm`;
        pageN.style.maxHeight = `${currentPaper.height}mm`;
        pageN.style.overflow = 'hidden';
        pageN.style.fontSize = `${fontSize}%`;
        pageN.style.background = 'white';

        // Get aside and main from the cloned page
        const pageNAside = pageN.querySelector('aside');
        const pageNMain = pageN.querySelector('main');
        
        // Empty the sidebar but keep it to maintain layout/margins
        if (pageNAside) {
          pageNAside.innerHTML = '';
          pageNAside.style.padding = `${contentPadding}px ${contentPadding * 0.667}px`;
        }
        
        // Shift main content up to show next portion
        if (pageNMain) {
          pageNMain.style.padding = `${contentPadding}px`;
          pageNMain.style.marginTop = `-${pageHeightPx * (i + 1)}px`;
        }
        
        // Apply theme colors to page N
        applyThemeColors(pageN);
        
        // Remove page break indicator
        const pageNIndicator = pageN.querySelector('.page-break-indicator');
        if (pageNIndicator) pageNIndicator.remove();

        tempContainer.appendChild(pageN);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture page N
        const canvasN = await html2canvas(pageN, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: pageN.offsetWidth,
          height: pageN.offsetHeight
        });

        // Add to PDF
        pdf.addPage();
        const imgDataN = canvasN.toDataURL("image/png");
        pdf.addImage(imgDataN, "PNG", 0, 0, pageWidth, pageHeight);

        pageN.remove();
      }
    }

    // Cleanup
    tempContainer.remove();
    
    // Show page break indicator again
    if (pageBreakIndicator) {
      pageBreakIndicator.style.display = '';
    }

    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const base = (state.name || 'resume').toString().trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\-]/g, '');
    const filename = `${base || 'resume'}-Resume-${dateStr}.pdf`;
    pdf.save(filename);
    
    const paperName = currentPaper.width === 210 ? 'A4' : 
                     currentPaper.width === 215.9 && currentPaper.height < 300 ? 'Letter' : 'Legal';
    toast.success(`PDF exported successfully (${paperName})!`);
    
    return true;
  } catch (err) {
    console.error("PDF export failed", err);
    toast.error("PDF export failed: " + (err?.message || err));
    
    // Cleanup on error
    const tempContainer = document.querySelector('div[style*="-9999px"]');
    if (tempContainer) tempContainer.remove();
    
    const pageBreakIndicator = document.querySelector(".page-break-indicator");
    if (pageBreakIndicator) {
      pageBreakIndicator.style.display = '';
    }
    
    return false;
  }
}
