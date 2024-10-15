import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import withAuth from "@/components/hoc/withAuth"; // Import the withAuth HOC
import { User, getAuth } from "firebase/auth"; // Properly import getAuth

interface EditProps {
  user: User; // The user prop is injected by withAuth
}

const Edit: React.FC<EditProps> = ({ user }) => {
  const auth = getAuth(); // Get the auth instance to use for signOut

  return (
    <DashboardLayout user={user} signOutUser={() => auth.signOut()}>
      <h1>Review & Edit</h1>
      <p>Review and edit your schedules here.</p>
    </DashboardLayout>
  );
};

export default withAuth(Edit);
