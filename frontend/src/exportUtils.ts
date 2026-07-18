import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { LogEntry, Profile } from './types';

// Format date helper
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const exportToPDF = (logs: LogEntry[], profile: Profile) => {
  const doc = new jsPDF();
  
  // Header section
  doc.setFontSize(20);
  doc.setTextColor('#7a0016');
  doc.text('Daily Time Record', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor('#333333');
  doc.text(`Name: ${profile.name || 'N/A'}`, 14, 32);
  doc.text(`Student ID: ${profile.studentId || 'N/A'}`, 14, 38);
  doc.text(`Program: ${profile.program || 'N/A'}`, 14, 44);
  
  doc.text(`Host Company: ${profile.company || 'N/A'}`, 120, 32);
  doc.text(`Supervisor: ${profile.supervisor || 'N/A'}`, 120, 38);
  doc.text(`Target Hours: ${profile.targetHours || 0} hrs`, 120, 44);

  // Table Data
  const tableColumn = ["Date", "Start Time", "End Time", "Hours", "Tasks / Description"];
  const tableRows: string[][] = [];

  // Sort logs oldest to newest for the timesheet
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalHours = 0;

  sortedLogs.forEach(log => {
    totalHours += log.hours;
    const logData = [
      formatDate(log.date),
      log.startTime || '',
      log.endTime || '',
      log.hours.toFixed(2),
      log.tasks || 'No task description provided'
    ];
    tableRows.push(logData);
  });

  // Add total row
  tableRows.push(['', '', 'TOTAL:', totalHours.toFixed(2), '']);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 55,
    theme: 'grid',
    headStyles: { fillColor: [122, 0, 22] }, // #7a0016
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 30 }, // Date
      1: { cellWidth: 25 }, // Start Time
      2: { cellWidth: 25 }, // End Time
      3: { cellWidth: 20 }, // Hours
      4: { cellWidth: 'auto' }, // Tasks
    },
    didDrawPage: (data) => {
      // Footer
      const str = 'Page ' + doc.internal.pages.length;
      doc.setFontSize(8);
      doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
    }
  });

  doc.save(`${profile.name || 'Student'}_OJT_Timesheet.pdf`);
};

export const exportToExcel = (logs: LogEntry[], profile: Profile) => {
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const excelData = sortedLogs.map(log => ({
    Date: formatDate(log.date),
    'Start Time': log.startTime || '',
    'End Time': log.endTime || '',
    'Hours': log.hours,
    'Tasks / Description': log.tasks || ''
  }));

  const totalHours = excelData.reduce((sum, log) => sum + Number(log.Hours), 0);
  excelData.push({
    Date: '',
    'Start Time': '',
    'End Time': 'TOTAL:',
    'Hours': totalHours,
    'Tasks / Description': ''
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Date
    { wch: 12 }, // Start Time
    { wch: 12 }, // End Time
    { wch: 10 }, // Hours
    { wch: 50 }, // Tasks
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet");

  XLSX.writeFile(workbook, `${profile.name || 'Student'}_OJT_Timesheet.xlsx`);
};
