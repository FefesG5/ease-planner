import { AttendanceHeaderProps } from "@/interfaces/schedulesInterface";

const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  year,
  month,
  schoolName,
  teacherName,
}) => {
  return (
    <div className="w-full bg-white">
      {/* Mobile (block layout) */}
      <div className="block sm:hidden p-2 border-b border-black">
        <div className="flex justify-between">
          <span className="font-bold text-[12px]">
            {year}年{month}月度 出勤簿
          </span>
          <span className="font-bold text-[10px]">
            TryAngle Kids {schoolName}
          </span>
        </div>
        <div className="mt-1">
          <span className="text-[10px] font-bold">氏名:</span>{" "}
          <span className="text-[10px]">{teacherName}</span>
        </div>
      </div>

      {/* Desktop/Tablet (original layout) */}
      <div className="hidden sm:grid grid-cols-3 items-start w-full bg-white">
        {/* Year and Month */}
        <div className="flex items-center justify-start h-full pl-5 font-bold text-[12px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[20px] mb-2">
          {year}年{month}月度
        </div>

        {/* Title */}
        <div className="flex items-center justify-center h-full text-[16px] sm:text-[20px] md:text-[24px] lg:text-[20px] xl:text-[20px] font-bold mb-4">
          出 勤 簿
        </div>
        {/* Empty Space */}
        <div />

        {/* Main Content Section */}
        <div className="grid grid-cols-[4fr_3fr_2fr] col-span-3 gap-0 mt-2">
          {/* Place Section */}
          <div className="grid grid-cols-[auto_1fr] items-stretch border border-black h-full">
            {/* School Title */}
            <div className="border-r border-black flex items-center justify-center h-full px-1 text-[10px] sm:text-[9px] md:text-[12px] lg:text-[14px] xl:text-[14px]">
              所属
            </div>
            {/* School Name */}
            <div className="flex items-center h-full px-1.5 text-[10px] sm:text-[9px] md:text-[12px] lg:text-[14px] xl:text-[14px]">
              TryAngle Kids {schoolName}
            </div>
          </div>

          {/* Name Section */}
          <div className="grid grid-cols-[1fr_3fr] items-stretch border border-black h-full">
            {/* Name Labels Container */}
            <div className="grid grid-rows-2 border-r border-black h-full">
              {/* Name Title English */}
              <div className="border-b border-black flex items-center justify-center h-full text-[9px] sm:text-[9px] md:text-[12px] lg:text-[14px] xl:text-[14px] pb-1.5">
                Name
              </div>
              {/* Name Title Japanese */}
              <div className="flex items-center justify-center h-full text-[9px] sm:text-[9px] md:text-[12px] lg:text-[12px] xl:text-[14px] pb-1.5">
                氏名
              </div>
            </div>
            {/* Name Box Area */}
            <div className="flex items-center h-full px-1.5 text-[10px] sm:text-[9px] md:text-[12px] lg:text-[14px] xl:text-[14px]">
              {teacherName}
            </div>
          </div>

          {/* Signature Section */}
          <div className="grid grid-rows-2 border border-black ml-5 mr-5">
            {/* Signature Title */}
            <div className="text-left border-b border-black px-1 text-[7px] sm:text-[9px] md:text-[10px] lg:text-[10px] xl:text-[10px]">
              Signature
            </div>
            {/* Empty box area */}
            <div className="px-1"></div>
          </div>

          {/* Empty Space */}
          <div />
        </div>
      </div>
    </div>
  );
};

export default AttendanceHeader;
