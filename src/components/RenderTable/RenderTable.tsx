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
      <table className="w-full border-collapse border border-black text-[10px] mt-4">
        <thead>
          {/* English Headers Row */}
          <tr>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              date
            </th>
            <th
              className="border border-black px-0 py-0.5 font-normal" // Completely removed horizontal padding for "Day" column
              style={{ width: "50px" }} // Reduced width for "Day" column to make it visibly narrower
            >
              day
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              starting time
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              finishing time
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              overtime
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              break time
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              working hours
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              lesson hours
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal text-[7px]">
              Non lesson hours
            </th>
            <th className="border border-black px-0.5 py-0.5 font-normal">
              approval
            </th>
          </tr>
          {/* Japanese Headers Row */}
          <tr>
            {table.getHeaderGroups()[0].headers.map((header) => (
              <th
                key={header.id}
                className={`border border-black font-normal ${
                  header.column.id === "Day" ? "px-0 py-0.5" : "px-0.5 py-0.5"
                }`} // Removed horizontal padding for "Day" column
                style={header.column.id === "Day" ? { width: "50px" } : {}} // Reduced width for "Day" column
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
                  className={`border border-black ${
                    cell.column.id === "Day" ? "px-0 py-0.5" : "px-0.5 py-0.5"
                  }`} // Removed horizontal padding for "Day" column
                  style={cell.column.id === "Day" ? { width: "50px" } : {}} // Reduced width for "Day" column
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
