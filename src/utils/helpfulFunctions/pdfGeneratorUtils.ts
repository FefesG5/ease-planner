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
    doc.text(formatMonthYear(monthYear), marginLeft, marginTop);
    doc.text("出勤簿", 105, marginTop, { align: "center" });

    // Add the additional section below the header
    addHeaderSection(doc, marginTop + 2);

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
      startY: marginTop + 30, // Adjust table start based on added section
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

const addHeaderSection = (
  doc: jsPDF,
  startY: number,
  teacherName: string = "",
) => {
  // Define dimensions and positions for each box
  const box1 = {
    x: 15, // Starting x-coordinate for "所属"
    y: startY, // Starting y-coordinate
    width: 10, // Width of the box for "所属"
    height: 14, // Height of the box
    text: {
      content: "所属",
    },
  };

  const box2 = {
    x: box1.x + box1.width, // Start immediately after box1
    y: startY,
    width: 70, // Width of the box for "TryAngle Kids 南草津校"
    height: 14, // Height of the box
    text: {
      content: "TryAngle Kids 南草津校",
    },
  };

  const stackedBox = {
    x: box2.x + box2.width, // Start immediately to the right of box2
    y: startY, // Same starting y-coordinate as box2
    width: 15, // Width of the stacked boxes
    height: 14, // Total height of the stacked boxes
    box1Text: "Name", // Text for the first stacked box
    box2Text: "氏名", // Text for the second stacked box
  };

  const nameArea = {
    x: stackedBox.x + stackedBox.width, // Start immediately to the right of stackedBox
    y: startY, // Same starting y-coordinate
    width: 50, // Width of the name area
    height: 14, // Height of the name area
    text: teacherName, // Teacher's name or blank
  };

  // Helper function to center text inside a box
  const getTextOffsetsCenter = (
    text: string,
    boxWidth: number,
    boxHeight: number,
    fontSize: number,
  ) => {
    const textWidth = doc.getTextWidth(text);
    const xOffset = (boxWidth - textWidth) / 2; // Center horizontally
    const yOffset = (boxHeight + fontSize / 2.5) / 2; // Center vertically (approximation)
    return { xOffset, yOffset };
  };

  // Helper function to left-align text inside a box
  const getTextOffsetsLeft = (boxHeight: number, fontSize: number) => {
    const xOffset = 2; // Fixed left margin for text alignment
    const yOffset = (boxHeight + fontSize / 2.5) / 2; // Center vertically
    return { xOffset, yOffset };
  };

  // Set font size for the text
  const fontSize = 10;
  doc.setFontSize(fontSize);

  // Calculate offsets for "所属" box (centered)
  const box1Offsets = getTextOffsetsCenter(
    box1.text.content,
    box1.width,
    box1.height,
    fontSize,
  );
  // Draw the box for "所属"
  doc.rect(box1.x, box1.y, box1.width, box1.height); // Draw the rectangle for "所属"
  doc.text(
    box1.text.content,
    box1.x + box1Offsets.xOffset,
    box1.y + box1Offsets.yOffset,
  ); // Add centered text

  // Calculate offsets for "TryAngle Kids 南草津校" box (left-aligned)
  const box2Offsets = getTextOffsetsLeft(box2.height, fontSize);
  // Draw the box for "TryAngle Kids 南草津校"
  doc.rect(box2.x, box2.y, box2.width, box2.height); // Draw the rectangle for "TryAngle Kids 南草津校"
  doc.text(
    box2.text.content,
    box2.x + box2Offsets.xOffset,
    box2.y + box2Offsets.yOffset,
  ); // Add left-aligned text

  // Draw stacked boxes
  const stackedBoxHeight = stackedBox.height / 2; // Split height into two
  // Draw first stacked box ("Name")
  doc.rect(stackedBox.x, stackedBox.y, stackedBox.width, stackedBoxHeight);
  const stackedBox1Offsets = getTextOffsetsCenter(
    stackedBox.box1Text,
    stackedBox.width,
    stackedBoxHeight,
    fontSize,
  );
  doc.text(
    stackedBox.box1Text,
    stackedBox.x + stackedBox1Offsets.xOffset,
    stackedBox.y + stackedBox1Offsets.yOffset,
  );

  // Draw second stacked box ("氏名")
  doc.rect(
    stackedBox.x,
    stackedBox.y + stackedBoxHeight, // Start below the first box
    stackedBox.width,
    stackedBoxHeight,
  );
  const stackedBox2Offsets = getTextOffsetsCenter(
    stackedBox.box2Text,
    stackedBox.width,
    stackedBoxHeight,
    fontSize,
  );
  doc.text(
    stackedBox.box2Text,
    stackedBox.x + stackedBox2Offsets.xOffset,
    stackedBox.y + stackedBoxHeight + stackedBox2Offsets.yOffset,
  );

  // Draw the Name area
  doc.rect(nameArea.x, nameArea.y, nameArea.width, nameArea.height); // Draw the rectangle for the Name area
  if (nameArea.text) {
    // Only add text if a name is provided
    const nameAreaOffsets = getTextOffsetsCenter(
      nameArea.text,
      nameArea.width,
      nameArea.height,
      fontSize,
    );
    doc.text(
      nameArea.text,
      nameArea.x + nameAreaOffsets.xOffset,
      nameArea.y + nameAreaOffsets.yOffset,
    );
  }
};
