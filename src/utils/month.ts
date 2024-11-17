export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Optional: Utility function to get month name by number
export const getMonthName = (monthNumber: number): string => {
  return monthNames[monthNumber - 1]; // Because array index starts from 0
};

// Optional: Utility function to convert month name to number
export const getMonthNumber = (monthName: string): number | null => {
  const index = monthNames.findIndex(
    (m) => m.toLowerCase() === monthName.toLowerCase(),
  );
  return index !== -1 ? index + 1 : null;
};
