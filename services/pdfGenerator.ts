
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget, CompanyProfile, PdfConfig, DEFAULT_LEGAL_TEXTS } from '../types';

export const generateBudgetPdf = (
  budget: Budget,
  company: CompanyProfile,
  fullConfig: PdfConfig
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  const config = fullConfig[budget.system] || fullConfig.agora;

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  };

  const primaryRgb = hexToRgb(config.primaryColor);
  const secondaryRgb = hexToRgb(config.secondaryColor);
  
  // --- COVER PAGE ---
  if (config.showCoverPage) {
      // Background split
      doc.setFillColor(secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Accents
      doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.rect(0, 0, 15, pageHeight, 'F'); // Side stripe
      
      // Logo (Centered Big)
      if (company.logo) {
          try {
              const imgProps = doc.getImageProperties(company.logo);
              const ratio = imgProps.width / imgProps.height;
              const w = 80;
              const h = w / ratio;
              doc.addImage(company.logo, 'JPEG', (pageWidth / 2) - (w / 2), 60, w, h);
          } catch(e) {}
      }

      // Title
      doc.setTextColor(50);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      const title = config.coverTitle || 'PROPUESTA COMERCIAL';
      doc.text(title, pageWidth / 2, 140, { align: 'center' });

      // Subtitle
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      const subtitle = config.coverSubtitle || '';
      doc.text(subtitle, pageWidth / 2, 150, { align: 'center' });

      // Client Box
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth / 2 - 70, 180, 140, 50, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('PREPARADO PARA:', pageWidth / 2, 195, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(budget.clientData.commercialName || 'Cliente Estimado', pageWidth / 2, 205, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(budget.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric'}), pageWidth / 2, 220, { align: 'center' });

      doc.addPage();
  }

  // --- STANDARD HEADER ---
  doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.rect(0, 0, pageWidth, 4, 'F');

  let yPos = 20;

  if (config.showLogo && company.logo) {
    try {
      const imgProps = doc.getImageProperties(company.logo);
      const ratio = imgProps.width / imgProps.height;
      const w = 40;
      const h = w / ratio;
      doc.addImage(company.logo, 'JPEG', 15, yPos, w, h);
      if (h > 20) yPos += 5;
    } catch (e) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.text(company.name, 15, yPos + 10);
    }
  } else {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.text(company.name, 15, yPos + 10);
  }

  const rightMargin = pageWidth - 15;
  doc.setFontSize(26);
  doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(config.titleText, rightMargin, 25, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº Presupuesto:`, rightMargin - 40, 35, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(budget.number, rightMargin, 35, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha:`, rightMargin - 40, 40, { align: 'right' });
  doc.setTextColor(0);
  doc.text(new Date(budget.createdAt).toLocaleDateString(), rightMargin, 40, { align: 'right' });

  yPos = 55;

  // --- INFO COLUMNS ---
  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.setFont('helvetica', 'bold');
  doc.text("EMISOR", 20, yPos + 8);
  
  doc.setTextColor(50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, 20, yPos + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text(company.address, 20, yPos + 19);
  doc.text(`CIF: ${company.cif}`, 20, yPos + 24);
  doc.text(`${company.email} • ${company.phone}`, 20, yPos + 29);

  const col2X = pageWidth / 2 + 5;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.setFont('helvetica', 'bold');
  doc.text("CLIENTE", col2X, yPos + 8);

  doc.setTextColor(50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(budget.clientData.commercialName || 'Cliente Genérico', col2X, yPos + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text(budget.clientData.legalName, col2X, yPos + 19);
  doc.text(budget.clientData.address, col2X, yPos + 24);
  doc.text(`CIF: ${budget.clientData.cif}`, col2X, yPos + 29);

  yPos += 45;

  // --- PRESENTATION TEXT (NEW) ---
  if (budget.presentationText) {
      doc.setFontSize(9);
      doc.setTextColor(60);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(budget.presentationText, pageWidth - 30);
      doc.text(splitText, 15, yPos);
      yPos += (splitText.length * 5) + 10;
  }

  // --- TABLE ---
  const tableColumn = ["Concepto", "Uds", "Precio", "Dto %", "Total"];
  if (config.showImages) tableColumn.unshift("Img");

  const tableRows = budget.lineItems.map(item => {
    if (item.type === 'section') {
      return [{ 
        content: item.description.toUpperCase(), 
        colSpan: config.showImages ? 6 : 5, 
        styles: { fontStyle: 'bold' as const, fillColor: secondaryRgb, textColor: primaryRgb, halign: 'left' as const, cellPadding: { top: 3, bottom: 3, left: 5 } } 
      }];
    }
    
    const discount = item.discount || 0;
    const finalPrice = item.price * (1 - discount / 100);
    const totalLine = item.units * finalPrice;

    // Recurrency marker
    const desc = `${item.reference ? `[${item.reference}] ` : ''}${item.description}${item.isRecurring ? ' (Recurrente)' : ''}`;

    const row: any[] = [
      { content: desc, styles: { cellWidth: 'auto' as const } },
      { content: item.units, styles: { halign: 'center' as const } },
      { content: item.price.toLocaleString('es-ES', {minimumFractionDigits: 2}) + ' €', styles: { halign: 'right' as const } },
      { content: discount > 0 ? `${discount}%` : '-', styles: { halign: 'center' as const, textColor: discount > 0 ? [220, 38, 38] : [100, 100, 100] } },
      { content: totalLine.toLocaleString('es-ES', {minimumFractionDigits: 2}) + ' €', styles: { halign: 'right' as const, fontStyle: 'bold' as const } }
    ];

    if (config.showImages) {
      row.unshift({ content: '', styles: { minCellHeight: 12 } });
    }
    return row;
  });

  autoTable(doc, {
    startY: yPos,
    head: [tableColumn],
    body: tableRows,
    theme: 'plain',
    headStyles: { fillColor: primaryRgb, textColor: 255, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 9, cellPadding: 3, valign: 'middle', lineColor: [230, 230, 230], lineWidth: { bottom: 0.1 } },
    columnStyles: config.showImages ? { 0: { cellWidth: 15 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 15 }, 3: { cellWidth: 25 }, 4: { cellWidth: 15 }, 5: { cellWidth: 25 } } 
                                    : { 0: { cellWidth: 'auto' }, 1: { cellWidth: 15 }, 2: { cellWidth: 25 }, 3: { cellWidth: 15 }, 4: { cellWidth: 25 } },
    didDrawCell: (data) => {
        if (config.showImages && data.section === 'body' && data.column.index === 0) {
            const item = budget.lineItems[data.row.index];
            if (item && item.type === 'product' && item.image) {
                try { const dim = data.cell.height - 4; doc.addImage(item.image, 'JPEG', data.cell.x + 2, data.cell.y + 2, dim, dim); } catch (e) {}
            }
        }
    },
    didParseCell: (data) => {
        if (data.section === 'body' && data.row.index % 2 === 1) {
             // @ts-ignore
             if(!data.row.cells[0].raw.colSpan) data.cell.styles.fillColor = [252, 252, 252];
        }
    }
  });

  const productItems = budget.lineItems.filter(i => i.type !== 'section');
  const subtotal = productItems.reduce((acc, item) => {
      const disc = item.discount || 0;
      const finalPrice = item.price * (1 - disc / 100);
      return acc + (item.units * finalPrice);
  }, 0);

  const discountAmount = subtotal * (budget.discountPercentage / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxableBase = Math.max(0, subtotalAfterDiscount - budget.bonusAmount);
  const taxAmount = taxableBase * (budget.taxPercentage / 100);
  const withholdingAmount = taxableBase * ((budget.withholdingTax || 0) / 100);
  const total = taxableBase + taxAmount - withholdingAmount;

  let finalY = (doc as any).lastAutoTable.finalY + 10;
  if (finalY > pageHeight - 60) { doc.addPage(); finalY = 20; }

  const totalsWidth = 70;
  const totalsX = pageWidth - totalsWidth - 15;
  
  const drawTotalLine = (label: string, value: string, isBold = false, color: [number, number, number] = [0,0,0], bg: [number, number, number] | null = null) => {
    if (bg) {
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.rect(totalsX - 2, finalY - 4, totalsWidth + 4, 7, 'F');
    }
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(label, totalsX, finalY);
    doc.text(value, pageWidth - 15, finalY, { align: 'right' });
    finalY += 7;
  };

  drawTotalLine("Subtotal (Neto)", `${subtotal.toFixed(2)} €`);
  if (budget.discountPercentage > 0) drawTotalLine(`Descuento Global (${budget.discountPercentage}%)`, `-${discountAmount.toFixed(2)} €`, false, [220, 38, 38]);
  if (budget.bonusAmount > 0) drawTotalLine("Bono / Subvención", `-${budget.bonusAmount.toFixed(2)} €`, false, [22, 163, 74]);
  drawTotalLine("Base Imponible", `${taxableBase.toFixed(2)} €`, true);
  drawTotalLine(`IVA (${budget.taxPercentage}%)`, `${taxAmount.toFixed(2)} €`);
  if (budget.withholdingTax && budget.withholdingTax > 0) drawTotalLine(`Retención IRPF (${budget.withholdingTax}%)`, `-${withholdingAmount.toFixed(2)} €`, false, [37, 99, 235]);
  finalY += 2;
  drawTotalLine("TOTAL", `${total.toFixed(2)} €`, true, [255, 255, 255], primaryRgb);

  // --- NEW: Payment Terms Table ---
  if (budget.paymentTerms && budget.paymentTerms.length > 0) {
      if (finalY > pageHeight - 40) { doc.addPage(); finalY = 20; } else { finalY += 10; }
      
      doc.setFontSize(9);
      doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.setFont('helvetica', 'bold');
      doc.text("FORMA DE PAGO / VENCIMIENTOS", 15, finalY);
      finalY += 2;

      autoTable(doc, {
          startY: finalY,
          head: [['Concepto / Hito', 'Fecha', '%', 'Importe']],
          body: budget.paymentTerms.map(t => [
              t.concept,
              t.date ? new Date(t.date).toLocaleDateString() : 'A concretar',
              `${t.percentage}%`,
              `${t.amount.toFixed(2)} €`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [240, 240, 240], textColor: 50, fontStyle: 'bold', lineWidth: 0 },
          styles: { fontSize: 8, cellPadding: 2, textColor: 80 },
          columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } }
      });
      finalY = (doc as any).lastAutoTable.finalY + 10;
  } else {
      finalY += 10;
  }

  if (config.showLegal) {
      if (finalY > pageHeight - 80) { doc.addPage(); finalY = 20; }
      doc.setFontSize(8); doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]); doc.setFont('helvetica', 'bold'); doc.text("TÉRMINOS Y CONDICIONES", 15, finalY);
      finalY += 5;
      doc.setTextColor(80); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      let legalText = company.terms + "\n";
      config.legalTextIds.forEach(id => { const t = DEFAULT_LEGAL_TEXTS.find(lt => lt.id === id); if (t) legalText += `• ${t.text}\n`; });
      if (config.customLegalTexts) config.customLegalTexts.forEach(clt => { if (clt.active) legalText += `• ${clt.text}\n`; });
      const splitLegal = doc.splitTextToSize(legalText, pageWidth - 30);
      doc.text(splitLegal, 15, finalY);
      finalY += (splitLegal.length * 3) + 10;
  } else { finalY += 20; }

  if (config.showSignatures) {
      if (finalY > pageHeight - 50) { doc.addPage(); finalY = 40; }
      const boxW = 80; const boxH = 35;
      doc.setDrawColor(200); doc.setLineWidth(0.1);
      doc.rect(15, finalY, boxW, boxH);
      doc.setFontSize(7); doc.setTextColor(150); doc.text("Firma y Sello de la Empresa", 17, finalY + 4);
      const clientBoxX = pageWidth - 15 - boxW;
      doc.rect(clientBoxX, finalY, boxW, boxH);
      doc.text("Aceptación del Cliente", clientBoxX + 2, finalY + 4);
      if (budget.clientSignature) { try { doc.addImage(budget.clientSignature, 'PNG', clientBoxX + 10, finalY + 5, boxW - 20, boxH - 10); } catch(e) {} }
  }

  const footerY = pageHeight - 15;
  const logoH = 10;
  const activeLogos = Object.values(config.partnerLogos).filter(l => !!l && l.length > 0);
  if (activeLogos.length > 0) {
      const gap = 5; const w = 20;
      let startX = (pageWidth - (activeLogos.length * w) - ((activeLogos.length - 1) * gap)) / 2;
      activeLogos.forEach(logo => { if (logo) { try { doc.addImage(logo, 'PNG', startX, footerY - 5, w, logoH, undefined, 'FAST'); startX += w + gap; } catch (e) {} } });
  }
  if (config.footerText) { doc.setFontSize(7); doc.setTextColor(150); doc.text(config.footerText, pageWidth / 2, pageHeight - 20, { align: 'center' }); }
  if (config.showPageNumbers) {
      const pageCount = doc.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) { doc.setPage(i); doc.setFontSize(7); doc.setTextColor(180); doc.text(`Página ${i} de ${pageCount}`, pageWidth - 10, pageHeight - 5, { align: 'right' }); }
  }
  return doc;
};
