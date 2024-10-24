import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner/Spinner";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function Edit() {
  const { user, loading, isAuthorized, signOutUser } = useAuthContext();

  // Handle loading state
  if (loading) {
    return <Spinner />;
  }

  // If no user is logged in or the user is not authorized, redirect or show message
  if (!user) {
    return <p>You must be logged in to access this page.</p>;
  }

  if (!isAuthorized) {
    return <p>You are not authorized to access this page.</p>;
  }

  // Render the content if user is authenticated and authorized
  return (
    <DashboardLayout user={user} signOutUser={signOutUser}>
      <h1>Review & Edit</h1>
      <p>Review and edit your schedules here.</p>
    </DashboardLayout>
  );
}
