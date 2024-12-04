import { flexRender, Table } from "@tanstack/react-table";
import AttendanceHeader from "@/components/AttendanceHeaderSection/AttendanceHeaderSection";
import { ScheduleData } from "@/interfaces/schedulesInterface";

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
  return (
    <div className="p-2 sm:p-3 md:p-4 bg-white w-full overflow-x-auto lg:overflow-visible">
      <AttendanceHeader
        year={year}
        month={month}
        schoolName={schoolName}
        teacherName={teacherName}
      />
      <table className="w-full border-collapse border border-black text-[6px] sm:text-[7px] md:text-[8px] lg:text-[7px] xl:text-[8px] mt-2 sm:mt-4">
        <thead>
          {/* English Headers Row */}
          <tr>
            <th className="border border-black text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 font-normal">
              date
            </th>
            <th className="border border-black text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 font-normal whitespace-nowrap">
              day
            </th>
            <th className="border border-black text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 font-normal">
              starting time
            </th>
            <th className="border border-black text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 font-normal">
              finishing time
            </th>
            <th className="border border-black text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 font-normal">
              overtime
            </th>
            <th className="border border-black text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 font-normal">
              break time
            </th>
            <th className="border border-black text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 font-normal">
              working hours
            </th>
            <th className="border border-black text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 font-normal">
              lesson hours
            </th>
            <th className="border border-black text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 font-normal">
              non lesson hours
            </th>
            <th className="border border-black text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 font-normal">
              approval
            </th>
          </tr>
          {/* Japanese Headers Row */}
          <tr>
            {table.getHeaderGroups()[0].headers.map((header) => (
              <th
                key={header.id}
                className="border border-black font-normal text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 whitespace-nowrap"
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
                  className="border border-black text-center px-0.25 py-0.25 sm:px-0.5 sm:py-0.5 md:px-1 md:py-1 lg:px-1 lg:py-1 xl:px-1 xl:py-1 text-[5px] sm:text-[6px] md:text-[7px] lg:text-[8px] xl:text-[9px] whitespace-nowrap"
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
