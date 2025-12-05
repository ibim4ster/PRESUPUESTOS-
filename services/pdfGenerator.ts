

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget, CompanyProfile, PdfTemplate, DEFAULT_LEGAL_TEXTS } from '../types';

export const generateBudgetPdf = (
  budget: Budget,
  company: CompanyProfile,
  template: PdfTemplate
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // --- UTILS ---
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  const primaryRgb = hexToRgb(template.primaryColor);
  const secondaryRgb = hexToRgb(template.secondaryColor);
  const textRgb = hexToRgb(template.textColor);

  const setFont = (type: 'bold' | 'normal' | 'italic' = 'normal', size = 10, color = textRgb) => {
      doc.setFont(template.font, type);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
  };

  const margin = template.margins;

  // --- HEADER ---
  let yPos = margin;

  if (template.layout === 'modern') {
      // Top Color Bar
      doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.rect(0, 0, pageWidth, 4, 'F');
      yPos += 10;
  }

  // Logo & Title
  if (template.showLogo && company.logo) {
      try {
          const imgProps = doc.getImageProperties(company.logo);
          const ratio = imgProps.width / imgProps.height;
          const w = 40;
          const h = w / ratio;
          doc.addImage(company.logo, 'JPEG', margin, yPos, w, h);
          // If classic, logo center? No, let's keep left for now or based on config
      } catch (e) {}
  } else {
      setFont('bold', 22, primaryRgb);
      doc.text(company.name, margin, yPos + 10);
  }

  // Document Title (Right Aligned)
  setFont('bold', 24, primaryRgb);
  doc.text(template.titleText, pageWidth - margin, yPos + 10, { align: 'right' });

  setFont('normal', 10, [100, 100, 100]);
  doc.text(`Nº: ${budget.number}`, pageWidth - margin, yPos + 20, { align: 'right' });
  doc.text(`Fecha: ${new Date(budget.createdAt).toLocaleDateString()}`, pageWidth - margin, yPos + 25, { align: 'right' });

  yPos = template.headerHeight + 20;

  // --- INFO COLUMNS ---
  if (template.layout === 'modern' || template.layout === 'minimal') {
      // Draw Background for Info if modern
      if(template.layout === 'modern') {
        doc.setFillColor(secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);
        doc.roundedRect(margin, yPos, pageWidth - (margin*2), 35, 2, 2, 'F');
      }

      // Column 1: Issuer (Company)
      if (template.showCompanyDetails) {
          setFont('bold', 8, [150, 150, 150]);
          doc.text("EMISOR", margin + 5, yPos + 8);
          
          setFont('bold', 10, textRgb);
          doc.text(company.name, margin + 5, yPos + 14);
          setFont('normal', 9, [80, 80, 80]);
          doc.text(company.address, margin + 5, yPos + 19);
          doc.text(`CIF: ${company.cif}`, margin + 5, yPos + 24);
          doc.text(`${company.email} • ${company.phone}`, margin + 5, yPos + 29);
      }

      // Column 2: Client
      if (template.showClientDetails) {
          const col2X = pageWidth / 2 + 5;
          setFont('bold', 8, [150, 150, 150]);
          doc.text("CLIENTE", col2X, yPos + 8);

          setFont('bold', 10, textRgb);
          doc.text(budget.clientData.commercialName || 'Cliente Genérico', col2X, yPos + 14);
          setFont('normal', 9, [80, 80, 80]);
          doc.text(budget.clientData.legalName, col2X, yPos + 19);
          doc.text(budget.clientData.address, col2X, yPos + 24);
          doc.text(`CIF: ${budget.clientData.cif}`, col2X, yPos + 29);
      }
      yPos += 45;
  } else {
      // Classic Layout: Line separated
      doc.setDrawColor(200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
      
      setFont('bold', 11, textRgb);
      doc.text("De:", margin, yPos);
      doc.text("Para:", pageWidth / 2, yPos);
      
      setFont('normal', 10, [80, 80, 80]);
      yPos += 5;
      doc.text(company.name, margin, yPos);
      doc.text(budget.clientData.commercialName, pageWidth / 2, yPos);
      yPos += 5;
      doc.text(company.address, margin, yPos);
      doc.text(budget.clientData.address, pageWidth / 2, yPos);
      yPos += 5;
      doc.text(`CIF: ${company.cif}`, margin, yPos);
      doc.text(`CIF: ${budget.clientData.cif}`, pageWidth / 2, yPos);
      
      yPos += 20;
  }

  // --- TABLE ---
  const tableColumn = ["Concepto", "Uds", "Precio", "Total"];
  if (template.showImages) tableColumn.unshift("Img");

  const tableRows = budget.lineItems.map(item => {
    // Section Header Row
    if (item.type === 'section') {
      return [{ 
        content: item.description.toUpperCase(), 
        colSpan: template.showImages ? 5 : 4, 
        styles: { 
          fontStyle: 'bold' as const, 
          fillColor: template.layout === 'minimal' ? [255,255,255] : secondaryRgb, 
          textColor: primaryRgb,
          halign: 'left' as const
        } 
      }];
    }
    
    const row: any[] = [
      { content: `${item.reference ? `[${item.reference}] ` : ''}${item.description}`, styles: { cellWidth: 'auto' as const } },
      { content: item.units, styles: { halign: 'center' as const } },
      { content: item.price.toLocaleString('es-ES', {minimumFractionDigits: 2}) + ' €', styles: { halign: 'right' as const } },
      { content: (item.units * item.price).toLocaleString('es-ES', {minimumFractionDigits: 2}) + ' €', styles: { halign: 'right' as const, fontStyle: 'bold' as const } }
    ];

    if (template.showImages) {
      row.unshift({ content: '', styles: { minCellHeight: 12 } }); 
    }
    return row;
  });

  autoTable(doc, {
    startY: yPos,
    head: [tableColumn],
    body: tableRows,
    theme: template.layout === 'minimal' ? 'plain' : 'striped',
    headStyles: { 
        fillColor: template.layout === 'minimal' ? [255,255,255] : primaryRgb, 
        textColor: template.layout === 'minimal' ? textRgb : 255, 
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: { bottom: template.layout === 'minimal' ? 0.5 : 0 },
        lineColor: textRgb
    },
    styles: { 
        font: template.font,
        fontSize: 9, 
        cellPadding: 3, 
        valign: 'middle',
        textColor: textRgb
    },
    columnStyles: template.showImages ? {
      0: { cellWidth: 15 }, 
      1: { cellWidth: 'auto' }, 
      2: { cellWidth: 20 }, 
      3: { cellWidth: 30 }, 
      4: { cellWidth: 30 } 
    } : {
      0: { cellWidth: 'auto' }, 
      1: { cellWidth: 20 }, 
      2: { cellWidth: 30 }, 
      3: { cellWidth: 30 } 
    },
    didDrawCell: (data) => {
        if (template.showImages && data.section === 'body' && data.column.index === 0) {
            const item = budget.lineItems[data.row.index];
            if (item && item.type === 'product' && item.image) {
                try {
                     const dim = data.cell.height - 4;
                     doc.addImage(item.image, 'JPEG', data.cell.x + 2, data.cell.y + 2, dim, dim);
                } catch (e) {}
            }
        }
    }
  });

  // --- TOTALS ---
  const productItems = budget.lineItems.filter(i => i.type !== 'section');
  const subtotal = productItems.reduce((acc, item) => acc + (item.units * item.price), 0);
  const discountAmount = subtotal * (budget.discountPercentage / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxableBase = Math.max(0, subtotalAfterDiscount - budget.bonusAmount);
  const taxAmount = taxableBase * (budget.taxPercentage / 100);
  const total = taxableBase + taxAmount;

  let finalY = (doc as any).lastAutoTable.finalY + 10;
  if (finalY > pageHeight - 60) { doc.addPage(); finalY = 20; }

  const totalsWidth = 70;
  const totalsX = pageWidth - totalsWidth - margin;
  
  const drawTotalLine = (label: string, value: string, isBold = false, color = textRgb, bg: [number, number, number] | null = null) => {
    if (bg) {
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.rect(totalsX - 2, finalY - 4, totalsWidth + 4, 7, 'F');
    }
    setFont(isBold ? 'bold' : 'normal', 10, color);
    doc.text(label, totalsX, finalY);
    doc.text(value, pageWidth - margin, finalY, { align: 'right' });
    finalY += 7;
  };

  drawTotalLine("Subtotal", `${subtotal.toFixed(2)} €`);
  if (budget.discountPercentage > 0) drawTotalLine(`Descuento (${budget.discountPercentage}%)`, `-${discountAmount.toFixed(2)} €`, false, [220, 38, 38]);
  if (budget.bonusAmount > 0) drawTotalLine("Bono / Subvención", `-${budget.bonusAmount.toFixed(2)} €`, false, [22, 163, 74]);
  drawTotalLine("Base Imponible", `${taxableBase.toFixed(2)} €`, true);
  drawTotalLine(`IVA (${budget.taxPercentage}%)`, `${taxAmount.toFixed(2)} €`);
  
  finalY += 2;
  drawTotalLine("TOTAL", `${total.toFixed(2)} €`, true, template.layout === 'minimal' ? textRgb : [255, 255, 255], template.layout === 'minimal' ? null : primaryRgb);

  // --- LEGAL & TERMS ---
  if (template.showLegal) {
      if (finalY > pageHeight - 80) { doc.addPage(); finalY = 20; } else { finalY += 10; }
      
      setFont('bold', 8, primaryRgb);
      doc.text("TÉRMINOS Y CONDICIONES", margin, finalY);
      finalY += 5;

      setFont('normal', 7, [80, 80, 80]);
      let legalText = company.terms + "\n";
      DEFAULT_LEGAL_TEXTS.forEach(t => legalText += `• ${t.text}\n`);
      const splitLegal = doc.splitTextToSize(legalText, pageWidth - (margin * 2));
      doc.text(splitLegal, margin, finalY);
      finalY += (splitLegal.length * 3) + 10;
  } else {
      finalY += 20;
  }

  // --- SIGNATURES ---
  if (template.showSignatures) {
      if (finalY > pageHeight - 50) { doc.addPage(); finalY = 40; }
      const boxW = 80;
      const boxH = 35;
      
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      
      // Company
      doc.rect(margin, finalY, boxW, boxH);
      setFont('normal', 7, [150, 150, 150]);
      doc.text("Firma y Sello de la Empresa", margin + 2, finalY + 4);

      // Client
      const clientBoxX = pageWidth - margin - boxW;
      doc.rect(clientBoxX, finalY, boxW, boxH);
      doc.text("Aceptación del Cliente", clientBoxX + 2, finalY + 4);

      if (budget.clientSignature) {
          try { doc.addImage(budget.clientSignature, 'PNG', clientBoxX + 10, finalY + 5, boxW - 20, boxH - 10); } catch(e) {}
      }
  }

  // --- FOOTER ---
  const footerY = pageHeight - 15;
  if (template.footerText) {
      setFont('normal', 8, [150, 150, 150]);
      doc.text(template.footerText, pageWidth / 2, footerY, { align: 'center' });
  }

  if (template.showPageNumbers) {
      const pageCount = doc.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        setFont('normal', 7, [180, 180, 180]);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
      }
  }

  return doc;
};