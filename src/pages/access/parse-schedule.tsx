import { useState } from "react";
import withDashboardLayout from "@/hoc/withDashboardLayout";
import Papa from "papaparse";

// Define the schedule type
interface Schedule {
  Employee: string;
  Date: string;
  Day: string;
  School: string;
  Shift: string;
}

function ParseSchedule() {
  const [weeklyData, setWeeklyData] = useState<string>("");
  const [weeksData, setWeeksData] = useState<Schedule[][]>([]);
  const [ariFullSchedule, setAriFullSchedule] = useState<Schedule[]>([]);
  const [message, setMessage] = useState<string>("");

  // Function to extract Ari's schedule from the parsed data
  const extractAriSchedule = (data: string[][]): Schedule[] => {
    const ariSchedules: Schedule[] = [];
    const daysRowIndex = 1; // The second row contains the days
    const datesRowIndex = 0; // The first row contains the dates
    const ariRowIndex1 = 5; // First row for Ari's schedule
    const ariRowIndex2 = 6; // Second row for Ari's schedule

    const dates = data[datesRowIndex];
    const days = data[daysRowIndex];
    const ariRow1 = data[ariRowIndex1];
    const ariRow2 = data[ariRowIndex2];

    // Iterate through both rows to extract Ari's shifts
    for (let i = 0; i < ariRow1.length; i++) {
      // Handle row 5 (ariRow1)
      if (
        ariRow1[i] &&
        ariRow1[i].trim() !== "" &&
        ariRow1[i] !== "Office" &&
        ariRow1[i] !== "NT" &&
        ariRow1[i] !== "Ari(F)" &&
        ariRow1[i] !== "M"
      ) {
        // Ensure there is a valid date and day at the same index
        if (
          dates[i] &&
          dates[i].trim() !== "" &&
          days[i] &&
          days[i].trim() !== ""
        ) {
          ariSchedules.push({
            Employee: "Ari(F)",
            Date: dates[i].trim(),
            Day: days[i].trim(),
            School: "M", // Assume M is used for School based on the row label, you can adjust if needed
            Shift: ariRow1[i].trim(),
          });
        }
      }

      // Handle row 6 (ariRow2)
      if (
        ariRow2[i] &&
        ariRow2[i].trim() !== "" &&
        ariRow2[i] !== "Office" &&
        ariRow2[i] !== "NT" &&
        ariRow2[i] !== "T"
      ) {
        // Ensure there is a valid date and day at the same index
        if (
          dates[i] &&
          dates[i].trim() !== "" &&
          days[i] &&
          days[i].trim() !== ""
        ) {
          ariSchedules.push({
            Employee: "Ari(F)",
            Date: dates[i].trim(),
            Day: days[i].trim(),
            School: "T", // Assume T is used for School based on the row label, you can adjust if needed
            Shift: ariRow2[i].trim(),
          });
        }
      }
    }

    console.log("Extracted Ari Schedules:", ariSchedules);
    return ariSchedules;
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
      // Use PapaParse to parse the CSV data
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
            console.log("Parsed Data:", data);
            const extractedSchedule = extractAriSchedule(data);
            if (extractedSchedule.length > 0) {
              setWeeksData((prevWeeks) => [...prevWeeks, extractedSchedule]);
              setWeeklyData(""); // Clear weekly data after saving
              setMessage("Week added successfully!");
            } else {
              setMessage("No schedule found for Ari in the provided week.");
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
    const fullSchedule = weeksData.flat();
    setAriFullSchedule(fullSchedule);
    setMessage("Full schedule generated successfully!");
  };

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 shadow-md mt-0 bg-[var(--user-section-bg-color)]">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center text-[color:var(--body-text-color)]">
        Parse Weekly Schedule for Ari
      </h1>
      <textarea
        value={weeklyData}
        onChange={handleTextAreaChange}
        rows={10}
        placeholder="Paste the weekly CSV data here..."
        className="w-full p-3 rounded-md text-[color:var(--body-text-color)] bg-[var(--signin-input-bg-color)] border-[var(--signin-input-border-color)] mb-4"
      ></textarea>
      <button
        onClick={handleParseWeek}
        className="w-full py-2 px-4 rounded-md text-white bg-[var(--signin-btn-bg-color)] hover:bg-blue-600 mb-4"
      >
        Add Week
      </button>

      <div className="mt-6">
        <h2 className="font-bold">Weekly Previews:</h2>
        {weeksData.length > 0 ? (
          weeksData.map((week, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-md my-4">
              <h3 className="font-semibold">
                Week {index + 1} Schedule for Ari:
              </h3>
              {week.length > 0 ? (
                <pre className="text-sm">{JSON.stringify(week, null, 2)}</pre>
              ) : (
                <p>No schedule found for Ari in this week.</p>
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
          className="w-full py-2 px-4 rounded-md text-white bg-green-600 hover:bg-green-700 mt-4"
        >
          Generate Full Schedule
        </button>
      )}

      <div className="mt-6">
      <h2>Ari&apos;s Full Schedule:</h2>
        {ariFullSchedule.length > 0 ? (
          <pre className="bg-gray-100 p-4 rounded-md my-4">
            {JSON.stringify(ariFullSchedule, null, 2)}
          </pre>
        ) : (
          <p>
            No full schedule generated yet. Add and generate the weeks first.
          </p>
        )}
      </div>

      {ariFullSchedule.length > 0 && (
        <button
          className="w-full py-2 px-4 rounded-md text-white bg-blue-500 hover:bg-blue-600 mt-4"
          onClick={() =>
            setMessage("Sending request to backend... (not functional yet)")
          }
        >
          Send Schedule to Backend
        </button>
      )}

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}

export default withDashboardLayout(ParseSchedule);
