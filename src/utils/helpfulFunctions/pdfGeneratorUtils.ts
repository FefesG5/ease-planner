import { jsPDF } from "jspdf";
import "jspdf-autotable"; // side-effect import
import { NotoSansJP } from "./NotoSansJP";

// Extend TypeScript definition for jsPDF to include the autoTable method
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Set up the `NotoSansJP` font
jsPDF.API.events.push([
  "addFonts",
  function (this: jsPDF) {
    this.addFileToVFS("NotoSansJP-Regular.ttf", NotoSansJP);
    this.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "normal");
  },
]);

/**
 * Generate PDF for school schedules.
 */
export const generateSchedulePDF = (
  schoolName: string,
  scheduleData: any[],
  monthYear: string,
) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Set default font to NotoSansJP
  doc.setFont("NotoSansJP", "normal");
  doc.setFontSize(10);

  // Adjust margins
  const marginLeft = 28; // 2.8 cm
  const marginTop = 40; // 4 cm

  // Add the title with adjusted top margin
  doc.text(`${monthYear}`, marginLeft, marginTop);
  doc.text("出勤簿", 105, marginTop, { align: "center" });

  // Table headers (English and Japanese)
  const tableHeaders = [
    [
      "Date",
      "Day",
      "Start Time",
      "End Time",
      "Break Time",
      "Working Hours",
      "Lesson Hours",
      "Non-Lesson Hours",
      "Approval",
    ],
    [
      "日付",
      "曜日",
      "出社時間",
      "退社時間",
      "休憩時間",
      "労働時間",
      "レッスン時間",
      "レッスン外時間",
      "承認",
    ],
  ];

  // Format schedule data (leave dates as plain numbers)
  const tableData = scheduleData.map((row) => [
    row.Date, // Use plain date
    row.Day,
    row.StartTime,
    row.EndTime,
    row.BreakTime,
    row.WorkingHours,
    row.LessonHours,
    row.NonLessonHours,
    row.Approval,
  ]);

  // Generate the table
  doc.autoTable({
    head: tableHeaders,
    body: tableData,
    startY: marginTop + 10, // Adjust table start based on top margin
    styles: {
      fontSize: 7,
      valign: "middle",
      halign: "center",
      font: "NotoSansJP", // Apply the default font
      lineWidth: 0.2, // Border line width
    },
    headStyles: {
      fontSize: 8,
      fontStyle: "bold",
      font: "NotoSansJP",
      fillColor: [255, 255, 255], // Remove background color (white)
      textColor: 0, // Black text
      lineWidth: 0.2, // Border line width
    },
    theme: "grid", // Plain grid without additional colors
    didDrawPage: (data: any) => {
      const pageHeight = doc.internal.pageSize.height;
      const footerY = pageHeight - 10;
      doc.setFontSize(8);
      doc.text(
        `Page ${doc.getNumberOfPages()}`,
        marginLeft,
        footerY
      );
    },
  });

  // Save the PDF
  doc.save(`${schoolName}_${monthYear}.pdf`);
};
