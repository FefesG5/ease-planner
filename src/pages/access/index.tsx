import { useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner/Spinner";
import SignIn from "@/components/SignIn/SignIn";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function AccessIndex() {
  const { user, loading, isAuthorized, signOutUser } = useAuthContext();

  useEffect(() => {}, [loading, user, isAuthorized]);

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <SignIn />;
  }

  if (!isAuthorized) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h2>
        <p className="mb-6 text-lg text-[var(--body-text-color)]">
          You are not authorized to access this application. Please contact the
          administrator for access.
        </p>
        <SignIn />
      </div>
    );
  }

  return (
    <DashboardLayout user={user} signOutUser={signOutUser}>
      <h1>Dashboard Home</h1>
      <p>Welcome to the dashboard! You can manage everything from here.</p>
    </DashboardLayout>
  );
}
