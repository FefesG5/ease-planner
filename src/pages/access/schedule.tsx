import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import withAuth from "@/components/hoc/withAuth"; // Import the withAuth HOC
import { User, getAuth } from "firebase/auth"; // Properly import getAuth

interface ScheduleProps {
  user: User; // The user prop is injected by withAuth
}

const Schedule: React.FC<ScheduleProps> = ({ user }) => {
  const auth = getAuth(); // Get the auth instance to use for signOut

  return (
    <DashboardLayout user={user} signOutUser={() => auth.signOut()}>
      <h1>Generate Schedule</h1>
      <p>Generate and manage your schedules here.</p>
    </DashboardLayout>
  );
};

// Export the component wrapped in withAuth HOC
export default withAuth(Schedule);
