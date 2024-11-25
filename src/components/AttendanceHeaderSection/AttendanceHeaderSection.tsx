import React from "react";
import { AttendanceHeaderProps } from "@/interfaces/schedulesInterface";

const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  year,
  month,
  schoolName,
  teacherName,
}) => {
  return (
    <div className="grid grid-cols-3 items-center bg-white">
      {/* Year Month */}
      <div className="flex items-center justify-start h-full pl-5 font-bold">
        {year}年{month}月度
      </div>

      {/* Title */}
      <div className="flex items-center justify-center h-full text-xl font-bold">
        出 勤 簿
      </div>
      {/* Empty Space to leave space on the right */}
      <div />

      {/* Main Content Section */}
      <div className="grid grid-cols-[3fr_5fr_2fr] col-span-3 gap-0 mt-0">
        {/* Place Section */}
        <div className="grid grid-cols-[auto_1fr] items-stretch border border-black h-full">
          {/* School Title */}
          <div className="border-r border-black flex items-center justify-center h-full px-1.5">
            所属
          </div>
          {/* School Name */}
          <div className="flex items-center h-full px-1.5">
            TryAngle Kids {schoolName}
          </div>
        </div>

        {/* Name Section */}
        <div className="grid grid-cols-[1fr_3fr] items-stretch border border-black h-full">
          {/* Name Labels Container */}
          <div className="grid grid-rows-2 border-r border-black h-full">
            {/* Name Title English */}
            <div className="border-b border-black flex items-center justify-center h-full px-1.5">
              Name
            </div>
            {/* Name Title Japanese */}
            <div className="flex items-center justify-center h-full text-sm px-1.5">
              氏名
            </div>
          </div>
          {/* Name Box Area */}
          <div className="flex items-center h-full px-1.5">{teacherName}</div>
        </div>

        {/* Signature Section */}
        <div className="grid grid-rows-2 border border-black ml-5 mr-5">
          {/* Signature Title */}
          <div className="text-left border-b border-black px-1.5">
            Signature
          </div>
          {/* Empty box area */}
          <div className="px-1.5"></div>
        </div>

        {/* Empty Space */}
        <div />
      </div>
    </div>
  );
};

export default AttendanceHeader;
