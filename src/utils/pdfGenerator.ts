import { jsPDF } from 'jspdf';
import type { AuditReport } from '../types';

export function exportAuditToPDF(report: AuditReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2); // 170mm
  let y = 20;

  // Helper: check page boundaries and add page
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 25) {
      doc.addPage();
      y = 20;
      drawFooter();
    }
  };

  // Helper: Draw running footer
  const drawFooter = () => {
    const totalPages = doc.internal.pages.length - 1;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    
    // Bottom border line
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.text(
      `Aegis Consulting Audit (Report ID: ${report.reportId})`,
      margin,
      pageHeight - 10
    );
    doc.text(
      `Page ${totalPages}`,
      pageWidth - margin - 15,
      pageHeight - 10
    );
  };

  // Helper: Draw section header with left accent bar
  const drawSectionHeader = (title: string) => {
    checkPageBreak(15);
    
    // Draw accent indicator
    doc.setFillColor(79, 70, 229); // Indigo accent
    doc.rect(margin, y, 4, 6, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(title.toUpperCase(), margin + 8, y + 4.5);
    
    y += 10;
  };

  // --- COVER BANNER ---
  doc.setFillColor(15, 23, 42); // slate-900 (Deep Midnight Blue)
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Decorative Accent bar in banner
  doc.setFillColor(79, 70, 229); // Indigo accent
  doc.rect(0, 48, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BUSINESS AUTOMATION CONSULTING REPORT', margin, 18);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`REPORT ID: ${report.reportId}`, margin, 26);
  doc.text(`DATE GENERATED: ${new Date(report.timestamp).toLocaleDateString()}`, margin, 31);
  doc.text(`CLIENT COMPANY: ${report.inputs.companyName.toUpperCase()}`, margin, 36);

  y = 62;
  drawFooter();

  // --- 1. WORKFLOW CONTEXT ---
  drawSectionHeader('Workflow Context');

  // Metadata Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(71, 85, 105); // slate-600
  
  doc.text('Target Role:', margin + 6, y + 8);
  doc.text('Department:', margin + 6, y + 16);
  doc.text('Industry:', margin + 6, y + 24);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(report.inputs.employeeRole, margin + 36, y + 8);
  doc.text(report.inputs.department, margin + 36, y + 16);
  doc.text(report.inputs.industry, margin + 36, y + 24);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Hours spent/wk:', margin + 96, y + 8);
  doc.text('Headcount:', margin + 96, y + 16);
  doc.text('Frequency:', margin + 96, y + 24);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.inputs.hoursSpentPerWeek} hours`, margin + 128, y + 8);
  doc.text(`${report.inputs.numberOfEmployees} employee(s)`, margin + 128, y + 16);
  doc.text(report.inputs.taskFrequency, margin + 128, y + 24);

  y += 40;

  // --- 2. EXECUTIVE SUMMARY CALLOUT ---
  checkPageBreak(35);
  doc.setFillColor(243, 244, 246); // gray-100
  doc.rect(margin, y, contentWidth, 24, 'F');
  
  // Indigo border line on the left side
  doc.setFillColor(79, 70, 229);
  doc.rect(margin, y, 2.5, 24, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Executive Summary Statement', margin + 6, y + 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const summaryLines = doc.splitTextToSize(report.executiveSummary, contentWidth - 12);
  doc.text(summaryLines, margin + 6, y + 12);

  y += 32;

  // --- 3. POTENTIAL & PRIORITY CARDS ---
  checkPageBreak(35);
  const colCardWidth = (contentWidth - 6) / 2;

  // Opportunity Card (Soft emerald background)
  doc.setFillColor(240, 253, 250); // teal-50
  doc.setDrawColor(204, 251, 241); // teal-100
  doc.roundedRect(margin, y, colCardWidth, 28, 2, 2, 'FD');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 148, 136); // teal-600
  doc.text('AUTOMATION POTENTIAL', margin + 6, y + 6);
  doc.setFontSize(14);
  doc.text(report.automationOpportunity, margin + 6, y + 15);
  doc.setFontSize(7.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const oppTextLines = doc.splitTextToSize(report.automationOpportunityExplanation, colCardWidth - 12);
  doc.text(oppTextLines, margin + 6, y + 20);

  // Priority Card (Soft indigo background)
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(224, 231, 255); // indigo-100
  doc.roundedRect(margin + colCardWidth + 6, y, colCardWidth, 28, 2, 2, 'FD');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text('CONSULTING PRIORITY', margin + colCardWidth + 12, y + 6);
  doc.setFontSize(14);
  doc.text(report.priority, margin + colCardWidth + 12, y + 15);
  doc.setFontSize(7.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const priTextLines = doc.splitTextToSize(report.priorityExplanation, colCardWidth - 12);
  doc.text(priTextLines, margin + colCardWidth + 12, y + 20);

  y += 38;

  // --- 4. WHY IMPROVE & STRATEGY ---
  checkPageBreak(40);
  drawSectionHeader('Strategic Assessment');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Why Automate This Process:', margin, y);
  
  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  report.whyImprove.forEach(item => {
    checkPageBreak(6);
    doc.text(`[Yes] ${item}`, margin + 4, y);
    y += 5.5;
  });

  y += 4;
  checkPageBreak(25);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Recommended Automation Approaches:', margin, y);
  
  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  report.recommendedStrategy.forEach(item => {
    checkPageBreak(8);
    const splitStrategy = doc.splitTextToSize(`• ${item}`, contentWidth - 6);
    doc.text(splitStrategy, margin + 4, y);
    y += splitStrategy.length * 4.5 + 1.5;
  });

  y += 6;

  // --- 5. WORKFLOWS COMPARISON ---
  checkPageBreak(50);
  drawSectionHeader('Process Transformation');

  const halfWidth = (contentWidth - 6) / 2;

  // Column Headers
  doc.setFillColor(254, 242, 242); // red-50
  doc.roundedRect(margin, y, halfWidth, 7, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(239, 68, 68); // red-500
  doc.text('CURRENT MANUAL WORKFLOW', margin + 4, y + 4.5);

  doc.setFillColor(240, 253, 250); // teal-50
  doc.roundedRect(margin + halfWidth + 6, y, halfWidth, 7, 1.5, 1.5, 'F');
  doc.setTextColor(13, 148, 136); // teal-600
  doc.text('SUGGESTED AUTOMATED WORKFLOW', margin + halfWidth + 10, y + 4.5);

  y += 11;

  const maxSteps = Math.max(report.currentManualWorkflow.length, report.suggestedAutomatedWorkflow.length);
  let stepY = y;

  for (let i = 0; i < maxSteps; i++) {
    const manualStep = report.currentManualWorkflow[i] || '';
    const autoStep = report.suggestedAutomatedWorkflow[i] || '';
    let maxLineHeight = stepY;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    // Left Column Box
    if (manualStep) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 226, 226);
      
      const manualLines = doc.splitTextToSize(`${i + 1}. ${manualStep}`, halfWidth - 8);
      const boxHeight = manualLines.length * 4 + 6;
      doc.roundedRect(margin, stepY, halfWidth, boxHeight, 1, 1, 'FD');
      doc.text(manualLines, margin + 4, stepY + 4.5);
      maxLineHeight = Math.max(maxLineHeight, stepY + boxHeight);
    }

    // Right Column Box
    if (autoStep) {
      doc.setFillColor(240, 253, 250);
      doc.setDrawColor(204, 251, 241);

      const autoLines = doc.splitTextToSize(`${i + 1}. ${autoStep}`, halfWidth - 8);
      const boxHeight = autoLines.length * 4 + 6;
      doc.roundedRect(margin + halfWidth + 6, stepY, halfWidth, boxHeight, 1, 1, 'FD');
      doc.text(autoLines, margin + halfWidth + 10, stepY + 4.5);
      maxLineHeight = Math.max(maxLineHeight, stepY + boxHeight);
    }

    stepY = maxLineHeight + 4;
    checkPageBreak(25);
  }

  y = stepY + 6;

  // --- 6. FINANCIAL SAVINGS TABLE ---
  checkPageBreak(45);
  drawSectionHeader('Estimated Impact & Financial Return');

  doc.setFillColor(15, 23, 42); // Deep slate-900 header
  doc.rect(margin, y, contentWidth, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.text('TIME PERIOD', margin + 6, y + 5.5);
  doc.text('HOURS RECLAIMED', margin + 60, y + 5.5);
  
  const showMoney = report.inputs.hourlyLaborCost !== undefined && report.inputs.hourlyLaborCost > 0;
  if (showMoney) {
    doc.text('ESTIMATED LABOR VALUE RETRIEVED (INR)', margin + 110, y + 5.5);
  }
  
  y += 8;

  const rows = [
    { period: 'Weekly Savings', hours: `${report.estimatedTimeSaved.weeklyHoursSaved} hrs`, value: report.estimatedTimeSaved.weeklyCostSavings },
    { period: 'Monthly Savings', hours: `${report.estimatedTimeSaved.monthlyHoursSaved} hrs`, value: report.estimatedTimeSaved.monthlyCostSavings },
    { period: 'Annual Reclaimed Value', hours: `${report.estimatedTimeSaved.yearlyHoursSaved} hrs`, value: report.estimatedTimeSaved.yearlyCostSavings }
  ];

  rows.forEach((row, idx) => {
    // Alternating zebra backgrounds
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.rect(margin, y, contentWidth, 8, 'F');

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(row.period, margin + 6, y + 5.5);
    doc.text(row.hours, margin + 60, y + 5.5);

    if (showMoney) {
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(row.value !== undefined ? `Rs. ${row.value.toLocaleString('en-IN')}` : 'N/A', margin + 110, y + 5.5);
    }

    y += 8;
  });

  y += 6;

  // --- 7. ROADMAP ---
  checkPageBreak(50);
  drawSectionHeader('3-Step Deployment Roadmap');

  report.threeStepRoadmap.forEach((step) => {
    checkPageBreak(22);
    
    // Draw step rounded timeline block
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, 'FD');

    // Colored badge
    doc.setFillColor(79, 70, 229); // Indigo
    doc.roundedRect(margin + 4, y + 4, 12, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`0${step.step}`, margin + 8, y + 9.5);

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(step.title, margin + 20, y + 9.5);

    // Description
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const descLines = doc.splitTextToSize(step.description, contentWidth - 28);
    doc.text(descLines, margin + 20, y + 13.5);

    y += 19;
  });

  y += 4;

  // Disclaimer Section
  checkPageBreak(20);
  doc.setFont('Helvetica', 'oblique');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const disclaimerLines = doc.splitTextToSize(report.disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, y);

  // Generate output file
  doc.save(`Aegis_Consulting_Audit_${report.reportId}.pdf`);
}
