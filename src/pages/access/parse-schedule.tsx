import withDashboardLayout from "@/hoc/withDashboardLayout";

function ParseSchedule() {
  return (
    <div>
      <h1>Parse Schedule</h1>
      <p>Enter and upload to parse the montly schedules here.</p>
    </div>
  );
}

export default withDashboardLayout(ParseSchedule);
