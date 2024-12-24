import { jsPDF } from "jspdf";
import "jspdf-autotable"; // side-effect import
import { NotoSansJP } from "./NotoSansJP";
import { ScheduleRow } from "./tableDataUtils";

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
  scheduleData: ScheduleRow[],
  monthYear: string,
) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Set default font to NotoSansJP
  doc.setFont("NotoSansJP", "normal");
  doc.setFontSize(10);

  // Adjust margins
  const marginLeft = 28; // 2.8 cm
  const marginTop = 40; // 4 cm

  // Split schedule data into separate groups (e.g., one group per table)
  const groupedData = splitScheduleData(scheduleData);

  groupedData.forEach((group, index) => {
    if (index > 0) {
      doc.addPage(); // Add a new page for each group after the first
    }

    // Add the title with adjusted top margin
    doc.text(formatMonthYear(monthYear), marginLeft, marginTop); // Call the function correctly
    doc.text("出勤簿", 105, marginTop, { align: "center" });

    // Table headers (English and Japanese)
    const tableHeaders = [
      [
        "Date",
        "Day",
        "Starting Time",
        "Finishing Time",
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

    // Format group data (leave dates as plain numbers)
    const tableData = group.map((row) => [
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
    });
  });

  // Save the PDF
  doc.save(`${schoolName}_${monthYear}.pdf`);
};

/**
 * Function to split schedule data into groups based on the number of rows
 * @param scheduleData - Array of schedule rows
 * @returns Array of grouped rows for each table
 */
const splitScheduleData = (scheduleData: ScheduleRow[]): ScheduleRow[][] => {
  const groups: ScheduleRow[][] = [];
  const daysInMonth = scheduleData.length; // Assume scheduleData contains rows for the whole month

  for (let i = 0; i < daysInMonth; i += 31) {
    groups.push(scheduleData.slice(i, i + 31)); // Use a large enough value to include all days in a month
  }

  return groups;
};

/**
 * Helper function to format the monthYear string
 * @param monthYear - The month and year in "YYYY-MM" format
 * @returns Formatted string in "YYYY年MM月度" format
 */
const formatMonthYear = (monthYear: string): string => {
  const [year, month] = monthYear.split("-");
  return `${year}年${parseInt(month, 10)}月度`;
};
