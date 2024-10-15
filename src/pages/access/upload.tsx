import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import withAuth from "@/components/hoc/withAuth"; // Import the withAuth HOC
import { User, getAuth } from "firebase/auth"; // Properly import getAuth

interface UploadProps {
  user: User; // User prop injected by withAuth
}

const Upload: React.FC<UploadProps> = ({ user }) => {
  const auth = getAuth(); // Get the auth instance to use for signOut

  return (
    <DashboardLayout user={user} signOutUser={() => auth.signOut()}>
      <h1>Upload Files</h1>
      <p>Upload the files to get started with schedule generation.</p>
    </DashboardLayout>
  );
};

// Wrap the Upload component with the withAuth HOC for authentication
export default withAuth(Upload);
