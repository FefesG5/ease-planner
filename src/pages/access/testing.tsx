import withDashboardLayout from "@/hoc/withDashboardLayout";

function TestingPage() {
  return (
    <div>
      <h1>Testing Page</h1>
      <p>This is a simple testing page.</p>
    </div>
  );
}

export default withDashboardLayout(TestingPage);
