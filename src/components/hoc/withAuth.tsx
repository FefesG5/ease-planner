import React from "react";
import useAuth from "@/hooks/useAuth";
import Spinner from "@/components/Spinner/Spinner";
import SignIn from "@/components/SignIn/SignIn";
import { User } from "firebase/auth";

interface WithAuthProps {
  user: User;
}

// WrappedComponent can take props in addition to `user`.
function withAuth<P extends WithAuthProps>(
  WrappedComponent: React.ComponentType<P>,
) {
  const AuthenticatedComponent: React.FC<Omit<P, "user">> = (props) => {
    const { user, loading } = useAuth();

    // Handle loading state
    if (loading) {
      return <Spinner />;
    }

    // If no user is authenticated, render the SignIn component
    if (!user) {
      return <SignIn />;
    }

    // Render the wrapped component with user information
    return <WrappedComponent {...(props as P)} user={user} />;
  };

  return AuthenticatedComponent;
}

export default withAuth;
