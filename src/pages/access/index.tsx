import Spinner from "@/components/Spinner/Spinner";
import SignIn from "@/components/SignIn/SignIn";
import { useAuthContext } from "@/contexts/AuthContext";
import withDashboardLayout from "@/hoc/withDashboardLayout";

function AccessContent() {
  return (
    <div>
      <h1>Dashboard Home</h1>
      <p>Welcome to the dashboard! You can manage everything from here.</p>
    </div>
  );
}

const WrappedAccessContent = withDashboardLayout(AccessContent);

function AccessIndex() {
  const { user, loading, isAuthorized } = useAuthContext();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    // Show the SignIn component if the user is not logged in
    return <SignIn />;
  }

  if (!isAuthorized) {
    // If user is logged in but not authorized, display access denied and allow the user to re-sign in
    return (
      <div className="flex flex-col items-center justify-start min-h-screen text-center px-4 py-4">
        <h2 className="text-2xl font-bold mb-2 text-red-600">Access Denied</h2>
        <p className="mb-4 text-lg text-[var(--body-text-color)]">
          You are not authorized to access this application. Please contact the
          administrator for access.
        </p>
        <SignIn /> {/* Provide the sign-in option */}
      </div>
    );
  }

  // If user is logged in and authorized, render the dashboard with the layout
  return <WrappedAccessContent />;
}

export default AccessIndex;
