import { flexRender, Table } from "@tanstack/react-table";
import AttendanceHeader from "@/components/AttendanceHeaderSection/AttendanceHeaderSection";
import { ScheduleData } from "@/interfaces/schedulesInterface";

interface RenderTableProps {
  table: Table<ScheduleData>;
  schoolName: string;
  teacherName: string;
}

const RenderTable: React.FC<RenderTableProps> = ({
  table,
  schoolName,
  teacherName,
}) => {
  // Extracting year and month from the first entry, assuming all entries are in the same month
  const [year, month] = [2024, 11]; // Static values for November 2024, replace with dynamic extraction if necessary

  return (
    <div className="p-4 bg-white w-full">
      <AttendanceHeader
        year={year}
        month={month}
        schoolName={schoolName}
        teacherName={teacherName}
      />
      <table className="w-full border-collapse border border-black text-[9px] mt-4">
        <thead>
          {/* English Headers Row */}
          <tr>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              Date
            </th>
            <th
              className="border border-black px-0.5 py-0.5 font-normal"
              style={{ width: "80px" }}
            >
              Day
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              Starting Time
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              Finishing Time
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              Overtime
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              Break Time
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              Working Hours
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              Lesson Hours
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal text-[6px]">
              Non Lesson Hours
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              Approval
            </th>
          </tr>
          {/* Japanese Headers Row */}
          <tr>
            {table.getHeaderGroups()[0].headers.map((header) => (
              <th
                key={header.id}
                className="border border-black px-0.5 py-0.5 font-normal"
                style={header.column.id === "Day" ? { width: "80px" } : {}}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="text-center">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border border-black px-0.5 py-0.5"
                  style={cell.column.id === "Day" ? { width: "80px" } : {}}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RenderTable;
