import { flexRender, Table } from "@tanstack/react-table";
import AttendanceHeader from "@/components/AttendanceHeaderSection/AttendanceHeaderSection";
import { ScheduleData } from "@/interfaces/schedulesInterface";
import { useState } from "react";

interface RenderTableProps {
  table: Table<ScheduleData>;
  schoolName: string;
  teacherName: string;
  year: number;
  month: number;
}

const RenderTable: React.FC<RenderTableProps> = ({
  table,
  schoolName,
  teacherName,
  year,
  month,
}) => {
  // Essential columns always visible
  const essentialColumns = ["Date", "Day", "StartTime", "EndTime"];

  // Extra columns in pairs for the carousel
  const extraColumnsPairs: string[][] = [
    ["Overtime", "BreakTime"],
    ["WorkingHours", "LessonHours"],
    ["NonLessonHours", "Approval"],
  ];

  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const currentPair = extraColumnsPairs[currentPairIndex];

  const handleNextPair = () => {
    setCurrentPairIndex((prev) => (prev + 1) % extraColumnsPairs.length);
  };

  const handlePrevPair = () => {
    setCurrentPairIndex((prev) =>
      prev === 0 ? extraColumnsPairs.length - 1 : prev - 1,
    );
  };

  const isColumnVisibleOnMobile = (columnId: string) => {
    if (essentialColumns.includes(columnId)) return true;
    return currentPair.includes(columnId);
  };

  // Get the headers for the Japanese row
  const headerGroup = table.getHeaderGroups()[0]; // Usually just one group
  const japaneseHeaders = headerGroup.headers;

  return (
    <div className="bg-white w-full">
      <AttendanceHeader
        year={year}
        month={month}
        schoolName={schoolName}
        teacherName={teacherName}
      />

      {/* Mobile carousel controls */}
      <div className="block sm:hidden text-center text-[10px] text-gray-600 mb-2">
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={handlePrevPair}
            className="border px-2 py-1 rounded bg-gray-200"
          >
            ←
          </button>
          <span>Showing: {currentPair.join(" & ")}</span>
          <button
            onClick={handleNextPair}
            className="border px-2 py-1 rounded bg-gray-200"
          >
            →
          </button>
        </div>
        <div className="mt-1">Swipe or scroll horizontally if needed.</div>
      </div>

      <div className="overflow-x-auto">
        {/* table-fixed ensures columns remain consistent */}
        <table className="w-full border-collapse border border-black table-fixed text-[8px] sm:text-[7px] md:text-[8px] lg:text-[7px] xl:text-[8px] mt-2 sm:mt-4">
          <thead>
            {/* English Headers Row (Static) */}
            <tr>
              <th className="border border-black text-center px-1 py-1 font-normal w-[20px]">
                date
              </th>
              <th className="border border-black text-center px-1 py-1 font-normal w-[24px]">
                day
              </th>
              <th className="border border-black text-center px-1 py-1 font-normal w-[35px]">
                starting time
              </th>
              <th className="border border-black text-center px-1 py-1 font-normal w-[35px]">
                finishing time
              </th>
              {extraColumnsPairs.flat().map((colId) => (
                <th
                  key={colId}
                  className={
                    "border border-black text-center px-1 py-1 font-normal w-[55px] whitespace-nowrap " +
                    (!isColumnVisibleOnMobile(colId)
                      ? "hidden sm:table-cell"
                      : "")
                  }
                >
                  {colId === "Overtime"
                    ? "overtime"
                    : colId === "BreakTime"
                      ? "break time"
                      : colId === "WorkingHours"
                        ? "working hours"
                        : colId === "LessonHours"
                          ? "lesson hours"
                          : colId === "NonLessonHours"
                            ? "non lesson hours"
                            : colId === "Approval"
                              ? "approval"
                              : ""}
                </th>
              ))}
            </tr>
            {/* Japanese Headers Row (Dynamic) */}
            <tr>
              {essentialColumns.map((colId) => {
                const h = japaneseHeaders.find((hh) => hh.column.id === colId);
                return (
                  <th
                    key={colId}
                    className="border border-black font-normal text-center px-1 py-1 whitespace-nowrap w-[50px]"
                  >
                    {h && !h.isPlaceholder
                      ? flexRender(h.column.columnDef.header, h.getContext())
                      : ""}
                  </th>
                );
              })}
              {extraColumnsPairs.flat().map((colId) => {
                const h = japaneseHeaders.find((hh) => hh.column.id === colId);
                let className =
                  "border border-black font-normal text-center px-1 py-1 whitespace-nowrap w-[50px]";
                if (!isColumnVisibleOnMobile(colId)) {
                  className += " hidden sm:table-cell";
                }
                return (
                  <th key={colId} className={className}>
                    {h && !h.isPlaceholder
                      ? flexRender(h.column.columnDef.header, h.getContext())
                      : ""}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="text-center">
                {row.getVisibleCells().map((cell) => {
                  let className =
                    "border border-black text-center px-1 py-1 text-[8px] sm:text-[7px] md:text-[8px] whitespace-nowrap overflow-hidden";
                  if (!isColumnVisibleOnMobile(cell.column.id)) {
                    className += " hidden sm:table-cell";
                  }
                  return (
                    <td key={cell.id} className={className}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RenderTable;
