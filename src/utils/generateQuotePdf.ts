import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface QuoteItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface QuoteMetadata {
  customerName?: string;
  storeName?: string;
  logoDataUrl?: string; // base64 data URL for embedding a logo
}

// Generates a styled, downloadable PDF quotation. Returns true when saved.
export async function generateQuotePdf(items: QuoteItem[], metadata?: QuoteMetadata) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Safe defaults
  const storeName = metadata?.storeName || 'MiTienditaCRM';
  const title = 'COTIZACIÓN';

  // Helper: load an image URL into a PNG data URL using an offscreen canvas
  const loadImageAsDataUrl = (url: string): Promise<string> => new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas not supported'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          // export as PNG to ensure jsPDF compatibility
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        } catch (_err) {
          reject(_err as Error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image: ' + url));
      img.src = url;
    } catch (_err) {
      reject(_err as Error);
    }
  });

  // Draw a simple colored header band
  const headerHeight = 70;
  doc.setFillColor(16, 95, 170); // brand blue
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // Optional logo (left) - try provided dataUrl or attempt to fetch a default logo path
  try {
    let logoData = metadata?.logoDataUrl;
    if (!logoData) {
      // try common workspace logo path used by the app
      const candidate = '/assets/icons/workspaces/logo-1.webp';
      // only try fetch in browser environments
      if (typeof window !== 'undefined') {
        try {
          // convert to PNG dataURL for jsPDF
          logoData = await loadImageAsDataUrl(candidate).catch(() => undefined);
        } catch (e) {
          // ignore
          logoData = undefined;
        }
      }
    }

    if (logoData) {
      // Keep logo max height 48 and maintain aspect ratio by letting jsPDF scale
      doc.addImage(logoData, 'PNG', margin, 12, 48, 48);
    }
  } catch (_err) {
    // ignore image embedding errors
  }

  // Header text (right side)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(storeName, pageWidth - margin, 28, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString(), pageWidth - margin, 46, { align: 'right' });

  // Title
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, headerHeight + 36, { align: 'center' });

  // Project info / short professional message under the title
  const leftColX = margin;
  let cursorY = headerHeight + 60;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('----------------------------------------------', leftColX, cursorY, { maxWidth: pageWidth - margin * 2 });
  cursorY += 16;

  // A professional, friendly message so the page doesn't look empty
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const niceMsg = 'Gracias por solicitar esta cotización. Esta propuesta es válida por 7 días. Para consultas o ajustes en la cotización, contáctanos y con gusto te ayudamos.';
  const niceLines = doc.splitTextToSize(niceMsg, pageWidth - margin * 2);
  doc.text(niceLines, leftColX, cursorY);
  cursorY += niceLines.length * 12 + 8;

  // Optional customer
  if (metadata?.customerName) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 33, 33);
    doc.text('Cliente:', leftColX, cursorY);
    doc.setFont('helvetica', 'normal');
    doc.text(String(metadata.customerName), leftColX + 50, cursorY);
    cursorY += 18;
  }

  // Reserve space then draw table
  const tableStartY = cursorY + 6;

  // Prepare table body - coerce price/quantity to numbers to avoid runtime errors when values are strings
  const tableBody = items.map((it) => {
    const priceNum = typeof it.price === 'number' ? it.price : Number(String(it.price).replace(/[^0-9.-]+/g, ''));
    const qtyNum = typeof it.quantity === 'number' ? it.quantity : Number(String(it.quantity)) || 0;
    const unit = Number.isFinite(priceNum) ? priceNum : 0;
    const total = unit * (Number.isFinite(qtyNum) ? qtyNum : 0);
    return [String(it.name), String(qtyNum), `Q ${unit.toFixed(2)}`, `Q ${total.toFixed(2)}`];
  });

  try {
    // Add autoTable with a clean, modern style
    (autoTable as any)(doc, {
      startY: tableStartY,
      head: [['Producto', 'Cantidad', 'Precio unitario', 'Total']],
      body: tableBody,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [16, 95, 170], textColor: 255, halign: 'center' },
      columnStyles: {
        1: { halign: 'center', cellWidth: 60 },
        2: { halign: 'right', cellWidth: 90 },
        3: { halign: 'right', cellWidth: 90 }
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data: any) => {
        // footer on every page. Use autoTable-provided page number to avoid calling
        // potentially unavailable jsPDF helpers that can throw at runtime.
        const page = (data && data.pageNumber) || 1;
        const pageCount = doc.getNumberOfPages();
        const footerY = pageHeight - 30;
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`${storeName} • Cotización`, margin, footerY);
        doc.text(`Página ${page} / ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
      }
    });
  } catch (_err) {
    // If autoTable fails, still attempt to render plain text fallback inside PDF
    let y = tableStartY;
    doc.setFontSize(10);
    tableBody.forEach((row) => {
      doc.text(row.join('  -  '), margin, y);
      y += 14;
      if (y > pageHeight - margin - 60) {
        doc.addPage();
        y = margin;
      }
    });
  }

  // Calculate total and print at the bottom of the last page (coerce values safely)
  const subtotal = items.reduce((s, it) => {
    const priceNum = typeof it.price === 'number' ? it.price : Number(String(it.price).replace(/[^0-9.-]+/g, ''));
    const qtyNum = typeof it.quantity === 'number' ? it.quantity : Number(String(it.quantity)) || 0;
    const unit = Number.isFinite(priceNum) ? priceNum : 0;
    return s + unit * (Number.isFinite(qtyNum) ? qtyNum : 0);
  }, 0);
  const finalPage = doc.getNumberOfPages();
  doc.setPage(finalPage);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: Q ${subtotal.toFixed(2)}`, pageWidth - margin, pageHeight - 70, { align: 'right' });

  // Save file
  const fileName = `cotizacion_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
  // Try to save the PDF; if that fails (some environments block doc.save),
  // fallback to creating a blob and triggering a download via an anchor.
  try {
    doc.save(fileName);
    return true;
  } catch (err) {
    console.warn('doc.save failed, trying blob download fallback', err);
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      // In case this util is used in a non-browser env, guard DOM usage
      if (typeof document !== 'undefined') {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return true;
      }
      // if no document, rethrow
      throw err;
    } catch (err2) {
      console.error('Error saving PDF with blob fallback:', err2);
      throw err2;
    }
  }
}

export default generateQuotePdf;
