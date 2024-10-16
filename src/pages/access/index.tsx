import React, { useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner/Spinner";
import SignIn from "@/components/SignIn/SignIn";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function AccessIndex() {
  const { user, loading, isAuthorized, signOutUser } = useAuthContext();

  useEffect(() => {
    if (!loading && user && isAuthorized === false) {
      signOutUser();
    }
  }, [loading, user, isAuthorized, signOutUser]);

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <SignIn />;
  }

  if (!isAuthorized) {
    return <p>You are not authorized to access this application.</p>;
  }

  return (
    <DashboardLayout user={user} signOutUser={signOutUser}>
      <h1>Dashboard Home</h1>
      <p>Welcome to the dashboard! You can manage everything from here.</p>
    </DashboardLayout>
  );
}
