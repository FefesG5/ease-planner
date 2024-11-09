import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner/Spinner";
import Router from "next/router";

const withDashboardLayout = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return function WrappedComponent(props: P) {
    const { user, loading, isAuthorized, signOutUser } = useAuthContext();

    if (loading) {
      return <Spinner />;
    }

    if (!user) {
      Router.push("/access"); // Redirect to login page if not logged in
      return null; // Return nothing temporarily while redirecting
    }

    if (!isAuthorized) {
      return (
        <div className="flex items-center justify-center min-h-screen text-center text-[color:var(--body-text-color)]">
          <p className="text-lg">You are not authorized to access this page.</p>
        </div>
      );
    }

    return (
      <DashboardLayout user={user} signOutUser={signOutUser}>
        <Component {...props} />
      </DashboardLayout>
    );
  };
};

export default withDashboardLayout;
