import PDFDocument from 'pdfkit';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatCurrency(val) {
  const num = parseFloat(val) || 0;
  return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateMonthlyReportPdf({ user, month, year, summary, categories = [], transactions = [], categoryBreakdown = [] }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Monthly Financial Report - ${MONTH_NAMES[month]} ${year}`,
          Author: 'PocketTrack Expense Tracker',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const monthName = MONTH_NAMES[month] || `Month ${month}`;
      const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'User';

      // --- HEADER ---
      doc.rect(40, 40, 515, 60).fill('#1E293B');
      doc.fillColor('#FFFFFF')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('Expense Tracker', 55, 52);

      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#94A3B8')
        .text(`Monthly Financial Report — ${monthName} ${year}`, 55, 75);

      doc.fillColor('#64748B')
        .fontSize(9)
        .text(`Generated for: ${userName} (${user?.email || ''}) | Date: ${new Date().toISOString().split('T')[0]}`, 40, 110);

      doc.moveDown(1.5);
      let currentY = 130;

      // --- SUMMARY SECTION ---
      doc.rect(40, currentY, 515, 24).fill('#F1F5F9');
      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text('MONTHLY FINANCIAL SUMMARY', 50, currentY + 6);
      currentY += 32;

      const summaryItems = [
        { label: 'Total Income', val: summary.total_income, color: '#16A34A' },
        { label: 'Total Budget', val: summary.total_budget, color: '#2563EB' },
        { label: 'Total Expenses', val: summary.total_expenses, color: '#DC2626' },
        { label: 'Remaining Budget', val: summary.remaining_budget, color: summary.remaining_budget >= 0 ? '#16A34A' : '#DC2626' },
        { label: 'Savings', val: summary.savings, color: summary.savings >= 0 ? '#16A34A' : '#DC2626' },
      ];

      const boxWidth = 95;
      const boxGap = 10;
      summaryItems.forEach((item, idx) => {
        const x = 40 + idx * (boxWidth + boxGap);
        doc.rect(x, currentY, boxWidth, 50).fillAndStroke('#F8FAFC', '#E2E8F0');
        doc.fillColor('#64748B').font('Helvetica').fontSize(8).text(item.label, x + 5, currentY + 8, { width: boxWidth - 10, align: 'center' });
        doc.fillColor(item.color).font('Helvetica-Bold').fontSize(9).text(formatCurrency(item.val), x + 5, currentY + 26, { width: boxWidth - 10, align: 'center' });
      });

      currentY += 65;

      // --- BUDGET VS ACTUAL ---
      doc.rect(40, currentY, 515, 22).fill('#F1F5F9');
      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text('BUDGET VS ACTUAL', 50, currentY + 6);
      currentY += 28;

      // Table Header
      doc.rect(40, currentY, 515, 20).fill('#E2E8F0');
      doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8);
      doc.text('Category', 50, currentY + 6);
      doc.text('Budget Limit', 170, currentY + 6, { width: 80, align: 'right' });
      doc.text('Actual Spent', 260, currentY + 6, { width: 80, align: 'right' });
      doc.text('Remaining', 350, currentY + 6, { width: 80, align: 'right' });
      doc.text('% Used / Status', 440, currentY + 6, { width: 100, align: 'center' });
      currentY += 22;

      if (!categories || categories.length === 0) {
        doc.fillColor('#94A3B8').font('Helvetica-Oblique').fontSize(9).text('No category budgets defined for this month.', 50, currentY + 6);
        currentY += 22;
      } else {
        categories.forEach((cat, idx) => {
          if (currentY > 740) {
            doc.addPage();
            currentY = 50;
          }
          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          doc.rect(40, currentY, 515, 18).fill(bg);

          const isExceeded = cat.spent > cat.budget;
          const statusText = isExceeded ? 'EXCEEDED' : `${cat.percentage_used || 0}%`;

          doc.fillColor('#1E293B').font('Helvetica').fontSize(8).text(cat.category, 50, currentY + 5);
          doc.text(formatCurrency(cat.budget), 170, currentY + 5, { width: 80, align: 'right' });
          doc.text(formatCurrency(cat.spent), 260, currentY + 5, { width: 80, align: 'right' });
          doc.fillColor(cat.remaining >= 0 ? '#16A34A' : '#DC2626').text(formatCurrency(cat.remaining), 350, currentY + 5, { width: 80, align: 'right' });
          doc.fillColor(isExceeded ? '#DC2626' : '#2563EB').font('Helvetica-Bold').text(statusText, 440, currentY + 5, { width: 100, align: 'center' });
          currentY += 19;
        });
      }

      currentY += 12;

      // --- EXPENSE BREAKDOWN ---
      if (categoryBreakdown && categoryBreakdown.length > 0) {
        if (currentY > 680) {
          doc.addPage();
          currentY = 50;
        }

        doc.rect(40, currentY, 515, 22).fill('#F1F5F9');
        doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text('EXPENSE BREAKDOWN', 50, currentY + 6);
        currentY += 28;

        doc.rect(40, currentY, 515, 20).fill('#E2E8F0');
        doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8);
        doc.text('Category', 50, currentY + 6);
        doc.text('Total Amount', 200, currentY + 6, { width: 90, align: 'right' });
        doc.text('Share of Expenses', 310, currentY + 6, { width: 100, align: 'right' });
        doc.text('Transaction Count', 430, currentY + 6, { width: 100, align: 'center' });
        currentY += 22;

        categoryBreakdown.forEach((item, idx) => {
          if (currentY > 740) {
            doc.addPage();
            currentY = 50;
          }
          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          doc.rect(40, currentY, 515, 18).fill(bg);
          doc.fillColor('#1E293B').font('Helvetica').fontSize(8).text(item.category, 50, currentY + 5);
          doc.text(formatCurrency(item.total_amount), 200, currentY + 5, { width: 90, align: 'right' });
          doc.text(`${item.percentage}%`, 310, currentY + 5, { width: 100, align: 'right' });
          doc.text(`${item.transaction_count}`, 430, currentY + 5, { width: 100, align: 'center' });
          currentY += 19;
        });

        currentY += 12;
      }

      // --- TRANSACTIONS LIST ---
      if (currentY > 640) {
        doc.addPage();
        currentY = 50;
      }

      doc.rect(40, currentY, 515, 22).fill('#F1F5F9');
      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text(`TRANSACTIONS (${transactions.length})`, 50, currentY + 6);
      currentY += 28;

      doc.rect(40, currentY, 515, 20).fill('#E2E8F0');
      doc.fillColor('#334155').font('Helvetica-Bold').fontSize(8);
      doc.text('Date', 50, currentY + 6);
      doc.text('Description / Title', 120, currentY + 6, { width: 150 });
      doc.text('Category', 280, currentY + 6, { width: 80 });
      doc.text('Type', 370, currentY + 6, { width: 60 });
      doc.text('Amount', 440, currentY + 6, { width: 100, align: 'right' });
      currentY += 22;

      if (!transactions || transactions.length === 0) {
        doc.fillColor('#94A3B8').font('Helvetica-Oblique').fontSize(9).text('No transactions recorded for this month.', 50, currentY + 6);
        currentY += 22;
      } else {
        transactions.forEach((tx, idx) => {
          if (currentY > 740) {
            doc.addPage();
            currentY = 50;
          }
          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          doc.rect(40, currentY, 515, 18).fill(bg);

          const isIncome = tx.transaction_type === 'INCOME';
          const typeColor = isIncome ? '#16A34A' : '#DC2626';
          const dateStr = typeof tx.transaction_date === 'string' ? tx.transaction_date.split('T')[0] : '';

          doc.fillColor('#64748B').font('Helvetica').fontSize(8).text(dateStr, 50, currentY + 5);
          doc.fillColor('#1E293B').font('Helvetica').fontSize(8).text(tx.title || tx.description || '-', 120, currentY + 5, { width: 150, ellipsis: true });
          doc.text(tx.category || '-', 280, currentY + 5, { width: 80, ellipsis: true });
          doc.fillColor(typeColor).font('Helvetica-Bold').text(tx.transaction_type, 370, currentY + 5, { width: 60 });
          doc.fillColor(typeColor).font('Helvetica-Bold').text(`${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}`, 440, currentY + 5, { width: 100, align: 'right' });
          currentY += 19;
        });
      }

      // --- FOOTER ---
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fillColor('#94A3B8').font('Helvetica').fontSize(8)
          .text(`PocketTrack Expense Tracker — Confidential Report | Page ${i + 1} of ${pages.count}`, 40, 790, {
            width: 515,
            align: 'center',
          });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export default generateMonthlyReportPdf;
