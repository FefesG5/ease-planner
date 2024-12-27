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
  school: string,
  scheduleData: ScheduleRow[],
  monthYear: string,
  teacherName: string,
  doc: jsPDF,
) => {
  // Determine the correct school name
  const schoolNameMap: Record<string, string> = {
    M: "TryAngle Kids 南草津校",
    T: "TryAngle Kids 高槻校",
    Future: "TryAngle Kids KZ校",
  };
  const schoolName = schoolNameMap[school] || school;

  // Set default font to NotoSansJP
  doc.setFont("NotoSansJP", "normal");

  // Adjust margins
  const marginLeft = 28; // 2.8 cm
  const marginTop = 20; // Adjusted to reduce gap between title and header section

  // Split schedule data into separate groups (e.g., one group per table)
  const groupedData = splitScheduleData(scheduleData);

  groupedData.forEach((group, index) => {
    if (index > 0) {
      doc.addPage(); // Add a new page for each group after the first
    }

    // Add the date with separate font size
    doc.setFontSize(18); // Set font size for the date
    doc.text(formatMonthYear(monthYear), marginLeft, marginTop);

    // Add the title with separate font size
    doc.setFontSize(24); // Set font size for the title
    doc.text("出勤簿", 105, marginTop, { align: "center" });

    // Add the header box section with the correct school and teacher names
    addHeaderSection(doc, marginTop + 3, schoolName, teacherName);

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
      startY: marginTop + 22, // Adjusted to maintain a reduced gap
      styles: {
        fontSize: 8.5,
        valign: "middle",
        halign: "center",
        font: "NotoSansJP", // Apply the default font
        lineWidth: 0.2, // Default border thickness
        textColor: 0, // Black text
        lineColor: 0, // Black border color
        cellPadding: 1.5,
      },
      headStyles: {
        fontSize: 7,
        font: "NotoSansJP",
        fillColor: [255, 255, 255], // White background for headers
        textColor: 0, // Black text
        lineWidth: 0.2, // Default header border thickness
        lineColor: 0, // Black border color
        cellPadding: 1.5,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255], // White background for rows
        textColor: 0, // Black text
      },
      theme: "grid", // Plain grid
    });
  });
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
  schoolName: string,
  teacherName: string,
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
      content: schoolName,
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

  const signatureArea = {
    x: nameArea.x + nameArea.width + 5, // Add extra space before the signature box
    y: startY, // Same starting y-coordinate
    width: 25, // Width of the signature area
    height: 14, // Total height of the signature area
    stackHeight: 7, // Height for each stack in the signature area
    box1Text: "Signature", // Text for the top box
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

  // Draw "所属" box
  const box1Offsets = getTextOffsetsCenter(
    box1.text.content,
    box1.width,
    box1.height,
    fontSize,
  );
  doc.rect(box1.x, box1.y, box1.width, box1.height);
  doc.text(
    box1.text.content,
    box1.x + box1Offsets.xOffset,
    box1.y + box1Offsets.yOffset,
  );

  // Draw "TryAngle Kids 南草津校" box
  const box2Offsets = getTextOffsetsLeft(box2.height, fontSize);
  doc.rect(box2.x, box2.y, box2.width, box2.height);
  doc.text(
    box2.text.content,
    box2.x + box2Offsets.xOffset,
    box2.y + box2Offsets.yOffset,
  );

  // Draw stacked "Name" and "氏名" boxes
  const stackedBoxHeight = stackedBox.height / 2;
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

  doc.rect(
    stackedBox.x,
    stackedBox.y + stackedBoxHeight,
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

  // Draw "Name" area
  doc.rect(nameArea.x, nameArea.y, nameArea.width, nameArea.height);
  if (nameArea.text) {
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

  // Draw "Signature" area with extra spacing
  // Top box for "Signature"
  doc.rect(
    signatureArea.x,
    signatureArea.y,
    signatureArea.width,
    signatureArea.stackHeight,
  );
  const signatureBoxOffsets = getTextOffsetsLeft(
    signatureArea.stackHeight,
    fontSize,
  ); // Left align
  doc.text(
    signatureArea.box1Text,
    signatureArea.x + signatureBoxOffsets.xOffset,
    signatureArea.y + signatureBoxOffsets.yOffset,
  );

  // Bottom empty box
  doc.rect(
    signatureArea.x,
    signatureArea.y + signatureArea.stackHeight,
    signatureArea.width,
    signatureArea.stackHeight,
  );
};
