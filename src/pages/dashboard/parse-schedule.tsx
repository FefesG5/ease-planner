import { useState } from "react";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import MonthYearSelect from "@/components/MonthYearSelect/MonthYearSelect";
import Papa from "papaparse";
import { useAuthContext } from "@/contexts/AuthContext";
import { teacherNames } from "@/data/teachersName";
import { TeachersShift } from "@/interfaces/teachersShift";

function ParseSchedule() {
  const { user } = useAuthContext();
  const [weeklyData, setWeeklyData] = useState<string>("");
  const [weeksData, setWeeksData] = useState<TeachersShift[][]>([]);
  const [fullSchedule, setFullSchedule] = useState<TeachersShift[]>([]);
  const [message, setMessage] = useState<string>("");
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);

  // Function to extract all schedules from the parsed data
  const extractSchedules = (
    data: string[][],
    year: number,
    month: number,
  ): TeachersShift[] => {
    const schedules: TeachersShift[] = [];
    let dates: string[] = [];
    let days: string[] = [];

    // Step 1: Extract dates and days rows
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (i === 0) {
        // First row: dates
        dates = row;
      } else if (i === 1) {
        // Second row: days
        days = row;
      }
    }

    // Step 2: Iterate through rows starting from the 6th row to find teacher schedule data
    for (let i = 5; i < data.length - 1; i++) {
      const currentRow = data[i];
      const nextRow = data[i + 1];

      // Identify teacher names in the second column
      if (teacherNames.some((name) => currentRow[1]?.trim().includes(name))) {
        const teacherName = currentRow[1]?.trim();
        const schoolM = currentRow[2]?.trim() === "M" ? "M" : "";
        const schoolT = nextRow[2]?.trim() === "T" ? "T" : "";

        // Define the time pattern for shift extraction
        const timePattern = /(\d{1,2}:\d{2})\s*[-~]?\s*(\d{1,2}:\d{2})?/;

        // Process each cell containing schedule data
        for (let j = 3; j < currentRow.length; j++) {
          const dateStr = dates[j] || "";
          const parts = dateStr.split("/");
          if (parts.length < 3) continue; // Skip if date format is invalid

          const dateYear = parseInt(parts[0], 10);
          const dateMonth = parseInt(parts[1], 10);

          // Dynamic filtering: only process if the date matches the selected year and month
          if (dateYear !== year || dateMonth !== month) continue;

          // Process the current row's schedule if available
          if (currentRow[j]) {
            const matches = currentRow[j].match(timePattern);
            if (matches) {
              const [_, startTime, endTime] = matches;
              schedules.push({
                Employee: teacherName,
                Date: dateStr,
                Day: days[j] || "",
                School: schoolM,
                Shift: endTime ? `${startTime}-${endTime}` : `${startTime}`,
              });
            }
          }

          // Process the next row's schedule if available
          if (nextRow[j]) {
            const matches = nextRow[j].match(timePattern);
            if (matches) {
              const [_, startTime, endTime] = matches;
              schedules.push({
                Employee: teacherName,
                Date: dateStr,
                Day: days[j] || "",
                School: schoolT,
                Shift: endTime ? `${startTime}-${endTime}` : `${startTime}`,
              });
            }
          }
        }
      }
    }

    return schedules;
  };

  // Handle text area change for weekly data input
  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setWeeklyData(event.target.value);
  };

  // Handle parsing of the entered week data
  const handleParseWeek = () => {
    if (!weeklyData.trim()) {
      setMessage("Please enter the weekly CSV data.");
      return;
    }

    try {
      Papa.parse(weeklyData, {
        header: false, // CSV provided does not have standard headers
        skipEmptyLines: true,
        complete: (result: Papa.ParseResult<string[]>) => {
          if (result.errors.length > 0) {
            setMessage(
              "There were some errors parsing the data. Please check your input.",
            );
            console.error(result.errors);
          } else {
            const data: string[][] = result.data;

            // Ensure that 'year' and 'month' are selected before parsing.
            if (year === null || month === null) {
              setMessage("Please select a month and year.");
              return;
            }

            // Call extractSchedules with the proper three arguments: data, year, and month
            const extractedSchedule = extractSchedules(data, year, month);

            if (extractedSchedule.length > 0) {
              setWeeksData((prevWeeks) => [...prevWeeks, extractedSchedule]);
              setWeeklyData(""); // Clear weekly data after saving
              setMessage("Week added successfully!");
            } else {
              setMessage("No valid schedule found in the provided week.");
            }
          }
        },
        error: (error: Error) => {
          console.error("Error while parsing CSV:", error);
          setMessage("Error occurred while parsing. Please try again.");
        },
      });
    } catch (error) {
      console.error("Error while parsing week:", error);
      setMessage("Error occurred while parsing. Please try again.");
    }
  };

  // Handle generating the full schedule
  const handleGenerateFullSchedule = () => {
    const fullScheduleData = weeksData.flat();
    setFullSchedule(fullScheduleData);
    setMessage("Full schedule generated successfully!");
  };

  // Function to send the full schedule to the backend API
  const handleSendScheduleToBackend = async () => {
    if (!user) {
      setMessage("You must be logged in to send the schedule.");
      return;
    }

    if (fullSchedule.length === 0 || !month || !year) {
      setMessage(
        "Please select a month, year, and parse data before submitting.",
      );
      return;
    }

    setMessage("Sending schedule to backend...");

    try {
      const token = await user.getIdToken();

      const response = await fetch("/api/schedules/saveSchedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schedule: fullSchedule,
          year,
          month,
        }),
      });

      if (response.ok) {
        setMessage("Schedule saved successfully!");
      } else {
        const errorData = await response.json();
        setMessage(`Failed to save schedule: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error sending schedule:", error);
      setMessage("Error occurred while sending schedule.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 shadow-md mt-0 bg-[var(--user-section-bg-color)]">
      <h1 className="text-base font-bold text-center mb-4 text-center text-[color:var(--body-text-color)]">
        PARSE WEEKLY SCHEDULE
      </h1>
      <textarea
        value={weeklyData}
        onChange={handleTextAreaChange}
        rows={10}
        placeholder="Paste the weekly CSV data here..."
        className="w-full p-3 text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)] mb-4"
      ></textarea>
      <div className="flex flex-col gap-4 mb-4">
        <MonthYearSelect
          month={month}
          year={year}
          onMonthChange={(value) => setMonth(value)}
          onYearChange={(value) => setYear(value)}
        />
      </div>

      <button
        onClick={handleParseWeek}
        className="w-full py-2 px-4 text-white bg-[var(--signin-btn-bg-color)] hover:bg-blue-600 mb-4"
      >
        Add Week
      </button>

      <div className="mt-6">
        <h2 className="font-bold">Weekly Previews:</h2>
        {weeksData.length > 0 ? (
          weeksData.map((week, index) => (
            <div key={index} className="bg-gray-100 p-4 my-4">
              <h3 className="font-semibold">
                Week {index + 1} Schedule for Teachers:
              </h3>
              {week.length > 0 ? (
                <pre className="text-xs overflow-auto max-h-40 p-2 bg-gray-200">
                  {JSON.stringify(week, null, 2)}
                </pre>
              ) : (
                <p>No valid schedule found for this week.</p>
              )}
            </div>
          ))
        ) : (
          <p>No weeks added yet.</p>
        )}
      </div>

      {weeksData.length > 0 && (
        <button
          onClick={handleGenerateFullSchedule}
          className="w-full py-2 px-4 text-white bg-green-600 hover:bg-green-700 mt-4"
        >
          Generate Full Schedule
        </button>
      )}

      <div className="mt-6">
        <h2>Teachers&apos; Full Schedule:</h2>
        {fullSchedule.length > 0 ? (
          <pre className="bg-gray-100 p-4 my-4 text-xs overflow-auto max-h-40">
            {JSON.stringify(fullSchedule, null, 2)}
          </pre>
        ) : (
          <p>
            No full schedule generated yet. Add and generate the weeks first.
          </p>
        )}
      </div>

      {fullSchedule.length > 0 && (
        <button
          className="w-full py-2 px-4 text-white bg-blue-500 hover:bg-blue-600 mt-4"
          onClick={handleSendScheduleToBackend}
        >
          Send Schedule to Backend
        </button>
      )}

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}

export default withDashboardLayout(ParseSchedule);
