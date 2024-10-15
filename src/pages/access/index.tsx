import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import Spinner from "@/components/Spinner/Spinner";
import SignIn from "@/components/SignIn/SignIn";
import { getAuth } from "firebase/auth";

export default function AccessIndex() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <SignIn />;
  }

  const auth = getAuth(); // Get the authentication instance for signOut

  return (
    <DashboardLayout user={user} signOutUser={() => auth.signOut()}>
      <h1>Dashboard Home</h1>
      <p>Welcome to the dashboard! You can manage everything from here.</p>
    </DashboardLayout>
  );
}
