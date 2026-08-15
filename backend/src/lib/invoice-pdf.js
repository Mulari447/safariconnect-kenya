// backend/src/lib/invoice-pdf.js
const PDFDocument = require('pdfkit');

// Builds a professional invoice/receipt PDF and returns it as a Buffer.
function generateInvoicePdf({
  invoiceNumber,
  companyName,
  contactPerson,
  county,
  planName,
  billingCycle,
  amountKes,
  method,
  paidAt,
  periodStart,
  periodEnd,
  mpesaReceipt,
}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const PAGE_W = 595.28;
    const MARGIN = 50;
    const kes = (n) =>
      `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtDate = (d) =>
      new Date(d).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const fmtDateShort = (d) =>
      new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

    // ---- Top brand bar ----
    doc.rect(0, 0, PAGE_W, 8).fill('#166534');

    // ---- Diagonal PAID ribbon (top-right corner) ----
    doc.save();
    doc.rotate(45, { origin: [520, 60] });
    doc.rect(430, 45, 180, 28).fill('#166534');
    doc.restore();
    doc.save();
    doc
      .fillColor('#ffffff')
      .fontSize(13)
      .font('Helvetica-Bold');
    doc.rotate(45, { origin: [520, 60] });
    doc.text('PAID', 470, 52, { width: 100, align: 'center' });
    doc.restore();

    // ---- Header: brand + company banking info ----
    doc
      .fillColor('#0f172a')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('SafariConnect', MARGIN, 40);
    doc
      .fillColor('#166534')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Kenya', MARGIN + 158, 40);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Kenyan Tour Operator Marketplace', MARGIN, 70)
      .text('info@safariconnect.co.ke  ·  www.safariconnect.co.ke', MARGIN, 83);

    doc.moveTo(MARGIN, 110).lineTo(PAGE_W - MARGIN, 110).strokeColor('#e2e8f0').lineWidth(1).stroke();

    // ---- Invoice meta block ----
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text(`Invoice #${invoiceNumber}`, MARGIN, 128);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`Invoice date: ${fmtDate(paidAt)}`, MARGIN, 152)
      .text(`Billing period: ${fmtDateShort(periodStart)} – ${fmtDateShort(periodEnd)}`, MARGIN, 166);

    // ---- Invoiced To ----
    let y = 200;
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#64748b')
      .text('INVOICED TO', MARGIN, y);
    y += 16;
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text(companyName, MARGIN, y);
    y += 18;
    if (contactPerson) {
      doc.fontSize(10).font('Helvetica').fillColor('#334155').text(`Attn: ${contactPerson}`, MARGIN, y);
      y += 14;
    }
    if (county) {
      doc.fontSize(10).font('Helvetica').fillColor('#334155').text(`${county}, Kenya`, MARGIN, y);
      y += 14;
    }

    // ---- Items table ----
    const tableTop = 300;
    doc.rect(MARGIN, tableTop, PAGE_W - MARGIN * 2, 26).fill('#f1f5f9');
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#475569')
      .text('DESCRIPTION', MARGIN + 12, tableTop + 8)
      .text('TOTAL', PAGE_W - MARGIN - 100, tableTop + 8, { width: 88, align: 'right' });

    const rowY = tableTop + 40;
    doc
      .fontSize(10.5)
      .font('Helvetica')
      .fillColor('#0f172a')
      .text(`${planName} plan — ${billingCycle} subscription`, MARGIN + 12, rowY, { width: 320 })
      .text(kes(amountKes), PAGE_W - MARGIN - 100, rowY, { width: 88, align: 'right' });

    const subtotalY = rowY + 40;
    doc.moveTo(MARGIN, subtotalY).lineTo(PAGE_W - MARGIN, subtotalY).strokeColor('#e2e8f0').stroke();

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Sub Total', PAGE_W - MARGIN - 220, subtotalY + 12, { width: 120, align: 'right' })
      .fillColor('#0f172a')
      .text(kes(amountKes), PAGE_W - MARGIN - 100, subtotalY + 12, { width: 88, align: 'right' });

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('VAT (0%)', PAGE_W - MARGIN - 220, subtotalY + 30, { width: 120, align: 'right' })
      .fillColor('#0f172a')
      .text('KES 0.00', PAGE_W - MARGIN - 100, subtotalY + 30, { width: 88, align: 'right' });

    const totalY = subtotalY + 54;
    doc.rect(MARGIN, totalY, PAGE_W - MARGIN * 2, 32).fill('#166534');
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('TOTAL PAID', PAGE_W - MARGIN - 220, totalY + 9, { width: 120, align: 'right' })
      .text(kes(amountKes), PAGE_W - MARGIN - 100, totalY + 9, { width: 88, align: 'right' });

    // ---- Ledger / payment reference ----
    const ledgerTop = totalY + 60;
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text('Payment details', MARGIN, ledgerTop);

    const ledgerRowTop = ledgerTop + 24;
    doc.rect(MARGIN, ledgerRowTop, PAGE_W - MARGIN * 2, 26).fill('#f1f5f9');
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#475569')
      .text('DATE', MARGIN + 12, ledgerRowTop + 8, { width: 110 })
      .text('METHOD', MARGIN + 130, ledgerRowTop + 8, { width: 130 })
      .text('REFERENCE', MARGIN + 270, ledgerRowTop + 8, { width: 150 })
      .text('AMOUNT', PAGE_W - MARGIN - 100, ledgerRowTop + 8, { width: 88, align: 'right' });

    const ledgerDataY = ledgerRowTop + 34;
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#0f172a')
      .text(fmtDateShort(paidAt), MARGIN + 12, ledgerDataY, { width: 110 })
      .text(method === 'mpesa' ? 'M-Pesa Express' : 'Card Payment', MARGIN + 130, ledgerDataY, { width: 130 })
      .text(mpesaReceipt || invoiceNumber, MARGIN + 270, ledgerDataY, { width: 150 })
      .text(kes(amountKes), PAGE_W - MARGIN - 100, ledgerDataY, { width: 88, align: 'right' });

    // ---- Footer ----
    const footerY = 750;
    doc.moveTo(MARGIN, footerY - 20).lineTo(PAGE_W - MARGIN, footerY - 20).strokeColor('#e2e8f0').stroke();
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text(
        'This is an official receipt for your SafariConnect Kenya operator subscription. Keep it for your records.',
        MARGIN,
        footerY,
        { width: PAGE_W - MARGIN * 2, align: 'center' },
      )
      .text(`PDF generated on ${fmtDate(new Date())}`, MARGIN, footerY + 12, {
        width: PAGE_W - MARGIN * 2,
        align: 'center',
      });

    doc.end();
  });
}

module.exports = { generateInvoicePdf };